import type { MetadataRoute } from "next";
import type { Page, Post } from "@/types/post";
import { API_URL } from "@/utils/apiClient";
import { siteConfig } from "@/utils/site";

// shortcut: only the latest 50 posts are listed; walk nextCursor if the blog outgrows that.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = siteConfig.url;
    const res = await fetch(`${API_URL}/posts?limit=50`, {
        next: { revalidate: 3600 },
    }).catch(() => null);
    const posts: Post[] = res?.ok
        ? ((await res.json()) as Page<Post>).data
        : [];

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        ...posts.map((post) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: post.publishedAt
                ? new Date(post.publishedAt)
                : undefined,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        })),
    ];
}
