"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, CheckCircle2, XCircle, Loader2 } from "lucide-react";

function SetPasswordForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token") ?? "";

  const [status,   setStatus]   = useState<"loading" | "valid" | "invalid">("loading");
  const [name,     setName]     = useState("");
  const [pass,     setPass]     = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPass, setShowPass] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [done,     setDone]     = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    fetch(`/api/admin/reset-password?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.valid) { setName(d.name); setStatus("valid"); }
        else setStatus("invalid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (pass.length < 6) { setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    if (pass !== confirm) { setError("รหัสผ่านไม่ตรงกัน"); return; }
    setSaving(true);
    try {
      const res  = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "เกิดข้อผิดพลาด"); return; }
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  }

  const strength = pass.length === 0 ? 0 : pass.length < 6 ? 1 : pass.length < 10 ? 2 : pass.length < 14 ? 3 : 4;
  const strengthColors = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-400"];
  const strengthLabels = ["", "สั้นเกินไป", "พอใช้", "ดี", "แข็งแกร่ง"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.5em] uppercase text-[#C9A752] mb-2">Maison LORLUM</p>
          <h1 className="font-[var(--font-cormorant,Georgia)] text-[32px] font-light text-[#2C1F0F] leading-tight">
            Admin Portal
          </h1>
        </div>

        <div className="bg-[#FAF9F6] border border-[rgba(201,167,82,0.25)] p-10">

          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#C9A752]" />
              <p className="text-sm text-[#8A7B6E]">กำลังตรวจสอบลิงก์...</p>
            </div>
          )}

          {status === "invalid" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <XCircle className="h-12 w-12 text-red-400" />
              <div>
                <p className="text-base font-medium text-[#2C1F0F] mb-1">ลิงก์ไม่ถูกต้องหรือหมดอายุ</p>
                <p className="text-sm text-[#8A7B6E]">กรุณาติดต่อผู้ดูแลระบบเพื่อขอลิงก์ใหม่</p>
              </div>
              <a href="/login" className="mt-2 text-[11px] tracking-[0.2em] uppercase text-[#C9A752] hover:text-[#2C1F0F] transition-colors">
                กลับหน้าเข้าสู่ระบบ
              </a>
            </div>
          )}

          {status === "valid" && !done && (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                  <KeyRound className="h-4 w-4 text-[#C9A752]" />
                  <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A752]">ตั้งรหัสผ่านของคุณ</p>
                </div>
                <h2 className="font-[var(--font-cormorant,Georgia)] text-[22px] font-light text-[#2C1F0F]">
                  สวัสดีคุณ {name}
                </h2>
                <p className="text-[12px] text-[#8A7B6E] mt-1 leading-relaxed">
                  โปรดตั้งรหัสผ่านเพื่อเริ่มใช้งานบัญชีผู้ดูแลระบบ
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-[11px] tracking-[0.08em] uppercase text-[#8A7B6E]">
                    รหัสผ่านใหม่ <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={pass}
                      onChange={e => setPass(e.target.value)}
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                      required
                      className="w-full border border-[rgba(201,167,82,0.3)] bg-white px-4 py-3 pr-11 text-sm text-[#2C1F0F] placeholder:text-[#C9B89A] focus:outline-none focus:border-[#C9A752] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B5A898] hover:text-[#2C1F0F] transition-colors bg-transparent border-none cursor-pointer p-0"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {pass && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : "bg-gray-200"}`} />
                        ))}
                      </div>
                      <p className="text-[10px] text-[#8A7B6E]">{strengthLabels[strength]}</p>
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div className="space-y-2">
                  <label className="block text-[11px] tracking-[0.08em] uppercase text-[#8A7B6E]">
                    ยืนยันรหัสผ่าน <span className="text-red-400">*</span>
                  </label>
                  <input
                    type={showPass ? "text" : "password"}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    required
                    className="w-full border border-[rgba(201,167,82,0.3)] bg-white px-4 py-3 text-sm text-[#2C1F0F] placeholder:text-[#C9B89A] focus:outline-none focus:border-[#C9A752] transition-colors"
                  />
                  {confirm && pass !== confirm && (
                    <p className="text-[10px] text-red-500">รหัสผ่านไม่ตรงกัน</p>
                  )}
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#2C1F0F] text-[#C9A752] text-[11px] font-medium tracking-[0.25em] uppercase py-4 hover:bg-[#1A1208] transition-colors disabled:opacity-60 cursor-pointer border-none"
                >
                  {saving ? "กำลังบันทึก..." : "ยืนยันรหัสผ่าน"}
                </button>
              </form>
            </>
          )}

          {done && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <div>
                <p className="text-base font-medium text-[#2C1F0F] mb-1">ตั้งรหัสผ่านสำเร็จ!</p>
                <p className="text-sm text-[#8A7B6E]">กำลังพาคุณไปหน้าเข้าสู่ระบบ...</p>
              </div>
            </div>
          )}

        </div>

        <p className="text-center text-[10px] text-[#C9B89A] mt-6 tracking-[0.1em]">
          © LORLUM Maison · Luxury Footwear
        </p>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE]">
        <Loader2 className="h-6 w-6 animate-spin text-[#C9A752]" />
      </div>
    }>
      <SetPasswordForm />
    </Suspense>
  );
}
