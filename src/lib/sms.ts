const SMARTCOMM_BASE = process.env.SMARTCOMM_URL ?? "https://o8.sc4msg.com";
const SENDER = "LORLUM";

function isThaiPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  // starts with 66 (intl format) or 0 (local format)
  return digits.startsWith("66") || digits.startsWith("0");
}

function toThaiLocal(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("66")) return "0" + digits.slice(2);
  return digits;
}

function toE164(phone: string): string {
  // Strip spaces/dashes/parens, keep the leading +
  return phone.replace(/[\s\-()]/g, "");
}

export function maskPhone(phone: string): string {
  if (isThaiPhone(phone)) {
    const local = toThaiLocal(phone);
    if (local.length < 8) return local;
    return local.slice(0, 3) + "****" + local.slice(-3);
  }
  // International: show country code + first digit, mask middle
  const clean = toE164(phone);
  if (clean.length < 8) return clean;
  return clean.slice(0, 5) + "****" + clean.slice(-3);
}

// ─── SmartComm (Thailand) ─────────────────────────────────────────────────────

async function sendViaSmartComm(
  account: string,
  password: string,
  mobile: string,
  message: string,
): Promise<boolean> {
  const body = new URLSearchParams({
    ACCOUNT: account,
    PASSWORD: password,
    MOBILE:   mobile,
    MESSAGE:  message,
    OPTION:   `SENDER=${SENDER}`,
  });
  const res  = await fetch(`${SMARTCOMM_BASE}/SendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  });
  const text = await res.text();
  return text.includes("STATUS=0");
}

// ─── Infobip (International) ──────────────────────────────────────────────────

async function sendViaInfobip(to: string, message: string): Promise<boolean> {
  const baseUrl = process.env.INFOBIP_BASE_URL ?? "";
  const apiKey  = process.env.INFOBIP_API_KEY  ?? "";
  if (!baseUrl || !apiKey) return false;

  const res = await fetch(`https://${baseUrl}/sms/2/text/single`, {
    method:  "POST",
    headers: {
      "Authorization": `App ${apiKey}`,
      "Content-Type":  "application/json",
      "Accept":        "application/json",
    },
    body: JSON.stringify({ from: SENDER, to, text: message }),
  });
  return res.ok;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function sendOtpSms(
  phone: string,
  otp: string,
): Promise<{ ok: boolean }> {

  if (isThaiPhone(phone)) {
    // ── Thailand → SmartComm ──
    const mobile   = toThaiLocal(phone);
    const account1 = process.env.SMARTCOMM_ACCOUNT  ?? "";
    const pass1    = process.env.SMARTCOMM_PASSWORD  ?? "";
    const account2 = process.env.SMARTCOMM_ACCOUNT2 ?? "";
    const pass2    = process.env.SMARTCOMM_PASSWORD2 ?? "";

    if (!account1 && !account2) {
      console.log(`\n[SMS DEV] To: ${mobile} | OTP: ${otp}\n`);
      return { ok: true };
    }

    const message = `รหัสยืนยัน LORLUM: ${otp} (หมดอายุใน 10 นาที) อย่าเปิดเผยรหัสนี้`;

    if (account1 && (await sendViaSmartComm(account1, pass1, mobile, message))) return { ok: true };
    if (account2 && (await sendViaSmartComm(account2, pass2, mobile, message))) return { ok: true };
    throw new Error("SmartComm SMS failed on all accounts");

  } else {
    // ── International → Infobip ──
    const to     = toE164(phone);
    const apiKey = process.env.INFOBIP_API_KEY ?? "";

    if (!apiKey) {
      console.log(`\n[SMS DEV] To: ${to} | OTP: ${otp}\n`);
      return { ok: true };
    }

    const message = `Your LORLUM verification code: ${otp} (expires in 10 min). Do not share this code.`;

    if (await sendViaInfobip(to, message)) return { ok: true };
    throw new Error("Infobip SMS failed");
  }
}
