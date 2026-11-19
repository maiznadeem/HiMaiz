import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import { PaperFilter } from "@/components/PaperFilter";
import { OPEN_GRAPH_BASE, RSS_ALTERNATE, TAGLINE } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
    subsets: ["latin"],
    axes: ["SOFT", "WONK", "opsz"],
    variable: "--font-fraunces",
    display: "swap",
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#e7e7e2" },
        { media: "(prefers-color-scheme: dark)", color: "#22211e" },
    ],
};

export const metadata: Metadata = {
    metadataBase: new URL("https://himaiz.com"),
    title: {
        default: "Maiz Nadeem | A Personal Space, Taking Shape",
        template: "%s | Maiz Nadeem",
    },
    description: TAGLINE,
    applicationName: "HiMaiz",
    authors: [{ name: "Maiz" }],
    creator: "Maiz",
    publisher: "Maiz",
    alternates: {
        canonical: "/",
        types: RSS_ALTERNATE,
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
    },
    openGraph: {
        ...OPEN_GRAPH_BASE,
        title: "Maiz Nadeem | A Personal Space, Taking Shape",
        description: TAGLINE,
        url: "https://himaiz.com",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Maiz Nadeem | A Personal Space, Taking Shape",
        description: TAGLINE,
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
        <html lang="en" className={`${fraunces.variable} h-full`}>
            <body className="min-h-full antialiased">
                <PaperFilter />
                {children}
            </body>
        </html>
    );
}
