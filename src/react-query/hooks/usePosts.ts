"use client";

import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { apiClient, errorStatus } from "@/utils/apiClient";
import type {
    Page,
    Post,
    PostDetail,
    Profile,
    Reaction,
    SharePlatform,
} from "@/types/post";
import { postKeys, profileKeys } from "../query-keys";

const PAGE_SIZE = 9;

function usePostList(queryKey: readonly unknown[], path: string) {
    const query = useInfiniteQuery({
        queryKey,
        queryFn: async ({ pageParam }) =>
            (
                await apiClient.get<Page<Post>>(path, {
                    params: { limit: PAGE_SIZE, cursor: pageParam },
                })
            ).data,
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (last) => last.meta.nextCursor ?? undefined,
    });
    return { ...query, posts: query.data?.pages.flatMap((p) => p.data) ?? [] };
}

export const useFeed = () => usePostList(postKeys.feed(), "/posts");

export const useAuthorPosts = (userId: string) =>
    usePostList(postKeys.byAuthor(userId), `/profiles/${userId}/posts`);

export function useProfile(userId: string) {
    return useQuery({
        queryKey: profileKeys.detail(userId),
        queryFn: async () =>
            (await apiClient.get<{ data: Profile }>(`/profiles/${userId}`)).data
                .data,
    });
}

/** Each fetch adds a view, so never refetch on its own. */
export function usePost(slug: string) {
    return useQuery({
        queryKey: postKeys.detail(slug),
        queryFn: async () =>
            (
                await apiClient.get<{ data: PostDetail }>(
                    `/posts/by-slug/${encodeURIComponent(slug)}`,
                )
            ).data.data,
        staleTime: Infinity,
        retry: (count, err) => count < 1 && errorStatus(err) !== 404,
    });
}

export type PostInput = {
    title: string;
    content: string;
    excerpt: string | null;
    photoUrl: string | null;
    status: "draft" | "published";
};

export function useSavePost(postId?: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: Partial<PostInput>) => {
            const res = postId
                ? await apiClient.patch<{ data: PostDetail }>(
                      `/posts/${postId}`,
                      body,
                  )
                : await apiClient.post<{ data: PostDetail }>("/posts", body);
            return res.data.data;
        },
        onSuccess: (post) => {
            qc.setQueryData(postKeys.detail(post.slug), post);
            qc.invalidateQueries({ queryKey: postKeys.lists() });
        },
    });
}

export function useDeletePost() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (postId: string) => apiClient.delete(`/posts/${postId}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: postKeys.lists() }),
    });
}

export function useReaction(post: PostDetail) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (type: Reaction) => {
            const url = `/posts/${post.id}/reaction`;
            type R = {
                data: {
                    myReaction: Reaction | null;
                    likeCount: number;
                    dislikeCount: number;
                };
            };
            const res =
                post.myReaction === type
                    ? await apiClient.delete<R>(url)
                    : await apiClient.put<R>(url, { type });
            return res.data.data;
        },
        onSuccess: ({ myReaction, likeCount, dislikeCount }) => {
            qc.setQueryData<PostDetail>(
                postKeys.detail(post.slug),
                (p) =>
                    p && {
                        ...p,
                        myReaction,
                        counts: {
                            ...p.counts,
                            likes: likeCount,
                            dislikes: dislikeCount,
                        },
                    },
            );
            qc.invalidateQueries({ queryKey: postKeys.lists() });
        },
    });
}

export function useShare(post: PostDetail) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (platform: SharePlatform) =>
            (
                await apiClient.post<{
                    data: { shareCount: number; shareUrl: string };
                }>(`/posts/${post.id}/shares`, { platform })
            ).data.data,
        onSuccess: ({ shareCount }) =>
            qc.setQueryData<PostDetail>(
                postKeys.detail(post.slug),
                (p) =>
                    p && { ...p, counts: { ...p.counts, shares: shareCount } },
            ),
    });
}
