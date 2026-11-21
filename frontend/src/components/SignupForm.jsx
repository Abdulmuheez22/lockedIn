import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { signUp } from "../services/api.services";
import { Link, useLocation, useNavigate } from "react-router";

const levels = [
  "100 Level",
  "200 Level",
  "300 Level",
  "400 Level",
  "500 Level",
  "600 Level",
  "700 Level",
];

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="leading-tight">
        <p className="text-[#0a0a0a] font-extrabold text-xl sm:text-2xl tracking-tighter">
          Locked In Circle
        </p>
        <p className="text-[#737373] text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.18em]">
          Members Portal
        </p>
      </div>
    </div>
  );
}

/* ---------- Password strength helper ---------- */
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}

const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["#ef4444", "#f59e0b", "#eab308", "#84cc16", "#22c55e"];

/* ---------- Reusable field wrapper with error highlights ---------- */
function Field({ label, hint, error, isError, children }) {
  return (
    <div className="mb-4 sm:mb-5">
      <label className="block text-[12px] sm:text-[13px] font-semibold text-[#0a0a0a] mb-1.5">
        {label}
        {hint && (
          <span className="text-[#737373] font-normal ml-1.5">{hint}</span>
        )}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[#dc2626] text-[12px] sm:text-xs mt-1.5 flex items-center gap-1 font-medium"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span>{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const getInputClass = (hasError) =>
  `w-full bg-[#ffffff] border-[1.5px] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-[#0a0a0a] placeholder-[#a3a3a3] text-[14px] sm:text-sm outline-none transition-all duration-200 ${
    hasError
      ? "border-[#dc2626] focus:border-[#dc2626] focus:ring-4 focus:ring-[#dc2626]/10"
      : "border-[#e5e5e5] focus:border-[#0a0a0a] focus:ring-4 focus:ring-[#0a0a0a]/5"
  }`;

const EyeIcon = ({ off }) =>
  off ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

export default function SignupForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    level: "",
    department: "",
    phone: "",
  });

  useEffect(() => {
    const savedData = location.state?.accountData;
    if (!savedData) return;

    setFormData({
      fullName: savedData.fullName ?? "",
      email: savedData.email ?? "",
      password: savedData.password ?? "",
      confirmPassword: savedData.confirmPassword ?? savedData.password ?? "",
      level: savedData.level ?? "",
      department: savedData.department ?? "",
      phone: savedData.phone ?? "",
    });
  }, [location.state]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [isUnverifiedConflict, setIsUnverifiedConflict] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  /* Field Refs for auto-focusing on error */
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);
  const levelRef = useRef(null);
  const deptRef = useRef(null);
  const phoneRef = useRef(null);

  const shake = useCallback(() => setShakeKey((k) => k + 1), []);

  const strength = useMemo(
    () => getStrength(formData.password),
    [formData.password],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (globalError) setGlobalError("");
    if (isUnverifiedConflict) setIsUnverifiedConflict(false);
  };

  const validate = () => {
    const newErrors = {};
    let firstBadField = null;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      firstBadField = firstBadField || nameRef;
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      firstBadField = firstBadField || emailRef;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
      firstBadField = firstBadField || emailRef;
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
      firstBadField = firstBadField || passwordRef;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      firstBadField = firstBadField || passwordRef;
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      firstBadField = firstBadField || confirmRef;
    }
    if (!formData.level) {
      newErrors.level = "Please select your level";
      firstBadField = firstBadField || levelRef;
    }
    if (!formData.department.trim()) {
      newErrors.department = "Department is required";
      firstBadField = firstBadField || deptRef;
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      firstBadField = firstBadField || phoneRef;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      shake();
      firstBadField?.current?.focus();
      return false;
    }
    return true;
  };

  const { mutate } = useMutation({
    mutationFn: signUp,
    onSuccess: (data) => {
      setIsSubmitting(false);
      setSubmitted(true);
    },
    onError: (error) => {
      setIsSubmitting(false);
      shake();

      const errorData = error.response?.data;
      const message =
        errorData?.message ||
        error.message ||
        "We couldn't create your account. Please check your details and try again.";

      // Check if backend flags email already registered but unverified
      const isUnverified =
        errorData?.isUnverified ||
        message.toLowerCase().includes("unverified") ||
        message.toLowerCase().includes("already registered");

      if (isUnverified) {
        setIsUnverifiedConflict(true);
        setGlobalError(
          "An account with this email already exists but has not been verified yet."
        );
      } else if (message.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: message }));
        emailRef.current?.focus();
      } else {
        setGlobalError(message);
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);
    setGlobalError("");
    setIsUnverifiedConflict(false);

    mutate({
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      level: formData.level,
      department: formData.department.trim(),
      phoneNumber: formData.phone.trim(),
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 280, damping: 26 },
    },
  };

  const shakeAnim = {
    x: [0, -8, 8, -5, 5, 0],
    transition: { duration: 0.42 },
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#050315] flex items-center justify-center p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] relative"
      >
        {/* Header / Logo */}
        <div className="mb-6 sm:mb-8">
          <Logo />
        </div>

        {/* Form Container with Shake Wrapper */}
        <motion.div
          key={shakeKey}
          initial={false}
          animate={shakeKey ? shakeAnim : { x: 0 }}
          className="bg-[#ffffff] rounded-2xl sm:rounded-3xl p-5 sm:p-9"
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              /* ---- Success State ---- */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 16,
                    delay: 0.1,
                  }}
                  className="w-16 h-16 rounded-2xl bg-[#0a0a0a] mx-auto mb-5 flex items-center justify-center shadow-lg shadow-[#0a0a0a]/20"
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </motion.div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0a0a0a] tracking-tight">
                  Welcome to the circle
                </h2>
                <p className="text-[#737373] text-[13px] sm:text-sm mt-2 leading-relaxed">
                  Your account has been created successfully. We’ve sent a verification code to{" "}
                  <span className="font-semibold text-[#0a0a0a]">{formData.email}</span>.
                </p>
                <div className="mt-7">
                  <Link
                    to="/OtpVerification"
                    state={{ accountData: formData }}
                    className="w-full inline-flex items-center justify-center bg-[#0a0a0a] text-white font-semibold text-[15px] py-3.5 rounded-xl hover:bg-[#1f1f1f] transition-colors shadow-lg shadow-[#0a0a0a]/20"
                  >
                    Verify your email
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                variants={container}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit}
                noValidate
              >
                <motion.div variants={item} className="mb-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0a0a0a] tracking-tight">
                    Create your account
                  </h1>
                  <p className="text-[#737373] text-[13px] sm:text-sm mt-1">
                    Join the Locked In Circle community in under a minute.
                  </p>
                </motion.div>

                {/* Global Alert / Unverified Conflict Banner */}
                <AnimatePresence>
                  {(globalError || isUnverifiedConflict) && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-[13px]"
                    >
                      <div className="flex items-start gap-2.5">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#dc2626"
                          strokeWidth="2.2"
                          className="shrink-0 mt-0.5"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <circle cx="12" cy="16" r="0.5" fill="#dc2626" />
                        </svg>
                        <div className="flex-1">
                          <p className="font-medium text-[#991b1b]">
                            {globalError}
                          </p>
                          {isUnverifiedConflict && (
                            <div className="mt-2">
                              <Link
                                to="/OtpVerification"
                                state={{ accountData: formData }}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#dc2626] text-white px-3 py-1.5 rounded-lg hover:bg-[#b91c1c] transition-colors shadow-sm"
                              >
                                Complete email verification &rarr;
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Full Name */}
                <motion.div variants={item}>
                  <Field label="Full Name" error={errors.fullName}>
                    <input
                      ref={nameRef}
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={getInputClass(errors.fullName)}
                    />
                  </Field>
                </motion.div>

                {/* Email */}
                <motion.div variants={item}>
                  <Field label="Email Address" error={errors.email}>
                    <input
                      ref={emailRef}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={getInputClass(errors.email)}
                    />
                  </Field>
                </motion.div>

                {/* Password */}
                <motion.div variants={item}>
                  <Field label="Password" error={errors.password}>
                    <div className="relative flex items-center">
                      <input
                        ref={passwordRef}
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={`${getInputClass(errors.password)} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-[#737373] hover:text-[#0a0a0a] transition-colors p-1"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        <EyeIcon off={showPassword} />
                      </button>
                    </div>
                    {/* Strength meter */}
                    {formData.password && (
                      <div className="mt-2.5">
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="h-1 flex-1 rounded-full transition-colors duration-300"
                              style={{
                                backgroundColor:
                                  i <= strength
                                    ? strengthColors[strength]
                                    : "#e5e5e5",
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-[#737373] mt-1 font-medium">
                          {strengthLabels[strength]}
                        </p>
                      </div>
                    )}
                  </Field>
                </motion.div>

                {/* Confirm Password */}
                <motion.div variants={item}>
                  <Field
                    label="Confirm Password"
                    error={errors.confirmPassword}
                  >
                    <div className="relative flex items-center">
                      <input
                        ref={confirmRef}
                        type={showConfirm ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={`${getInputClass(errors.confirmPassword)} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 text-[#737373] hover:text-[#0a0a0a] transition-colors p-1"
                        aria-label={
                          showConfirm ? "Hide password" : "Show password"
                        }
                      >
                        <EyeIcon off={showConfirm} />
                      </button>
                    </div>
                  </Field>
                </motion.div>

                {/* Level */}
                <motion.div variants={item}>
                  <Field label="Current Academic Level" error={errors.level}>
                    <div className="relative flex items-center">
                      <select
                        ref={levelRef}
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        className={`${getInputClass(errors.level)} appearance-none cursor-pointer ${
                          !formData.level ? "text-[#a3a3a3]" : ""
                        }`}
                      >
                        <option value="" disabled>
                          Select your level
                        </option>
                        {levels.map((lvl) => (
                          <option
                            key={lvl}
                            value={lvl}
                            className="text-[#0a0a0a]"
                          >
                            {lvl}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-4 text-[#737373]">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                    </div>
                  </Field>
                </motion.div>

                {/* Department */}
                <motion.div variants={item}>
                  <Field label="Department" error={errors.department}>
                    <input
                      ref={deptRef}
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. History & International Studies"
                      className={getInputClass(errors.department)}
                    />
                  </Field>
                </motion.div>

                {/* Phone */}
                <motion.div variants={item}>
                  <Field
                    label="Phone Number"
                    hint="(WhatsApp preferred)"
                    error={errors.phone}
                  >
                    <input
                      ref={phoneRef}
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+234 801 234 5678"
                      className={getInputClass(errors.phone)}
                    />
                  </Field>
                </motion.div>

                {/* Submit */}
                <motion.div variants={item} className="mt-3">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    className="w-full bg-[#0a0a0a] text-[#ffffff] font-semibold text-[15px] py-3.5 rounded-xl hover:bg-[#1f1f1f] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0a0a0a]/20"
                  >
                    <AnimatePresence mode="wait">
                      {isSubmitting ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
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
                          Creating your account...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Create Account
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>

                <motion.p
                  variants={item}
                  className="text-center text-[13px] text-[#737373] mt-6"
                >
                  Already have an account?{" "}
                  <Link
                    to="/signin"
                    className="text-[#0a0a0a] font-semibold underline underline-offset-4 hover:text-[#737373] transition-colors"
                  >
                    Log in
                  </Link>
                </motion.p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Trust footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[11px] text-[#a3a3a3] mt-6 flex items-center justify-center gap-1.5"
        >
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
        </motion.p>
      </motion.div>
    </div>
  );
}