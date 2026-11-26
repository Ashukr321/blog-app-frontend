"use client";

import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/utils/apiClient";
import type { Comment, Page, PostDetail } from "@/types/post";
import { commentKeys, postKeys } from "../query-keys";

export type CommentNode = Comment & { replies: CommentNode[] };

/** Comments come oldest first, so a parent is always seen before its replies. */
export function buildTree(comments: Comment[]): CommentNode[] {
    const byId = new Map(
        comments.map((c) => [c.id, { ...c, replies: [] as CommentNode[] }]),
    );
    const roots: CommentNode[] = [];
    for (const c of byId.values()) {
        const parent = c.parentId ? byId.get(c.parentId) : undefined;
        (parent ? parent.replies : roots).push(c);
    }
    return roots;
}

export function useComments(postId: string) {
    const query = useInfiniteQuery({
        queryKey: commentKeys.list(postId),
        queryFn: async ({ pageParam }) =>
            (
                await apiClient.get<Page<Comment>>(
                    `/posts/${postId}/comments`,
                    {
                        params: { limit: 50, cursor: pageParam },
                    },
                )
            ).data,
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (last) => last.meta.nextCursor ?? undefined,
    });
    const all = query.data?.pages.flatMap((p) => p.data) ?? [];
    return { ...query, tree: buildTree(all) };
}

type CommentAction =
    | { kind: "add"; body: string; parentId?: string }
    | { kind: "edit"; id: string; body: string }
    | { kind: "delete"; id: string };

export function useCommentAction(post: PostDetail) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (a: CommentAction) => {
            if (a.kind === "add")
                return apiClient.post(`/posts/${post.id}/comments`, {
                    body: a.body,
                    parentId: a.parentId,
                });
            if (a.kind === "edit")
                return apiClient.patch(`/comments/${a.id}`, { body: a.body });
            return apiClient.delete(`/comments/${a.id}`);
        },
        onSuccess: (_, a) => {
            qc.invalidateQueries({ queryKey: commentKeys.list(post.id) });
            const delta = a.kind === "add" ? 1 : a.kind === "delete" ? -1 : 0;
            if (delta)
                qc.setQueryData<PostDetail>(
                    postKeys.detail(post.slug),
                    (p) =>
                        p && {
                            ...p,
                            counts: {
                                ...p.counts,
                                comments: p.counts.comments + delta,
                            },
                        },
                );
        },
    });
}
