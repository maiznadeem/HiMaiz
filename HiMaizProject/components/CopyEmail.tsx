"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { copyText } from "@/lib/clipboard";

const STATUS_TEXT = {
    idle: "",
    copied: "Email address copied to clipboard.",
    error: "Couldn't copy. Please use the email link.",
};

export function CopyEmail({ email }: { email: string }) {
    const [status, setStatus] = useState<keyof typeof STATUS_TEXT>("idle");
    const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            if (resetTimer.current) clearTimeout(resetTimer.current);
        };
    }, []);

    async function copy() {
        const result = await copyText(email, navigator.clipboard);
        if (!mounted.current) return;
        setStatus(result);
        // Cleared after the await, so an earlier click's timer cannot reset this result early.
        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setStatus("idle"), 2600);
    }

    const copied = status === "copied";
    return (
        <>
            <button
                type="button"
                onClick={copy}
                aria-label="Copy email address"
                title={copied ? "Copied" : "Copy email address"}
                className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink transition-[background-color] hover:bg-ink/10"
            >
                {copied ? (
                    <Check size={17} strokeWidth={1.75} aria-hidden="true" />
                ) : (
                    <Copy size={17} strokeWidth={1.75} aria-hidden="true" />
                )}
            </button>
            <span className="sr-only" role="status">
                {STATUS_TEXT[status]}
            </span>
        </>
    );
}
