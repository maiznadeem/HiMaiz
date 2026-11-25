import { execFile } from "node:child_process";
import {
    closeSync,
    existsSync,
    mkdirSync,
    openSync,
    readFileSync,
    renameSync,
    rmSync,
    statSync,
    writeSync,
} from "node:fs";
import path from "node:path";
import { voiceEnv } from "./voice";

/**
 * A machine-wide render queue, so several scenes rendering at once cannot overload the machine.
 *
 * Heavy stages (render and encode in `npm run scene`; the frames in `npm run frame` and `npm run still`)
 * first take a slot: a lock file in a shared folder outside the repo. At most two full renders and one
 * frame-or-still job hold slots at a time; the rest wait, printing every 30 s who they are waiting for.
 * The voice and the bundle run without a slot.
 *
 * The folder is $VIDEO_RENDER_SLOTS, else `render-slots` inside the voice environment's folder. If that
 * folder's parent does not exist (a machine without the shared setup), there is no queue at all.
 *
 * A lock records the holder's PID and its process start time, so a slot whose process has gone (or whose
 * PID was reused by another process) is reclaimed instead of blocking forever.
 */
export const SLOT_LIMITS = { render: 2, frame: 1 } as const;
export type SlotKind = keyof typeof SLOT_LIMITS;

type Lock = { pid: number; started: string; label: string; since: string };

function slotDir(): string | undefined {
    let dir = process.env.VIDEO_RENDER_SLOTS;
    if (!dir) {
        try {
            dir = path.join(voiceEnv().dir, "render-slots");
        } catch {
            return undefined;
        }
    }
    if (!existsSync(path.dirname(path.resolve(dir)))) return undefined;
    mkdirSync(dir, { recursive: true });
    return dir;
}

/** Start times (an opaque string per PID) for running processes; missing PIDs are not running. */
function startTimes(pids: number[]): Promise<Map<number, string> | undefined> {
    return new Promise((resolve) => {
        // undefined when the query itself failed: then nothing may be judged gone by start time.
        const done = (out: string | undefined) => {
            if (out === undefined) return resolve(undefined);
            const m = new Map<number, string>();
            for (const part of out.trim().split(/\s+/)) {
                const [p, t] = part.split(":");
                if (p && t && t !== "-") m.set(Number(p), t);
            }
            resolve(m);
        };
        if (process.platform === "win32") {
            // GetProcessTimes through ctypes: about 0.1 s, where PowerShell can take seconds under load.
            const code = [
                "import ctypes,sys",
                "from ctypes import wintypes as w",
                "k=ctypes.WinDLL('kernel32')",
                "o=[]",
                "for p in map(int,sys.argv[1:]):",
                " h=k.OpenProcess(0x1000,False,p)",
                " if not h: o.append(f'{p}:-'); continue",
                " c,e,a,b,x=w.FILETIME(),w.FILETIME(),w.FILETIME(),w.FILETIME(),w.DWORD()",
                " k.GetExitCodeProcess(h,ctypes.byref(x))",
                " ok=k.GetProcessTimes(h,ctypes.byref(c),ctypes.byref(e),ctypes.byref(a),ctypes.byref(b)); k.CloseHandle(h)",
                " o.append(f'{p}:'+(str((c.dwHighDateTime<<32)|c.dwLowDateTime) if ok and x.value==259 else '-'))",
                "print(' '.join(o))",
            ].join("\n");
            let python = "python";
            try {
                python = voiceEnv().python;
            } catch {}
            execFile(
                python,
                ["-I", "-c", code, ...pids.map(String)],
                { windowsHide: true },
                (err, stdout) => done(err ? undefined : stdout),
            );
        } else {
            execFile("ps", ["-o", "pid=,lstart=", "-p", pids.join(",")], (err, stdout) => {
                const lines = (err ? "" : stdout).trim().split("\n").filter(Boolean);
                done(
                    lines
                        .map((l) => {
                            const [pid, ...rest] = l.trim().split(/\s+/);
                            return `${pid}:${rest.join("_")}`;
                        })
                        .join(" "),
                );
            });
        }
    });
}

function readLock(file: string): Lock | undefined {
    try {
        return JSON.parse(readFileSync(file, "utf8")) as Lock;
    } catch {
        return undefined;
    }
}

/** Remove a lock whose holder is gone, without racing another waiter doing the same. */
function reclaim(file: string): void {
    const aside = `${file}.stale-${process.pid}-${Date.now()}`;
    try {
        renameSync(file, aside);
        rmSync(aside, { force: true });
    } catch {}
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Wait for a slot of this kind and hold it. Returns a release function (also called on exit).
 * With no slot folder, returns at once and holds nothing.
 */
export async function takeSlot(kind: SlotKind, label: string): Promise<() => void> {
    const dir = slotDir();
    if (!dir) return () => {};
    const me = (await startTimes([process.pid]))?.get(process.pid) ?? `t${Date.now()}`;
    const files = Array.from({ length: SLOT_LIMITS[kind] }, (_, i) =>
        path.join(dir, `${kind}-${i + 1}.lock`),
    );
    const waitStart = Date.now();
    let lastSay = 0;
    let lastVerify = 0;
    for (;;) {
        for (const file of files) {
            try {
                const fd = openSync(file, "wx");
                const lock: Lock = {
                    pid: process.pid,
                    started: me,
                    label,
                    since: new Date().toISOString(),
                };
                writeSync(fd, JSON.stringify(lock));
                closeSync(fd);
                if (Date.now() - waitStart > 1000) {
                    console.log(
                        `  got a ${kind} slot after ${Math.round((Date.now() - waitStart) / 1000)} s`,
                    );
                }
                let released = false;
                const release = () => {
                    if (released) return;
                    released = true;
                    const held = readLock(file);
                    if (held?.pid === process.pid && held.started === me)
                        rmSync(file, { force: true });
                };
                process.once("exit", release);
                for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
                    process.once(sig, () => {
                        release();
                        process.exit(130);
                    });
                }
                return release;
            } catch {
                // Taken (or unreadable): checked below.
            }
        }
        // All slots taken. Reclaim any whose holder is gone; check start times every 30 s or so, since a
        // dead PID is cheap to spot but a reused PID needs the start time.
        const holders = files.map((f) => ({ file: f, lock: readLock(f) }));
        const now = Date.now();
        const verify = now - lastVerify >= 30_000;
        if (verify) lastVerify = now;
        const alive = verify
            ? await startTimes(holders.map((h) => h.lock?.pid ?? 0).filter(Boolean))
            : undefined;
        let reclaimed = false;
        for (const h of holders) {
            if (!h.lock) {
                // A lock that stays unreadable for a minute is broken (a crash while writing it).
                try {
                    if (Date.now() - statSync(h.file).mtimeMs > 60_000) reclaim(h.file);
                } catch {}
                continue;
            }
            let gone = false;
            try {
                process.kill(h.lock.pid, 0);
            } catch (err) {
                gone = (err as NodeJS.ErrnoException).code === "ESRCH";
            }
            if (!gone && alive) gone = alive.get(h.lock.pid) !== h.lock.started;
            if (gone) {
                reclaimed = true;
                console.log(
                    `  reclaiming ${path.basename(h.file)}: ${h.lock.label} (pid ${h.lock.pid}) is gone`,
                );
                reclaim(h.file);
            }
        }
        if (reclaimed) continue; // a slot just came free: try again at once
        if (now - lastSay >= 30_000) {
            lastSay = now;
            const who = holders
                .map((h) =>
                    h.lock
                        ? `${h.lock.label} (pid ${h.lock.pid}, since ${h.lock.since.slice(11, 19)})`
                        : "?",
                )
                .join("; ");
            console.log(
                `  queued for a ${kind} slot (${SLOT_LIMITS[kind]} at a time) for ${Math.round((now - waitStart) / 1000)} s, behind: ${who}`,
            );
        }
        await sleep(2000);
    }
}
