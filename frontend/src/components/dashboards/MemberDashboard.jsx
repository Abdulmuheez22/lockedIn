import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dpfRegistration } from "../../services/api.services.js";
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

const mockUser = {
  name: "Abdulmuheez",
  department: "Computer Science",
  level: "300 Level",
};

const REQUIRED_KEYS = [
  "studyMinutes",
  "topics",
  "methods",
  "techniques",
  "focus",
  "emotion",
  "understanding",
  "challenge",
  "wentWell",
  "whatToImprove",
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
    case "studyMinutes":
      return form.studyMinutes !== "" && Number(form.studyMinutes) > 0;
    case "topics":
      return form.topics.length > 0;
    case "methods":
      return form.methods.length > 0;
    case "techniques":
      return form.techniques.length > 0;
    case "focus":
    case "emotion":
    case "understanding":
    case "challenge":
      return form[key] !== null;
    case "wentWell":
    case "whatToImprove":
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
          className="text-[#e5e5e5]"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx="22"
          cy="22"
        />
        <motion.circle
          stroke="currentColor"
          className="text-[#0a0a0a]"
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
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#0a0a0a]">
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
    <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 backdrop-blur-xl border-b border-[#eaeaea]">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
            {todayFormatted()}
          </p>
          <h1 className="text-xl font-extrabold text-[#0a0a0a] tracking-tight truncate mt-0.5">
            Daily Performance Form · Hey, {name}
          </h1>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Flame className="w-4 h-4 text-amber-500" fill="currentColor" />
            </motion.div>
            <span className="text-sm font-bold text-[#0a0a0a]">
              {streak} Days
            </span>
          </div>
          <ProgressRing progress={progress} />
        </div>
      </div>
    </header>
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
        <h2 className="text-sm font-bold text-[#0a0a0a] tracking-tight">
          {label}
          {required && <span className="text-[#dc2626] ml-1">*</span>}
        </h2>
        {helper && <p className="mt-0.5 text-xs text-[#737373]">{helper}</p>}
      </div>

      <div
        role={multi ? "group" : "radiogroup"}
        aria-label={label}
        className="flex flex-wrap gap-2.5"
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
                inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                border-[1.5px] transition-all duration-200 focus:outline-none
                ${
                  selected
                    ? "bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-sm shadow-[#0a0a0a]/20"
                    : "bg-white text-[#737373] border-[#e5e5e5] hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
                }
              `}
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    selected ? "text-white" : "text-[#737373]"
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
        <h2 className="text-sm font-bold text-[#0a0a0a] tracking-tight">
          {label}
          <span className="text-[#dc2626] ml-1">*</span>
        </h2>
        {helper && <p className="mt-0.5 text-xs text-[#737373]">{helper}</p>}
      </div>

      <div
        role="radiogroup"
        aria-label={label}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {options.map((opt) => {
          const selected = value === opt.id;
          const Icon = opt.icon;
          const accent = colorMap?.[opt.id] || {
            selected: "bg-[#0a0a0a] border-[#0a0a0a] text-white",
            icon: "text-white",
          };

          return (
            <motion.button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(opt.id)}
              className={`
                relative flex flex-col items-center gap-2.5 p-5 rounded-2xl border-[1.5px] text-center
                transition-all duration-200 focus:outline-none
                ${
                  selected
                    ? `${accent.selected} shadow-md`
                    : "bg-white border-[#e5e5e5] text-[#737373] hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
                }
              `}
            >
              <Icon
                className={`w-6 h-6 ${
                  selected ? accent.icon : "text-[#737373]"
                }`}
              />
              <span
                className={`text-sm font-bold leading-tight ${selected ? "text-white" : "text-[#0a0a0a]"}`}
              >
                {opt.label}
              </span>
              {selected && (
                <div className="absolute top-3 right-3">
                  <Check className="w-4 h-4 text-white opacity-90" />
                </div>
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
        <h2 className="text-sm font-bold text-[#0a0a0a] tracking-tight">
          {label}
          <span className="text-[#dc2626] ml-1">*</span>
        </h2>
        {helper && <p className="mt-0.5 text-xs text-[#737373]">{helper}</p>}
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
              className="inline-flex items-center gap-1.5 pl-3.5 pr-2 py-1.5 rounded-xl bg-[#fafafa] text-[#0a0a0a] text-sm font-medium border-[1.5px] border-[#e5e5e5]"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                className="p-0.5 rounded-md hover:bg-[#e5e5e5] transition text-[#737373] hover:text-[#0a0a0a]"
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
          className="w-full rounded-xl border-[1.5px] border-[#e5e5e5] bg-white pl-4 pr-11 py-3 text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#0a0a0a] focus:ring-4 focus:ring-[#0a0a0a]/5 transition"
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!input.trim()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0a0a0a] disabled:opacity-40 disabled:bg-[#737373] transition"
          aria-label="Add topic"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
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
      className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
        className="w-20 h-20 rounded-2xl bg-[#0a0a0a] text-white flex items-center justify-center mb-6 shadow-xl shadow-[#0a0a0a]/20"
      >
        <CheckCircle2 className="w-10 h-10 text-white" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a] tracking-tight"
      >
        Day logged successfully
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mt-2 text-[#737373] text-sm sm:text-base max-w-sm"
      >
        Your daily performance record has been secured. Keep the momentum going.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55 }}
        className="mt-8 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#fafafa] border border-[#e5e5e5]"
      >
        <Flame className="w-5 h-5 text-amber-500" fill="currentColor" />
        <span className="text-sm font-bold text-[#0a0a0a]">
          {streak} Day Streak Active
        </span>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        type="button"
        onClick={onReset}
        className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[#0a0a0a] text-white shadow-lg shadow-[#0a0a0a]/20 hover:bg-[#1f1f1f] transition"
      >
        Log another record
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

/* ---------- Inline SVG Icons ---------- */
const DashboardIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

const DpfIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

const MembersIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1.13 1.57l-.46.25a2 2 0 0 1-2.86-.81L5 3.5a2 2 0 0 0-2.83 2.83l.81 1.09a2 2 0 0 1 .81 2.86l-.25.46a2 2 0 0 1-1.57 1.13H2a2 2 0 0 0-2 2v.44a2 2 0 0 0 2 2h.18a2 2 0 0 1 1.57 1.13l.25.46a2 2 0 0 1-.81 2.86l-.81 1.09a2 2 0 0 0 2.83 2.83l1.09-.81a2 2 0 0 1 2.86.81l.25.46a2 2 0 0 1 1.13 1.57V22a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1.13-1.57l.46-.25a2 2 0 0 1 2.86.81l1.09.81a2 2 0 0 0 2.83-2.83l-.81-1.09a2 2 0 0 1-.81-2.86l.25-.46a2 2 0 0 1 1.57-1.13H22a2 2 0 0 0 2-2v-.44a2 2 0 0 0-2-2h-.18a2 2 0 0 1-1.57-1.13l-.25-.46a2 2 0 0 1 .81-2.86l.81-1.09A2 2 0 0 0 21.5 3.5l-1.09.81a2 2 0 0 1-2.86-.81l-.25-.46A2 2 0 0 1 16.18 2H15a2 2 0 0 0-2 2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const BellIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const UploadIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export default function MemberDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("overview");

  // DPF Form Local State
  const [dpfTask, setDpfTask] = useState("");
  const [dpfScore, setDpfScore] = useState("10");
  const [dpfNotes, setDpfNotes] = useState("");
  const [dpfSubmitted, setDpfSubmitted] = useState(false);

  const navItems = [
    { id: "overview", label: "Overview", icon: <DashboardIcon /> },
    {
      id: "dpf",
      label: "DPF",
      fullName: "Daily Performance Form",
      icon: <DpfIcon />,
    },
    { id: "analytics", label: "Analytics", icon: <AnalyticsIcon /> },
    { id: "tutorial", label: "Tutorial", icon: <BookOpen /> },
    { id: "notifications", label: "Notifications", icon: <BellIcon /> },
    { id: "upload materials", label: "Upload material", icon: <UploadIcon /> },
    { id: "members", label: "Circle Directory", icon: <MembersIcon /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon /> },
  ];

  const handleDpfSubmit = (e) => {
    e.preventDefault();
    if (!dpfTask.trim()) return;
    setDpfSubmitted(true);
    setTimeout(() => {
      setDpfSubmitted(false);
      setDpfTask("");
      setDpfNotes("");
    }, 3000);
  };

  const [form, setForm] = useState({
    studyMinutes: "",
    topics: [],
    methods: [],
    techniques: [],
    focus: null,
    emotion: null,
    understanding: null,
    challenge: null,
    tomorrowPlan: "",
    wentWell: "",
    whatToImprove: "",
  });

  const [streak, setStreak] = useState(7);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({});
  const [missingField, setMissingField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
    setMissingField((current) => (current === key ? null : current));
    setSubmissionError("");
  };

  const progress = useMemo(() => {
    const validCount = REQUIRED_KEYS.filter((k) =>
      isFieldValid(k, form),
    ).length;
    return (validCount / REQUIRED_KEYS.length) * 100;
  }, [form]);

  const isValid = progress === 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!isValid) {
      const firstMissing = REQUIRED_KEYS.find(
        (key) => !isFieldValid(key, form),
      );
      setMissingField(firstMissing);
      if (firstMissing) {
        window.requestAnimationFrame(() => {
          const field = document.getElementById(`dpf-${firstMissing}`);
          field?.scrollIntoView({ behavior: "smooth", block: "center" });
          field?.querySelector("input, textarea, button")?.focus();
        });
      }
      return;
    }

    const payload = {
      entryDate: new Date().toISOString().slice(0, 10),
      studyMinutes: Number(form.studyMinutes),
      coursesStudied: form.topics,
      studyMethods: form.methods,
      studyTechniques: form.techniques,
      focusLevel: form.focus,
      emotionalState: form.emotion,
      understanding: form.understanding,
      challengeFaced: form.challenge,
      whatWentWell: form.wentWell.trim(),
      whatToImprove: form.whatToImprove.trim(),
      nextDayPlan: form.tomorrowPlan.trim() || null,
    };

    setIsSubmitting(true);
    setSubmissionError("");

    try {
      await dpfRegistration(payload);
      setStreak((s) => s + 1);
      setSubmitted(true);
    } catch (error) {
      console.error("DPF submission failed:", error);
      const message = error?.response?.data?.message;
      setSubmissionError(
        typeof message === "string"
          ? message
          : "Could not submit the form. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      studyMinutes: "",
      topics: [],
      methods: [],
      techniques: [],
      focus: null,
      emotion: null,
      understanding: null,
      challenge: null,
      tomorrowPlan: "",
      wentWell: "",
      whatToImprove: "",
    });
    setTouched({});
    setMissingField(null);
    setSubmissionError("");
    setSubmitted(false);
  };

  const minuteChips = [
    { minutes: 30, label: "30min" },
    { minutes: 45, label: "45min" },
    { minutes: 60, label: "1hr" },
    { minutes: 120, label: "2hr" },
    { minutes: 180, label: "3hr" },
    { minutes: 240, label: "4hr" },
    { minutes: 300, label: "5hr" },
    { minutes: 360, label: "6hr" },
    { minutes: 420, label: "7hr" },
    { minutes: 480, label: "8hr" },
  ];

  const methodOptions = [
    { id: "Reading", label: "Reading", icon: BookOpen },
    { id: "Note Taking", label: "Note Taking", icon: PenLine },
    { id: "Revision", label: "Revision", icon: RotateCcw },
    { id: "Practice", label: "Practice", icon: PlayCircle },
    { id: "Watching Videos", label: "Watching Videos", icon: PlayCircle },
    { id: "Group Study", label: "Group Study", icon: Users },
    { id: "Teaching Others", label: "Teaching Others", icon: Users },
  ];

  const techniqueOptions = [
    { id: "Pomodoro", label: "Pomodoro" },
    { id: "Active Recall", label: "Active Recall" },
    { id: "Spaced Repetition", label: "Spaced Repetition" },
    { id: "Feynman Technique", label: "Feynman Technique" },
    { id: "Mind Mapping", label: "Mind Mapping" },
    { id: "SQ3R Method", label: "SQ3R Method" },
    { id: "Cornell Note-Taking System", label: "Cornell Note-Taking System" },
    { id: "Self-Explanation", label: "Self-Explanation" },
  ];

  const focusOptions = [
    { id: "Very focused", label: "Very focused", icon: Target },
    { id: "Somewhat focused", label: "Somewhat focused", icon: Eye },
    { id: "Distracted", label: "Distracted", icon: BellRing },
  ];

  const emotionOptions = [
    { id: "Motivated", label: "Motivated", icon: Smile },
    { id: "Neutral", label: "Neutral", icon: Meh },
    { id: "Frustrated", label: "Frustrated", icon: Frown },
    { id: "Anxious", label: "Anxious", icon: Meh },
    { id: "Excited", label: "Excited", icon: Smile },
    { id: "Bored", label: "Bored", icon: Meh },
  ];

  const emotionColors = {
    Motivated: {
      selected: "bg-[#0a0a0a] border-[#0a0a0a] text-white",
      icon: "text-white",
    },
    Neutral: {
      selected: "bg-[#0a0a0a] border-[#0a0a0a] text-white",
      icon: "text-white",
    },
    Frustrated: {
      selected: "bg-[#0a0a0a] border-[#0a0a0a] text-white",
      icon: "text-white",
    },
    Anxious: {
      selected: "bg-[#0a0a0a] border-[#0a0a0a] text-white",
      icon: "text-white",
    },
    Excited: {
      selected: "bg-[#0a0a0a] border-[#0a0a0a] text-white",
      icon: "text-white",
    },
    Bored: {
      selected: "bg-[#0a0a0a] border-[#0a0a0a] text-white",
      icon: "text-white",
    },
  };

  const understandingOptions = [
    { id: "Very clear", label: "Very clear", icon: CheckCircle2 },
    { id: "Somewhat clear", label: "Somewhat clear", icon: HelpCircle },
    { id: "Confused", label: "Confused", icon: Frown },
    { id: "Lost", label: "Lost", icon: Frown },
  ];

  const challengeOptions = [
    { id: "Time Management", label: "Time Management", icon: Clock },
    { id: "Distractions", label: "Distractions", icon: Smartphone },
    { id: "Lack of Motivation", label: "Lack of Motivation", icon: BatteryLow },
    {
      id: "Difficulty Understanding Material",
      label: "Difficulty Understanding Material",
      icon: HelpCircle,
    },
    { id: "Procrastination", label: "Procrastination", icon: Clock },
    { id: "Burnout", label: "Burnout", icon: BatteryLow },
    { id: "Nothing", label: "Nothing", icon: CheckCircle2 },
    {
      id: "unavailability of material",
      label: "Unavailability of material",
      icon: HelpCircle,
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] text-[#050315] flex flex-col md:flex-row font-sans antialiased selection:bg-[#0a0a0a] selection:text-white">
      {/* ---------- Mobile Header ---------- */}
      <header className="md:hidden flex items-center justify-between px-4 py-3.5 bg-white border-b border-[#eaeaea] sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            className="p-1.5 rounded-lg text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors"
          >
            <MenuIcon />
          </button>
          <div>
            <p className="text-[#0a0a0a] font-bold text-sm tracking-tight">
              Locked In Circle
            </p>
            <p className="text-[10px] text-[#737373] font-semibold uppercase tracking-wider">
              Members Portal
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#0a0a0a] text-white font-bold text-xs grid place-items-center shadow-sm">
          AM
        </div>
      </header>

      {/* ---------- Mobile Backdrop ---------- */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ---------- Sidebar Drawer / Navigation ---------- */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-[260px] bg-white border-r border-[#eaeaea] flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Logo Header */}
          <div className="p-6 border-b border-[#f0f0f0] flex items-center justify-between">
            <div>
              <h2 className="text-[#0a0a0a] font-extrabold text-lg tracking-tight">
                Locked In Circle
              </h2>
              <p className="text-[#737373] text-[10px] font-semibold uppercase tracking-[0.2em] mt-0.5">
                Members Portal
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-[#737373] hover:text-[#0a0a0a] p-1 text-lg font-bold"
            >
              &times;
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-[14px] font-semibold transition-all duration-150 relative group ${
                    isActive
                      ? "bg-[#0a0a0a] text-white shadow-md shadow-[#0a0a0a]/20"
                      : "text-[#737373] hover:text-[#0a0a0a] hover:bg-[#fafafa]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        isActive
                          ? "text-white"
                          : "text-[#737373] group-hover:text-[#0a0a0a]"
                      }
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {/* DPF Full Meaning Hover Indicator */}
                  {item.id === "dpf" && (
                    <span className="hidden">
                      {/* Daily Performance Form */}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-[#f0f0f0] m-3 rounded-2xl bg-[#fafafa]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0a0a0a] text-white font-bold text-xs grid place-items-center shrink-0 shadow-sm">
              AM
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-[#0a0a0a] truncate">
                Abdulmuheez
              </p>
              <p className="text-[11px] text-[#737373] truncate">
                Staff Engineer
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------- Main Content Area (Full Screen Flow) ---------- */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen bg-[#FAFAFA]">
        {/* Desktop Sticky Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 bg-white border-b border-[#eaeaea] sticky top-0 z-20 shadow-xs">
          <div>
            <h1 className="text-lg font-bold text-[#0a0a0a] tracking-tight capitalize">
              {activeNav === "dpf"
                ? "Daily Performance Form (DPF)"
                : `${activeNav} Dashboard`}
            </h1>
            <p className="text-xs text-[#737373] mt-0.5">
              Welcome back, Abdulmuheez. Here is your operational overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              aria-label="View notifications"
              className="p-2.5 rounded-xl border border-[#e5e5e5] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#fafafa] transition-colors relative"
            >
              <BellIcon />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0a0a0a]" />
            </button>
            <div className="px-3.5 py-2 rounded-xl bg-[#f5f5f5] text-xs font-semibold text-[#0a0a0a] border border-[#e8e8e8]">
              Term: 2026/2027 Session
            </div>
          </div>
        </header>

        {/* Dynamic Full Screen Content Container */}
        <div className="flex-1 p-4 sm:p-8 space-y-6">
          {activeNav === "dpf" ? (
            /* ==================== DPF VIEW ==================== */
            <div className="min-h-screen bg-[#FAFAFA] text-[#050315] font-sans antialiased flex flex-col">
              <StreakHeader
                name={mockUser.name}
                streak={streak}
                progress={progress}
              />

              <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 pb-32">
                {submitted ? (
                  <SuccessView streak={streak} onReset={resetForm} />
                ) : (
                  <>
                    {/* User metadata badge */}
                    <div className="mb-6 flex items-center gap-2.5 text-xs text-[#737373] bg-white px-4 py-3 rounded-2xl border border-[#eaeaea]">
                      <span className="font-bold text-[#0a0a0a]">
                        {mockUser.department}
                      </span>
                      <span>·</span>
                      <span>{mockUser.level}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 text-[#0a0a0a] font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-[#0a0a0a]" />
                        Locked In Circle Member
                      </span>
                    </div>

                    <motion.form
                      variants={container}
                      initial="hidden"
                      animate="show"
                      onSubmit={handleSubmit}
                      className="space-y-6"
                    >
                      {/* 1. Study time */}
                      <motion.div
                        variants={item}
                        id="dpf-studyMinutes"
                        className={`rounded-3xl border bg-white p-6 sm:p-8 shadow-xs space-y-4 transition ${
                          missingField === "studyMinutes"
                            ? "border-amber-500 ring-4 ring-amber-300/50"
                            : "border-[#eaeaea]"
                        }`}
                      >
                        <div>
                          <h2 className="text-sm font-bold text-[#0a0a0a] tracking-tight">
                            Study time
                            <span className="text-[#dc2626] ml-1">*</span>
                          </h2>
                          <p className="mt-0.5 text-xs text-[#737373]">
                            Total focused minutes logged today
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {minuteChips.map(({ minutes, label }) => (
                            <button
                              key={minutes}
                              type="button"
                              onClick={() =>
                                update("studyMinutes", String(minutes))
                              }
                              className={`
                        px-3.5 py-2 rounded-xl text-xs font-semibold border-[1.5px] transition
                        ${
                          Number(form.studyMinutes) === minutes
                            ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                            : "bg-[#fafafa] text-[#737373] border-[#e5e5e5] hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
                        }
                      `}
                            >
                              {label}
                            </button>
                          ))}
                        </div>

                        {touched.studyMinutes &&
                          !isFieldValid("studyMinutes", form) && (
                            <p className="text-xs font-medium text-[#dc2626]">
                              Enter a positive number of minutes
                            </p>
                          )}
                      </motion.div>

                      {/* 3. Topics */}
                      <motion.div
                        variants={item}
                        id="dpf-topics"
                        className={`rounded-3xl border bg-white p-6 sm:p-8 shadow-xs transition ${
                          missingField === "topics"
                            ? "border-amber-500 ring-4 ring-amber-300/50"
                            : "border-[#eaeaea]"
                        }`}
                      >
                        <TagInput
                          label="Courses / topics studied"
                          helper="Press Enter to add each topic tag"
                          tags={form.topics}
                          onChange={(v) => update("topics", v)}
                        />
                        {touched.topics && !isFieldValid("topics", form) && (
                          <p className="mt-2 text-xs font-medium text-[#dc2626]">
                            Add at least one topic
                          </p>
                        )}
                      </motion.div>

                      {/* 4. Methods */}
                      <motion.div
                        variants={item}
                        id="dpf-methods"
                        className={`rounded-3xl border bg-white p-6 sm:p-8 shadow-xs transition ${
                          missingField === "methods"
                            ? "border-amber-500 ring-4 ring-amber-300/50"
                            : "border-[#eaeaea]"
                        }`}
                      >
                        <ChipSelect
                          label="Study methods"
                          helper="Select all methods used today"
                          options={methodOptions}
                          value={form.methods}
                          onChange={(v) => update("methods", v)}
                          multi
                          required
                        />
                        {touched.methods && !isFieldValid("methods", form) && (
                          <p className="mt-2 text-xs font-medium text-[#dc2626]">
                            Select at least one method
                          </p>
                        )}
                      </motion.div>

                      {/* 5. Techniques */}
                      <motion.div
                        variants={item}
                        id="dpf-techniques"
                        className={`rounded-3xl border bg-white p-6 sm:p-8 shadow-xs transition ${
                          missingField === "techniques"
                            ? "border-amber-500 ring-4 ring-amber-300/50"
                            : "border-[#eaeaea]"
                        }`}
                      >
                        <ChipSelect
                          label="Study techniques"
                          helper="Select all techniques used today"
                          options={techniqueOptions}
                          value={form.techniques}
                          onChange={(v) => update("techniques", v)}
                          multi
                          required
                        />
                        {touched.techniques &&
                          !isFieldValid("techniques", form) && (
                            <p className="mt-2 text-xs font-medium text-[#dc2626]">
                              Select at least one technique
                            </p>
                          )}
                      </motion.div>

                      {/* 6. Focus */}
                      <motion.div
                        variants={item}
                        id="dpf-focus"
                        className={`rounded-3xl border bg-white p-6 sm:p-8 shadow-xs transition ${
                          missingField === "focus"
                            ? "border-amber-500 ring-4 ring-amber-300/50"
                            : "border-[#eaeaea]"
                        }`}
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
                        id="dpf-emotion"
                        className={`rounded-3xl border bg-white p-6 sm:p-8 shadow-xs transition ${
                          missingField === "emotion"
                            ? "border-amber-500 ring-4 ring-amber-300/50"
                            : "border-[#eaeaea]"
                        }`}
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
                        id="dpf-understanding"
                        className={`rounded-3xl border bg-white p-6 sm:p-8 shadow-xs transition ${
                          missingField === "understanding"
                            ? "border-amber-500 ring-4 ring-amber-300/50"
                            : "border-[#eaeaea]"
                        }`}
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
                        id="dpf-challenge"
                        className={`rounded-3xl border bg-white p-6 sm:p-8 shadow-xs transition ${
                          missingField === "challenge"
                            ? "border-amber-500 ring-4 ring-amber-300/50"
                            : "border-[#eaeaea]"
                        }`}
                      >
                        <ChipSelect
                          label="Biggest challenge faced"
                          options={challengeOptions}
                          value={form.challenge}
                          onChange={(v) => update("challenge", v)}
                          required
                        />
                      </motion.div>

                      {/* 9. Reflections & Tomorrow's Plan */}
                      <motion.div
                        variants={item}
                        className="rounded-3xl border border-[#eaeaea] bg-white p-6 sm:p-8 shadow-xs space-y-6"
                      >
                        <div
                          id="dpf-wentWell"
                          className={`rounded-xl transition ${
                            missingField === "wentWell"
                              ? "ring-4 ring-amber-300/50 p-2"
                              : ""
                          }`}
                        >
                          <h2 className="text-sm font-bold text-[#0a0a0a] tracking-tight mb-1">
                            What went well today?
                          </h2>
                          <textarea
                            value={form.wentWell}
                            onChange={(e) => update("wentWell", e.target.value)}
                            rows={3}
                            placeholder="Highlight your small wins or breakthroughs..."
                            className="w-full rounded-xl border-[1.5px] border-[#e5e5e5] bg-white p-4 text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#0a0a0a] focus:ring-4 focus:ring-[#0a0a0a]/5 resize-none transition"
                          />
                        </div>

                        <div
                          id="dpf-whatToImprove"
                          className={`rounded-xl transition ${
                            missingField === "whatToImprove"
                              ? "ring-4 ring-amber-300/50 p-2"
                              : ""
                          }`}
                        >
                          <h2 className="text-sm font-bold text-[#0a0a0a] tracking-tight mb-1">
                            What to improve tomorrow?
                          </h2>
                          <textarea
                            value={form.whatToImprove}
                            onChange={(e) =>
                              update("whatToImprove", e.target.value)
                            }
                            rows={3}
                            placeholder="Identify key adjustments for tomorrow..."
                            className="w-full rounded-xl border-[1.5px] border-[#e5e5e5] bg-white p-4 text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#0a0a0a] focus:ring-4 focus:ring-[#0a0a0a]/5 resize-none transition"
                          />
                        </div>

                        <div>
                          <h2 className="text-sm font-bold text-[#0a0a0a] tracking-tight mb-1">
                            Tomorrow&apos;s study plan{" "}
                            <span className="text-xs font-normal text-[#737373]">
                              (Optional)
                            </span>
                          </h2>
                          <textarea
                            value={form.tomorrowPlan}
                            onChange={(e) =>
                              update("tomorrowPlan", e.target.value)
                            }
                            rows={3}
                            placeholder="Sketch what you intend to cover tomorrow..."
                            className="w-full rounded-xl border-[1.5px] border-[#e5e5e5] bg-white p-4 text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#0a0a0a] focus:ring-4 focus:ring-[#0a0a0a]/5 resize-none transition"
                          />
                        </div>
                      </motion.div>

                      {/* Submit CTA Bar */}
                      <motion.div variants={item} className="pt-4">
                        {submissionError && (
                          <p
                            role="alert"
                            className="mb-3 text-center text-sm font-medium text-red-600"
                          >
                            {submissionError}
                          </p>
                        )}
                        <motion.button
                          type="submit"
                          disabled={!isValid || isSubmitting}
                          whileHover={{
                            scale: isValid && !isSubmitting ? 1.01 : 1,
                          }}
                          whileTap={{
                            scale: isValid && !isSubmitting ? 0.98 : 1,
                          }}
                          className={`
                    w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 shadow-xl transition-all duration-200
                    ${
                      isValid && !isSubmitting
                        ? "bg-[#0a0a0a] text-white shadow-[#0a0a0a]/25 hover:bg-[#1f1f1f] cursor-pointer"
                        : "bg-[#e5e5e5] text-[#a3a3a3] cursor-not-allowed shadow-none"
                    }
                  `}
                        >
                          <span>
                            {isSubmitting
                              ? "Submitting..."
                              : `Submit Daily Performance Form (${Math.round(progress)}%)`}
                          </span>
                          {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                        </motion.button>
                        {!isValid && (
                          <p className="text-center text-xs font-medium text-[#737373] mt-3">
                            Please complete all required sections above to
                            submit.
                          </p>
                        )}
                      </motion.div>
                    </motion.form>
                  </>
                )}
              </main>
            </div>
          ) : (
            /* ==================== OVERVIEW / DASHBOARD VIEW ==================== */
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: "Total Circle Members",
                    value: "1,284",
                    change: "+12.5%",
                    positive: true,
                  },
                  {
                    title: "DPF Submission Rate",
                    value: "94.2%",
                    change: "+4.1%",
                    positive: true,
                  },
                  {
                    title: "Active Projects",
                    value: "24",
                    change: "+2",
                    positive: true,
                  },
                  {
                    title: "System Uptime",
                    value: "99.9%",
                    change: "Optimal",
                    positive: true,
                  },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-5 rounded-2xl border border-[#eaeaea] shadow-xs"
                  >
                    <p className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline justify-between mt-2">
                      <h3 className="text-2xl font-extrabold text-[#0a0a0a] tracking-tight">
                        {stat.value}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        <TrendingUpIcon /> {stat.change}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Chart & Recent Activity Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Interactive Chart Section */}
                <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-[#eaeaea] shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-bold text-[#0a0a0a] tracking-tight">
                        Performance Velocity & DPF Trends
                      </h3>
                      <p className="text-xs text-[#737373] mt-0.5">
                        Weekly submission analytics across active departments
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-[#f5f5f5] p-1 rounded-xl border border-[#eaeaea]">
                      <button className="px-3 py-1 rounded-lg text-xs font-semibold bg-white text-[#0a0a0a] shadow-xs">
                        Weekly
                      </button>
                      <button className="px-3 py-1 rounded-lg text-xs font-medium text-[#737373] hover:text-[#0a0a0a]">
                        Monthly
                      </button>
                    </div>
                  </div>

                  {/* Clean SVG Bar Chart */}
                  <div className="h-64 w-full flex items-end justify-between gap-2.5 pt-6 px-2 border-b border-[#f0f0f0]">
                    {[45, 62, 38, 82, 68, 92, 78, 88, 96, 64, 89, 94].map(
                      (height, i) => (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
                        >
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{
                              duration: 0.6,
                              delay: i * 0.04,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="w-full bg-[#0a0a0a] rounded-t-lg group-hover:bg-[#333333] transition-colors relative"
                          >
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0a0a0a] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap">
                              {height}%
                            </span>
                          </motion.div>
                        </div>
                      ),
                    )}
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-[#737373] pt-3 px-1 font-semibold uppercase tracking-wider">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>

                {/* Live Activity Feed */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#eaeaea] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-[#0a0a0a] tracking-tight">
                        Recent DPF Logs
                      </h3>
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ● Live
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {[
                        {
                          name: "Sarah Jenkins",
                          dept: "Computer Science",
                          time: "10m ago",
                          score: "9.5",
                        },
                        {
                          name: "Adekunle Adebayo",
                          dept: "Software Eng.",
                          time: "42m ago",
                          score: "8.8",
                        },
                        {
                          name: "Chidinma O.",
                          dept: "Information Systems",
                          time: "2h ago",
                          score: "9.2",
                        },
                        {
                          name: "Michael Okoye",
                          dept: "Cybersecurity",
                          time: "3h ago",
                          score: "9.0",
                        },
                      ].map((activity, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-2xl bg-[#fafafa] border border-[#f0f0f0] hover:border-[#e0e0e0] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#e5e5e5] text-[#0a0a0a] font-bold text-xs grid place-items-center shrink-0">
                              {activity.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#0a0a0a]">
                                {activity.name}
                              </p>
                              <p className="text-[10px] text-[#737373]">
                                {activity.dept}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-[#0a0a0a]">
                              ⭐ {activity.score}
                            </span>
                            <p className="text-[10px] text-[#737373]">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="w-full mt-6 py-2.5 rounded-xl border-[1.5px] border-[#e5e5e5] text-xs font-semibold text-[#0a0a0a] hover:bg-[#fafafa] transition-colors">
                    View All Submissions
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
