/**
 * Copies text with the given clipboard (pass `navigator.clipboard`). Never throws: a missing
 * clipboard, a denied permission or any other failure resolves to "error".
 */
export async function copyText(
    text: string,
    clipboard?: Pick<Clipboard, "writeText"> | undefined,
): Promise<"copied" | "error"> {
    try {
        if (!clipboard) return "error";
        await clipboard.writeText(text);
        return "copied";
    } catch {
        return "error";
    }
}
