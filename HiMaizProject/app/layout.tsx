import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
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
    description:
        "Thoughtful code. Curious experiments. A new home for everything in between. The personal website of Maiz Nadeem, coming soon.",
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
    },
    openGraph: {
        title: "Maiz Nadeem | A Personal Space, Taking Shape",
        description:
            "Thoughtful code. Curious experiments. A new home for everything in between. Coming soon.",
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
        title: "Maiz Nadeem | A Personal Space, Taking Shape",
        description: "Thoughtful code. Curious experiments. A personal space, taking shape.",
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
            <body className="min-h-full antialiased">{children}</body>
        </html>
    );
}
