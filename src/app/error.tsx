"use client";

import Link from "next/link";

export default function ErrorPage() {
    return (
        <main className="flex min-h-[60vh] items-center justify-center px-4">
            <div className="bg-card w-full max-w-md rounded-2xl border p-8 text-center shadow-lg">
                <p className="text-destructive text-sm font-semibold tracking-[0.2em] uppercase">
                    Error
                </p>
                <h1 className="mt-3 text-2xl">Something went wrong</h1>
                <p className="text-muted-foreground mt-2 text-sm">
                    Please try again or return to the home page.
                </p>
                <Link
                    href="/"
                    className="bg-primary text-primary-foreground hover:bg-primary/85 mt-5 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold transition"
                >
                    Go home
                </Link>
            </div>
        </main>
    );
}
