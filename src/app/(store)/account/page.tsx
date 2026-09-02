"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { StoreNav } from "@/components/store/nav";
import { StoreFooter } from "@/components/store/footer";
import { useStoreLang } from "@/contexts/store-language-context";
import ST from "@/lib/store-translations";

type Mode   = "login" | "register" | "otp-send" | "otp-verify";
type OtpFor = "login";

export default function AccountPage() {
  const router = useRouter();
  const { lang } = useStoreLang();
  const t = ST[lang];

  const [mode,        setMode]       = useState<Mode>("login");
  const [email,       setEmail]      = useState("");
  const [password,    setPassword]   = useState("");
  const [confirmPw,   setConfirmPw]  = useState("");
  const [name,        setName]       = useState("");
  const [otp,         setOtp]        = useState(["","","","","",""]);
  const [otpFor]                     = useState<OtpFor>("login");
  const [showPw,      setShowPw]     = useState(false);
  const [error,       setError]      = useState("");
  const [loading,     setLoading]    = useState(false);
  const [countdown,   setCountdown]  = useState(0);
  const otpRefs = useRef<(HTMLInputElement|null)[]>([]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleLoginPassword = async () => {
    setError(""); setLoading(true);
    const res = await fetch("/api/store/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? t.errGeneral); return; }
    router.push("/account/profile");
  };

  const handleRegister = async () => {
    setError("");
    if (password !== confirmPw) { setError(t.errPwMismatch); return; }
    setLoading(true);
    const res = await fetch("/api/store/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? t.errGeneral); return; }
    if (data.needsVerification) {
      setOtp(["","","","","",""]); setCountdown(60);
      setMode("otp-verify");
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } else {
      router.push("/account/profile");
    }
  };

  const sendOtp = async () => {
    setError(""); setLoading(true);
    const res = await fetch("/api/store/auth/send-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? t.errGeneral); return; }
    setOtp(["","","","","",""]); setCountdown(60);
    setMode("otp-verify");
    setTimeout(() => otpRefs.current[0]?.focus(), 300);
  };

  const verifyOtp = async () => {
    setError(""); setLoading(true);
    const code = otp.join("");
    if (code.length < 6) { setError(t.otpIncomplete); setLoading(false); return; }
    const res = await fetch("/api/store/auth/verify-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: code, for: otpFor }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? t.otpInvalid); return; }
    router.push("/account/profile");
  };

  const handleOtpInput = (i: number, val: string) => {
    const v = val.replace(/\D/g,"").slice(-1);
    const next = [...otp]; next[i] = v; setOtp(next);
    if (v && i < 5) otpRefs.current[i+1]?.focus();
  };
  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i-1]?.focus();
      const next = [...otp]; next[i-1] = ""; setOtp(next);
    }
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    const next = Array(6).fill("");
    digits.split("").forEach((d, j) => { next[j] = d; });
    setOtp(next);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  return (
    <div className="font-jost bg-ivory min-h-screen flex flex-col">
      <StoreNav active="home" cartCount={0} />

      <div className="flex-1 flex items-center justify-center px-5 py-20 md:py-28">
        <div className="bg-cream border border-gold/[0.18] max-w-[420px] w-full px-8 md:px-11 py-12">

          {/* OTP verify screen */}
          {mode === "otp-verify" && (
            <div>
              <span className="block text-[8px] tracking-[0.5em] uppercase text-gold mb-3.5">{t.verification}</span>
              <h2 className="font-cormorant text-[26px] font-normal text-espresso mb-1.5">{t.otpTitle}</h2>
              <p className="text-[12px] font-light text-muted mb-4 leading-[1.7]">{t.otpDesc}</p>
              <div className="inline-flex items-center gap-1.5 bg-gold/[0.1] border border-gold/20 px-3 py-1 mb-6">
                <span className="text-[11.5px] font-light text-oak">{email}</span>
                <button onClick={() => setMode("login")} className="bg-transparent border-none cursor-pointer text-muted text-[10px] uppercase tracking-[0.15em] ml-1 font-jost">{t.otpChange}</button>
              </div>
              <div className="flex justify-center gap-2 mb-3" onPaste={handlePaste}>
                {otp.map((d, i) => (
                  <input key={i} ref={el => { otpRefs.current[i] = el; }}
                    maxLength={1} type="text" inputMode="numeric" value={d}
                    onChange={e => handleOtpInput(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    className="w-10 h-12 bg-ivory text-center font-cormorant text-[24px] text-espresso outline-none"
                    style={{ border: d ? "1px solid rgba(201,167,82,0.6)" : "1px solid rgba(201,167,82,0.3)", caretColor:"#C9A752" }}
                  />
                ))}
              </div>
              {error && <p className="text-[11px] text-red-500 mb-3">{error}</p>}
              <button onClick={verifyOtp} disabled={loading || otp.join("").length < 6}
                className="w-full h-[50px] bg-espresso text-gold-lt border-none font-jost text-[9.5px] tracking-[0.35em] uppercase mb-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                {loading ? t.verifying : t.verifyBtn}
              </button>
              <p className="text-[10px] text-muted text-center">
                {t.didntReceive}{" "}
                <span onClick={() => { if (countdown === 0) sendOtp(); }}
                  className={`text-gold border-b border-gold/35 ${countdown > 0 ? "opacity-40 cursor-default" : "cursor-pointer"}`}>
                  {t.resendCode}
                </span>
                {countdown > 0 && <span className="text-gold"> — {countdown}s</span>}
              </p>
            </div>
          )}

          {/* OTP send screen */}
          {mode === "otp-send" && (
            <div>
              <span className="block text-[8px] tracking-[0.5em] uppercase text-gold mb-3.5">Passwordless</span>
              <h2 className="font-cormorant text-[26px] font-normal text-espresso mb-1.5">Sign In with OTP</h2>
              <p className="text-[12px] font-light text-muted mb-8 leading-[1.7]">{t.otpSendDesc}</p>
              <div className="mb-2">
                <label className="block text-[8.5px] tracking-[0.28em] uppercase text-muted mb-2">{t.emailLabel}</label>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder="yourname@domain.com"
                  className="w-full h-12 border-none border-b border-gold/35 bg-transparent font-jost text-[14px] font-light text-espresso outline-none px-1" />
              </div>
              {error && <p className="text-[11px] text-red-500 mb-3">{error}</p>}
              <div className="h-5 mb-5" />
              <button onClick={sendOtp} disabled={!isValidEmail || loading}
                className="w-full h-[50px] bg-espresso text-gold-lt border-none font-jost text-[9.5px] tracking-[0.35em] uppercase mb-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? t.otpSending : "Send OTP"}
              </button>
              <button onClick={() => { setMode("login"); setError(""); }}
                className="w-full text-[9px] tracking-[0.2em] uppercase text-muted bg-transparent border-none cursor-pointer font-jost">
                {t.backToPassword}
              </button>
            </div>
          )}

          {/* Login / Register tabs */}
          {(mode === "login" || mode === "register") && (
            <div>
              <div className="flex border-b border-gold/20 mb-8 gap-0">
                {(["login","register"] as const).map(m => (
                  <button key={m} onClick={() => { setMode(m); setError(""); }}
                    className={`flex-1 pb-3 text-[9px] tracking-[0.3em] uppercase font-jost bg-transparent border-none cursor-pointer transition-colors ${mode === m ? "text-espresso border-b-2 border-gold" : "text-muted"}`}
                    style={{ marginBottom: mode === m ? "-1px" : undefined }}>
                    {m === "login" ? t.signInTab : t.createAccountTab}
                  </button>
                ))}
              </div>

              {mode === "login" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[8.5px] tracking-[0.28em] uppercase text-muted mb-2">{t.emailLabel}</label>
                    <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                      placeholder="yourname@domain.com"
                      className="w-full h-11 border-none border-b border-gold/35 bg-transparent font-jost text-[13px] text-espresso outline-none px-1" />
                  </div>
                  <div>
                    <label className="block text-[8.5px] tracking-[0.28em] uppercase text-muted mb-2">{t.pwdLabel}</label>
                    <div className="relative">
                      <input type={showPw ? "text" : "password"} value={password}
                        onChange={e => { setPassword(e.target.value); setError(""); }}
                        placeholder="••••••••"
                        className="w-full h-11 border-none border-b border-gold/35 bg-transparent font-jost text-[13px] text-espresso outline-none px-1 pr-8" />
                      <button type="button" onClick={() => setShowPw(v => !v)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-muted">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {error && <p className="text-[11px] text-red-500">{error}</p>}
                  <button onClick={handleLoginPassword} disabled={!isValidEmail || !password || loading}
                    className="w-full h-[50px] bg-espresso text-gold-lt border-none font-jost text-[9.5px] tracking-[0.35em] uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    {loading ? t.signingIn : t.signInTab}
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gold/[0.18]" />
                    <span className="text-[9px] tracking-[0.2em] uppercase text-muted/50">{t.orDivider}</span>
                    <div className="flex-1 h-px bg-gold/[0.18]" />
                  </div>

                  <button onClick={() => { setMode("otp-send"); setError(""); }}
                    className="w-full h-10 bg-transparent border border-gold/28 text-muted font-jost text-[9px] tracking-[0.28em] uppercase cursor-pointer hover:border-gold/50 transition-colors">
                    {t.signinOtp}
                  </button>
                </div>
              )}

              {mode === "register" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[8.5px] tracking-[0.28em] uppercase text-muted mb-2">{t.fullName}</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder={t.fullName}
                      className="w-full h-11 border-none border-b border-gold/35 bg-transparent font-jost text-[13px] text-espresso outline-none px-1" />
                  </div>
                  <div>
                    <label className="block text-[8.5px] tracking-[0.28em] uppercase text-muted mb-2">{t.emailLabel}</label>
                    <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                      placeholder="yourname@domain.com"
                      className="w-full h-11 border-none border-b border-gold/35 bg-transparent font-jost text-[13px] text-espresso outline-none px-1" />
                  </div>
                  <div>
                    <label className="block text-[8.5px] tracking-[0.28em] uppercase text-muted mb-2">{t.pwdLabel}</label>
                    <div className="relative">
                      <input type={showPw ? "text" : "password"} value={password}
                        onChange={e => { setPassword(e.target.value); setError(""); }}
                        placeholder={lang === "en" ? "At least 6 characters" : "อย่างน้อย 6 ตัวอักษร"}
                        className="w-full h-11 border-none border-b border-gold/35 bg-transparent font-jost text-[13px] text-espresso outline-none px-1 pr-8" />
                      <button type="button" onClick={() => setShowPw(v => !v)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-muted">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8.5px] tracking-[0.28em] uppercase text-muted mb-2">{t.confirmPwd}</label>
                    <input type={showPw ? "text" : "password"} value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 border-none border-b border-gold/35 bg-transparent font-jost text-[13px] text-espresso outline-none px-1" />
                  </div>
                  {error && <p className="text-[11px] text-red-500">{error}</p>}
                  <button onClick={handleRegister} disabled={!isValidEmail || !password || loading}
                    className="w-full h-[50px] bg-espresso text-gold-lt border-none font-jost text-[9.5px] tracking-[0.35em] uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    {loading ? t.creatingAccount : t.createAccountTab}
                  </button>
                </div>
              )}

              <p className="text-[10px] text-muted text-center mt-6 leading-[1.8]">
                {t.agreeTerms}{" "}
                <Link href="/" className="text-gold border-b border-gold/35">{t.termsLink}</Link>
                {" & "}
                <Link href="/" className="text-gold border-b border-gold/35">{t.privacyLink}</Link>
              </p>
            </div>
          )}
        </div>
      </div>

      <StoreFooter />
    </div>
  );
}
