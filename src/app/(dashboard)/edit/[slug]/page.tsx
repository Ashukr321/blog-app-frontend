"use client";

import { use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PostForm from "@/components/blog/PostForm";
import { useMe, usePost } from "@/react-query";
import { errorMessage } from "@/utils/apiClient";

export default function EditPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = use(params);
    const { data: post, isPending, error } = usePost(slug);
    const { data: me } = useMe();

    if (isPending) return <Skeleton className="h-96 w-full rounded-xl" />;
    if (error) return <p className="text-destructive">{errorMessage(error)}</p>;
    if (post.author.id !== me?.userId)
        return (
            <p className="text-muted-foreground">
                You can only edit your own posts.
            </p>
        );

    return (
        <>
            <h1 className="sr-only">Edit post</h1>
            <PostForm post={post} />
        </>
    );
}
