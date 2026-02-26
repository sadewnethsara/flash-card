"use client";

import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCw, Menu, Plus, X, Upload } from "lucide-react";

type Card = {
  question: string;
  answer: string;
};

type FlashcardSet = {
  id: string;
  name: string;
  cards: Card[];
};

export default function FlashcardApp() {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navFeedback, setNavFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial CSVs from public/flashcards
  useEffect(() => {
    const fetchDefaultSets = async () => {
      try {
        const res = await fetch("/api/flashcards");
        const data = await res.json();
        
        if (data.files && data.files.length > 0) {
          const loadedSets: FlashcardSet[] = data.files.map((file: any) => {
            const parsed = Papa.parse(file.content, { skipEmptyLines: true });
            const cards = parsed.data.map((row: any) => ({
              question: row[0] || "",
              answer: row[1] || "",
            })).filter(c => c.question && c.answer);

            return { id: file.name, name: file.name, cards };
          });

          setSets(loadedSets);
          if (loadedSets.length > 0) setActiveSetId(loadedSets[0].id);
        }
      } catch (error) {
        console.error("Error loading default sets:", error);
      }
    };
    fetchDefaultSets();
  }, []);

  const activeSet = sets.find((s) => s.id === activeSetId);
  const currentCard = activeSet?.cards[currentIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === "ArrowRight") {
        handleNext();
      } else if (e.code === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, activeSet]);

  const handleNext = () => {
    if (activeSet && currentIndex < activeSet.cards.length - 1) {
      setIsFlipped(false);
      setNavFeedback("Next");
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setNavFeedback("Previous");
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 150);
    }
  };

  const handleRestart = () => {
    setIsFlipped(false);
    setNavFeedback(null);
    setTimeout(() => setCurrentIndex(0), 150);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      const parsed = Papa.parse(csvText, { skipEmptyLines: true });
      const cards = parsed.data.map((row: any) => ({
        question: row[0] || "",
        answer: row[1] || "",
      })).filter(c => c.question && c.answer);

      if (cards.length > 0) {
        const newSet: FlashcardSet = {
          id: file.name + Date.now(),
          name: file.name.replace(".csv", ""),
          cards,
        };
        setSets((prev) => [...prev, newSet]);
        setActiveSetId(newSet.id);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsMenuOpen(false);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (navFeedback) {
      const timer = setTimeout(() => setNavFeedback(null), 800);
      return () => clearTimeout(timer);
    }
  }, [navFeedback]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 flex flex-col items-center justify-center font-sans overflow-hidden text-white">
      
      {/* Top Bar */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
        <button onClick={() => setIsMenuOpen(true)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition backdrop-blur-md">
          <Menu className="w-6 h-6" />
        </button>
        <span className="text-sm font-medium text-white/60 tracking-wider uppercase">
          {activeSet ? activeSet.name : "No Set Selected"}
        </span>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Main Flashcard Area */}
      {activeSet && currentCard ? (
        <div className="flex flex-col items-center w-full max-w-md px-4 mt-12">
          <p className="text-white/50 text-sm mb-6 animate-pulse">Press "Space" to flip, "← / →" to navigate</p>
          
          <div className="relative w-full aspect-[4/5] perspective-1000 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div
              className="w-full h-full relative preserve-3d"
              animate={{ rotateX: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            >
              {/* Front of Card */}
              <div className="absolute w-full h-full backface-hidden bg-[#2C2C2E] rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center border border-white/5">
                <h2 className="text-2xl md:text-3xl font-semibold text-center leading-tight">
                  {currentCard.question}
                </h2>
                <span className="absolute bottom-8 text-white/30 text-sm font-medium">See answer</span>
              </div>

              {/* Back of Card */}
              <div className="absolute w-full h-full backface-hidden bg-emerald-900/90 rounded-3xl p-8 shadow-2xl flex items-center justify-center rotate-x-180 border border-emerald-500/20">
                <h2 className="text-2xl md:text-3xl font-semibold text-center text-emerald-50 leading-tight">
                  {currentCard.answer}
                </h2>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between w-full mt-10 px-4">
            <button onClick={handleRestart} className="p-3 text-white/50 hover:text-white transition">
              <RotateCw className="w-5 h-5" />
            </button>
            <div className="flex space-x-6">
              <button onClick={handlePrev} disabled={currentIndex === 0} className="p-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 transition backdrop-blur-md">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={handleNext} disabled={currentIndex === activeSet.cards.length - 1} className="p-4 rounded-full bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 transition shadow-lg shadow-indigo-500/30">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <div className="w-11"></div> {/* Spacer */}
          </div>

          {/* Progress Bar */}
          <div className="w-full mt-10 flex items-center space-x-4">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / activeSet.cards.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-white/50 min-w-[60px] text-right">
              {currentIndex + 1} / {activeSet.cards.length}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-white/50">
          <Upload className="w-16 h-16 mb-4 opacity-50" />
          <p>No flashcards found.</p>
          <button onClick={() => setIsMenuOpen(true)} className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-full">
            Open Menu to Add
          </button>
        </div>
      )}

      {/* navigation feedback */}
      <AnimatePresence>
        {navFeedback && (
          <motion.div
            className="absolute top-24 text-2xl font-bold text-white/90"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {navFeedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="absolute left-0 top-0 bottom-0 w-80 bg-[#1C1C1E] z-50 p-6 flex flex-col shadow-2xl border-r border-white/10"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Your Sets</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-white/50 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                {sets.map((set) => (
                  <button
                    key={set.id}
                    onClick={() => {
                      setActiveSetId(set.id);
                      setCurrentIndex(0);
                      setIsFlipped(false);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left p-4 rounded-2xl transition flex justify-between items-center ${
                      activeSetId === set.id ? "bg-indigo-500 text-white shadow-lg" : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <span className="truncate font-medium pr-2">{set.name}</span>
                    <span className="text-xs opacity-60 bg-black/20 px-2 py-1 rounded-full">{set.cards.length}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-2xl transition shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-semibold">Upload CSV</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* copyright */}
      <div className="absolute bottom-2 w-full text-center text-[10px] text-white/30">
        © Sadew Nethsara {new Date().getFullYear()}
      </div>
    </div>
  );
}