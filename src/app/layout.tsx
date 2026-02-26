import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* ─── Fonts ───────────────────────────────────────────────────────
   Inter        → clean UI body text
   Space Grotesk → distinctive headings / card text
   JetBrains Mono → monospace fallback (answers, code-like content)
──────────────────────────────────────────────────────────────────── */
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

/* ─── Viewport ────────────────────────────────────────────────────
   Locks scale so the card flip animations don't get interrupted
   by pinch-zoom gestures on mobile.
──────────────────────────────────────────────────────────────────── */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080810" },
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",           // safe-area support (notch / dynamic island)
};

/* ─── Metadata ────────────────────────────────────────────────────
   Full Open Graph so sharing looks great.
   Icons cover every major platform.
   manifest.json enables "Add to Home Screen" on Android/iOS.
──────────────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  /* ── Core ── */
  title: {
    default: "Flashcard App — Study Smarter",
    template: "%s | Flashcard App",
  },
  description:
    "An interactive flashcard study app with shuffle mode, skip tracking, and spaced repetition. Upload any CSV and start learning in seconds.",
  keywords: [
    "flashcards", "study", "learning", "quiz", "spaced repetition",
    "education", "exam prep", "memory", "offline",
  ],
  authors: [{ name: "Sadew Nethsara" }],
  creator: "Sadew Nethsara",
  publisher: "Sadew Nethsara",

  /* ── PWA / Manifest ── */
  manifest: "/manifest.json",

  /* ── Apple ── */
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Flashcards",
    startupImage: [
      // iPhone 14 Pro Max
      { url: "/splash/apple-splash-1290-2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone 14 / 13 / 12
      { url: "/splash/apple-splash-1170-2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone SE
      { url: "/splash/apple-splash-750-1334.png", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" },
      // iPad Pro 12.9"
      { url: "/splash/apple-splash-2048-2732.png", media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" },
    ],
  },

  /* ── Icons ── */
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

  /* ── Open Graph ── */
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://flash-cards-preview.vercel.app/",            // ← replace with your real URL
    siteName: "Flashcard App",
    title: "Flashcard App — Study Smarter",
    description:
      "Interactive flashcards with shuffle, skip tracking, and offline support. Upload a CSV and study anywhere.",
    images: [
      {
        url: "https://flash-cards-preview.vercel.app/og-image.png", // ← replace
        width: 1200,
        height: 630,
        alt: "Flashcard App preview",
      },
    ],
  },

  /* ── Robots ── */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  /* ── Misc ── */
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "education",
};

/* ─── Root Layout ─────────────────────────────────────────────── */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Preconnect to Google Fonts CDN for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* MS Tile (Windows pinned sites) */}
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Prevent iOS from auto-detecting phone numbers / addresses */}
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />

        {/* PWA: service worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker
                    .register('/sw.js', { scope: '/' })
                    .then(function (reg) {
                      console.log('[SW] Registered:', reg.scope);
                    })
                    .catch(function (err) {
                      console.warn('[SW] Registration failed:', err);
                    });
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