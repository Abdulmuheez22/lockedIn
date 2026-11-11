import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { signUp } from "../services/api.services";

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
      {/* <motion.div
        initial={{ rotate: -12, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="relative w-11 h-11 rounded-full bg-[#0a0a0a] flex items-center justify-center shadow-lg shadow-[#0a0a0a]/15"
      > */}
      {/* <svg
          width="20"
          height="20"
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
        </svg> */}
      {/* <span className="absolute inset-0 rounded-full border border-[#0a0a0a]/10" /> */}
      {/* </motion.div> */}
      <div className="leading-tight">
        <p className="text-[#0a0a0a] font-extrabold text-2xl tracking-tighter">
          Locked In Circle
        </p>
        <p className="text-[#737373] text-[11px] font-medium uppercase tracking-[0.18em]">
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

/* ---------- Reusable field wrapper ---------- */
function Field({ label, hint, error, children }) {
  return (
    <div className="mb-5">
      <label className="block text-[13px] font-semibold text-[#0a0a0a] mb-1.5">
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
            className="text-[#dc2626] text-xs mt-1.5 flex items-center gap-1"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputClass =
  "w-full bg-[#ffffff] border border-[#e5e5e5] rounded-xl px-4 py-3 text-[#0a0a0a] placeholder-[#a3a3a3] text-sm focus:outline-none focus:ring-4 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a] transition-all duration-200";

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
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    level: "",
    department: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const strength = useMemo(
    () => getStrength(formData.password),
    [formData.password],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Enter a valid email address";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.level) newErrors.level = "Please select your level";
    if (!formData.department.trim())
      newErrors.department = "Department is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { mutate, isPending, isError } = useMutation({
    mutationFn: signUp,
    onSuccess: (data) => {
      console.log("Success:", data);
      // redirect, show toast, etc.
    },
    onError: (error) => {
      console.log("Error:", error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      mutate({formData})
      console.log("Form submitted:", formData);
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

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

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#050315] flex items-center justify-center p-4 sm:p-8">
      {/* subtle background texture */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(10,10,10,0.05) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative"
      >
        {/* Header */}
        <div className="mb-8">
          <Logo />
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="bg-[#ffffff] border border-[#e8e8e8] rounded-3xl p-7 sm:p-9 shadow-[0_20px_60px_-15px_rgba(10,10,10,0.12)]"
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              /* ---- Success state ---- */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center"
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
                  className="w-16 h-16 rounded-full bg-[#0a0a0a] mx-auto mb-5 flex items-center justify-center"
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </motion.div>
                <h2 className="text-2xl font-bold text-[#0a0a0a] tracking-tight">
                  You're in the circle
                </h2>
                <p className="text-[#737373] text-sm mt-2">
                  Your account has been created successfully.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      fullName: "",
                      email: "",
                      password: "",
                      confirmPassword: "",
                      level: "",
                      department: "",
                      phone: "",
                    });
                  }}
                  className="mt-6 text-sm font-semibold text-[#0a0a0a] underline underline-offset-4 hover:text-[#737373] transition-colors"
                >
                  Create another account
                </button>
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
                <motion.div variants={item} className="mb-7">
                  <h1 className="text-2xl font-bold text-[#0a0a0a] tracking-tight">
                    Create your account
                  </h1>
                  <p className="text-[#737373] text-sm mt-1">
                    Join the Locked In Circle community in under a minute.
                  </p>
                </motion.div>

                {/* Full Name */}
                <motion.div variants={item}>
                  <Field label="Full Name" error={errors.fullName}>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={inputClass}
                    />
                  </Field>
                </motion.div>

                {/* Email */}
                <motion.div variants={item}>
                  <Field label="Email Address" error={errors.email}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </Field>
                </motion.div>

                {/* Password */}
                <motion.div variants={item}>
                  <Field label="Password" error={errors.password}>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={`${inputClass} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        <EyeIcon off={showPassword} />
                      </button>
                    </div>
                    {/* Strength meter */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1">
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
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={`${inputClass} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] transition-colors"
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
                    <div className="relative">
                      <select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        className={`${inputClass} appearance-none cursor-pointer ${!formData.level ? "text-[#a3a3a3]" : ""}`}
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
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#737373]">
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
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. History & International Studies"
                      className={inputClass}
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
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+234 801 234 5678"
                      className={inputClass}
                    />
                  </Field>
                </motion.div>

                {/* Submit */}
                <motion.div variants={item} className="mt-2">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    className="w-full bg-[#0a0a0a] text-[#ffffff] font-semibold text-sm py-3.5 rounded-xl hover:bg-[#1f1f1f] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0a0a0a]/10"
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
                  <a
                    href="/login"
                    className="text-[#0a0a0a] font-semibold hover:underline underline-offset-4 transition-colors"
                  >
                    Log in
                  </a>
                </motion.p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Trust footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
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
