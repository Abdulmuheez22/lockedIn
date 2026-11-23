import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOADING_STEPS = [
  "Establishing secure connection...",
  "Syncing user profile & metadata...",
  "Loading active session metrics...",
  "Preparing your workspace..."
];

export default function PulseLoader({ 
  message = "Loading your workspace...", 
  subtext = "Please hold on while we secure your session",
  showSteps = true 
}) {
  const [stepIndex, setStepIndex] = useState(0);

  // Cycle through contextual sub-messages if multiple steps are enabled
  useEffect(() => {
    if (!showSteps) return;
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [showSteps]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#050315] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[360px] bg-white rounded-3xl p-8 flex flex-col items-center text-center overflow-hidden"
      >
        {/* Subtle top ambient glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#0a0a0a]/[0.03] rounded-full blur-2xl pointer-events-none" />

        {/* Central Graphic: Breathing Dual Rings + Pulsing Core */}
        <div className="relative w-20 h-20 grid place-items-center mb-6">
          {/* Outer expanding radar ring */}
          <motion.div
            animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-2xl border-[1.5px] border-[#0a0a0a]/20"
          />

          {/* Inner spinning precise border ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-1 rounded-2xl border-[2px] border-transparent border-t-[#0a0a0a] border-r-[#0a0a0a]/40"
          />

          {/* Solid Core Icon / Badge */}
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 rounded-xl bg-[#0a0a0a] text-white flex items-center justify-center shadow-md shadow-[#0a0a0a]/20 font-bold text-xs tracking-tighter"
          >
            LIC
          </motion.div>
        </div>

        {/* Primary Heading */}
        <h2 className="text-base font-bold text-[#0a0a0a] tracking-tight">
          {message}
        </h2>

        {/* Dynamic / Static Subtext with AnimatePresence for smooth transitions */}
        <div className="h-6 mt-1.5 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={showSteps ? LOADING_STEPS[stepIndex] : subtext}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="text-xs text-[#737373] font-medium"
            >
              {showSteps ? LOADING_STEPS[stepIndex] : subtext}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-1 bg-[#f0f0f0] rounded-full mt-6 overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1/2 h-full bg-[#0a0a0a] rounded-full"
          />
        </div>

        {/* Micro Security Note Footer */}
        <div className="mt-6 pt-4 border-t border-[#f5f5f5] w-full flex items-center justify-center gap-1.5 text-[10px] text-[#a3a3a3] uppercase tracking-wider font-semibold">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          Encrypted Connection
        </div>
      </motion.div>
    </div>
  );
}