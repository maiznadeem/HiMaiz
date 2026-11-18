import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { LeafPebble } from "@/lib/og-art";

export const alt = "Maiz Nadeem. A leaf and an orange pebble cut from paper.";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default async function OpenGraphImage() {
    const fraunces = await readFile(join(process.cwd(), "assets/fonts/Fraunces-Soft-700.ttf"));
    return new ImageResponse(
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#e7e7e2",
                color: "#191919",
                padding: "0 60px 0 80px",
                fontFamily: "Fraunces",
            }}
        >
            <div style={{ display: "flex", flexDirection: "column", width: 660 }}>
                <span style={{ fontSize: 96, lineHeight: 1.02, letterSpacing: "-0.02em" }}>
                    Maiz Nadeem
                </span>
                <span
                    style={{
                        fontSize: 42,
                        lineHeight: 1.12,
                        letterSpacing: "-0.02em",
                        marginTop: 28,
                    }}
                >
                    Building things, and writing it down.
                </span>
                <span style={{ fontSize: 30, color: "#6b6b66", marginTop: 40 }}>himaiz.com</span>
            </div>
            <LeafPebble size={380} />
        </div>,
        {
            ...size,
            fonts: [{ name: "Fraunces", data: fraunces, weight: 700, style: "normal" }],
        },
    );
}
