// npm run lint:narration -- <slug> [<scene-id>]   (or a path to a folder or .json file)
// Fails when a line's spoken text (its `say`, else its `text`) has a unit or symbol the voice reads as
// letters, such as "22 ms". The fix is a `say` field with the words spelled out. `npm run scene` runs the
// same lint first.
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { formatHits, lintNarration } from "./lib/lint";
import { loadNarration, missingSceneMessage } from "./lib/narration";
import { UserError, VIDEO_DIR } from "./lib/paths";
import { fail } from "./lib/prepare";

function files(args: string[]): string[] {
    const [a, b] = args.filter((x) => !x.startsWith("--"));
    if (!a) throw new UserError("Usage: npm run lint:narration -- <slug> [<scene-id>]");
    if (existsSync(a) && statSync(a).isFile()) return [path.resolve(a)];
    const dir = existsSync(a) ? path.resolve(a) : path.join(VIDEO_DIR, "narration", a);
    if (b) {
        const f = path.join(dir, `${b}.json`);
        if (!existsSync(f)) throw new UserError(missingSceneMessage(f));
        return [f];
    }
    if (!existsSync(dir)) throw new UserError(missingSceneMessage(path.join(dir, "x.json")));
    return readdirSync(dir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => path.join(dir, f));
}

function main() {
    let count = 0;
    const list = files(process.argv.slice(2));
    for (const f of list) {
        const hits = lintNarration(loadNarration(f));
        if (hits.length) console.log(formatHits(f, hits));
        count += hits.length;
    }
    if (count) {
        console.error(
            `\nFAILED: ${count} form(s) the voice reads badly, in ${list.length} file(s).`,
        );
        process.exit(1);
    }
    console.log(`OK: ${list.length} narration file(s), nothing the voice reads badly.`);
}

try {
    main();
} catch (err) {
    fail(err);
}
