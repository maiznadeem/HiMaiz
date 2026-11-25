import { spawn } from "node:child_process";

/** Run a program, collect its output, and throw with the output if it fails. */
export function run(
    cmd: string,
    args: string[],
    opts: { cwd?: string; input?: string; env?: NodeJS.ProcessEnv; quiet?: boolean } = {},
): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, {
            cwd: opts.cwd,
            env: opts.env ?? process.env,
            windowsHide: true,
        });
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", (d) => (stdout += d));
        child.stderr.on("data", (d) => (stderr += d));
        child.on("error", (err) => reject(new Error(`Could not start ${cmd}: ${err.message}`)));
        child.on("close", (code) => {
            if (code === 0) resolve({ stdout, stderr });
            else
                reject(
                    new Error(
                        `${cmd} ${args.join(" ")} exited with ${code}\n${stderr.slice(-3000)}${stdout.slice(-1000)}`,
                    ),
                );
        });
        if (opts.input !== undefined) child.stdin.end(opts.input);
        else child.stdin.end();
    });
}

export async function ffprobe(file: string): Promise<FfprobeResult> {
    const { stdout } = await run("ffprobe", [
        "-v",
        "error",
        "-show_streams",
        "-show_format",
        "-of",
        "json",
        file,
    ]);
    return JSON.parse(stdout) as FfprobeResult;
}

export type FfprobeStream = {
    codec_type: string;
    codec_name: string;
    profile?: string;
    width?: number;
    height?: number;
    pix_fmt?: string;
    r_frame_rate?: string;
    avg_frame_rate?: string;
    channels?: number;
    sample_rate?: string;
    bit_rate?: string;
    duration?: string;
};
export type FfprobeResult = {
    streams: FfprobeStream[];
    format: { duration?: string; size?: string; format_name?: string };
};

/** Time a step and log it. */
export async function timed<T>(label: string, times: Record<string, number>, fn: () => Promise<T>) {
    const t0 = performance.now();
    process.stdout.write(`- ${label}... `);
    const out = await fn();
    const s = (performance.now() - t0) / 1000;
    times[label] = Math.round(s * 10) / 10;
    process.stdout.write(`${s.toFixed(1)} s\n`);
    return out;
}
