import type { Post } from "@/types/post";

// shortcut: static mock posts, replace with an API call (src/services) once the backend exists.
export const posts: Post[] = [
  {
    slug: "getting-started-with-nextjs-app-router",
    title: "Getting Started with the Next.js App Router",
    excerpt:
      "Layouts, server components and data fetching explained with practical examples you can drop into your next project.",
    category: "Web Development",
    author: "Editorial Team",
    publishedAt: "2026-11-18",
    readingMinutes: 8,
  },
  {
    slug: "writing-seo-friendly-blog-posts",
    title: "Writing SEO-Friendly Blog Posts That People Actually Read",
    excerpt:
      "Titles, structure, metadata and internal links — a checklist for posts that rank and keep readers scrolling.",
    category: "Writing",
    author: "Editorial Team",
    publishedAt: "2026-11-12",
    readingMinutes: 6,
  },
  {
    slug: "react-query-patterns",
    title: "React Query Patterns for Real-World Apps",
    excerpt:
      "Query keys, optimistic updates and cache invalidation patterns that scale beyond the todo app.",
    category: "React",
    author: "Editorial Team",
    publishedAt: "2026-11-05",
    readingMinutes: 10,
  },
  {
    slug: "designing-readable-typography",
    title: "Designing Readable Typography for the Web",
    excerpt:
      "Line length, rhythm and contrast: small typographic choices that make long-form reading comfortable.",
    category: "Design",
    author: "Editorial Team",
    publishedAt: "2026-10-29",
    readingMinutes: 5,
  },
  {
    slug: "deep-work-for-developers",
    title: "Deep Work for Developers",
    excerpt:
      "How to protect focus time, batch shallow tasks and ship meaningful work every week.",
    category: "Productivity",
    author: "Editorial Team",
    publishedAt: "2026-10-21",
    readingMinutes: 7,
  },
  {
    slug: "typescript-tips-you-will-use-daily",
    title: "TypeScript Tips You Will Use Daily",
    excerpt:
      "Narrowing, satisfies, utility types and other everyday tricks for safer, cleaner code.",
    category: "Web Development",
    author: "Editorial Team",
    publishedAt: "2026-10-14",
    readingMinutes: 9,
  },
];

export const categories = [...new Set(posts.map((p) => p.category))];
