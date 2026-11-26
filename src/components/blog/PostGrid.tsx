"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard from "@/components/blog/PostCard";
import type { useFeed } from "@/react-query";
import { errorMessage } from "@/utils/apiClient";

type Props = { query: ReturnType<typeof useFeed>; empty: React.ReactNode };

const GridSkeleton = () => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
        ))}
    </div>
);

// The API is cursor-based, so pages are fetched in order and cached; Previous just steps back.
export default function PostGrid({ query, empty }: Props) {
    const {
        data,
        isPending,
        isError,
        error,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = query;
    const [page, setPage] = useState(0);

    if (isPending) return <GridSkeleton />;
    if (isError)
        return (
            <p className="text-destructive text-sm">{errorMessage(error)}</p>
        );

    const pages = data.pages;
    const current = pages[Math.min(page, pages.length - 1)].data;
    if (!current.length) return <>{empty}</>;

    const canNext = page < pages.length - 1 || hasNextPage;
    const goTo = async (p: number) => {
        if (p >= pages.length) await fetchNextPage();
        setPage(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <>
            {isFetchingNextPage ? (
                <GridSkeleton />
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {current.map((p) => (
                        <PostCard key={p.id} post={p} />
                    ))}
                </div>
            )}
            {(page > 0 || canNext) && (
                <nav
                    aria-label="Pagination"
                    className="mt-10 flex items-center justify-center gap-3"
                >
                    <Button
                        variant="outline"
                        disabled={page === 0}
                        onClick={() => goTo(page - 1)}
                    >
                        <ChevronLeft /> Previous
                    </Button>
                    <span className="text-muted-foreground min-w-16 text-center text-sm">
                        Page {page + 1}
                    </span>
                    <Button
                        variant="outline"
                        disabled={!canNext || isFetchingNextPage}
                        onClick={() => goTo(page + 1)}
                    >
                        Next <ChevronRight />
                    </Button>
                </nav>
            )}
        </>
    );
}
