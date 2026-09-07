const BASE_URL = process.env.SMARTCOMM_URL ?? "https://o8.sc4msg.com";
const SENDER   = "LORLUM";

function toThaiLocal(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("66")) return "0" + digits.slice(2);
  return digits;
}

export function maskPhone(phone: string): string {
  const local = toThaiLocal(phone);
  if (local.length < 8) return local;
  return local.slice(0, 3) + "****" + local.slice(-3);
}

async function sendViaAccount(
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

  const res  = await fetch(`${BASE_URL}/SendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  });

  const text = await res.text();
  return text.includes("STATUS=0");
}

export async function sendOtpSms(
  phone: string,
  otp: string,
): Promise<{ ok: boolean }> {
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

  if (account1 && (await sendViaAccount(account1, pass1, mobile, message))) {
    return { ok: true };
  }

  if (account2 && (await sendViaAccount(account2, pass2, mobile, message))) {
    return { ok: true };
  }

  throw new Error("SmartComm SMS failed on all accounts");
}
