"use client";

import Hero from "@/components/home/Hero";
import PostGrid from "@/components/blog/PostGrid";
import EmptyState from "@/components/common/EmptyState";
import { useFeed, useMe } from "@/react-query";

export default function Home() {
    const feed = useFeed();
    const { data: me } = useMe();

    return (
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <Hero isAuthed={!!me} />

            <section aria-labelledby="latest" className="pb-16">
                <div className="mb-8 flex items-end justify-between gap-4 border-b pb-4">
                    <div>
                        <p className="text-primary text-xs font-semibold tracking-widest uppercase">
                            The journal
                        </p>
                        <h2 id="latest" className="mt-1 text-2xl sm:text-3xl">
                            Latest posts
                        </h2>
                    </div>
                </div>
                <PostGrid
                    query={feed}
                    empty={
                        <EmptyState
                            title="Nothing here yet"
                            description="The page is blank and waiting. Share an idea, a guide or a story — be the first to publish."
                            action={{
                                href: me ? "/write" : "/register",
                                label: me
                                    ? "Write the first post"
                                    : "Start writing",
                            }}
                        />
                    }
                />
            </section>
        </div>
    );
}
