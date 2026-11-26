import type { Metadata } from "next";
import PostView from "@/components/blog/PostView";
import type { PostDetail } from "@/types/post";
import { API_URL } from "@/utils/apiClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    // shortcut: by-slug counts a view; the 5-min cache keeps metadata to ≤1 extra view per slug per 5 min.
    // Upgrade when the API gets a view-free metadata endpoint.
    const res = await fetch(
        `${API_URL}/posts/by-slug/${encodeURIComponent(slug)}`,
        {
            next: { revalidate: 300 },
        },
    ).catch(() => null);
    if (!res?.ok) return { title: "Post" };
    const post: PostDetail = (await res.json()).data;
    const description = post.excerpt ?? undefined;

    return {
        title: post.title,
        description,
        alternates: { canonical: `/blog/${post.slug}` },
        openGraph: {
            type: "article",
            url: `/blog/${post.slug}`,
            title: post.title,
            description,
            publishedTime: post.publishedAt ?? undefined,
            authors: [post.author.displayName],
            images: post.photoUrl ? [post.photoUrl] : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description,
        },
    };
}

export default async function PostPage({ params }: Props) {
    const { slug } = await params;
    return <PostView slug={slug} />;
}
