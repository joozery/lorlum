import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Customer from "@/models/Customer";
import { PrintButton } from "./print-button";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}

function fmt(n: number) {
  return "฿" + n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(d: Date | string, lang: "th" | "en") {
  return new Date(d).toLocaleDateString(lang === "en" ? "en-GB" : "th-TH", {
    year: "numeric", month: "long", day: "numeric",
  });
}

const TH = {
  title: "ใบเสร็จรับเงิน",
  seller: "ผู้ขาย",
  buyer: "ลูกค้า",
  date: "วันที่",
  item: "รายการสินค้า",
  qty: "จำนวน",
  unitPrice: "ราคา/ชิ้น",
  total: "รวม",
  subtotal: "ราคาสินค้า",
  shipping: "ค่าจัดส่ง",
  free: "ฟรี",
  grandTotal: "ยอดรวมทั้งสิ้น",
  paidBy: "ชำระโดย",
  thanks: "ขอบคุณที่ไว้วางใจ LORLUM Maison",
  auto: "เอกสารนี้ออกโดยระบบอัตโนมัติ ไม่ต้องลงนาม",
  print: "พิมพ์ใบเสร็จ",
  color: "สี",
};
const EN = {
  title: "Receipt",
  seller: "Seller",
  buyer: "Customer",
  date: "Date",
  item: "Item",
  qty: "Qty",
  unitPrice: "Unit Price",
  total: "Total",
  subtotal: "Subtotal",
  shipping: "Shipping",
  free: "Free",
  grandTotal: "Grand Total",
  paidBy: "Paid by",
  thanks: "Thank you for choosing LORLUM Maison",
  auto: "This document is auto-generated and requires no signature.",
  print: "Print Receipt",
  color: "Color",
};

export default async function ReceiptPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { lang: langParam } = await searchParams;
  const lang: "th" | "en" = langParam === "en" ? "en" : "th";
  const T = lang === "en" ? EN : TH;
  const altLang = lang === "en" ? "th" : "en";
  const altLabel = lang === "en" ? "ภาษาไทย" : "English";

  await connectDB();
  const order = await Order.findById(id).lean() as Record<string, unknown> | null;
  if (!order) return notFound();

  let customerName = (order.shippingAddress as Record<string, string>)?.name ?? "Guest";
  let customerEmail = (order.guestEmail as string) ?? "";
  if (order.customerId) {
    const cust = await Customer.findById(order.customerId).select("name email").lean() as { name?: string; email?: string } | null;
    if (cust?.name) customerName = cust.name;
    if (cust?.email) customerEmail = cust.email;
  }

  const addr = order.shippingAddress as Record<string, string> | undefined;
  const items = (order.items as Array<Record<string, unknown>>) ?? [];
  const subtotal = order.subtotal as number ?? 0;
  const shippingFee = order.shippingFee as number ?? 0;
  const total = order.total as number ?? 0;
  const orderNumber = order.orderNumber as string ?? id;
  const createdAt = order.createdAt as string ?? new Date().toISOString();
  const paymentMethod = order.paymentMethod as string ?? "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600&family=Cormorant+Garamond:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sarabun', sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; }
        .receipt-page { max-width: 720px; margin: 0 auto; padding: 48px 40px; }

        .r-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #C9A752; }
        .r-logo { font-family: 'Cormorant Garamond', serif; font-size: 32px; color: #4A3219; letter-spacing: 0.08em; }
        .r-logo-sub { font-size: 9px; letter-spacing: 0.3em; color: #8C7355; text-transform: uppercase; margin-top: 2px; }
        .r-meta { text-align: right; }
        .r-title { font-size: 18px; font-weight: 600; color: #4A3219; margin-bottom: 6px; }
        .r-num { font-family: 'Cormorant Garamond', serif; font-size: 15px; color: #C9A752; letter-spacing: 0.1em; }
        .r-date { font-size: 11px; color: #8C7355; margin-top: 4px; }

        .r-info { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
        .r-box h4 { font-size: 9px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #C9A752; margin-bottom: 8px; border-bottom: 1px solid #f0e8d4; padding-bottom: 6px; }
        .r-box p { font-size: 12.5px; line-height: 1.7; color: #3A2C1A; }
        .r-name { font-weight: 600; font-size: 13.5px; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead tr { background: #4A3219; color: #E8D5A3; }
        thead th { padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; }
        .th-right { text-align: right !important; }
        .th-center { text-align: center !important; }
        tbody tr { border-bottom: 1px solid #f5f0e8; }
        tbody tr:last-child { border-bottom: none; }
        tbody td { padding: 11px 12px; vertical-align: top; }
        .td-right { text-align: right; font-weight: 500; white-space: nowrap; }
        .td-center { text-align: center; }
        .r-item-name { font-weight: 500; color: #1a1a1a; }
        .r-item-meta { font-size: 11px; color: #8C7355; margin-top: 2px; }
        .bespoke-badge { display: inline-block; font-size: 9px; background: #fef3c7; color: #92400e; border-radius: 3px; padding: 1px 5px; margin-left: 4px; font-weight: 500; }

        .r-totals { margin-left: auto; width: 260px; margin-bottom: 16px; }
        .r-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12.5px; color: #555; border-bottom: 1px solid #f5f0e8; }
        .r-row:last-child { border-bottom: none; }
        .r-total { display: flex; justify-content: space-between; padding: 12px 0; margin-top: 4px; border-top: 2px solid #4A3219; font-size: 15px; font-weight: 600; color: #4A3219; }

        .r-pay-label { font-size: 10px; color: #8C7355; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 16px; text-align: right; }
        .r-pay-badge { display: inline-block; background: #f5f0e8; color: #6B4E2A; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 4px; margin-top: 4px; float: right; }

        .r-footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e8dfc8; display: flex; justify-content: space-between; align-items: center; clear: both; }
        .r-footer-note { font-size: 10.5px; color: #8C7355; line-height: 1.7; }
        .r-footer-logo { font-family: 'Cormorant Garamond', serif; font-size: 18px; color: #C9A752; letter-spacing: 0.1em; }

        .btn-bar { position: fixed; bottom: 24px; right: 24px; display: flex; gap: 8px; }
        .print-btn { background: #4A3219; color: #E8D5A3; border: none; padding: 11px 22px; font-size: 12px; font-family: 'Sarabun', sans-serif; font-weight: 500; letter-spacing: 0.1em; cursor: pointer; border-radius: 2px; text-decoration: none; display: inline-block; }
        .print-btn:hover { background: #2C1F0F; }
        .lang-btn { background: #f5f0e8; color: #6B4E2A; border: 1px solid #C9A752; padding: 11px 16px; font-size: 11px; font-family: 'Sarabun', sans-serif; font-weight: 500; cursor: pointer; border-radius: 2px; text-decoration: none; display: inline-block; }
        .lang-btn:hover { background: #e8dfc8; }

        @media print {
          .btn-bar { display: none; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="receipt-page">
        <div className="r-header">
          <div>
            <div className="r-logo">LORLUM</div>
            <div className="r-logo-sub">Luxury Maison</div>
          </div>
          <div className="r-meta">
            <div className="r-title">{T.title}</div>
            <div className="r-num">{orderNumber}</div>
            <div className="r-date">{T.date} {fmtDate(createdAt, lang)}</div>
          </div>
        </div>

        <div className="r-info">
          <div className="r-box">
            <h4>{T.seller}</h4>
            <p className="r-name">LORLUM Maison</p>
            <p>lorlum.com</p>
            <p>contact@lorlum.com</p>
          </div>
          <div className="r-box">
            <h4>{T.buyer}</h4>
            <p className="r-name">{customerName}</p>
            {customerEmail && <p>{customerEmail}</p>}
            {addr?.phone && <p>{addr.phone}</p>}
            {addr?.line1 && <p>{[addr.line1, addr.line2].filter(Boolean).join(" ")}</p>}
            {(addr?.city || addr?.province) && <p>{[addr.city, addr.province, addr.zip].filter(Boolean).join(" ")}</p>}
            {addr?.country && <p>{addr.country}</p>}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: "50%" }}>{T.item}</th>
              <th className="th-center">{T.qty}</th>
              <th className="th-right">{T.unitPrice}</th>
              <th className="th-right">{T.total}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>
                  <div className="r-item-name">
                    {item.productName as string}
                    {item.size === "Bespoke" && <span className="bespoke-badge">✂ Bespoke</span>}
                  </div>
                  <div className="r-item-meta">
                    {[
                      item.color ? `${T.color} ${item.color}` : null,
                      item.size && item.size !== "Bespoke" ? `EU ${item.size}` : null,
                    ].filter(Boolean).join(" · ")}
                  </div>
                </td>
                <td className="td-center">{item.qty as number}</td>
                <td className="td-right">{fmt(item.price as number)}</td>
                <td className="td-right">{fmt((item.price as number) * (item.qty as number))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="r-totals">
          <div className="r-row"><span>{T.subtotal}</span><span>{fmt(subtotal)}</span></div>
          <div className="r-row"><span>{T.shipping}</span><span>{shippingFee === 0 ? T.free : fmt(shippingFee)}</span></div>
          <div className="r-total"><span>{T.grandTotal}</span><span>{fmt(total)}</span></div>
        </div>

        {paymentMethod && (
          <>
            <div className="r-pay-label">{T.paidBy}</div>
            <div className="r-pay-badge">{paymentMethod}</div>
          </>
        )}

        <div className="r-footer">
          <div className="r-footer-note">
            {T.thanks}<br />
            {T.auto}
          </div>
          <div className="r-footer-logo">LORLUM</div>
        </div>
      </div>

      <div className="btn-bar">
        <a
          href={`/orders/${id}/receipt?lang=${altLang}`}
          className="lang-btn"
        >
          {altLabel}
        </a>
        <PrintButton label={T.print} />
      </div>
    </>
  );
}
