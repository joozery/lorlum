"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

/* ── OTP input component ── */
function OTPInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
  }

  function handleChange(i: number, v: string) {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const next = [...value];
    digits.forEach((d, i) => { next[i] = d; });
    onChange(next);
    const last = Math.min(digits.length, 5);
    refs.current[last]?.focus();
    e.preventDefault();
  }

  return (
    <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
      {value.map((v, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          className={[
            "h-12 w-11 rounded-xl border-2 bg-gray-50 text-center text-base font-bold tracking-widest",
            "transition-all duration-150 outline-none",
            v
              ? "border-gray-900 bg-white text-gray-900"
              : "border-gray-200 text-gray-900",
            "focus:border-gray-900 focus:bg-white focus:shadow-[0_0_0_3px_rgba(17,17,17,0.08)]",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

/* ── Main ── */
type Step = "credentials" | "otp";

export default function LoginPage() {
  const [step,      setStep]      = useState<Step>("credentials");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [remember,  setRemember]  = useState(false);
  const [showPass,  setShowPass]  = useState(false);
  const [otp,       setOtp]       = useState(["", "", "", "", "", ""]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [shakeKey,  setShakeKey]  = useState(0);

  // Clear error when user types
  useEffect(() => { setError(""); }, [email, password, otp]);

  function shake() { setShakeKey(k => k + 1); }

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res  = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "เกิดข้อผิดพลาด");
        shake();
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      shake();
    } finally {
      setLoading(false);
    }
  }

  const otpComplete = otp.every(d => d !== "");

  return (
    <div className="flex min-h-screen">

      {/* ── LEFT PANEL ─────────────────────────────── */}
      <div
        className="relative hidden lg:flex lg:w-[45%] flex-col justify-between overflow-hidden p-12"
        style={{ background: "linear-gradient(155deg,#1A1208 0%,#2C1F0F 45%,#4A3219 100%)" }}
      >
        {/* Gold radial glows */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 55% at 25% 20%, rgba(201,167,82,0.18) 0%, transparent 60%), radial-gradient(ellipse 55% 55% at 85% 85%, rgba(201,167,82,0.1) 0%, transparent 55%)" }} />

        {/* Subtle gold grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage: `linear-gradient(rgba(201,167,82,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,167,82,1) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Sweep shimmer */}
        <div className="pointer-events-none absolute inset-[-20%]" style={{ background: "linear-gradient(115deg, transparent 40%, rgba(232,213,163,0.06) 48%, transparent 58%)" }} />

        {/* Top: Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center border"
              style={{ borderColor: "rgba(201,167,82,0.35)", background: "rgba(201,167,82,0.08)" }}
            >
              <span className="font-[family-name:var(--font-cormorant)] italic font-light text-lg leading-none" style={{ color: "#C9A752" }}>L</span>
            </div>
            <div>
              <p className="text-[11px] font-medium tracking-[0.35em] uppercase" style={{ color: "#EDD9A3" }}>ECOMJAME</p>
              <p className="text-[9px] tracking-[0.22em] uppercase" style={{ color: "rgba(201,167,82,0.45)" }}>Admin Panel</p>
            </div>
          </div>
        </motion.div>

        {/* Center: Brand wordmark */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
          >
            <div className="w-10 h-px mb-10" style={{ background: "rgba(201,167,82,0.5)" }} />
            <p
              className="font-[family-name:var(--font-cormorant)] italic font-light leading-[1.15]"
              style={{ fontSize: "clamp(36px, 3.2vw, 50px)", color: "#EDD9A3" }}
            >
              Crafted for those<br />
              <span style={{ color: "#C9A752" }}>who demand more.</span>
            </p>
            <div className="w-10 h-px mt-10" style={{ background: "rgba(201,167,82,0.25)" }} />
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative"
        >
          <p className="text-[10px] tracking-[0.08em]" style={{ color: "rgba(201,167,82,0.3)" }}>© 2025 ECOMJAME · All rights reserved</p>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[380px]"
        >

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
              <span className="text-sm font-bold text-white italic">L</span>
            </div>
            <p className="text-sm font-bold text-gray-900">ECOMJAME Admin</p>
          </div>

          <AnimatePresence mode="wait">
            {step === "credentials" ? (

              /* ── STEP 1: Email + Password ── */
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">ยินดีต้อนรับกลับ</h2>
                  <p className="mt-1.5 text-sm text-gray-500">เข้าสู่ระบบเพื่อจัดการร้านค้าของคุณ</p>
                </div>

                <motion.form
                  key={`form-${shakeKey}`}
                  animate={shakeKey > 0 ? {
                    x: [0, -8, 8, -6, 6, -3, 3, 0],
                    transition: { duration: 0.5 }
                  } : {}}
                  onSubmit={handleCredentials}
                  className="space-y-4"
                >
                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -4, height: 0 }}
                        className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                        <p className="text-xs font-medium text-red-600">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">อีเมล</label>
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@ecomjame.com"
                      className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all outline-none focus:border-gray-900 focus:bg-white focus:shadow-[0_0_0_3px_rgba(17,17,17,0.08)]"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-700">รหัสผ่าน</label>
                      <button type="button" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                        ลืมรหัสผ่าน?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition-all outline-none focus:border-gray-900 focus:bg-white focus:shadow-[0_0_0_3px_rgba(17,17,17,0.08)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(s => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me */}
                  <label className="flex cursor-pointer items-center gap-2.5 select-none">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={remember}
                        onChange={e => setRemember(e.target.checked)}
                      />
                      <div className="h-5 w-5 rounded-md border-2 border-gray-200 bg-gray-50 transition-all peer-checked:border-gray-900 peer-checked:bg-gray-900 flex items-center justify-center">
                        {remember && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-600">จดจำฉันเป็นเวลา 30 วัน</span>
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative mt-2 flex h-11 w-full items-center justify-center overflow-hidden rounded-xl bg-gray-900 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        กำลังเข้าสู่ระบบ...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        เข้าสู่ระบบ
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    )}
                  </button>
                </motion.form>

                {/* Divider */}
                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-100" />
                  <span className="text-xs text-gray-400">หรือ</span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>

                {/* OTP option */}
                <button
                  onClick={() => setStep("otp")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-3 text-xs font-semibold text-gray-600 transition-all hover:border-gray-300 hover:bg-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  เข้าสู่ระบบด้วย OTP
                </button>
              </motion.div>

            ) : (

              /* ── STEP 2: OTP ── */
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onClick={() => setStep("credentials")}
                  className="mb-6 flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                  กลับ
                </button>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">ยืนยัน OTP</h2>
                  <p className="mt-1.5 text-sm text-gray-500">
                    กรอกรหัส 6 หลักที่ส่งไปยัง<br />
                    <span className="font-semibold text-gray-800">{email || "อีเมลของคุณ"}</span>
                  </p>
                </div>

                <div className="space-y-6">
                  <OTPInput value={otp} onChange={setOtp} />

                  <button
                    type="button"
                    disabled={!otpComplete || loading}
                    className="flex h-11 w-full items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        กำลังตรวจสอบ...
                      </span>
                    ) : (
                      "ยืนยัน OTP"
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-xs text-gray-400">
                      ไม่ได้รับรหัส?{" "}
                      <button className="font-semibold text-gray-700 hover:text-gray-900 underline-offset-2 hover:underline transition-colors">
                        ส่งอีกครั้ง
                      </button>
                      <span className="mx-1.5 text-gray-300">·</span>
                      <span className="text-gray-400">หมดอายุใน 5 นาที</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
}
