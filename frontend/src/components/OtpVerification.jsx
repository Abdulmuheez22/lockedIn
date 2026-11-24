import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { resendOtp, verifyOtp } from "../services/api.services";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

/* ---------- tiny inline icons ---------- */
const LockIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ffffff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    <circle cx="12" cy="16" r="1.4" fill="#ffffff" stroke="none" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ffffff"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const ShieldNote = () => (
  <p className="flex items-center justify-center gap-1.5 mt-6 text-[11px] text-neutral-400">
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
    Your information is encrypted and secure
  </p>
);

export default function OtpVerification() {
  const location = useLocation();
  const navigate = useNavigate();

  /* ------- state ------- */
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success
  const [shakeKey, setShakeKey] = useState(0);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  const inputsRef = useRef([]);
  const submitRef = useRef(false);

  const resendMutation = useMutation({
    mutationFn: resendOtp,
    onSuccess: (data) => {
      setCooldown(RESEND_SECONDS);
      setInfo(data?.message || "A new code has been sent.");
      setError("");
      setDigits(Array(OTP_LENGTH).fill(""));
      setTimeout(() => focusBox(0), 60);
    },
    onError: (err) => {
      setError(
        err.response?.data?.message ||
          "Couldn't resend the code. Please try again.",
      );
    },
  });

  /* ------- URL params ------- */
  const params = new URLSearchParams(window.location.search);
  const accountData = location.state?.accountData ?? {};
  const email = decodeURIComponent(
    accountData.email || params.get("email") || "you@example.com",
  );
  const expectedCode = params.get("code"); // demo only — verify server-side in production

  const handleChangeEmail = () => {
    navigate("/", {
      state: {
        accountData: {
          ...accountData,
          email,
        },
      },
    });
  };

  /* ------- helpers ------- */
  const fullCode = digits.join("");

  const setDigit = (i, val) =>
    setDigits((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });

  const focusBox = (i) => {
    const el = inputsRef.current[i];
    if (el) {
      el.focus();
      el.select();
    }
  };

  useLayoutEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const fail = useCallback((msg) => {
    setError(msg);
    setShakeKey((k) => k + 1);
    setDigits(Array(OTP_LENGTH).fill(""));
    setTimeout(() => focusBox(0), 60);
  }, []);

  const { mutate, isPending, isError } = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      console.log("Email verified Successfully:", data);
      setStatus("success");
      setTimeout(() => navigate("/dashboard", { replace: true }), 1200);
    },
    onError: (error) => {
      console.error("OTP verification failed:", error);
      setStatus("idle");
      setError(
        error.response?.data?.message ||
          error.message ||
          "OTP verification failed. Please try again.",
      );
    },
  });

  /* ------- verify ------- */
  const verify = useCallback(() => {
    if (fullCode.length < OTP_LENGTH) {
      fail("Please enter all 6 digits.");
      return;
    }
    setStatus("loading");
    setError("");

    /// here is where you will place your api call
    mutate({ email, otp: fullCode });

    // TODO: replace with real API call — verification must be server-side
    //   setTimeout(() => {
    //     if (expectedCode && fullCode !== expectedCode) {
    //       setStatus("idle");
    //       fail("That code doesn't match. Please try again.");
    //     } else {
    //       setStatus("success");
    //       setTimeout(() => {
    //         /* window.location.href = "/dashboard"; */
    //       }, 1800);
    //     }
    //   }, 1200);
  }, [fullCode, expectedCode, fail]);

  /* auto-submit when complete */
  useEffect(() => {
    if (fullCode.length === OTP_LENGTH && !submitRef.current) {
      submitRef.current = true;
      verify();
    }
    if (fullCode.length < OTP_LENGTH) submitRef.current = false;
  }, [fullCode, verify]);

  /* ------- resend countdown ------- */
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = () => {
    if (resendMutation.isPending) return;
    resendMutation.mutate({ email });
  };

  /* ------- input handlers ------- */
  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    setError("");
    setInfo("");
    setDigit(i, val);
    if (val && i < OTP_LENGTH - 1) focusBox(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      setDigit(i - 1, "");
      focusBox(i - 1);
    }
    if (e.key === "ArrowLeft" && i > 0) focusBox(i - 1);
    if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) focusBox(i + 1);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!text) return;
    const next = Array(OTP_LENGTH).fill("");
    text.split("").forEach((d, i) => (next[i] = d));
    setDigits(next);
    setError("");
    setInfo("");
    focusBox(Math.min(text.length, OTP_LENGTH - 1));
  };

  /* ------- animation variants ------- */
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.15 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 280, damping: 26 },
    },
  };
  const box = (i) => ({
    hidden: { opacity: 0, y: 12, scale: 0.9 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 320,
        damping: 22,
        delay: 0.3 + i * 0.05,
      },
    },
  });
  const shakeAnim = { x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.45 } };

  return (
    <div
      className="min-h-screen bg-[#FFFFFF] text-[#050315] flex items-center justify-center p-3 sm:p-6"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(10,10,10,0.05) 1px, transparent 0)",
        backgroundSize: "28px 28px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[400px] bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-10"
      >
        {/* ---------- Success overlay ---------- */}
        <AnimatePresence>
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 bg-white rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center p-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 15,
                  delay: 0.1,
                }}
                className="w-16 h-16 rounded-full bg-[#0a0a0a] flex items-center justify-center mb-5 shadow-lg shadow-[#0a0a0a]/20"
              >
                <CheckIcon />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-2xl font-bold text-[#0a0a0a] tracking-tight"
              >
                You're verified!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-[#737373] mt-2 leading-relaxed"
              >
                Welcome to the circle. Redirecting you to your dashboard…
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={container} initial="hidden" animate="show">
          {/* ---------- Brand ---------- */}
          <motion.div variants={item} className="text-center">
            {/* <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
              className="w-[52px] h-[52px] rounded-full bg-[#0a0a0a] mx-auto mb-4 flex items-center justify-center shadow-lg shadow-[#0a0a0a]/25"
            >
              {/* <LockIcon /> */}
            {/* </motion.div> */}
            <p className="text-lg sm:text-xl font-bold text-[#0a0a0a] tracking-tight">
              Locked In Circle
            </p>
            <p className="text-[10px] font-semibold text-[#737373] tracking-[0.2em] uppercase mt-1">
              Members Portal
            </p>
          </motion.div>

          <motion.div
            variants={item}
            className="h-px bg-[#e8e8e8] my-6 sm:my-7"
          />

          {/* ---------- Heading ---------- */}
          <motion.h1
            variants={item}
            className="text-xl sm:text-2xl font-bold text-[#0a0a0a] tracking-tight text-center leading-snug"
          >
            Check your email inbox
          </motion.h1>
          <motion.p
            variants={item}
            className="text-[13px] sm:text-sm text-[#737373] text-center leading-relaxed mt-2.5"
          >
            We sent a 6-digit verification code to
            <br />
            <strong className="text-[#0a0a0a] font-semibold break-all">
              {email}
            </strong>
          </motion.p>

          {/* ---------- OTP boxes ---------- */}
          <motion.div
            key={shakeKey}
            initial={false}
            animate={shakeKey ? shakeAnim : { x: 0 }}
            variants={item}
            className="mt-7"
          >
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="flex justify-center gap-1.5 sm:gap-2.5"
            >
              {digits.map((d, i) => (
                <motion.input
                  key={i}
                  variants={box(i)}
                  ref={(el) => {
                    inputsRef.current[i] = el;
                  }}
                  autoFocus={i === 0}
                  onAnimationComplete={() => {
                    if (i === 0) focusBox(0);
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={d}
                  aria-label={`Digit ${i + 1}`}
                  onChange={(e) => handleChange(i, e)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  onFocus={(e) => e.target.select()}
                  className={[
                    "flex-1 min-w-0 max-w-[56px] h-[54px] sm:h-[62px]",
                    "rounded-[10px] sm:rounded-xl border-[1.5px] text-center",
                    "text-[22px] sm:text-[26px] font-bold text-[#0a0a0a]",
                    "[font-variant-numeric:tabular-nums] caret-[#0a0a0a] outline-none",
                    "transition-all duration-150 bg-white",
                    error
                      ? "border-[#dc2626] focus:ring-4 focus:ring-[#dc2626]/10"
                      : d
                        ? "border-[#c9c9c9] bg-[#f5f5f5] focus:border-[#0a0a0a] focus:ring-4 focus:ring-[#0a0a0a]/5"
                        : "border-[#e5e5e5] focus:border-[#0a0a0a] focus:ring-4 focus:ring-[#0a0a0a]/5",
                  ].join(" ")}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* ---------- message ---------- */}
          <div className="min-h-[22px] text-center text-[13px] font-medium mt-2">
            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  key="err"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[#dc2626]"
                >
                  {error}
                </motion.p>
              )}
              {info && !error && (
                <motion.p
                  key="ok"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[#16a34a]"
                >
                  {info}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* ---------- Submit ---------- */}
          <motion.div variants={item}>
            <motion.button
              type="button"
              onClick={verify}
              disabled={status === "loading"}
              whileHover={{ scale: status === "loading" ? 1 : 1.01 }}
              whileTap={{ scale: status === "loading" ? 1 : 0.98 }}
              className="w-full mt-4 py-3.5 rounded-xl bg-[#0a0a0a] text-white text-[15px] font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-[#0a0a0a]/30 hover:bg-[#1f1f1f] transition-colors duration-200 disabled:opacity-55 disabled:cursor-not-allowed"
            >
              <AnimatePresence mode="wait" initial={false}>
                {status === "loading" ? (
                  <motion.span
                    key="load"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Spinner /> Verifying...
                  </motion.span>
                ) : (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Verify Email
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>

          {/* ---------- Resend + alt ---------- */}
          <motion.p
            variants={item}
            className="text-center text-[13px] text-[#737373] mt-6"
          >
            Didn't get the code?{" "}
            {cooldown > 0 ? (
              <span className="font-medium">Resend in {cooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-[#0a0a0a] font-semibold underline underline-offset-[3px] decoration-[1.5px] hover:text-[#737373] transition-colors"
              >
                Resend code
              </button>
            )}
          </motion.p>
          <motion.p
            variants={item}
            className="text-center text-[13px] text-[#737373] mt-3.5"
          >
            Wrong email?{" "}
            <button
              type="button"
              onClick={handleChangeEmail}
              className="text-[#0a0a0a] font-semibold hover:underline underline-offset-4 transition-colors"
            >
              Change email address
            </button>
          </motion.p>

          <motion.div variants={item}>
            <ShieldNote />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
