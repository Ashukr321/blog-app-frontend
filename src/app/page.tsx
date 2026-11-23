import Link from "next/link";
import { categories, posts } from "@/mocks-data/posts";
import { siteConfig } from "@/utils/site";
import type { Post } from "@/types/post";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function Home() {
  const [featured, ...latest] = posts;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.excerpt,
      datePublished: p.publishedAt,
      author: { "@type": "Person", name: p.author },
      url: `${siteConfig.url}/blog/${p.slug}`,
    })),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            {siteConfig.name}
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-slate-600 hover:text-slate-900"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
        <section className="py-16 text-center sm:py-24">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-600">
            {siteConfig.name}
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            {siteConfig.tagline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 text-pretty">
            {siteConfig.description}
          </p>
          <ul className="mt-8 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <li
                key={c}
                className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-700"
              >
                {c}
              </li>
            ))}
          </ul>
        </section>

        {featured && (
          <section aria-labelledby="featured-heading" className="mb-16">
            <h2 id="featured-heading" className="sr-only">
              Featured post
            </h2>
            <Link
              href={`/blog/${featured.slug}`}
              className="group grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md md:grid-cols-2"
            >
              <div
                aria-hidden
                className="min-h-48 bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400"
              />
              <div className="flex flex-col justify-center gap-3 p-6 sm:p-10">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Featured · {featured.category}
                </span>
                <h3 className="text-2xl font-bold tracking-tight group-hover:text-indigo-600 sm:text-3xl">
                  {featured.title}
                </h3>
                <p className="text-slate-600">{featured.excerpt}</p>
                <PostMeta post={featured} />
              </div>
            </Link>
          </section>
        )}

        <section aria-labelledby="latest-heading" className="mb-20">
          <h2
            id="latest-heading"
            className="mb-6 text-2xl font-bold tracking-tight"
          >
            Latest articles
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((post) => (
              <article key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    {post.category}
                  </span>
                  <h3 className="text-lg font-semibold leading-snug group-hover:text-indigo-600">
                    {post.title}
                  </h3>
                  <p className="flex-1 text-sm text-slate-600">
                    {post.excerpt}
                  </p>
                  <PostMeta post={post} />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-20 rounded-2xl bg-slate-900 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Start writing your own stories
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Create a free account to publish posts, save favourites and join
            the conversation.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-200"
          >
            Create an account
          </Link>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-slate-500 sm:px-6">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function PostMeta({ post }: { post: Post }) {
  return (
    <p className="text-xs text-slate-500">
      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      {" · "}
      {post.readingMinutes} min read
    </p>
  );
}
