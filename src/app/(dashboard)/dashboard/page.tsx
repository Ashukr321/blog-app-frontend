"use client";

import Link from "next/link";
import { PenSquare, Settings } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import PostGrid from "@/components/blog/PostGrid";
import EmptyState from "@/components/common/EmptyState";
import UserAvatar from "@/components/common/UserAvatar";
import { useAuthorPosts, useMe } from "@/react-query";

function MyPosts({ userId }: { userId: string }) {
    const posts = useAuthorPosts(userId);
    return (
        <PostGrid
            query={posts}
            empty={
                <EmptyState
                    title="Your first story awaits"
                    description="You haven't published anything yet."
                    action={{ href: "/write", label: "Write a post" }}
                />
            }
        />
    );
}

export default function DashboardPage() {
    const { data: me } = useMe();
    if (!me) return null; // layout guards this

    return (
        <div className="grid gap-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <UserAvatar user={me} size="lg" />
                    <div className="min-w-0">
                        <h1 className="truncate text-xl font-semibold">
                            Hi, {me.displayName}
                        </h1>
                        <p className="text-muted-foreground truncate text-sm">
                            {me.email}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/settings"
                        className={buttonVariants({ variant: "outline" })}
                    >
                        <Settings /> Settings
                    </Link>
                    <Link href="/write" className={buttonVariants()}>
                        <PenSquare /> New post
                    </Link>
                </div>
            </div>
            <section>
                <h2 className="mb-4 text-lg font-semibold">
                    Your published posts
                </h2>
                <p className="text-muted-foreground -mt-3 mb-4 text-xs">
                    Drafts aren&apos;t listed yet; open them from the link you
                    get after saving.
                </p>
                <MyPosts userId={me.userId} />
            </section>
        </div>
    );
}
