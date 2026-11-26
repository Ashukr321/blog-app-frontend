import { z } from "zod";

// Optional image URL (from POST /uploads/image); "" means "none" and is sent to the API as null.
// http is allowed because the local API serves uploads over http; other schemes (javascript:, data:) are not.
const imageUrl = z
    .string()
    .trim()
    .max(500, "URL must be at most 500 characters")
    .refine(
        (v) => v === "" || /^https?:\/\/\S+$/.test(v),
        "Must be an http(s) URL",
    );

export const postSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(255),
    excerpt: z
        .string()
        .trim()
        .max(500, "Excerpt must be at most 500 characters"),
    photoUrl: imageUrl,
    content: z.string().trim().min(1, "Content is required"),
});

export const commentSchema = z.object({
    body: z.string().trim().min(1, "Comment can't be empty").max(2000),
});

export const profileSchema = z.object({
    displayName: z.string().trim().min(1, "Name is required").max(80),
    avatarUrl: imageUrl,
    bio: z.string().trim().max(300, "Bio must be at most 300 characters"),
});

export type PostFormInput = z.infer<typeof postSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
