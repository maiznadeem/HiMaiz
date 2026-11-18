import { describe, expect, it } from "vitest";
import { copyText } from "./clipboard";

describe("copyText", () => {
    it("resolves copied when writeText resolves", async () => {
        const written: string[] = [];
        const clipboard = {
            writeText: async (text: string) => {
                written.push(text);
            },
        };
        await expect(copyText("hello", clipboard)).resolves.toBe("copied");
        expect(written).toEqual(["hello"]);
    });

    it("resolves error when writeText rejects", async () => {
        const clipboard = { writeText: () => Promise.reject(new Error("denied")) };
        await expect(copyText("hello", clipboard)).resolves.toBe("error");
    });

    it("resolves error when writeText throws synchronously", async () => {
        const clipboard = {
            writeText: (): Promise<void> => {
                throw new Error("not allowed");
            },
        };
        await expect(copyText("hello", clipboard)).resolves.toBe("error");
    });

    it("resolves error when the clipboard is unavailable", async () => {
        await expect(copyText("hello", undefined)).resolves.toBe("error");
    });
});
