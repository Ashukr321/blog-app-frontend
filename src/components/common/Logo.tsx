import { useId } from "react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/utils/site";

// Ink-drop mark with a pen nib cut into it.
export function LogoMark({ className }: { className?: string }) {
    const id = useId();
    return (
        <svg
            viewBox="0 0 32 32"
            aria-hidden
            className={cn("size-8 shrink-0 drop-shadow-md", className)}
        >
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#6366f1" />
                    <stop offset="0.55" stopColor="#a855f7" />
                    <stop offset="1" stopColor="#ec4899" />
                </linearGradient>
            </defs>
            <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
            <path
                d="M16 5.5c-3.6 4.6-7 9-7 13.1a7 7 0 0 0 14 0c0-4.1-3.4-8.5-7-13.1Z"
                fill="#fff"
            />
            <path
                d="M16 12.5 13 18.2l3 4.3 3-4.3-3-5.7Z"
                fill={`url(#${id})`}
            />
            <path d="M16 17.5v4" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="16" cy="17.3" r="1.1" fill="#fff" />
        </svg>
    );
}

export default function Logo({ className }: { className?: string }) {
    const [head, tail] = [siteConfig.name.slice(0, 3), siteConfig.name.slice(3)];
    return (
        <span
            className={cn(
                "font-heading flex items-center gap-2 text-xl font-bold tracking-tight",
                className,
            )}
        >
            <LogoMark />
            <span>
                {head}
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    {tail}
                </span>
            </span>
        </span>
    );
}
