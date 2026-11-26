import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#050315] flex items-center justify-center p-4 sm:p-6 font-sans antialiased selection:bg-[#0a0a0a] selection:text-white">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[440px]"
      >
        <div className="bg-[#FFFFFF] rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          
          {/* Subtle top ambient background glow */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#0a0a0a]/[0.02] rounded-full blur-3xl pointer-events-none" />

          {/* Animated 404 Badge with Breathing Rings */}
          <div className="relative w-24 h-24 mx-auto mb-8 grid place-items-center">
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-3xl border-[1.5px] border-[#0a0a0a]/15"
            />
            
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-2xl border-[2px] border-dashed border-[#0a0a0a]/20"
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-14 h-14 rounded-2xl bg-[#0a0a0a] text-white flex items-center justify-center shadow-lg shadow-[#0a0a0a]/20 font-extrabold text-lg tracking-tighter"
            >
              404
            </motion.div>
          </div>

          {/* Typography & Error Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <span className="text-[10px] font-bold text-[#737373] uppercase tracking-[0.2em] bg-[#fafafa] px-3 py-1 rounded-full border border-[#f0f0f0]">
              Page Not Found
            </span>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a] tracking-tight mt-4">
              Lost in the circle
            </h1>
            
            <p className="text-sm text-[#737373] mt-2.5 leading-relaxed max-w-[320px] mx-auto">
              The page you are looking for might have been moved, deleted, or never existed in the repository.
            </p>
          </motion.div>

          {/* Action Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-8 space-y-3"
          >
            <motion.button
              type="button"
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl bg-[#0a0a0a] text-white text-[15px] font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-[#0a0a0a]/20 hover:bg-[#1f1f1f] transition-colors cursor-pointer"
            >
              <span>Back to Dashboard</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.button>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="w-full py-3 rounded-xl bg-transparent text-[#737373] hover:text-[#0a0a0a] text-sm font-semibold transition-colors"
            >
              Return to previous page
            </button>
          </motion.div>

          {/* Footer Security / Status Note */}
          <div className="mt-8 pt-5 border-t border-[#f5f5f5] flex items-center justify-center gap-1.5 text-[11px] text-[#a3a3a3] font-semibold uppercase tracking-wider">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <span>Locked In Circle Security</span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}