// app/robots.ts
// Next.js automatically serves this at /robots.txt

import type { MetadataRoute } from "next";

const SITE_URL = "https://flash-cards-preview.vercel.app/"; // ← replace

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/"],   // don't index internal API routes
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}