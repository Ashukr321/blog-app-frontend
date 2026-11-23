// Single source for site-wide name/URL/SEO copy — used by layout metadata, manifest, robots, sitemap, home page.
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Blog App",
  tagline: "Stories, guides and ideas worth reading",
  description:
    "A modern blog with in-depth articles on web development, design, productivity and technology — written by developers, for developers.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: [
    "blog",
    "articles",
    "web development",
    "programming",
    "Next.js",
    "React",
    "design",
    "technology",
    "tutorials",
  ],
};
