// app/opengraph-image.tsx
// Next.js auto-serves this as /opengraph-image.png (1200×630)
// This replaces a static og-image.png — it's generated on the server.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Flashcard App — Study Smarter";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #080810 0%, #1a1a2e 50%, #0d2137 100%)",
                    fontFamily: "sans-serif",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Background orb — indigo */}
                <div style={{
                    position: "absolute", width: 600, height: 600,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)",
                    top: -150, left: -100,
                    filter: "blur(80px)",
                    display: "flex",
                }} />

                {/* Background orb — emerald */}
                <div style={{
                    position: "absolute", width: 500, height: 500,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(16,185,129,0.28) 0%, transparent 70%)",
                    bottom: -100, right: -80,
                    filter: "blur(80px)",
                    display: "flex",
                }} />

                {/* Card mockup */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(38,38,58,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 32,
                    padding: "48px 64px",
                    marginBottom: 40,
                    boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
                    minWidth: 520,
                }}>
                    <div style={{ fontSize: 20, color: "rgba(255,255,255,0.35)", marginBottom: 16, letterSpacing: 3, display: "flex" }}>
                        QUESTION
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 700, color: "#fff", textAlign: "center", display: "flex" }}>
                        What is spaced repetition?
                    </div>
                </div>

                {/* App name */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 16,
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 28,
                    }}>
                        🃏
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 32, fontWeight: 800, color: "#fff", display: "flex" }}>
                            Flashcard App
                        </span>
                        <span style={{ fontSize: 18, color: "rgba(255,255,255,0.45)", display: "flex" }}>
                            Study Smarter · Offline Ready · Free
                        </span>
                    </div>
                </div>

                {/* Feature pills */}
                <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
                    {["Shuffle Mode", "Skip Tracking", "CSV Upload", "PWA"].map((f) => (
                        <div key={f} style={{
                            display: "flex",
                            padding: "8px 20px",
                            borderRadius: 999,
                            background: "rgba(99,102,241,0.2)",
                            border: "1px solid rgba(99,102,241,0.4)",
                            color: "#a5b4fc",
                            fontSize: 16,
                            fontWeight: 600,
                        }}>
                            {f}
                        </div>
                    ))}
                </div>
            </div>
        ),
        { ...size }
    );
}