// Query key factory — centralizes all cache keys for TanStack React Query.

export const authKeys = {
    all: ["auth"] as const,
    me: () => [...authKeys.all, "me"] as const,
};

export const postKeys = {
    all: ["posts"] as const,
    lists: () => [...postKeys.all, "list"] as const,
    feed: () => [...postKeys.lists(), "feed"] as const,
    byAuthor: (userId: string) =>
        [...postKeys.lists(), "author", userId] as const,
    detail: (slug: string) => [...postKeys.all, "detail", slug] as const,
};

export const commentKeys = {
    list: (postId: string) => ["comments", postId] as const,
};

export const profileKeys = {
    detail: (userId: string) => ["profiles", userId] as const,
};
