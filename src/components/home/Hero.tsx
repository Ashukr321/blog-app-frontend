"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, PenLine, Sparkles } from "lucide-react";
import { siteConfig } from "@/utils/site";

gsap.registerPlugin(useGSAP);

// Last two words of the tagline get the animated gradient treatment.
const HIGHLIGHT_WORDS = 2;

export default function Hero({ isAuthed }: { isAuthed: boolean }) {
    const root = useRef<HTMLElement>(null);
    const words = siteConfig.tagline.split(" ");
    const splitAt = words.length - HIGHLIGHT_WORDS;

    useGSAP(
        () => {
            const mm = gsap.matchMedia();

            mm.add("(prefers-reduced-motion: no-preference)", () => {
                const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

                tl.from(".hero-blob", {
                    scale: 0.4,
                    opacity: 0,
                    duration: 1.6,
                    stagger: 0.15,
                })
                    .from(
                        ".hero-badge",
                        { y: -30, opacity: 0, scale: 0.6, duration: 0.9, ease: "back.out(2.5)" },
                        0.1,
                    )
                    .from(
                        ".hero-char",
                        {
                            yPercent: 120,
                            rotateX: -100,
                            opacity: 0,
                            duration: 1.1,
                            stagger: { each: 0.025, from: "start" },
                        },
                        0.25,
                    )
                    .from(
                        ".hero-highlight",
                        {
                            scale: 2.2,
                            opacity: 0,
                            filter: "blur(16px)",
                            duration: 1.2,
                            stagger: 0.12,
                        },
                        "-=0.7",
                    )
                    .from(
                        ".hero-underline",
                        { scaleX: 0, duration: 0.9, ease: "power4.inOut" },
                        "-=0.5",
                    )
                    .from(
                        ".hero-word",
                        { y: 18, opacity: 0, duration: 0.6, stagger: 0.015 },
                        "-=0.7",
                    )
                    .from(
                        ".hero-cta",
                        { y: 30, opacity: 0, scale: 0.8, duration: 0.9, ease: "elastic.out(1, 0.5)" },
                        "-=0.4",
                    );

                // Endless motion after the intro
                gsap.to(".hero-highlight", {
                    backgroundPosition: "200% center",
                    duration: 4,
                    ease: "none",
                    repeat: -1,
                });
                gsap.to(".hero-blob", {
                    x: "random(-60, 60)",
                    y: "random(-40, 40)",
                    duration: 6,
                    ease: "sine.inOut",
                    repeat: -1,
                    repeatRefresh: true,
                    yoyo: true,
                });
            });

            // Title tilt + magnetic button: only on devices that can hover
            mm.add(
                "(hover: hover) and (prefers-reduced-motion: no-preference)",
                () => {
                    const el = root.current!;
                    const titleX = gsap.quickTo(".hero-title", "rotateY", { duration: 1, ease: "power3" });
                    const titleY = gsap.quickTo(".hero-title", "rotateX", { duration: 1, ease: "power3" });

                    const onMove = (e: PointerEvent) => {
                        const r = el.getBoundingClientRect();
                        const nx = (e.clientX - r.left) / r.width - 0.5;
                        const ny = (e.clientY - r.top) / r.height - 0.5;
                        titleX(nx * 10);
                        titleY(-ny * 10);
                    };
                    el.addEventListener("pointermove", onMove);

                    const cta = el.querySelector<HTMLElement>(".hero-cta-link")!;
                    const cx = gsap.quickTo(cta, "x", { duration: 0.5, ease: "power3" });
                    const cy = gsap.quickTo(cta, "y", { duration: 0.5, ease: "power3" });
                    const onCta = (e: PointerEvent) => {
                        const r = cta.getBoundingClientRect();
                        cx((e.clientX - r.left - r.width / 2) * 0.35);
                        cy((e.clientY - r.top - r.height / 2) * 0.35);
                    };
                    const resetCta = () => {
                        cx(0);
                        cy(0);
                    };
                    cta.addEventListener("pointermove", onCta);
                    cta.addEventListener("pointerleave", resetCta);

                    return () => {
                        el.removeEventListener("pointermove", onMove);
                        cta.removeEventListener("pointermove", onCta);
                        cta.removeEventListener("pointerleave", resetCta);
                    };
                },
            );
        },
        { scope: root },
    );

    return (
        <section
            ref={root}
            className="relative isolate py-20 text-center sm:py-28"
        >
            {/* Moving glow blobs */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <div className="hero-blob bg-primary/30 absolute top-0 left-[15%] size-72 rounded-full blur-3xl" />
                <div className="hero-blob absolute top-10 right-[12%] size-80 rounded-full bg-fuchsia-400/25 blur-3xl" />
                <div className="hero-blob absolute bottom-0 left-1/3 size-64 rounded-full bg-sky-400/25 blur-3xl" />
            </div>

            <span className="hero-badge bg-background/70 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
                <Sparkles className="text-primary size-3.5" />
                Stories, guides &amp; ideas
            </span>

            <h1
                aria-label={siteConfig.tagline}
                className="hero-title mx-auto mt-6 max-w-4xl text-4xl leading-[1.1] font-extrabold text-balance [perspective:800px] sm:text-6xl lg:text-7xl"
            >
                {words.map((word, wi) =>
                    wi < splitAt ? (
                        <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
                            {word.split("").map((ch, ci) => (
                                <span
                                    key={ci}
                                    className="hero-char text-foreground inline-block [transform-origin:50%_100%]"
                                >
                                    {ch}
                                </span>
                            ))}
                            &nbsp;
                        </span>
                    ) : (
                        <span key={wi} aria-hidden className="relative inline-block">
                            <span className="hero-highlight inline-block bg-gradient-to-r from-indigo-500 via-pink-500 to-indigo-500 bg-[length:200%_auto] bg-clip-text pb-2 text-transparent">
                                {word}
                            </span>
                            {wi === words.length - 1 && (
                                <span className="hero-underline absolute right-0 bottom-0 left-0 h-1.5 origin-left rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                            )}
                            {wi < words.length - 1 && " "}
                        </span>
                    ),
                )}
            </h1>

            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-pretty sm:text-lg">
                {siteConfig.description.split(" ").map((w, i) => (
                    <span key={i} className="hero-word inline-block">
                        {w}&nbsp;
                    </span>
                ))}
            </p>

            <div className="hero-cta mt-10">
                <Link
                    href={isAuthed ? "/write" : "/register"}
                    className="hero-cta-link group bg-primary text-primary-foreground shadow-primary/30 focus-visible:ring-ring/50 relative inline-flex h-12 items-center overflow-hidden rounded-full px-7 text-base font-medium shadow-lg transition-[padding,box-shadow] duration-300 ease-out outline-none hover:px-9 hover:shadow-xl hover:shadow-fuchsia-500/40 focus-visible:px-9 focus-visible:ring-3 motion-reduce:transition-none"
                >
                    {/* Footer gradient fades in on hover (gradients can't transition, opacity can) */}
                    <span
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                    />
                    <span
                        aria-hidden
                        className="relative max-w-0 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:mr-2 group-hover:max-w-4 group-hover:opacity-100 group-focus-visible:mr-2 group-focus-visible:max-w-4 group-focus-visible:opacity-100"
                    >
                        <PenLine className="size-4" />
                    </span>
                    <span className="relative">
                        {isAuthed ? "Write a post" : "Start writing"}
                    </span>
                    <ArrowUpRight className="relative ml-2 size-4 rotate-45 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:rotate-0" />
                </Link>
            </div>
        </section>
    );
}
