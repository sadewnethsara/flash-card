"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Papa from "papaparse";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import {
  ChevronLeft, ChevronRight, RotateCw, Plus, X,
  Upload, BookOpen, Layers, Shuffle, SkipForward,
  AlertCircle, ArrowRight, Check,
} from "lucide-react";

type Card = { question: string; answer: string };
type FlashcardSet = { id: string; name: string; cards: Card[] };

/* ─── Utility: Fisher-Yates shuffle ───────────────────────────── */
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── Animated Orb Background ─────────────────────────────────── */
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#080810]" />
      <motion.div
        className="absolute rounded-full"
        style={{ width: 560, height: 560, background: "radial-gradient(circle,rgba(99,102,241,0.32) 0%,transparent 70%)", top: "-18%", left: "-12%", filter: "blur(64px)" }}
        animate={{ x: [0, 45, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ width: 480, height: 480, background: "radial-gradient(circle,rgba(16,185,129,0.25) 0%,transparent 70%)", bottom: "-12%", right: "-10%", filter: "blur(70px)" }}
        animate={{ x: [0, -40, 0], y: [0, -28, 0], scale: [1, 1.14, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ width: 320, height: 320, background: "radial-gradient(circle,rgba(139,92,246,0.2) 0%,transparent 70%)", top: "38%", left: "33%", filter: "blur(52px)" }}
        animate={{ x: [0, 22, -22, 0], y: [0, -22, 12, 0], scale: [1, 0.88, 1.06, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
      <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "180px 180px" }} />
    </div>
  );
}

/* ─── Custom Menu Icon ─────────────────────────────────────────── */
function MenuIcon({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.9 }}
      className="relative flex items-center justify-center w-10 h-10 rounded-2xl"
      style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.09)" }}
    >
      <motion.div className="absolute inset-0 rounded-2xl" animate={{ opacity: hovered ? 1 : 0 }} style={{ background: "rgba(99,102,241,0.18)" }} />
      <div className="flex flex-col gap-[5px] relative z-10">
        {[0, 1, 2].map((i) => (
          <motion.span key={i} className="block rounded-full bg-white" style={{ height: 1.5 }}
            animate={{ width: hovered ? (i === 1 ? 18 : 12) : (i === 1 ? 12 : 18), opacity: hovered ? 0.9 : 0.5 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          />
        ))}
      </div>
    </motion.button>
  );
}

/* ─── Shuffle Toggle Button ────────────────────────────────────── */
function ShuffleButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      className="relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all"
      style={{
        background: active ? "linear-gradient(135deg,rgba(99,102,241,0.5),rgba(139,92,246,0.5))" : "rgba(255,255,255,0.06)",
        border: active ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.09)",
        boxShadow: active ? "0 0 16px rgba(99,102,241,0.25)" : "none",
      }}
      title="Shuffle mode"
    >
      <Shuffle className="w-4 h-4" style={{ color: active ? "#a5b4fc" : "rgba(255,255,255,0.4)" }} />
      {active && (
        <motion.div
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-400"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}

/* ─── Skip Count Badge ─────────────────────────────────────────── */
function SkipBadge({ count, onClick }: { count: number; onClick: () => void }) {
  if (count === 0) return null;
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.6, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.6 }}
      whileTap={{ scale: 0.92 }}
      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
      style={{
        background: "linear-gradient(135deg,rgba(245,158,11,0.25),rgba(217,119,6,0.2))",
        border: "1px solid rgba(245,158,11,0.35)",
        color: "#fbbf24",
        backdropFilter: "blur(8px)",
      }}
    >
      <AlertCircle className="w-3 h-3" />
      {count} skipped
    </motion.button>
  );
}

/* ─── Skipped Cards Review Sheet/Dialog Content ────────────────── */
function SkippedReview({
  skippedCards,
  onJumpTo,
  onClearAll,
  onClose,
}: {
  skippedCards: { index: number; card: Card }[];
  onJumpTo: (index: number) => void;
  onClearAll: () => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-none">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.18)" }}>
            <AlertCircle className="w-3.5 h-3.5" style={{ color: "#fbbf24" }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight leading-none">Skipped Cards</h2>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{skippedCards.length} card{skippedCards.length !== 1 ? "s" : ""} to revisit</p>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center transition"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
          <X className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto space-y-2.5 min-h-0">
        {skippedCards.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-3" style={{ color: "rgba(255,255,255,0.2)" }}>
            <Check className="w-10 h-10 opacity-40" />
            <p className="text-xs">All caught up — no skipped cards!</p>
          </div>
        ) : (
          skippedCards.map(({ index, card }, i) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onJumpTo(index)}
              className="w-full text-left rounded-2xl p-3.5 flex items-start gap-3 group transition-all"
              style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.14)" }}
            >
              {/* Card number pill */}
              <span className="flex-none text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5"
                style={{ background: "rgba(245,158,11,0.2)", color: "#fbbf24" }}>
                #{index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "rgba(255,255,255,0.75)" }}>{card.question}</p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{card.answer}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 flex-none mt-1 opacity-0 group-hover:opacity-60 transition-opacity" />
            </motion.button>
          ))
        )}
      </div>

      {/* Clear all */}
      {skippedCards.length > 0 && (
        <div className="flex-none pt-4 mt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClearAll}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition"
            style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)", color: "#fbbf24" }}
          >
            <Check className="w-4 h-4" />
            Clear All Skipped
          </motion.button>
        </div>
      )}
    </>
  );
}

/* ─── Sets Menu Content ────────────────────────────────────────── */
function SetListContent({ sets, activeSetId, onSelect, onUploadClick, onClose }: {
  sets: FlashcardSet[]; activeSetId: string | null;
  onSelect: (id: string) => void; onUploadClick: () => void; onClose: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-5 flex-none">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.18)" }}>
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">Flashcard Sets</h2>
        </div>
        <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white transition"
          style={{ background: "rgba(255,255,255,0.06)" }}>
          <X className="w-3.5 h-3.5" />
        </motion.button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {sets.length === 0 && (
          <div className="flex flex-col items-center py-10 gap-3 text-white/20">
            <BookOpen className="w-9 h-9 opacity-40" />
            <p className="text-xs">Upload a CSV to get started</p>
          </div>
        )}
        {sets.map((set, i) => (
          <motion.button key={set.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            onClick={() => onSelect(set.id)}
            className="w-full text-left px-4 py-3 rounded-2xl flex justify-between items-center transition-all group"
            style={activeSetId === set.id
              ? { background: "linear-gradient(135deg,rgba(99,102,241,0.8),rgba(139,92,246,0.8))", boxShadow: "0 4px 20px rgba(99,102,241,0.28)" }
              : { background: "rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full flex-none"
                style={{ background: activeSetId === set.id ? "#fff" : "rgba(99,102,241,0.5)" }} />
              <span className="truncate text-sm font-medium"
                style={{ color: activeSetId === set.id ? "#fff" : "rgba(255,255,255,0.55)" }}>
                {set.name}
              </span>
            </div>
            <span className="text-[11px] flex-none px-2 py-0.5 rounded-full ml-2"
              style={{ background: activeSetId === set.id ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.25)", color: activeSetId === set.id ? "#fff" : "rgba(255,255,255,0.3)" }}>
              {set.cards.length}
            </span>
          </motion.button>
        ))}
      </div>
      <div className="flex-none pt-4 mt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onUploadClick}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white transition"
          style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 6px 20px rgba(16,185,129,0.22)" }}>
          <Plus className="w-4 h-4" />Upload CSV
        </motion.button>
      </div>
    </>
  );
}

/* ─── Bottom Sheet ─────────────────────────────────────────────── */
function BottomSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const y = useMotionValue(0);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[28px]"
            style={{ background: "linear-gradient(160deg,#17172a 0%,#0c0c18 100%)", border: "1px solid rgba(255,255,255,0.08)", borderBottom: "none", maxHeight: "78dvh", y }}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 340 }}
            drag="y" dragConstraints={{ top: 0 }} dragElastic={{ top: 0, bottom: 0.35 }}
            onDragEnd={(_, info) => { if (info.offset.y > 90) onClose(); }}
          >
            <div className="absolute top-0 left-0 right-0 h-px rounded-t-[28px]"
              style={{ background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.5),transparent)" }} />
            <div className="flex justify-center pt-3 pb-1 flex-none">
              <div className="w-8 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }} />
            </div>
            <div className="flex flex-col flex-1 min-h-0 px-5 pb-7 pt-3">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Desktop Dialog ───────────────────────────────────────────── */
function DesktopDialog({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="fixed z-50 flex flex-col rounded-3xl"
            style={{ background: "linear-gradient(160deg,#1c1c2e 0%,#0c0c18 100%)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 40px 100px rgba(0,0,0,0.7),0 0 0 1px rgba(99,102,241,0.12)", width: 356, maxHeight: "68dvh", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
            initial={{ opacity: 0, scale: 0.86, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.86, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="absolute top-0 left-0 right-0 h-px rounded-t-3xl"
              style={{ background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.55),transparent)" }} />
            <div className="flex flex-col flex-1 min-h-0 p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Main App ─────────────────────────────────────────────────── */
export default function FlashcardApp() {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navFeedback, setNavFeedback] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // ── New feature states ──
  const [shuffleMode, setShuffleMode] = useState(false);
  const [cardOrder, setCardOrder] = useState<number[]>([]);           // ordered or shuffled indices
  const [skippedIndices, setSkippedIndices] = useState<Set<number>>(new Set());  // original card indices
  const [showSkipped, setShowSkipped] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const fetchDefaultSets = async () => {
      try {
        const res = await fetch("/api/flashcards");
        const data = await res.json();
        if (data.files?.length > 0) {
          const loadedSets: FlashcardSet[] = data.files.map((file: any) => {
            const parsed = Papa.parse(file.content, { skipEmptyLines: true });
            const cards = parsed.data.map((row: any) => ({ question: row[0] || "", answer: row[1] || "" })).filter((c: Card) => c.question && c.answer);
            return { id: file.name, name: file.name, cards };
          });
          setSets(loadedSets);
          if (loadedSets.length > 0) setActiveSetId(loadedSets[0].id);
        }
      } catch (e) { console.error(e); }
    };
    fetchDefaultSets();
  }, []);

  const activeSet = sets.find((s) => s.id === activeSetId);

  // Rebuild card order when set changes or shuffle toggles
  useEffect(() => {
    if (!activeSet) return;
    const indices = activeSet.cards.map((_, i) => i);
    setCardOrder(shuffleMode ? shuffleArray(indices) : indices);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSkippedIndices(new Set());
  }, [activeSetId, shuffleMode]);

  // The actual card we display (via order mapping)
  const realIndex = cardOrder[currentIndex] ?? 0;
  const currentCard = activeSet?.cards[realIndex];
  const progress = activeSet ? ((currentIndex + 1) / cardOrder.length) * 100 : 0;

  // Skipped cards list (resolved to actual cards)
  const skippedCards = activeSet
    ? [...skippedIndices].map((i) => ({ index: i, card: activeSet.cards[i] }))
    : [];

  const handleNext = useCallback(() => {
    if (activeSet && currentIndex < cardOrder.length - 1) {
      setIsFlipped(false);
      setNavFeedback("→");
      setTimeout(() => setCurrentIndex((p) => p + 1), 150);
    }
  }, [activeSet, currentIndex, cardOrder]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setNavFeedback("←");
      setTimeout(() => setCurrentIndex((p) => p - 1), 150);
    }
  }, [currentIndex]);

  const handleRestart = () => {
    setIsFlipped(false);
    // Re-shuffle if shuffle mode is on
    if (shuffleMode && activeSet) {
      setCardOrder(shuffleArray(activeSet.cards.map((_, i) => i)));
    }
    setTimeout(() => setCurrentIndex(0), 150);
  };

  const handleSkip = () => {
    if (!activeSet) return;
    // Mark real card index as skipped
    setSkippedIndices((prev) => new Set(prev).add(realIndex));
    setNavFeedback("Skipped");
    setIsFlipped(false);
    // Move to next if possible, else stay
    if (currentIndex < cardOrder.length - 1) {
      setTimeout(() => setCurrentIndex((p) => p + 1), 150);
    }
  };

  const handleJumpToSkipped = (originalIndex: number) => {
    // Find position in cardOrder that maps to originalIndex
    const pos = cardOrder.indexOf(originalIndex);
    if (pos !== -1) {
      setCurrentIndex(pos);
    } else {
      // If not in current order (e.g. shuffled away), just set currentIndex to first occurrence
      setCurrentIndex(0);
    }
    setIsFlipped(false);
    setShowSkipped(false);
  };

  const handleClearSkipped = () => {
    setSkippedIndices(new Set());
    setShowSkipped(false);
  };

  const handleToggleShuffle = () => {
    setShuffleMode((p) => !p);
    setNavFeedback(shuffleMode ? "Order" : "Shuffle!");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); setIsFlipped((p) => !p); }
      else if (e.code === "ArrowRight") handleNext();
      else if (e.code === "ArrowLeft") handlePrev();
      else if (e.code === "KeyS" && !e.metaKey && !e.ctrlKey) handleSkip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentIndex, activeSet, cardOrder, realIndex]);

  useEffect(() => {
    if (navFeedback) { const t = setTimeout(() => setNavFeedback(null), 700); return () => clearTimeout(t); }
  }, [navFeedback]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const csvText = ev.target?.result as string;
      const parsed = Papa.parse(csvText, { skipEmptyLines: true });
      const cards = parsed.data.map((row: any) => ({ question: row[0] || "", answer: row[1] || "" })).filter((c: Card) => c.question && c.answer);
      if (cards.length > 0) {
        const newSet: FlashcardSet = { id: file.name + Date.now(), name: file.name.replace(".csv", ""), cards };
        setSets((p) => [...p, newSet]);
        setActiveSetId(newSet.id);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsMenuOpen(false);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSelect = (id: string) => {
    setActiveSetId(id);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsMenuOpen(false);
  };

  const isSkipped = skippedIndices.has(realIndex);

  const menuContent = (
    <SetListContent sets={sets} activeSetId={activeSetId} onSelect={handleSelect}
      onUploadClick={() => { setIsMenuOpen(false); setTimeout(() => fileInputRef.current?.click(), 200); }}
      onClose={() => setIsMenuOpen(false)} />
  );

  const skippedContent = (
    <SkippedReview skippedCards={skippedCards} onJumpTo={handleJumpToSkipped}
      onClearAll={handleClearSkipped} onClose={() => setShowSkipped(false)} />
  );

  return (
    <div className="relative flex flex-col font-sans overflow-hidden text-white select-none"
      style={{ height: "100dvh", maxHeight: "100dvh" }}>
      <AnimatedBackground />

      {/* ── Top Bar ── */}
      <div className="flex-none flex justify-between items-center px-5 py-4 z-10 relative">
        <MenuIcon onClick={() => setIsMenuOpen(true)} />

        {/* Center: set name + skip badge */}
        <div className="flex flex-col items-center gap-1.5">
          <AnimatePresence mode="wait">
            <motion.div key={activeSetId ?? "none"}
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
              className="px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {activeSet ? activeSet.name : "No Set"}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence>
            {skippedIndices.size > 0 && (
              <SkipBadge count={skippedIndices.size} onClick={() => setShowSkipped(true)} />
            )}
          </AnimatePresence>
        </div>

        <ShuffleButton active={shuffleMode} onClick={handleToggleShuffle} />
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 min-h-0 relative z-10">
        {activeSet && currentCard ? (
          <>
            <p className="flex-none text-[11px] tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.18)" }}>
              Space · flip &nbsp;|&nbsp; S · skip &nbsp;|&nbsp; ← → · navigate
            </p>

            {/* Card */}
            <div className="w-full flex-1 min-h-0 max-w-sm cursor-pointer"
              style={{ perspective: "1200px", maxHeight: "55vh" }}
              onClick={() => setIsFlipped((p) => !p)}>
              <motion.div className="w-full h-full relative" style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateX: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.52, type: "spring", stiffness: 290, damping: 25 }}>

                {/* Front */}
                <div className="absolute inset-0 rounded-3xl p-7 flex flex-col items-center justify-center"
                  style={{
                    backfaceVisibility: "hidden",
                    background: isSkipped
                      ? "linear-gradient(150deg,rgba(60,40,10,0.92) 0%,rgba(30,20,5,0.96) 100%)"
                      : "linear-gradient(150deg,rgba(38,38,58,0.92) 0%,rgba(18,18,30,0.96) 100%)",
                    border: isSkipped ? "1px solid rgba(245,158,11,0.22)" : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 28px 64px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.05)",
                    transition: "background 0.4s,border 0.4s",
                  }}>
                  {/* Skipped indicator tag */}
                  {isSkipped && (
                    <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-4 left-4 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: "rgba(245,158,11,0.2)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)" }}>
                      <SkipForward className="w-2.5 h-2.5" /> Skipped
                    </motion.div>
                  )}
                  <motion.h2 key={`q-${currentIndex}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                    className="text-xl md:text-2xl font-semibold text-center leading-snug"
                    style={{ color: isSkipped ? "rgba(251,191,36,0.85)" : "rgba(255,255,255,0.88)" }}>
                    {currentCard.question}
                  </motion.h2>
                  <div className="absolute bottom-5 flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.18)" }}>
                    <div className="w-3 h-3 rounded-full border flex items-center justify-center" style={{ borderColor: "rgba(255,255,255,0.18)" }}>
                      <div className="w-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
                    </div>
                    tap to reveal
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 rounded-3xl p-7 flex items-center justify-center"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateX(180deg)",
                    background: "linear-gradient(150deg,rgba(10,40,32,0.96) 0%,rgba(5,22,18,0.98) 100%)",
                    border: "1px solid rgba(16,185,129,0.18)",
                    boxShadow: "0 28px 64px rgba(0,0,0,0.55),0 0 48px rgba(16,185,129,0.07),inset 0 1px 0 rgba(16,185,129,0.1)",
                  }}>
                  <h2 className="text-xl md:text-2xl font-semibold text-center leading-snug" style={{ color: "#6ee7b7" }}>
                    {currentCard.answer}
                  </h2>
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.18)" }}>
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Progress bar */}
            <div className="flex-none w-full max-w-sm mt-4 flex items-center gap-3">
              <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                {/* Base progress */}
                <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }}
                  animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
              </div>
              {/* Shuffle indicator */}
              {shuffleMode && (
                <Shuffle className="w-3 h-3 flex-none" style={{ color: "rgba(99,102,241,0.6)" }} />
              )}
              <span className="text-xs tabular-nums font-medium" style={{ color: "rgba(255,255,255,0.28)", minWidth: 44, textAlign: "right" }}>
                {currentIndex + 1} / {cardOrder.length}
              </span>
            </div>

            {/* Controls */}
            <div className="flex-none flex items-center justify-between w-full max-w-sm mt-4 mb-1">
              <motion.button whileTap={{ scale: 0.85, rotate: -30 }} onClick={handleRestart}
                className="w-9 h-9 rounded-full flex items-center justify-center transition"
                style={{ color: "rgba(255,255,255,0.28)" }}>
                <RotateCw className="w-4 h-4" />
              </motion.button>

              {/* Nav + Skip cluster */}
              <div className="flex items-center gap-2">
                <motion.button whileTap={{ scale: 0.9 }} onClick={handlePrev} disabled={currentIndex === 0}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center disabled:opacity-20 transition"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>

                {/* Skip button — center pill */}
                <motion.button
                  whileTap={{ scale: 0.88, y: 2 }}
                  onClick={handleSkip}
                  disabled={currentIndex === cardOrder.length - 1 && !isSkipped}
                  className="flex items-center gap-1.5 px-3 h-11 rounded-2xl text-xs font-bold disabled:opacity-30 transition"
                  style={{
                    background: isSkipped
                      ? "rgba(245,158,11,0.25)"
                      : "rgba(255,255,255,0.07)",
                    border: isSkipped
                      ? "1px solid rgba(245,158,11,0.35)"
                      : "1px solid rgba(255,255,255,0.08)",
                    color: isSkipped ? "#fbbf24" : "rgba(255,255,255,0.45)",
                  }}>
                  <SkipForward className="w-3.5 h-3.5" />
                  Skip
                </motion.button>

                <motion.button whileTap={{ scale: 0.9 }} onClick={handleNext} disabled={currentIndex === cardOrder.length - 1}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center disabled:opacity-20 transition"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 8px 28px rgba(99,102,241,0.38)" }}>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="w-9" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4" style={{ color: "rgba(255,255,255,0.25)" }}>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Upload className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-sm">No flashcards loaded</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsMenuOpen(true)}
              className="px-6 py-2.5 rounded-full text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 8px 28px rgba(99,102,241,0.36)" }}>
              Open Menu
            </motion.button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-none text-center text-[10px] py-2 z-10 relative" style={{ color: "rgba(255,255,255,0.12)" }}>
        © Sadew Nethsara {new Date().getFullYear()}
      </div>

      {/* Nav Feedback */}
      <AnimatePresence>
        {navFeedback && (
          <motion.div className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-20"
            style={{ top: 72, color: navFeedback === "Skipped" ? "#fbbf24" : "rgba(255,255,255,0.55)" }}
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.18 }}>
            <span className="text-xl font-bold">{navFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />

      {/* Sets menu */}
      {isMobile ? (
        <BottomSheet open={isMenuOpen} onClose={() => setIsMenuOpen(false)}>{menuContent}</BottomSheet>
      ) : (
        <DesktopDialog open={isMenuOpen} onClose={() => setIsMenuOpen(false)}>{menuContent}</DesktopDialog>
      )}

      {/* Skipped review */}
      {isMobile ? (
        <BottomSheet open={showSkipped} onClose={() => setShowSkipped(false)}>{skippedContent}</BottomSheet>
      ) : (
        <DesktopDialog open={showSkipped} onClose={() => setShowSkipped(false)}>{skippedContent}</DesktopDialog>
      )}
    </div>
  );
}