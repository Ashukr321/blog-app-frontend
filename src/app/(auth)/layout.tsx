import type { ReactNode } from "react";
import Image from "next/image";
import { siteConfig } from "@/utils/site";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="mx-auto grid w-full max-w-6xl flex-1 lg:grid-cols-2 lg:gap-12 lg:px-6 lg:py-12">
            {/* Quiet editorial panel, desktop only */}
            <aside className="shadow-primary/20 relative hidden flex-col justify-between overflow-hidden rounded-3xl p-10 text-white shadow-2xl lg:flex">
                <Image
                    src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80"
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 0px"
                    className="object-cover"
                />
                {/* Brand gradient over the photo keeps the white text readable */}
                <div
                    aria-hidden
                    className="from-primary/90 absolute inset-0 bg-gradient-to-br via-violet-700/75 to-fuchsia-700/85"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/15 blur-3xl"
                />
                <p className="font-heading relative text-sm font-bold tracking-wide text-white/80 uppercase">
                    {siteConfig.name}
                </p>
                <blockquote className="relative space-y-4">
                    <p className="font-heading text-4xl leading-tight font-bold">
                        “Write what should not be forgotten.”
                    </p>
                    <footer className="text-sm text-white/70">
                        — Isabel Allende
                    </footer>
                </blockquote>
                <p className="relative text-sm text-white/70">{siteConfig.tagline}</p>
            </aside>

            <div className="flex items-center justify-center px-4 py-12 sm:py-16">
                <div className="w-full max-w-sm">{children}</div>
            </div>
        </div>
    );
}
