import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* ─── Replace these once before deploying ───────────────────── */
const SITE_URL = "https://flash-cards-preview.vercel.app/";   // ← your real URL
const SITE_NAME = "Flashcard App";
const AUTHOR = "Sadew Nethsara";
const OG_IMAGE = `${SITE_URL}/og-image.png`;  // 1200×630 px
const TWITTER = "@your_twitter";             // ← your handle
/* ────────────────────────────────────────────────────────────── */

/* ─── Fonts ───────────────────────────────────────────────────── */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

/* ─── Viewport ────────────────────────────────────────────────── */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080810" },
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/* ─── Metadata ────────────────────────────────────────────────── */
export const metadata: Metadata = {
  /* Core */
  metadataBase: new URL(SITE_URL),              // ← makes relative URLs absolute automatically
  title: {
    default: `${SITE_NAME} — Study Smarter`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "An interactive flashcard study app with shuffle mode, skip tracking, and offline support. Upload any CSV and start learning in seconds.",
  keywords: [
    "flashcards", "study app", "learning tool", "quiz app",
    "spaced repetition", "education", "exam prep", "memory training",
    "offline study", "CSV flashcards", "free flashcard app",
  ],
  authors: [{ name: AUTHOR, url: SITE_URL }],
  creator: AUTHOR,
  publisher: AUTHOR,

  /* Canonical — prevents duplicate content penalties */
  alternates: {
    canonical: "/",
  },

  /* PWA */
  manifest: "/manifest.json",

  /* Apple */
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Flashcards",
    startupImage: [
      { url: "/splash/apple-splash-1290-2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/apple-splash-1170-2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/apple-splash-750-1334.png", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/splash/apple-splash-2048-2732.png", media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" },
    ],
  },

  /* Icons */
  icons: {
    icon: [
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/apple-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/apple-icon-120x120.png", sizes: "120x120", type: "image/png" },
    ],
    shortcut: "/icons/icon-192x192.png",
  },

  /* Open Graph */
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Study Smarter`,
    description: "Interactive flashcards with shuffle, skip tracking, and offline support. Upload a CSV and study anywhere.",
    images: [{
      url: OG_IMAGE,
      width: 1200,
      height: 630,
      alt: "Flashcard App — study interface preview",
    }],
  },

  /* Twitter / X card */
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Study Smarter`,
    description: "Interactive flashcards with shuffle, skip tracking, and offline support.",
    images: [OG_IMAGE],
    creator: TWITTER,
    site: TWITTER,
  },

  /* Google Search Console verification
     → Get your code at: https://search.google.com/search-console
     → Add property → "URL prefix" → copy the content="" value below */
  verification: {
    google: "ZWrkMslDD-_o146cdjuW3uwkdTpmoE8sFAl-D0rcZjM",  // ← replace
    // yandex: "your-yandex-code",    // optional
    // bing:   "your-bing-code",      // optional
  },

  /* Robots */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  /* Misc */
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "education",
};

/* ─── JSON-LD Structured Data ────────────────────────────────────
   Tells Google exactly what this page is.
   Renders as a rich result in search (app name, description, etc.)
──────────────────────────────────────────────────────────────────── */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description:
    "An interactive flashcard study app with shuffle mode, skip tracking, and offline PWA support.",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: AUTHOR,
    url: SITE_URL,
  },
  featureList: [
    "CSV flashcard upload",
    "Shuffle mode",
    "Skip tracking",
    "Offline support",
    "Progressive Web App",
    "Keyboard shortcuts",
  ],
  screenshot: OG_IMAGE,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    ratingCount: "1",    // update as you get real reviews
  },
};

/* ─── Root Layout ─────────────────────────────────────────────── */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Preconnect for faster Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Canonical — belt-and-suspenders (Next.js also injects one via metadata) */}
        <link rel="canonical" href={SITE_URL} />

        {/* Windows tile */}
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Prevent iOS auto-detection */}
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />

        {/* ── JSON-LD Structured Data ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* ── Service Worker registration ── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker
                    .register('/sw.js', { scope: '/' })
                    .then(r  => console.log('[SW] Registered:', r.scope))
                    .catch(e => console.warn('[SW] Failed:', e));
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`
          ${inter.variable}
          ${spaceGrotesk.variable}
          ${jetbrainsMono.variable}
          font-sans antialiased h-full overflow-hidden
        `}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}