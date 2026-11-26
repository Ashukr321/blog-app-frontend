import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";
import Providers from "@/providers/Providers";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import { siteConfig } from "@/utils/site";
import "./globals.css";

// Inter for body text, Plus Jakarta Sans for headings.
const sans = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
});

const display = Plus_Jakarta_Sans({
    variable: "--font-display",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: `${siteConfig.name} — ${siteConfig.tagline}`,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "/",
        siteName: siteConfig.name,
        title: `${siteConfig.name} — ${siteConfig.tagline}`,
        description: siteConfig.description,
    },
    twitter: {
        card: "summary_large_image",
        title: `${siteConfig.name} — ${siteConfig.tagline}`,
        description: siteConfig.description,
    },
    robots: { index: true, follow: true },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: siteConfig.name,
    },
};

// themeColor belongs in `viewport` since Next 14 (it warns inside `metadata`).
export const viewport: Viewport = { themeColor: "#4f46e5" };

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={`${sans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
        >
            <body id="top" className="flex min-h-full flex-col">
                <Providers>
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
