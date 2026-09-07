import { ImageResponse } from "next/og";

export const alt = "Maiz Nadeem. A personal space, taking shape. Monolith M identity.";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default function OpenGraphImage() {
    return new ImageResponse(
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "#101112",
                color: "#f2f3ef",
                padding: "48px 60px",
                fontFamily: "sans-serif",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #353936",
                    paddingBottom: "24px",
                }}
            >
                <span style={{ fontSize: 24, fontWeight: 700 }}>HiMaiz.</span>
                <span style={{ fontSize: 15, color: "#7ff0d7" }}>
                    A personal space, taking shape.
                </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 100, lineHeight: 1.1, fontWeight: 700 }}>Maiz</span>
                    <span style={{ fontSize: 100, lineHeight: 1.1, fontWeight: 700 }}>Nadeem.</span>
                    <span style={{ fontSize: 22, marginTop: 24, color: "#aeb1ae" }}>
                        Thoughtful code. Curious experiments.
                    </span>
                </div>
                <svg
                    width="350"
                    height="300"
                    viewBox="16 20 104 96"
                    style={{ transform: "rotate(-8deg)" }}
                >
                    <path
                        d="M26 94V34H48L64 62L80 34H102V94H86V58L70 86H58L42 58V94H26Z"
                        fill="#b7c5bf"
                    />
                    <path d="M80 34H102V56H80Z" fill="#7ff0d7" />
                </svg>
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid #353936",
                    paddingTop: 24,
                    fontSize: 16,
                }}
            >
                <span style={{ color: "#aeb1ae" }}>Portfolio coming soon</span>
                <span style={{ color: "#7ff0d7" }}>himaiz.com</span>
            </div>
        </div>,
        size,
    );
}
