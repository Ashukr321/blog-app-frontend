// Shapes returned by the blog API (see .todo/frontend-integration/endpoints.md).
export type Author = {
    id: string;
    displayName: string;
    avatarUrl: string | null;
};

export type Reaction = "like" | "dislike";

export type Post = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    photoUrl: string | null;
    author: Author;
    counts: {
        likes: number;
        dislikes: number;
        comments: number;
        shares: number;
        views: number;
    };
    myReaction: Reaction | null;
    publishedAt: string | null;
};

export type PostDetail = Post & {
    content: string;
    status: "draft" | "published";
    createdAt: string;
    updatedAt: string;
};

export type Profile = {
    userId: string;
    email?: string; // only on /me/profile
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
    joinedAt: string;
};

export type Comment = {
    id: string;
    body: string | null;
    parentId: string | null;
    author: Author;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
};

export type Page<T> = {
    data: T[];
    meta: { limit: number; nextCursor: string | null };
};

export type SharePlatform = "whatsapp" | "x" | "facebook" | "linkedin" | "link";
