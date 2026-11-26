import type { MetadataRoute } from "next";
import { siteConfig } from "@/utils/site";

// ✏️ Update the sitemap URL and rules to match your project.
// Disallow paths you don't want search engines to index (admin, API, auth pages, etc.)

export default function robots(): MetadataRoute.Robots {
    const baseUrl = siteConfig.url;

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/",
                    "/dashboard/",
                    "/login",
                    "/register",
                    "/forgot-password",
                    "/reset-password",
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
