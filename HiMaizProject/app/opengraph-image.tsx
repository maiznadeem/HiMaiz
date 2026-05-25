import { ImageResponse } from "next/og";

export const alt = "HiMaiz coming soon preview with the Monolith M mark";
export const contentType = "image/png";
export const size = {
    width: 1200,
    height: 630,
};

export default function OpenGraphImage() {
    return new ImageResponse(
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background:
                    "radial-gradient(circle at 18% 12%, rgba(132,245,218,0.24), transparent 30%), radial-gradient(circle at 72% 56%, rgba(255,111,145,0.20), transparent 34%), linear-gradient(135deg, #071012 0%, #0b171b 44%, #131315 100%)",
                color: "#fff8ee",
                padding: "72px",
                fontFamily: "Arial, sans-serif",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(90deg, rgba(255,248,238,0.045) 1px, transparent 1px), linear-gradient(0deg, rgba(255,248,238,0.035) 1px, transparent 1px)",
                    backgroundSize: "58px 58px",
                }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
                <svg width="104" height="104" viewBox="0 0 128 128">
                    <rect width="128" height="128" rx="28" fill="#071012" />
                    <path
                        d="M26 94V34H48L64 62L80 34H102V94H86V58L70 86H58L42 58V94H26Z"
                        fill="#f6f1e8"
                    />
                    <path d="M80 34H102V56H80V34Z" fill="#7ff0d7" />
                    <path d="M80 56H86V70L70 86H58L80 56Z" fill="#071012" opacity="0.18" />
                </svg>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        letterSpacing: "4px",
                        textTransform: "uppercase",
                    }}
                >
                    <span style={{ color: "#84f5da", fontSize: "28px", fontWeight: 700 }}>
                        HiMaiz
                    </span>
                    <span style={{ color: "rgba(255,248,238,0.62)", fontSize: "18px" }}>
                        personal site in progress
                    </span>
                </div>
            </div>
            <div
                style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    maxWidth: "820px",
                }}
            >
                <h1
                    style={{
                        margin: 0,
                        fontSize: "104px",
                        lineHeight: 0.95,
                        letterSpacing: "-1px",
                    }}
                >
                    Maiz is tuning the signal.
                </h1>
                <p
                    style={{
                        margin: "28px 0 0",
                        color: "rgba(255,248,238,0.72)",
                        fontSize: "30px",
                        lineHeight: 1.35,
                    }}
                >
                    Work, notes, experiments, and useful tools are coming soon.
                </p>
            </div>
        </div>,
        size,
    );
}
