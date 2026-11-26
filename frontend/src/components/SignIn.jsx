import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { signIn } from "../services/api.services";

/* ---------- inline SVG icons ---------- */
const MailIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
    <path d="m3 6.5 9 7 9-7" />
  </svg>
);

const LockIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2.5" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    <circle cx="12" cy="16" r="1.3" fill="currentColor" stroke="none" />
  </svg>
);

const EyeOpenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosedIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.9 4.24A10.6 10.6 0 0 1 12 4c7 0 10 8 10 8a17.4 17.4 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A16.5 16.5 0 0 0 2 12s3 8 10 8a9.9 9.9 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff"
    strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="13" />
    <circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
  </svg>
);

const ShieldNote = () => (
  <p className="flex items-center justify-center gap-1.5 mt-6 text-[11px] text-neutral-400">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 4 5.5v5.6c0 5 3.4 9.3 8 10.4 4.6-1.1 8-5.4 8-10.4V5.5L12 2Z" />
      <path d="m9 12 2 2 4-4.5" />
    </svg>
    Your information is encrypted and secure
  </p>
);

/* ---------- validation ---------- */
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function SignIn() {
  const navigate = useNavigate();

  /* ------- state ------- */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success
  const [shakeKey, setShakeKey] = useState(0);

  const emailRef = useRef(null);
  const passRef = useRef(null);

  /* ------- shake helper ------- */
  const shake = useCallback(() => setShakeKey((k) => k + 1), []);

  const setFieldError = (field, msg) =>
    setErrors((prev) => ({ ...prev, [field]: msg }));

  /* ------- API ------- */
  const { mutate } = useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      setStatus("success");
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      setStatus("idle");
      setErrors((prev) => ({
        ...prev,
        password:
          error.response?.data?.message ||
          "Sign in failed. Please check your credentials and try again.",
      }));
      shake();
    },
  });

  /* ------- validation ------- */
  const validate = () => {
    const next = { email: "", password: "" };
    let firstBad = null;

    if (!email.trim()) {
      next.email = "Please enter your email address.";
      firstBad = firstBad || "email";
    } else if (!EMAIL_RE.test(email.trim())) {
      next.email = "That email address doesn't look right.";
      firstBad = firstBad || "email";
    }

    if (!password) {
      next.password = "Please enter your password.";
      firstBad = firstBad || "password";
    } else if (password.length < 8) {
      next.password = "Password must be at least 8 characters.";
      firstBad = firstBad || "password";
    }

    setErrors(next);
    return firstBad;
  };

  /* ------- submit ------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (status !== "idle") return;

    const firstBad = validate();
    if (firstBad) {
      shake();
      (firstBad === "email" ? emailRef : passRef).current?.focus();
      return;
    }

    setStatus("loading");
    mutate({ email: email.trim(), password, remember });
  };

  /* ------- field props ------- */
  const emailBorder = errors.email
    ? "border-[#dc2626] focus:border-[#dc2626] focus:ring-4 focus:ring-[#dc2626]/10"
    : "border-[#e5e5e5] focus:border-[#0a0a0a] focus:ring-4 focus:ring-[#0a0a0a]/5";

  const passBorder = errors.password
    ? "border-[#dc2626] focus:border-[#dc2626] focus:ring-4 focus:ring-[#dc2626]/10"
    : "border-[#e5e5e5] focus:border-[#0a0a0a] focus:ring-4 focus:ring-[#0a0a0a]/5";

  /* ------- animation variants ------- */
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
  };
  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26 } },
  };
  const shakeAnim = { x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.45 } };

  return (
    <div
      className="min-h-screen bg-[#FFFFFF] text-[#050315] flex items-center justify-center p-3 sm:p-6"
      // style={{
      //   backgroundImage:
      //     "radial-gradient(circle at 1px 1px, rgba(10,10,10,0.05) 1px, transparent 0)",
      //   backgroundSize: "28px 28px",
      // }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[400px]"
      >
        {/* shake wrapper — keyed so failed submits retrigger the shake */}
        <motion.div
          key={shakeKey}
          initial={false}
          animate={shakeKey ? shakeAnim : { x: 0 }}
        >
          <div className="bg-[#FFFFFF] rounded-2xl sm:rounded-3xl p-5 sm:p-10">
            <motion.div variants={container} initial="hidden" animate="show">

              {/* ---------- Brand ---------- */}
              <motion.div variants={item} className="text-center">
                <p className="text-lg sm:text-xl font-bold text-[#0a0a0a] tracking-tight">
                  Locked In Circle
                </p>
                <p className="text-[10px] font-semibold text-[#737373] tracking-[0.2em] uppercase mt-1">
                  Members Portal
                </p>
              </motion.div>

              <motion.div variants={item} className="h-px bg-[#e8e8e8] my-6 sm:my-7" />

              {/* ---------- Heading ---------- */}
              <motion.h1
                variants={item}
                className="text-xl sm:text-2xl font-bold text-[#0a0a0a] tracking-tight text-center leading-snug"
              >
                Welcome back
              </motion.h1>
              <motion.p
                variants={item}
                className="text-[13px] sm:text-sm text-[#737373] text-center leading-relaxed mt-2.5"
              >
                Sign in to continue to your account
              </motion.p>

              <form onSubmit={handleSubmit} noValidate>
                {/* ---------- Email ---------- */}
                <motion.div variants={item} className="mt-7">
                  <label
                    htmlFor="email"
                    className="block text-[11px] font-semibold text-[#737373] tracking-[0.08em] uppercase mb-2"
                  >
                    Email address
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-neutral-400 pointer-events-none">
                      <MailIcon />
                    </span>
                    <input
                      ref={emailRef}
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setFieldError("email", "");
                      }}
                      className={`w-full rounded-xl border-[1.5px] bg-white pl-10 pr-4 py-3 text-[15px] text-[#0a0a0a] outline-none transition-all duration-150 placeholder:text-neutral-300 ${emailBorder}`}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 mt-2 text-[12.5px] font-medium text-[#dc2626]"
                      >
                        <AlertIcon /> {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* ---------- Password ---------- */}
                <motion.div variants={item} className="mt-4">
                  <label
                    htmlFor="password"
                    className="block text-[11px] font-semibold text-[#737373] tracking-[0.08em] uppercase mb-2"
                  >
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-neutral-400 pointer-events-none">
                      <LockIcon />
                    </span>
                    <input
                      ref={passRef}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setFieldError("password", "");
                      }}
                      className={`w-full rounded-xl border-[1.5px] bg-white pl-10 pr-11 py-3 text-[15px] text-[#0a0a0a] outline-none transition-all duration-150 placeholder:text-neutral-300 ${passBorder}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 p-2 rounded-lg text-neutral-400 hover:text-[#0a0a0a] hover:bg-neutral-100 transition-colors"
                    >
                      {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 mt-2 text-[12.5px] font-medium text-[#dc2626]"
                      >
                        <AlertIcon /> {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* ---------- Remember / forgot ---------- */}
                <motion.div
                  variants={item}
                  className="mt-3 flex items-end justify-end"
                >
              
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className=" cursor-pointer text-[13px] font-semibold text-[#0a0a0a] hover:text-[#737373] transition-colors"
                  >
                    Forgot password?
                  </button>
                </motion.div>

                {/* ---------- Submit ---------- */}
                <motion.div variants={item}>
                  <motion.button
                    type="submit"
                    disabled={status !== "idle"}
                    whileHover={{ scale: status === "idle" ? 1.01 : 1 }}
                    whileTap={{ scale: status === "idle" ? 0.98 : 1 }}
                    className="w-full mt-6 py-3.5 rounded-xl bg-[#0a0a0a] text-white text-[15px] font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-[#0a0a0a]/30 hover:bg-[#1f1f1f] transition-colors duration-200 disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {status === "loading" ? (
                        <motion.span
                          key="load"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Spinner /> Signing in…
                        </motion.span>  
                      ) : status === "success" ? (
                        <motion.span
                          key="success"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <CheckIcon /> Signed in
                        </motion.span>
                      ) : (
                        <motion.span
                          key="label"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2.5"
                        >
                          Sign in <ArrowIcon />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>

                {/* ---------- Footer ---------- */}
                <motion.p
                  variants={item}
                  className="text-center text-[13px] text-[#737373] mt-6"
                >
                  New to the circle?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="text-[#0a0a0a] font-semibold underline underline-offset-[3px] decoration-[1.5px] hover:text-[#737373] transition-colors"
                  >
                    Create an account
                  </button>
                </motion.p>
              </form>

              <motion.div variants={item}>
                <ShieldNote />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}