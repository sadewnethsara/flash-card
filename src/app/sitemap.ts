// app/sitemap.ts
// Next.js automatically serves this at /sitemap.xml
// Submit that URL in Google Search Console

import type { MetadataRoute } from "next";

const SITE_URL = "https://flash-cards-preview.vercel.app/"; // ← replace

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 1,
        },
        // Add more routes here if you expand the app
        // e.g. a /about or /sets page
    ];
}