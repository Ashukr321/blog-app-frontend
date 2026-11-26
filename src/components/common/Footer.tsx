import Link from "next/link";
import { ArrowUp, ArrowUpRight, PenLine, Sparkles } from "lucide-react";
import Logo from "@/components/common/Logo";
import { siteConfig } from "@/utils/site";

const columns = [
    {
        title: "Read",
        links: [
            { href: "/", label: "Latest stories" },
            { href: "/dashboard", label: "Your dashboard" },
        ],
    },
    {
        title: "Write",
        links: [
            { href: "/write", label: "New post" },
            { href: "/settings", label: "Settings" },
        ],
    },
    {
        title: "Account",
        links: [
            { href: "/login", label: "Sign in" },
            { href: "/register", label: "Create account" },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="relative mt-16 overflow-hidden bg-[#0b0a1a] text-white">
            {/* Glow blobs + dot grid */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute -top-32 -left-24 size-96 animate-pulse rounded-full bg-indigo-600/30 blur-3xl" />
                <div className="absolute top-10 right-0 size-80 animate-pulse rounded-full bg-fuchsia-600/25 blur-3xl [animation-delay:1.5s]" />
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/70 to-transparent" />
            </div>

            <div className="relative mx-auto max-w-6xl px-4 pt-16 sm:px-6">
                {/* CTA */}
                <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur md:flex-row md:items-center">
                    <div className="space-y-2">
                        <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-fuchsia-300 uppercase">
                            <Sparkles className="size-3.5" /> Your turn
                        </p>
                        <h2 className="font-heading text-3xl font-bold sm:text-4xl">
                            Got a story?{" "}
                            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                                Spill the ink.
                            </span>
                        </h2>
                    </div>
                    <Link
                        href="/write"
                        className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 font-semibold shadow-lg shadow-fuchsia-500/30 transition hover:scale-105 hover:shadow-fuchsia-500/50"
                    >
                        <PenLine className="size-4" />
                        Start writing
                        <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                </div>

                {/* Brand + links */}
                <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="space-y-4 lg:col-span-2">
                        <Logo className="text-2xl" />
                        <p className="max-w-xs text-sm text-white/60">
                            {siteConfig.description}
                        </p>
                    </div>
                    {columns.map((col) => (
                        <nav key={col.title} aria-label={col.title} className="space-y-4">
                            <h3 className="text-xs font-semibold tracking-widest text-white/40 uppercase">
                                {col.title}
                            </h3>
                            <ul className="space-y-2.5 text-sm">
                                {col.links.map((l) => (
                                    <li key={l.href}>
                                        <Link
                                            href={l.href}
                                            className="text-white/70 transition hover:text-white hover:underline hover:decoration-fuchsia-400 hover:underline-offset-4"
                                        >
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>
            </div>

            {/* Giant wordmark */}
            <p
                aria-hidden
                className="font-heading pointer-events-none relative -mb-[0.22em] text-center text-[22vw] leading-none font-black tracking-tighter select-none lg:text-[16rem]"
            >
                <span className="bg-gradient-to-b from-white/25 to-white/0 bg-clip-text text-transparent">
                    {siteConfig.name}
                </span>
            </p>

            <div className="relative border-t border-white/10">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-white/50 sm:flex-row sm:px-6">
                    <span>
                        © {new Date().getFullYear()} {siteConfig.name} · {siteConfig.tagline}
                    </span>
                    <a
                        href="#top"
                        className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 transition hover:border-fuchsia-400 hover:text-white"
                    >
                        Back to top <ArrowUp className="size-3.5" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
