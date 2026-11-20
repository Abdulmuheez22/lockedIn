import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
// Replace with your actual API service functions:
// import { requestPasswordReset, verifyResetOtp, resetPassword } from "../services/api.services";

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

const KeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
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

const ArrowRightIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
);

const CheckIcon = ({ size = 11, stroke = "#ffffff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
    strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="13" />
    <circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
  </svg>
);

const ShieldNote = () => (
  <p className="flex items-center justify-center gap-1.5 mt-6 text-[11px] text-neutral-400 text-center">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M12 2 4 5.5v5.6c0 5 3.4 9.3 8 10.4 4.6-1.1 8-5.4 8-10.4V5.5L12 2Z" />
      <path d="m9 12 2 2 4-4.5" />
    </svg>
    <span>Your information is encrypted and secure</span>
  </p>
);

/* ---------- validation & helpers ---------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const OTP_LENGTH = 6;

const getPasswordChecks = (pw) => ({
  length: pw.length >= 8,
  upperAndLower: /[a-z]/.test(pw) && /[A-Z]/.test(pw),
  numberOrSymbol: /[\d\W_]/.test(pw),
});

/* ---------- step indicator ---------- */
const STEPS = ["Email", "Verify", "Reset"];

const StepProgress = ({ currentStep }) => {
  if (currentStep > 2) return null;

  return (
    <div className="mb-6" aria-label="Password recovery progress">
      <div className="flex items-center justify-between gap-1.5">
        {STEPS.map((label, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full h-1 rounded-full bg-[#efefef] overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{
                    width: isCompleted || isActive ? "100%" : "0%",
                    backgroundColor: isCompleted || isActive ? "#0a0a0a" : "#efefef",
                  }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                />
              </div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                  isActive
                    ? "text-[#0a0a0a]"
                    : isCompleted
                    ? "text-[#525252]"
                    : "text-[#a3a3a3]"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function ForgotPassword() {
  const navigate = useNavigate();

  /* ------- flow state: 0 = email, 1 = otp, 2 = new password, 3 = done ------- */
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [shakeKey, setShakeKey] = useState(0);

  /* ------- form state ------- */
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ------- errors & timers ------- */
  const [errors, setErrors] = useState({
    email: "",
    otp: "",
    password: "",
    confirm: "",
  });
  const [resendTimer, setResendTimer] = useState(0);

  /* ------- refs ------- */
  const emailRef = useRef(null);
  const otpRefs = useRef([]);
  const passRef = useRef(null);
  const confirmRef = useRef(null);

  const shake = useCallback(() => setShakeKey((k) => k + 1), []);

  const clearError = (field) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));

  const goToStep = (nextStep) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  /* ------- resend countdown ------- */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => {
      setResendTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  /* ------- focus management per step ------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 0) emailRef.current?.focus();
      if (step === 1) otpRefs.current[0]?.focus();
      if (step === 2) passRef.current?.focus();
    }, 220);
    return () => clearTimeout(timer);
  }, [step]);

  /* ------- mutations (wire your api.services here) ------- */
  const sendOtpMutation = useMutation({
    mutationFn: async (payload) => {
      // Replace with: return requestPasswordReset(payload);
      await new Promise((r) => setTimeout(r, 750));
      return { ok: true, email: payload.email };
    },
    onSuccess: () => {
      setErrors({ email: "", otp: "", password: "", confirm: "" });
      setOtp(Array(OTP_LENGTH).fill(""));
      setResendTimer(60);
      if (step === 0) goToStep(1);
    },
    onError: (err) => {
      setErrors((prev) => ({
        ...prev,
        email:
          err?.response?.data?.message ||
          "We couldn't send a code to that address. Please try again.",
      }));
      shake();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (payload) => {
      // Replace with: return verifyResetOtp(payload);
      await new Promise((r) => setTimeout(r, 750));
      return { resetToken: "verified-session-token", ...payload };
    },
    onSuccess: (data) => {
      setResetToken(data?.resetToken || "");
      setErrors((prev) => ({ ...prev, otp: "" }));
      goToStep(2);
    },
    onError: (err) => {
      setErrors((prev) => ({
        ...prev,
        otp:
          err?.response?.data?.message ||
          "Invalid or expired verification code.",
      }));
      shake();
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (payload) => {
      // Replace with: return resetPassword(payload);
      await new Promise((r) => setTimeout(r, 850));
      return { ok: true, ...payload };
    },
    onSuccess: () => {
      goToStep(3);
    },
    onError: (err) => {
      setErrors((prev) => ({
        ...prev,
        confirm:
          err?.response?.data?.message ||
          "Unable to update password. Please request a new code.",
      }));
      shake();
    },
  });

  /* ------- step 0: email submit ------- */
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (sendOtpMutation.isPending) return;

    const trimmed = email.trim();
    if (!trimmed) {
      setErrors((prev) => ({ ...prev, email: "Please enter your email address." }));
      shake();
      emailRef.current?.focus();
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setErrors((prev) => ({ ...prev, email: "That email address doesn't look right." }));
      shake();
      emailRef.current?.focus();
      return;
    }

    sendOtpMutation.mutate({ email: trimmed });
  };

  /* ------- step 1: OTP handlers ------- */
  const handleOtpChange = (index, rawValue) => {
    const digit = rawValue.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    clearError("otp");

    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit once all 6 digits are entered
    if (digit && next.every((d) => d !== "")) {
      verifyOtpMutation.mutate({ email: email.trim(), otp: next.join("") });
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      } else if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, idx) => {
      next[idx] = char;
    });
    setOtp(next);
    clearError("otp");

    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[focusIdx]?.focus();

    if (pasted.length === OTP_LENGTH) {
      verifyOtpMutation.mutate({ email: email.trim(), otp: pasted });
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (verifyOtpMutation.isPending) return;

    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setErrors((prev) => ({
        ...prev,
        otp: "Please enter all 6 digits from your email.",
      }));
      shake();
      const firstEmpty = otp.findIndex((d) => !d);
      otpRefs.current[firstEmpty === -1 ? 0 : firstEmpty]?.focus();
      return;
    }

    verifyOtpMutation.mutate({ email: email.trim(), otp: code });
  };

  /* ------- step 2: new password submit ------- */
  const checks = getPasswordChecks(password);
  const strengthScore = Object.values(checks).filter(Boolean).length;

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (resetPasswordMutation.isPending) return;

    const nextErr = { email: "", otp: "", password: "", confirm: "" };
    let badField = null;

    if (!password) {
      nextErr.password = "Please create a new password.";
      badField = "password";
    } else if (!checks.length || !checks.upperAndLower || !checks.numberOrSymbol) {
      nextErr.password = "Please meet all password requirements below.";
      badField = "password";
    }

    if (!confirmPassword) {
      nextErr.confirm = "Please confirm your new password.";
      badField = badField || "confirm";
    } else if (password !== confirmPassword) {
      nextErr.confirm = "Passwords do not match.";
      badField = badField || "confirm";
    }

    setErrors(nextErr);
    if (badField) {
      shake();
      (badField === "password" ? passRef : confirmRef).current?.focus();
      return;
    }

    resetPasswordMutation.mutate({
      email: email.trim(),
      otp: otp.join(""),
      resetToken,
      password,
    });
  };

  /* ------- shared field styles ------- */
  const getInputBorder = (hasError) =>
    hasError
      ? "border-[#dc2626] focus:border-[#dc2626] focus:ring-4 focus:ring-[#dc2626]/10"
      : "border-[#e5e5e5] focus:border-[#0a0a0a] focus:ring-4 focus:ring-[#0a0a0a]/5";

  /* ------- animation variants ------- */
  const stepVariants = {
    enter: (dir) => ({
      opacity: 0,
      x: dir > 0 ? 18 : -18,
    }),
    center: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (dir) => ({
      opacity: 0,
      x: dir > 0 ? -18 : 18,
      transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  const shakeAnim = {
    x: [0, -8, 8, -5, 5, 0],
    transition: { duration: 0.42 },
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#050315] flex items-center justify-center px-3 py-6 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[400px]"
      >
        <motion.div
          key={shakeKey}
          initial={false}
          animate={shakeKey ? shakeAnim : { x: 0 }}
        >
          {/* Reduced horizontal padding on ultra-small screens (300px) to preserve inner width */}
          <div className="bg-[#FFFFFF] rounded-2xl sm:rounded-3xl px-3.5 py-6 min-[360px]:px-5 sm:p-10">
            {/* ---------- Brand ---------- */}
            <div className="text-center">
              <p className="text-lg sm:text-xl font-bold text-[#0a0a0a] tracking-tight">
                Locked In Circle
              </p>
              <p className="text-[10px] font-semibold text-[#737373] tracking-[0.2em] uppercase mt-1">
                Account Recovery
              </p>
            </div>

            <div className="h-px bg-[#e8e8e8] my-5 sm:my-7" />

            <StepProgress currentStep={step} />

            {/* ---------- Animated Multi-Step Stage ---------- */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                {/* ==================== STAGE 1: EMAIL ==================== */}
                {step === 0 && (
                  <motion.div
                    key="step-email"
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <h1 className="text-xl sm:text-2xl font-bold text-[#0a0a0a] tracking-tight text-center leading-snug">
                      Reset password
                    </h1>
                    <p className="text-[13px] sm:text-sm text-[#737373] text-center leading-relaxed mt-2">
                      Enter your account email and we’ll send a 6-digit verification code.
                    </p>

                    <form onSubmit={handleEmailSubmit} noValidate>
                      <div className="mt-6">
                        <label
                          htmlFor="reset-email"
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
                            id="reset-email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              clearError("email");
                            }}
                            className={`w-full rounded-xl border-[1.5px] bg-white pl-10 pr-3.5 py-3 text-[15px] text-[#0a0a0a] outline-none transition-all duration-150 placeholder:text-neutral-300 ${getInputBorder(
                              Boolean(errors.email)
                            )}`}
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
                              <AlertIcon /> <span>{errors.email}</span>
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <motion.button
                        type="submit"
                        disabled={sendOtpMutation.isPending}
                        whileHover={{ scale: sendOtpMutation.isPending ? 1 : 1.01 }}
                        whileTap={{ scale: sendOtpMutation.isPending ? 1 : 0.98 }}
                        className="w-full mt-6 py-3.5 rounded-xl bg-[#0a0a0a] text-white text-[14.5px] sm:text-[15px] font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0a0a0a]/25 hover:bg-[#1f1f1f] transition-colors duration-200 disabled:opacity-55 disabled:cursor-not-allowed"
                      >
                        {sendOtpMutation.isPending ? (
                          <>
                            <Spinner /> Sending code…
                          </>
                        ) : (
                          <>
                            Send verification code <ArrowRightIcon />
                          </>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}

                {/* ==================== STAGE 2: OTP ==================== */}
                {step === 1 && (
                  <motion.div
                    key="step-otp"
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <h1 className="text-xl sm:text-2xl font-bold text-[#0a0a0a] tracking-tight text-center leading-snug">
                      Check your email
                    </h1>
                    <p className="text-[13px] sm:text-sm text-[#737373] text-center leading-relaxed mt-2">
                      We sent a 6-digit code to{" "}
                      <span className="font-semibold text-[#0a0a0a] break-all">
                        {email.trim()}
                      </span>
                    </p>

                    <form onSubmit={handleOtpSubmit} noValidate>
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-[11px] font-semibold text-[#737373] tracking-[0.08em] uppercase">
                            Verification code
                          </label>
                          <button
                            type="button"
                            onClick={() => goToStep(0)}
                            className="text-[11.5px] font-semibold text-[#0a0a0a] hover:text-[#737373] transition-colors"
                          >
                            Change email
                          </button>
                        </div>

                        {/* Fluid 6-column grid engineered for >=300px screens */}
                        <div
                          onPaste={handleOtpPaste}
                          className="grid grid-cols-6 gap-1.5 min-[360px]:gap-2"
                        >
                          {otp.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => (otpRefs.current[idx] = el)}
                              type="text"
                              inputMode="numeric"
                              autoComplete={idx === 0 ? "one-time-code" : "off"}
                              maxLength={1}
                              aria-label={`Digit ${idx + 1} of ${OTP_LENGTH}`}
                              value={digit}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className={`w-full aspect-square max-h-12 rounded-xl border-[1.5px] bg-white text-center text-base min-[360px]:text-lg font-bold text-[#0a0a0a] outline-none transition-all duration-150 ${getInputBorder(
                                Boolean(errors.otp)
                              )}`}
                            />
                          ))}
                        </div>

                        <AnimatePresence>
                          {errors.otp && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-1.5 mt-2.5 text-[12.5px] font-medium text-[#dc2626]"
                            >
                              <AlertIcon /> <span>{errors.otp}</span>
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <motion.button
                        type="submit"
                        disabled={verifyOtpMutation.isPending}
                        whileHover={{ scale: verifyOtpMutation.isPending ? 1 : 1.01 }}
                        whileTap={{ scale: verifyOtpMutation.isPending ? 1 : 0.98 }}
                        className="w-full mt-6 py-3.5 rounded-xl bg-[#0a0a0a] text-white text-[14.5px] sm:text-[15px] font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0a0a0a]/25 hover:bg-[#1f1f1f] transition-colors duration-200 disabled:opacity-55 disabled:cursor-not-allowed"
                      >
                        {verifyOtpMutation.isPending ? (
                          <>
                            <Spinner /> Verifying…
                          </>
                        ) : (
                          <>
                            Verify code <ArrowRightIcon />
                          </>
                        )}
                      </motion.button>

                      {/* Resend bar */}
                      <div className="mt-4 text-center text-[12.5px] text-[#737373]">
                        Didn’t receive it?{" "}
                        {resendTimer > 0 ? (
                          <span className="font-semibold text-[#0a0a0a] tabular-nums">
                            Resend in {resendTimer}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={sendOtpMutation.isPending}
                            onClick={() => sendOtpMutation.mutate({ email: email.trim() })}
                            className="font-semibold text-[#0a0a0a] underline underline-offset-[3px] decoration-[1.5px] hover:text-[#737373] transition-colors disabled:opacity-50"
                          >
                            {sendOtpMutation.isPending ? "Sending…" : "Resend code"}
                          </button>
                        )}
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* ==================== STAGE 3: NEW PASSWORD ==================== */}
                {step === 2 && (
                  <motion.div
                    key="step-password"
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <h1 className="text-xl sm:text-2xl font-bold text-[#0a0a0a] tracking-tight text-center leading-snug">
                      Create new password
                    </h1>
                    <p className="text-[13px] sm:text-sm text-[#737373] text-center leading-relaxed mt-2">
                      Choose a strong password you haven’t used before.
                    </p>

                    <form onSubmit={handleResetSubmit} noValidate>
                      {/* New Password */}
                      <div className="mt-6">
                        <label
                          htmlFor="new-password"
                          className="block text-[11px] font-semibold text-[#737373] tracking-[0.08em] uppercase mb-2"
                        >
                          New password
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-neutral-400 pointer-events-none">
                            <LockIcon />
                          </span>
                          <input
                            ref={passRef}
                            id="new-password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              clearError("password");
                            }}
                            className={`w-full rounded-xl border-[1.5px] bg-white pl-10 pr-11 py-3 text-[15px] text-[#0a0a0a] outline-none transition-all duration-150 placeholder:text-neutral-300 ${getInputBorder(
                              Boolean(errors.password)
                            )}`}
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

                        {/* Strength bar */}
                        <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                          {[1, 2, 3].map((level) => (
                            <div
                              key={level}
                              className={`h-1 rounded-full transition-colors duration-300 ${
                                strengthScore >= level
                                  ? strengthScore === 3
                                    ? "bg-[#0a0a0a]"
                                    : "bg-[#737373]"
                                  : "bg-[#efefef]"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Live requirement pills */}
                        <ul className="mt-2.5 space-y-1">
                          {[
                            { ok: checks.length, text: "8 or more characters" },
                            { ok: checks.upperAndLower, text: "Uppercase & lowercase letters" },
                            { ok: checks.numberOrSymbol, text: "At least one number or symbol" },
                          ].map((rule) => (
                            <li
                              key={rule.text}
                              className={`flex items-center gap-2 text-[12px] transition-colors ${
                                rule.ok ? "text-[#0a0a0a] font-medium" : "text-[#737373]"
                              }`}
                            >
                              <span
                                className={`w-3.5 h-3.5 rounded-full grid place-items-center shrink-0 transition-colors ${
                                  rule.ok ? "bg-[#0a0a0a]" : "bg-[#e5e5e5]"
                                }`}
                              >
                                <CheckIcon size={8} />
                              </span>
                              <span>{rule.text}</span>
                            </li>
                          ))}
                        </ul>

                        <AnimatePresence>
                          {errors.password && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-1.5 mt-2 text-[12.5px] font-medium text-[#dc2626]"
                            >
                              <AlertIcon /> <span>{errors.password}</span>
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Confirm Password */}
                      <div className="mt-4">
                        <label
                          htmlFor="confirm-password"
                          className="block text-[11px] font-semibold text-[#737373] tracking-[0.08em] uppercase mb-2"
                        >
                          Confirm password
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-neutral-400 pointer-events-none">
                            <LockIcon />
                          </span>
                          <input
                            ref={confirmRef}
                            id="confirm-password"
                            type={showConfirm ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              clearError("confirm");
                            }}
                            className={`w-full rounded-xl border-[1.5px] bg-white pl-10 pr-11 py-3 text-[15px] text-[#0a0a0a] outline-none transition-all duration-150 placeholder:text-neutral-300 ${getInputBorder(
                              Boolean(errors.confirm)
                            )}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((s) => !s)}
                            aria-label={showConfirm ? "Hide password" : "Show password"}
                            className="absolute right-2 p-2 rounded-lg text-neutral-400 hover:text-[#0a0a0a] hover:bg-neutral-100 transition-colors"
                          >
                            {showConfirm ? <EyeClosedIcon /> : <EyeOpenIcon />}
                          </button>
                        </div>

                        <AnimatePresence>
                          {errors.confirm && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-1.5 mt-2 text-[12.5px] font-medium text-[#dc2626]"
                            >
                              <AlertIcon /> <span>{errors.confirm}</span>
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <motion.button
                        type="submit"
                        disabled={resetPasswordMutation.isPending}
                        whileHover={{ scale: resetPasswordMutation.isPending ? 1 : 1.01 }}
                        whileTap={{ scale: resetPasswordMutation.isPending ? 1 : 0.98 }}
                        className="w-full mt-6 py-3.5 rounded-xl bg-[#0a0a0a] text-white text-[14.5px] sm:text-[15px] font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0a0a0a]/25 hover:bg-[#1f1f1f] transition-colors duration-200 disabled:opacity-55 disabled:cursor-not-allowed"
                      >
                        {resetPasswordMutation.isPending ? (
                          <>
                            <Spinner /> Updating password…
                          </>
                        ) : (
                          <>
                            Update password <ArrowRightIcon />
                          </>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}

                {/* ==================== STAGE 4: SUCCESS ==================== */}
                {step === 3 && (
                  <motion.div
                    key="step-success"
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="text-center py-2"
                  >
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 360, damping: 22 }}
                      className="w-12 h-12 rounded-2xl bg-[#0a0a0a] text-white grid place-items-center mx-auto mb-4 shadow-md shadow-[#0a0a0a]/20"
                    >
                      <KeyIcon />
                    </motion.div>

                    <h1 className="text-xl sm:text-2xl font-bold text-[#0a0a0a] tracking-tight leading-snug">
                      Password updated
                    </h1>
                    <p className="text-[13px] sm:text-sm text-[#737373] leading-relaxed mt-2">
                      Your password has been reset successfully. You can now sign in with your new credentials.
                    </p>

                    <motion.button
                      type="button"
                      onClick={() => navigate("/login")}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-7 py-3.5 rounded-xl bg-[#0a0a0a] text-white text-[15px] font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0a0a0a]/25 hover:bg-[#1f1f1f] transition-colors duration-200"
                    >
                      Back to sign in <ArrowRightIcon />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ---------- Footer Navigation ---------- */}
            {step < 3 && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[#737373] hover:text-[#0a0a0a] transition-colors"
                >
                  <ArrowLeftIcon /> Back to sign in
                </button>
              </div>
            )}

            <ShieldNote />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}