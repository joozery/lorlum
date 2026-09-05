import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM ?? "LORLUM Maison <onboarding@resend.dev>";

function otpTemplate(otp: string, purpose: "verify" | "login") {
  const heading = purpose === "verify" ? "Verify Your Account" : "Sign In Code";
  const desc    = purpose === "verify"
    ? "Use the code below to verify your email address and activate your account."
    : "Use the code below to sign in to your account.";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F3EE;font-family:Georgia,serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:48px 16px">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#FAF9F6;border:1px solid rgba(201,167,82,0.25);max-width:480px;width:100%">
        <tr><td style="padding:40px 40px 0">
          <p style="margin:0 0 24px;font-family:'Helvetica Neue',sans-serif;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#C9A752">Maison LORLUM</p>
          <h1 style="margin:0 0 8px;font-size:28px;font-weight:400;color:#2C1F0F;line-height:1.2">${heading}</h1>
          <p style="margin:0 0 32px;font-family:'Helvetica Neue',sans-serif;font-size:13px;color:#8A7B6E;line-height:1.7">${desc}</p>
        </td></tr>
        <tr><td style="padding:0 40px">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="background:#fff;border:1px solid rgba(201,167,82,0.3);padding:24px 0">
              <span style="font-family:Georgia,serif;font-size:40px;letter-spacing:0.4em;color:#2C1F0F;font-weight:400">${otp}</span>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 40px 40px">
          <p style="margin:0 0 8px;font-family:'Helvetica Neue',sans-serif;font-size:11px;color:#8A7B6E;line-height:1.7">
            รหัสนี้หมดอายุใน <strong>10 นาที</strong> — อย่าแบ่งปันกับผู้อื่น
          </p>
          <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:11px;color:#B5A898;line-height:1.7">
            หากท่านไม่ได้ร้องขอรหัสนี้ กรุณาละเว้นอีเมลฉบับนี้
          </p>
          <hr style="border:none;border-top:1px solid rgba(201,167,82,0.15);margin:24px 0 0">
          <p style="margin:16px 0 0;font-family:'Helvetica Neue',sans-serif;font-size:10px;color:#C9B89A;letter-spacing:0.1em">
            © LORLUM Maison · Luxury Footwear
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

interface OrderItem {
  productName: string;
  imageUrl:    string;
  color:       string;
  size:        number | null;
  qty:         number;
  price:       number;
}
interface OrderConfirmParams {
  to:          string;
  orderNumber: string;
  items:       OrderItem[];
  total:       number;
  shipping: {
    name:     string;
    phone:    string;
    line1:    string;
    line2?:   string;
    city:     string;
    province: string;
    zip:      string;
  };
}

function orderConfirmTemplate(p: OrderConfirmParams) {
  const rows = p.items.map(i => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid rgba(201,167,82,0.1)">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            ${i.imageUrl ? `
            <td width="64" style="vertical-align:top;padding-right:12px">
              <img src="${i.imageUrl}" alt="${i.productName}"
                width="64" height="76"
                style="display:block;width:64px;height:76px;object-fit:cover;border:1px solid rgba(201,167,82,0.2)" />
            </td>` : ""}
            <td style="vertical-align:middle">
              <p style="margin:0 0 3px;font-family:'Helvetica Neue',sans-serif;font-size:12px;font-weight:500;color:#2C1F0F">${i.productName}</p>
              <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:11px;color:#8A7B6E">
                ${[i.color, i.size ? `EU ${i.size}` : "", `×${i.qty}`].filter(Boolean).join(" · ")}
              </p>
            </td>
            <td style="vertical-align:middle;text-align:right;font-family:'Helvetica Neue',sans-serif;font-size:12px;color:#2C1F0F;white-space:nowrap;padding-left:8px">
              ฿${(i.price * i.qty).toLocaleString("th-TH")}
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join("");

  const addrLine = [p.shipping.line1, p.shipping.line2].filter(Boolean).join(" ");
  const addrCity = [p.shipping.city && `เขต${p.shipping.city}`, p.shipping.province, p.shipping.zip].filter(Boolean).join(" ");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F3EE;font-family:Georgia,serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:48px 16px">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#FAF9F6;border:1px solid rgba(201,167,82,0.25);max-width:520px;width:100%">

        <!-- Header -->
        <tr><td style="padding:40px 40px 24px;border-bottom:1px solid rgba(201,167,82,0.15)">
          <p style="margin:0 0 6px;font-family:'Helvetica Neue',sans-serif;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#C9A752">Maison LORLUM</p>
          <h1 style="margin:0 0 6px;font-size:26px;font-weight:400;color:#2C1F0F">Order Confirmed</h1>
          <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:12px;color:#8A7B6E">
            ขอบคุณสำหรับการสั่งซื้อ — ชิ้นงานของท่านกำลังถูกเตรียมอย่างพิถีพิถัน
          </p>
        </td></tr>

        <!-- Order number -->
        <tr><td style="padding:20px 40px;background:#fff;border-bottom:1px solid rgba(201,167,82,0.1)">
          <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#8A7B6E">หมายเลขคำสั่งซื้อ</p>
          <p style="margin:4px 0 0;font-size:20px;letter-spacing:0.15em;color:#C9A752;font-weight:400">${p.orderNumber}</p>
        </td></tr>

        <!-- Items -->
        <tr><td style="padding:24px 40px">
          <p style="margin:0 0 12px;font-family:'Helvetica Neue',sans-serif;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#8A7B6E">รายการสินค้า</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${rows}
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border-top:1px solid rgba(201,167,82,0.3)">
            <tr>
              <td style="padding:12px 0 0;font-family:'Helvetica Neue',sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#2C1F0F">Total</td>
              <td style="padding:12px 0 0;text-align:right;font-size:18px;color:#C9A752;font-family:Georgia,serif">฿${p.total.toLocaleString("th-TH")}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:2px 0 0;font-family:'Helvetica Neue',sans-serif;font-size:11px;color:#C9A752;text-align:right">จัดส่งฟรี · Complimentary Shipping</td>
            </tr>
          </table>
        </td></tr>

        <!-- Shipping address -->
        <tr><td style="padding:0 40px 28px">
          <div style="background:#F5F3EE;border:1px solid rgba(201,167,82,0.15);padding:16px 20px">
            <p style="margin:0 0 8px;font-family:'Helvetica Neue',sans-serif;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#8A7B6E">ที่อยู่จัดส่ง</p>
            <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:12px;color:#2C1F0F;line-height:1.8">
              ${p.shipping.name}<br>
              ${p.shipping.phone}<br>
              ${addrLine}<br>
              ${addrCity}<br>
              ประเทศไทย
            </p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(201,167,82,0.15)">
          <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:11px;color:#8A7B6E;line-height:1.7">
            จัดส่งผ่าน EMS ภายใน 1–2 วันทำการ — ท่านจะได้รับหมายเลขติดตามพัสดุทางอีเมลอีกครั้ง
          </p>
          <hr style="border:none;border-top:1px solid rgba(201,167,82,0.1);margin:16px 0">
          <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:10px;color:#C9B89A;letter-spacing:0.1em">
            © LORLUM Maison · Luxury Shore Footwear
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmationEmail(params: OrderConfirmParams) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_your_api_key_here") {
    console.log(`\n📧 [EMAIL DEV] Order confirmation to: ${params.to} | Order: ${params.orderNumber}\n`);
    return { ok: true, dev: true };
  }
  const { error } = await resend.emails.send({
    from:    FROM,
    to:      params.to,
    subject: `Order Confirmed — ${params.orderNumber} · LORLUM Maison`,
    html:    orderConfirmTemplate(params),
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}

function adminInviteTemplate(name: string, link: string, role: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F3EE;font-family:Georgia,serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:48px 16px">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#FAF9F6;border:1px solid rgba(201,167,82,0.25);max-width:520px;width:100%">

        <!-- Header -->
        <tr><td style="padding:40px 40px 28px;border-bottom:1px solid rgba(201,167,82,0.15)">
          <p style="margin:0 0 20px;font-family:'Helvetica Neue',sans-serif;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#C9A752">Maison LORLUM · Admin</p>
          <h1 style="margin:0 0 10px;font-size:28px;font-weight:400;color:#2C1F0F;line-height:1.2">You're Invited</h1>
          <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:13px;color:#8A7B6E;line-height:1.8">
            สวัสดีคุณ <strong style="color:#2C1F0F">${name}</strong> — บัญชีผู้ดูแลระบบของคุณถูกสร้างแล้วในระดับ <strong style="color:#2C1F0F">${role}</strong>
          </p>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:36px 40px;text-align:center">
          <p style="margin:0 0 6px;font-family:'Helvetica Neue',sans-serif;font-size:12px;color:#8A7B6E">
            กดปุ่มด้านล่างเพื่อตั้งรหัสผ่านของคุณและเริ่มใช้งาน
          </p>
          <p style="margin:0 0 28px;font-family:'Helvetica Neue',sans-serif;font-size:11px;color:#B5A898">
            ลิงก์นี้มีอายุ <strong>72 ชั่วโมง</strong>
          </p>
          <a href="${link}" style="display:inline-block;background:#2C1F0F;color:#C9A752;font-family:'Helvetica Neue',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;text-decoration:none;padding:16px 40px">
            ตั้งรหัสผ่าน
          </a>
        </td></tr>

        <!-- Link fallback -->
        <tr><td style="padding:0 40px 32px">
          <div style="background:#F5F3EE;border:1px solid rgba(201,167,82,0.15);padding:14px 18px">
            <p style="margin:0 0 4px;font-family:'Helvetica Neue',sans-serif;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#8A7B6E">หรือเปิด URL นี้</p>
            <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:11px;color:#C9A752;word-break:break-all">${link}</p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(201,167,82,0.15)">
          <p style="margin:0 0 4px;font-family:'Helvetica Neue',sans-serif;font-size:11px;color:#8A7B6E;line-height:1.7">
            หากคุณไม่ได้ร้องขอสิ่งนี้ กรุณาเพิกเฉยต่ออีเมลนี้
          </p>
          <hr style="border:none;border-top:1px solid rgba(201,167,82,0.1);margin:14px 0">
          <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:10px;color:#C9B89A;letter-spacing:0.1em">
            © LORLUM Maison · Luxury Footwear
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendAdminInviteEmail(to: string, name: string, link: string, role: string) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_your_api_key_here") {
    console.log(`\n📧 [EMAIL DEV] Admin invite to: ${to} | Link: ${link}\n`);
    return { ok: true, dev: true };
  }
  const { error } = await resend.emails.send({
    from:    FROM,
    to,
    subject: "คุณได้รับเชิญเป็นผู้ดูแลระบบ LORLUM",
    html:    adminInviteTemplate(name, link, role),
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}

// ── Access Request ─────────────────────────────────────────────────────────

interface AccessRequestParams {
  fname:         string;
  email:         string;
  location:      string;
  interest:      string;
  applicationNo: string;
}

function accessRequestAdminTemplate(p: AccessRequestParams) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F3EE;font-family:'Helvetica Neue',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:48px 16px">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#FAF9F6;border:1px solid rgba(201,167,82,0.25);max-width:480px;width:100%">
        <tr><td style="padding:36px 40px 28px;border-bottom:1px solid rgba(201,167,82,0.15)">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#C9A752">Maison LORLUM · Admin</p>
          <h1 style="margin:0;font-size:22px;font-weight:400;color:#2C1F0F">New Access Request</h1>
        </td></tr>
        <tr><td style="padding:28px 40px">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${[
              ["Application No.", p.applicationNo],
              ["Name",           p.fname],
              ["Email",          p.email],
              ["Location",       p.location],
              ["Interest",       p.interest || "—"],
            ].map(([label, value]) => `
            <tr>
              <td style="padding:8px 0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#8C7355;width:130px;vertical-align:top">${label}</td>
              <td style="padding:8px 0;font-size:13px;color:#2C1F0F">${value}</td>
            </tr>`).join("")}
          </table>
        </td></tr>
        <tr><td style="padding:0 40px 36px">
          <p style="margin:0;font-size:11px;color:#8C7355;line-height:1.7">
            ดูรายการทั้งหมดได้ที่ Admin Dashboard → Access Requests
          </p>
          <hr style="border:none;border-top:1px solid rgba(201,167,82,0.12);margin:16px 0">
          <p style="margin:0;font-size:10px;color:#C9B89A;letter-spacing:0.1em">© LORLUM Maison</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function accessRequestConfirmTemplate(p: AccessRequestParams) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F3EE;font-family:'Helvetica Neue',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:48px 16px">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#FAF9F6;border:1px solid rgba(201,167,82,0.25);max-width:480px;width:100%">
        <tr><td style="padding:40px 40px 28px;border-bottom:1px solid rgba(201,167,82,0.15)">
          <p style="margin:0 0 20px;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#C9A752">Maison LORLUM</p>
          <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#2C1F0F;line-height:1.2">Application Received</h1>
          <p style="margin:0;font-size:13px;color:#8C7355;line-height:1.7">
            Dear ${p.fname}, your request for private access has been received.
          </p>
        </td></tr>
        <tr><td style="padding:24px 40px;background:#fff;border-bottom:1px solid rgba(201,167,82,0.1)">
          <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#8C7355">Application Number</p>
          <p style="margin:0;font-family:Georgia,serif;font-size:22px;letter-spacing:0.12em;color:#C9A752">${p.applicationNo}</p>
        </td></tr>
        <tr><td style="padding:28px 40px 36px">
          <p style="margin:0 0 16px;font-size:13px;color:#8C7355;line-height:1.8">
            Your application has been placed in the Season 2026 allocation queue.
            Our concierge team will review your details and notify you within
            <strong style="color:#2C1F0F">5 business days</strong>.
          </p>
          <p style="margin:0;font-size:12px;color:#8C7355;line-height:1.8">
            Please retain your application number for future reference.
          </p>
          <hr style="border:none;border-top:1px solid rgba(201,167,82,0.12);margin:24px 0">
          <p style="margin:0;font-size:10px;color:#C9B89A;letter-spacing:0.1em">© LORLUM Maison · Luxury Footwear</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendAccessRequestEmails(p: AccessRequestParams) {
  const ADMIN = process.env.ADMIN_NOTIFY_EMAIL ?? "zerryboy28@gmail.com";
  const devMode = !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_your_api_key_here";

  if (devMode) {
    console.log(`\n📧 [EMAIL DEV] Access request ${p.applicationNo} from ${p.email}\n`);
    return { ok: true, dev: true };
  }

  await Promise.all([
    resend.emails.send({
      from:    FROM,
      to:      ADMIN,
      subject: `New Access Request — ${p.applicationNo} · LORLUM`,
      html:    accessRequestAdminTemplate(p),
    }),
    resend.emails.send({
      from:    FROM,
      to:      p.email,
      subject: `Your Application — ${p.applicationNo} · LORLUM Maison`,
      html:    accessRequestConfirmTemplate(p),
    }),
  ]);

  return { ok: true };
}

export async function sendOtpEmail(
  to:      string,
  otp:     string,
  purpose: "verify" | "login" = "login"
) {
  const subject = purpose === "verify"
    ? "Verify your LORLUM account"
    : "Your LORLUM sign-in code";

  // dev mode — log to console if no API key
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_your_api_key_here") {
    console.log(`\n📧 [EMAIL DEV] To: ${to} | Subject: ${subject} | OTP: ${otp}\n`);
    return { ok: true, dev: true };
  }

  const { error } = await resend.emails.send({
    from:    FROM,
    to,
    subject,
    html:    otpTemplate(otp, purpose),
  });

  if (error) throw new Error(error.message);
  return { ok: true };
}
