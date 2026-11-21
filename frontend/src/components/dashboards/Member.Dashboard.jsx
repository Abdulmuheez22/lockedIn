import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  BookOpen,
  PenLine,
  RotateCcw,
  PlayCircle,
  Users,
  Target,
  Eye,
  BellRing,
  Smile,
  Meh,
  Frown,
  CheckCircle2,
  Smartphone,
  BatteryLow,
  HelpCircle,
  Clock,
  X,
  Plus,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   MOCK DATA
   ────────────────────────────────────────────────────────────── */
const mockUser = {
  name: "Adebayo",
  department: "Computer Science",
  level: "300 Level",
};

const mockYesterdayPlan =
  "Review data structures (trees & graphs) for 90 min, then solve 3 LeetCode medium problems on recursion.";

/* ──────────────────────────────────────────────────────────────
   STATE SHAPE
   form = {
     completedYesterday: "yes" | "partially" | "no" | null,
     whyNot: string,
     studyMinutes: number | "",
     topics: string[],
     methods: string[],          // multi
     focus: string | null,       // single
     emotion: string | null,
     understanding: string | null,
     challenge: string | null,
     tomorrowPlan: string,
     wentWell: string,
     improveTomorrow: string,
   }
   ────────────────────────────────────────────────────────────── */

const REQUIRED_KEYS = [
  "completedYesterday",
  "studyMinutes",
  "topics",
  "methods",
  "focus",
  "emotion",
  "understanding",
  "challenge",
  "wentWell",
  "improveTomorrow",
];

/* ──────────────────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────────────────── */
const todayFormatted = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

const isFieldValid = (key, form) => {
  switch (key) {
    case "completedYesterday":
      return form.completedYesterday !== null;
    case "studyMinutes":
      return form.studyMinutes !== "" && Number(form.studyMinutes) > 0;
    case "topics":
      return form.topics.length > 0;
    case "methods":
      return form.methods.length > 0;
    case "focus":
    case "emotion":
    case "understanding":
    case "challenge":
      return form[key] !== null;
    case "wentWell":
    case "improveTomorrow":
      return form[key].trim().length > 0;
    default:
      return true;
  }
};

/* ──────────────────────────────────────────────────────────────
   PROGRESS RING
   ────────────────────────────────────────────────────────────── */
function ProgressRing({ progress }) {
  const radius = 18;
  const stroke = 3.5;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-11 h-11">
      <svg height="44" width="44" className="-rotate-90">
        <circle
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-700"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx="22"
          cy="22"
        />
        <motion.circle
          stroke="currentColor"
          className="text-indigo-500"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          r={normalizedRadius}
          cx="22"
          cy="22"
          style={{ strokeDasharray: circumference }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-slate-700 dark:text-slate-200">
        {Math.round(progress)}%
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   STREAK HEADER
   ────────────────────────────────────────────────────────────── */
function StreakHeader({ name, streak, progress }) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {todayFormatted()}
          </p>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
            Hey, {name}
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Flame className="w-4 h-4 text-amber-500" fill="currentColor" />
            </motion.div>
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {streak}
            </span>
          </div>
          <ProgressRing progress={progress} />
        </div>
      </div>
    </header>
  );
}

/* ──────────────────────────────────────────────────────────────
   YESTERDAY PLAN CARD
   ────────────────────────────────────────────────────────────── */
function YesterdayPlanCard({ plan, value, whyNot, onChange, onWhyNotChange }) {
  const options = [
    { id: "yes", label: "Yes" },
    { id: "partially", label: "Partially" },
    { id: "no", label: "No" },
  ];

  const showWhy = value === "partially" || value === "no";

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Yesterday&apos;s plan
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {plan}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Did you complete it?
        </p>
        <div
          role="radiogroup"
          aria-label="Did you complete yesterday's plan?"
          className="flex gap-2"
        >
          {options.map((opt) => {
            const selected = value === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(opt.id)}
                className={`
                  flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200
                  border focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900
                  ${
                    selected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/25"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }
                `}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showWhy && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Why not?
            </label>
            <textarea
              value={whyNot}
              onChange={(e) => onWhyNotChange(e.target.value)}
              rows={3}
              placeholder="Briefly explain what got in the way…"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   CHIP SELECT (single or multi)
   ────────────────────────────────────────────────────────────── */
function ChipSelect({
  label,
  helper,
  options,
  value,
  onChange,
  multi = false,
  required = false,
}) {
  const isSelected = (id) =>
    multi ? Array.isArray(value) && value.includes(id) : value === id;

  const toggle = (id) => {
    if (multi) {
      const next = isSelected(id)
        ? value.filter((v) => v !== id)
        : [...value, id];
      onChange(next);
    } else {
      onChange(id);
    }
  };

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          {label}
          {required && <span className="text-indigo-500 ml-0.5">*</span>}
        </h2>
        {helper && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {helper}
          </p>
        )}
      </div>

      <div
        role={multi ? "group" : "radiogroup"}
        aria-label={label}
        className="flex flex-wrap gap-2"
      >
        {options.map((opt) => {
          const selected = isSelected(opt.id);
          const Icon = opt.icon;
          return (
            <motion.button
              key={opt.id}
              type="button"
              role={multi ? "checkbox" : "radio"}
              aria-checked={selected}
              whileTap={{ scale: 0.96 }}
              onClick={() => toggle(opt.id)}
              className={`
                inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium
                border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900
                ${
                  selected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }
              `}
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    selected ? "text-white" : "text-slate-500 dark:text-slate-400"
                  }`}
                />
              )}
              {opt.label}
              {selected && <Check className="w-3.5 h-3.5 ml-0.5 opacity-90" />}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   OPTION CARDS (large selectable cards)
   ────────────────────────────────────────────────────────────── */
function OptionCards({ label, helper, options, value, onChange, colorMap }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          {label}
          <span className="text-indigo-500 ml-0.5">*</span>
        </h2>
        {helper && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {helper}
          </p>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label={label}
        className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
      >
        {options.map((opt) => {
          const selected = value === opt.id;
          const Icon = opt.icon;
          const accent = colorMap?.[opt.id] || {
            selected: "bg-indigo-600 border-indigo-600 text-white",
            icon: "text-white",
          };

          return (
            <motion.button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(opt.id)}
              className={`
                relative flex flex-col items-center gap-2 p-4 rounded-2xl border text-center
                transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900
                ${
                  selected
                    ? `${accent.selected} shadow-md`
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                }
              `}
            >
              <Icon
                className={`w-6 h-6 ${
                  selected ? accent.icon : "text-slate-500 dark:text-slate-400"
                }`}
              />
              <span className="text-sm font-medium leading-tight">
                {opt.label}
              </span>
              {selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <Check className="w-4 h-4 opacity-90" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   TAG INPUT
   ────────────────────────────────────────────────────────────── */
function TagInput({ label, helper, tags, onChange }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          {label}
          <span className="text-indigo-500 ml-0.5">*</span>
        </h2>
        {helper && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {helper}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
        <AnimatePresence mode="popLayout">
          {tags.map((tag) => (
            <motion.span
              key={tag}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-sm font-medium border border-indigo-200/60 dark:border-indigo-800/40"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                className="p-0.5 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a topic and press Enter"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3.5 pr-11 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 disabled:opacity-40 disabled:hover:bg-transparent transition"
          aria-label="Add topic"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   SUCCESS VIEW
   ────────────────────────────────────────────────────────────── */
function SuccessView({ streak, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mb-6"
      >
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="text-2xl font-semibold text-slate-900 dark:text-white"
      >
        Day logged successfully
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mt-2 text-slate-600 dark:text-slate-400 max-w-xs"
      >
        Your progress is recorded. Keep the momentum going.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55 }}
        className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40"
      >
        <Flame className="w-5 h-5 text-amber-500" fill="currentColor" />
        <span className="text-base font-semibold text-amber-700 dark:text-amber-400">
          {streak} day streak
        </span>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        type="button"
        onClick={onReset}
        className="mt-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
      >
        Log another day
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────────────────────── */
export default function DailyPerformanceForm() {
  const [form, setForm] = useState({
    completedYesterday: null,
    whyNot: "",
    studyMinutes: "",
    topics: [],
    methods: [],
    focus: null,
    emotion: null,
    understanding: null,
    challenge: null,
    tomorrowPlan: "",
    wentWell: "",
    improveTomorrow: "",
  });

  const [streak, setStreak] = useState(7);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({});

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const progress = useMemo(() => {
    const validCount = REQUIRED_KEYS.filter((k) => isFieldValid(k, form)).length;
    return (validCount / REQUIRED_KEYS.length) * 100;
  }, [form]);

  const isValid = progress === 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;

    // Clean payload for backend
    const payload = {
      userId: "mock-user-id", // replace with real auth id
      date: new Date().toISOString().slice(0, 10),
      completedYesterday: form.completedYesterday,
      whyNot:
        form.completedYesterday === "yes" ? null : form.whyNot.trim() || null,
      studyMinutes: Number(form.studyMinutes),
      topics: form.topics,
      methods: form.methods,
      focus: form.focus,
      emotion: form.emotion,
      understanding: form.understanding,
      challenge: form.challenge,
      tomorrowPlan: form.tomorrowPlan.trim() || null,
      wentWell: form.wentWell.trim(),
      improveTomorrow: form.improveTomorrow.trim(),
    };

    console.log("DPF submit payload:", payload);

    // TODO: POST /api/dpf  with payload

    setStreak((s) => s + 1);
    setSubmitted(true);
  };

  const resetForm = () => {
    setForm({
      completedYesterday: null,
      whyNot: "",
      studyMinutes: "",
      topics: [],
      methods: [],
      focus: null,
      emotion: null,
      understanding: null,
      challenge: null,
      tomorrowPlan: "",
      wentWell: "",
      improveTomorrow: "",
    });
    setTouched({});
    setSubmitted(false);
  };

  // Quick-pick chips for minutes
  const minuteChips = [30, 60, 120, 240];

  const methodOptions = [
    { id: "reading", label: "Reading", icon: BookOpen },
    { id: "writing", label: "Writing / Notes", icon: PenLine },
    { id: "revision", label: "Revision", icon: RotateCcw },
    { id: "practice", label: "Practice / Problems", icon: PlayCircle },
    { id: "group", label: "Group study", icon: Users },
  ];

  const focusOptions = [
    { id: "very", label: "Very focused", icon: Target },
    { id: "somewhat", label: "Somewhat focused", icon: Eye },
    { id: "distracted", label: "Distracted", icon: BellRing },
  ];

  const emotionOptions = [
    { id: "calm", label: "Calm", icon: Smile },
    { id: "anxious", label: "Slightly anxious", icon: Meh },
    { id: "overwhelmed", label: "Overwhelmed", icon: Frown },
  ];

  const emotionColors = {
    calm: {
      selected: "bg-emerald-600 border-emerald-600 text-white",
      icon: "text-white",
    },
    anxious: {
      selected: "bg-amber-500 border-amber-500 text-white",
      icon: "text-white",
    },
    overwhelmed: {
      selected: "bg-rose-500 border-rose-500 text-white",
      icon: "text-white",
    },
  };

  const understandingOptions = [
    { id: "clear", label: "Clear", icon: CheckCircle2 },
    { id: "fair", label: "Fair", icon: HelpCircle },
    { id: "confused", label: "Confused", icon: Frown },
  ];

  const challengeOptions = [
    { id: "phone", label: "Phone / Social", icon: Smartphone },
    { id: "energy", label: "Low energy", icon: BatteryLow },
    { id: "concepts", label: "Hard concepts", icon: HelpCircle },
    { id: "time", label: "Time pressure", icon: Clock },
    { id: "none", label: "No major challenge", icon: CheckCircle2 },
  ];

  // Staggered entrance
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <SuccessView streak={streak} onReset={resetForm} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <StreakHeader
        name={mockUser.name}
        streak={streak}
        progress={progress}
      />

      <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
        {/* User context (read-only) */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {mockUser.department}
          </span>
          <span>·</span>
          <span>{mockUser.level}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
            <Sparkles className="w-3 h-3" />
            Locked In Circle
          </span>
        </div>

        <motion.form
          variants={container}
          initial="hidden"
          animate="show"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* 1. Yesterday */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
          >
            <YesterdayPlanCard
              plan={mockYesterdayPlan}
              value={form.completedYesterday}
              whyNot={form.whyNot}
              onChange={(v) => update("completedYesterday", v)}
              onWhyNotChange={(v) => update("whyNot", v)}
            />
          </motion.div>

          {/* 2. Study time */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3"
          >
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Study time
                <span className="text-indigo-500 ml-0.5">*</span>
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Total focused minutes today
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="1440"
                value={form.studyMinutes}
                onChange={(e) => update("studyMinutes", e.target.value)}
                placeholder="0"
                className="w-28 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                minutes
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {minuteChips.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => update("studyMinutes", String(m))}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium border transition
                    ${
                      Number(form.studyMinutes) === m
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }
                  `}
                >
                  {m}m
                </button>
              ))}
            </div>

            {touched.studyMinutes && !isFieldValid("studyMinutes", form) && (
              <p className="text-xs text-rose-500">Enter a positive number of minutes</p>
            )}
          </motion.div>

          {/* 3. Topics */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
          >
            <TagInput
              label="Courses / topics studied"
              helper="Press Enter to add each topic"
              tags={form.topics}
              onChange={(v) => update("topics", v)}
            />
            {touched.topics && !isFieldValid("topics", form) && (
              <p className="mt-2 text-xs text-rose-500">Add at least one topic</p>
            )}
          </motion.div>

          {/* 4. Methods */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
          >
            <ChipSelect
              label="Study methods"
              helper="Select all that apply"
              options={methodOptions}
              value={form.methods}
              onChange={(v) => update("methods", v)}
              multi
              required
            />
            {touched.methods && !isFieldValid("methods", form) && (
              <p className="mt-2 text-xs text-rose-500">Select at least one method</p>
            )}
          </motion.div>

          {/* 5. Focus */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
          >
            <OptionCards
              label="Focus level"
              options={focusOptions}
              value={form.focus}
              onChange={(v) => update("focus", v)}
            />
          </motion.div>

          {/* 6. Emotional state */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
          >
            <OptionCards
              label="Emotional state"
              options={emotionOptions}
              value={form.emotion}
              onChange={(v) => update("emotion", v)}
              colorMap={emotionColors}
            />
          </motion.div>

          {/* 7. Understanding */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
          >
            <OptionCards
              label="Understanding"
              options={understandingOptions}
              value={form.understanding}
              onChange={(v) => update("understanding", v)}
            />
          </motion.div>

          {/* 8. Biggest challenge */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
          >
            <ChipSelect
              label="Biggest challenge"
              options={challengeOptions}
              value={form.challenge}
              onChange={(v) => update("challenge", v)}
              required
            />
          </motion.div>

          {/* 9. Tomorrow's plan */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3"
          >
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Tomorrow&apos;s study plan
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Optional — sketch what you intend to cover
              </p>
            </div>
            <textarea
              value={form.tomorrowPlan}
              onChange={(e) => update("tomorrowPlan", e.target.value)}
              rows={3}
              placeholder="e.g. Finish chapter 4 + 2 practice sets…"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition"
            />
          </motion.div>

          {/* 10 & 11. Reflection */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-5"
          >
            <div className="space-y-2">
              <label
                htmlFor="wentWell"
                className="block text-sm font-semibold text-slate-900 dark:text-white"
              >
                What went well today?
                <span className="text-indigo-500 ml-0.5">*</span>
              </label>
              <textarea
                id="wentWell"
                value={form.wentWell}
                onChange={(e) => update("wentWell", e.target.value)}
                rows={2}
                placeholder="A win, however small…"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition"
              />
              {touched.wentWell && !isFieldValid("wentWell", form) && (
                <p className="text-xs text-rose-500">This field is required</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="improveTomorrow"
                className="block text-sm font-semibold text-slate-900 dark:text-white"
              >
                What will I improve tomorrow?
                <span className="text-indigo-500 ml-0.5">*</span>
              </label>
              <textarea
                id="improveTomorrow"
                value={form.improveTomorrow}
                onChange={(e) => update("improveTomorrow", e.target.value)}
                rows={2}
                placeholder="One concrete adjustment…"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition"
              />
              {touched.improveTomorrow &&
                !isFieldValid("improveTomorrow", form) && (
                  <p className="text-xs text-rose-500">This field is required</p>
                )}
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div variants={item} className="pt-2">
            <button
              type="submit"
              disabled={!isValid}
              className={`
                w-full py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300
                focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950
                ${
                  isValid
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-[0.98]"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                }
              `}
            >
              Log today&apos;s performance
            </button>
          </motion.div>
        </motion.form>
      </main>
    </div>
  );
}