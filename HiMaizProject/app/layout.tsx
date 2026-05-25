import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
    variable: "--font-space-grotesk",
    subsets: ["latin"],
    display: "swap",
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://himaiz.com"),
    title: {
        default: "Maiz | Coming Soon",
        template: "%s | Maiz",
    },
    description:
        "A personal website for Maiz is taking shape. Something thoughtful, animated, and useful is coming soon.",
    applicationName: "HiMaiz",
    authors: [{ name: "Maiz" }],
    creator: "Maiz",
    publisher: "Maiz",
    alternates: {
        canonical: "/",
    },
    keywords: [
        "Maiz",
        "HiMaiz",
        "portfolio",
        "personal website",
        "software",
        "design",
        "experiments",
    ],
    icons: {
        icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
        apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
    },
    openGraph: {
        title: "Maiz | Coming Soon",
        description:
            "A personal website for Maiz is taking shape. Something thoughtful, animated, and useful is coming soon.",
        url: "https://himaiz.com",
        siteName: "HiMaiz",
        images: [
            {
                url: "/opengraph-image",
                width: 1200,
                height: 630,
                alt: "HiMaiz coming soon preview with the Monolith M mark",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Maiz | Coming Soon",
        description: "A personal website for Maiz is taking shape.",
        images: ["/opengraph-image"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },
    category: "personal website",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${spaceGrotesk.variable} ${geistMono.variable} h-full`}>
            <body className="min-h-full antialiased">{children}</body>
        </html>
    );
}
