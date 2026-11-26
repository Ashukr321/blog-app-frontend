"use client";

import { use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PostGrid from "@/components/blog/PostGrid";
import EmptyState from "@/components/common/EmptyState";
import UserAvatar from "@/components/common/UserAvatar";
import { useAuthorPosts, useProfile } from "@/react-query";
import { errorMessage } from "@/utils/apiClient";
import { formatDate } from "@/utils/format";

export default function ProfilePage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = use(params);
    const { data: profile, isPending, error } = useProfile(userId);
    const posts = useAuthorPosts(userId);

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
            {isPending ? (
                <Skeleton className="h-20 w-full max-w-md" />
            ) : error ? (
                <p className="text-destructive">{errorMessage(error)}</p>
            ) : (
                <>
                    <div className="mb-10 flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
                        <UserAvatar
                            user={profile}
                            className="size-16 text-lg"
                        />
                        <div className="min-w-0">
                            <h1 className="text-3xl">{profile.displayName}</h1>
                            {profile.bio && (
                                <p className="text-muted-foreground mt-1">
                                    {profile.bio}
                                </p>
                            )}
                            <p className="text-muted-foreground mt-1 text-xs">
                                Joined {formatDate(profile.joinedAt)}
                            </p>
                        </div>
                    </div>
                    <PostGrid
                        query={posts}
                        empty={
                            <EmptyState
                                title="No posts yet"
                                description="This writer hasn't published anything yet."
                            />
                        }
                    />
                </>
            )}
        </div>
    );
}
