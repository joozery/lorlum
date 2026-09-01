/* Thai Purchase Order print utility — opens a new window with formatted HTML */

export interface POLineItem {
  name: string;
  sku: string;
  unit: string;
  qty: number;
  unitPrice: number;
  vatRate: number; // 0 or 7
}

export interface POData {
  poNumber: string;
  issueDate: string;        // ISO or display string
  deliveryDate: string;
  paymentTerms: string;
  shippingMethod: string;
  supplier: {
    name: string;
    address: string;
    taxId: string;
    contact: string;
    phone: string;
    email: string;
  };
  buyer: {
    name: string;
    nameEn: string;
    address: string;
    taxId: string;
    phone: string;
    email: string;
  };
  items: POLineItem[];
  discountPct: number;
  note: string;
}

// ── Thai number to words ──────────────────────────────────────────────────
const ONES = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
const POS  = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"];

function chunk6ToWords(n: number): string {
  if (n === 0) return "";
  let result = "";
  const digits = String(n).padStart(6, "0").split("").map(Number);
  for (let i = 0; i < 6; i++) {
    const d = digits[i];
    const pos = 5 - i;
    if (d === 0) continue;
    if (pos === 1 && d === 2) { result += "ยี่สิบ"; continue; }
    if (pos === 1 && d === 1) { result += "สิบ"; continue; }
    if (pos === 0 && d === 1 && n > 10) { result += "เอ็ด"; continue; }
    result += ONES[d] + POS[pos];
  }
  return result;
}

function numberToThaiWords(amount: number): string {
  if (amount === 0) return "ศูนย์บาทถ้วน";
  const satang = Math.round((amount % 1) * 100);
  const baht   = Math.floor(amount);

  let bahtPart = "";
  if (baht >= 1_000_000) {
    bahtPart += chunk6ToWords(Math.floor(baht / 1_000_000)) + "ล้าน";
    const rem = baht % 1_000_000;
    if (rem > 0) bahtPart += chunk6ToWords(rem);
  } else {
    bahtPart = chunk6ToWords(baht);
  }

  const satangPart = satang > 0
    ? chunk6ToWords(satang) + "สตางค์"
    : "ถ้วน";

  return (bahtPart || "ศูนย์") + "บาท" + satangPart;
}

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(s: string) {
  if (!s) return "-";
  try {
    return new Date(s).toLocaleDateString("th-TH", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return s;
  }
}

// ── Print ─────────────────────────────────────────────────────────────────
export function printPO(po: POData) {
  const subtotal = po.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const discount = subtotal * (po.discountPct / 100);
  const afterDiscount = subtotal - discount;
  const vat   = po.items.reduce((s, it) => {
    const line = it.qty * it.unitPrice;
    return s + (it.vatRate === 7 ? line * 0.07 : 0);
  }, 0) * (1 - po.discountPct / 100);
  const total = afterDiscount + vat;

  const itemRows = po.items.map((it, i) => {
    const lineTotal = it.qty * it.unitPrice;
    return `
      <tr class="${i % 2 === 0 ? "even" : ""}">
        <td class="center">${i + 1}</td>
        <td>${it.name}${it.sku ? `<br><span class="sku">${it.sku}</span>` : ""}</td>
        <td class="center">${it.unit || "ชิ้น"}</td>
        <td class="right">${fmt(it.qty)}</td>
        <td class="right">${fmt(it.unitPrice)}</td>
        <td class="center">${it.vatRate}%</td>
        <td class="right bold">${fmt(lineTotal)}</td>
      </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<title>ใบสั่งซื้อ ${po.poNumber}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Sarabun', 'TH Sarabun New', Arial, sans-serif;
    font-size: 11pt;
    color: #1a1a1a;
    background: #fff;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 15mm 18mm 18mm;
    position: relative;
  }

  /* ── Watermark ── */
  .watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%) rotate(-35deg);
    font-size: 72pt;
    font-weight: 700;
    color: rgba(0,0,0,0.04);
    pointer-events: none;
    white-space: nowrap;
    z-index: 0;
  }

  /* ── Header ── */
  .doc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 3px solid #111;
    padding-bottom: 12px;
    margin-bottom: 14px;
  }
  .company-block { flex: 1; }
  .company-name  { font-size: 17pt; font-weight: 700; line-height: 1.2; }
  .company-sub   { font-size: 9pt; color: #555; margin-top: 3px; }
  .company-contact { font-size: 9pt; color: #444; margin-top: 6px; line-height: 1.6; }

  .po-title-block { text-align: right; }
  .po-title { font-size: 22pt; font-weight: 700; letter-spacing: 2px; color: #111; }
  .po-title-en { font-size: 10pt; letter-spacing: 3px; color: #555; margin-bottom: 8px; }
  .po-meta { font-size: 10pt; line-height: 1.8; }
  .po-meta td:first-child { color: #555; padding-right: 8px; text-align: right; }
  .po-meta td:last-child { font-weight: 600; }
  .po-number-val { font-size: 13pt; font-weight: 700; color: #111; }

  /* ── Parties ── */
  .parties {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 14px;
  }
  .party-box {
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 10px 12px;
  }
  .party-label {
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #888;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
    margin-bottom: 7px;
  }
  .party-name { font-size: 12pt; font-weight: 700; line-height: 1.3; }
  .party-detail { font-size: 9pt; color: #555; line-height: 1.7; margin-top: 4px; }
  .party-taxid { font-size: 8.5pt; color: #888; margin-top: 4px; }

  /* ── PO Info strip ── */
  .info-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 14px;
    background: #f8f8f8;
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 9px 12px;
  }
  .info-item { }
  .info-label { font-size: 8pt; color: #888; font-weight: 600; letter-spacing: 0.5px; }
  .info-value { font-size: 10pt; font-weight: 600; margin-top: 2px; }

  /* ── Items table ── */
  table.items {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 8px;
    font-size: 10pt;
  }
  table.items thead tr {
    background: #111;
    color: #fff;
  }
  table.items thead th {
    padding: 8px 6px;
    font-weight: 600;
    font-size: 9pt;
  }
  table.items tbody tr { border-bottom: 1px solid #f0f0f0; }
  table.items tbody tr.even { background: #fafafa; }
  table.items tbody td { padding: 7px 6px; vertical-align: top; }
  table.items tfoot td { padding: 6px 6px; }

  /* ── Summary ── */
  .summary-wrap {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 14px;
  }
  .summary-box {
    width: 260px;
    border: 1px solid #eee;
    border-radius: 6px;
    overflow: hidden;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 12px;
    font-size: 10pt;
    border-bottom: 1px solid #f5f5f5;
  }
  .summary-row:last-child { border-bottom: none; }
  .summary-row.total {
    background: #111;
    color: #fff;
    font-size: 12pt;
    font-weight: 700;
    padding: 10px 12px;
  }
  .summary-row label { color: #666; }
  .summary-row.total label { color: rgba(255,255,255,0.75); }
  .summary-row span { font-weight: 600; }

  /* ── Total words ── */
  .total-words {
    border: 1px dashed #ccc;
    border-radius: 6px;
    padding: 9px 14px;
    font-size: 10pt;
    margin-bottom: 14px;
    background: #fffdf0;
  }
  .total-words strong { margin-right: 6px; font-size: 9pt; color: #888; letter-spacing: 0.5px; }

  /* ── Note ── */
  .note-box {
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 9px 12px;
    font-size: 9.5pt;
    color: #555;
    margin-bottom: 18px;
    min-height: 40px;
  }
  .note-label { font-size: 8pt; font-weight: 700; color: #aaa; letter-spacing: 1px; margin-bottom: 4px; }

  /* ── Signatures ── */
  .sigs {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 14px;
    margin-top: 20px;
  }
  .sig-box { text-align: center; }
  .sig-line { border-top: 1px solid #999; margin: 40px 10px 6px; }
  .sig-title { font-size: 9pt; font-weight: 600; color: #555; }
  .sig-name  { font-size: 8.5pt; color: #aaa; margin-top: 2px; min-height: 14px; }
  .sig-date  { font-size: 8pt; color: #bbb; margin-top: 3px; }

  /* ── Footer ── */
  .doc-footer {
    position: absolute;
    bottom: 12mm;
    left: 18mm;
    right: 18mm;
    border-top: 1px solid #eee;
    padding-top: 6px;
    display: flex;
    justify-content: space-between;
    font-size: 8pt;
    color: #bbb;
  }

  /* ── Utilities ── */
  .center { text-align: center; }
  .right  { text-align: right; }
  .bold   { font-weight: 700; }
  .sku    { font-size: 8.5pt; color: #999; font-family: monospace; }

  @media print {
    @page { size: A4; margin: 0; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .watermark { position: fixed; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="watermark">PURCHASE ORDER</div>

  <!-- Header -->
  <div class="doc-header">
    <div class="company-block">
      <div class="company-name">${po.buyer.name}</div>
      <div class="company-sub">${po.buyer.nameEn}</div>
      <div class="company-contact">
        ${po.buyer.address}<br>
        โทร: ${po.buyer.phone} &nbsp;|&nbsp; อีเมล: ${po.buyer.email}<br>
        เลขผู้เสียภาษี: ${po.buyer.taxId}
      </div>
    </div>
    <div class="po-title-block">
      <div class="po-title-en">PURCHASE ORDER</div>
      <div class="po-title">ใบสั่งซื้อ</div>
      <table class="po-meta">
        <tr>
          <td>เลขที่ PO:</td>
          <td><span class="po-number-val">${po.poNumber}</span></td>
        </tr>
        <tr>
          <td>วันที่:</td>
          <td>${fmtDate(po.issueDate)}</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Parties -->
  <div class="parties">
    <div class="party-box">
      <div class="party-label">ผู้ซื้อ / BUYER</div>
      <div class="party-name">${po.buyer.name}</div>
      <div class="party-detail">${po.buyer.address}<br>${po.buyer.phone}</div>
      <div class="party-taxid">เลขผู้เสียภาษี: ${po.buyer.taxId}</div>
    </div>
    <div class="party-box">
      <div class="party-label">ผู้ขาย / SUPPLIER</div>
      <div class="party-name">${po.supplier.name}</div>
      <div class="party-detail">
        ${po.supplier.address ? po.supplier.address + "<br>" : ""}
        ${po.supplier.phone || ""}${po.supplier.email ? " · " + po.supplier.email : ""}
        ${po.supplier.contact ? "<br>ผู้ติดต่อ: " + po.supplier.contact : ""}
      </div>
      ${po.supplier.taxId ? `<div class="party-taxid">เลขผู้เสียภาษี: ${po.supplier.taxId}</div>` : ""}
    </div>
  </div>

  <!-- Info strip -->
  <div class="info-strip">
    <div class="info-item">
      <div class="info-label">กำหนดส่งสินค้า</div>
      <div class="info-value">${fmtDate(po.deliveryDate) || "-"}</div>
    </div>
    <div class="info-item">
      <div class="info-label">เงื่อนไขการชำระ</div>
      <div class="info-value">${po.paymentTerms || "-"}</div>
    </div>
    <div class="info-item">
      <div class="info-label">วิธีจัดส่ง</div>
      <div class="info-value">${po.shippingMethod || "-"}</div>
    </div>
    <div class="info-item">
      <div class="info-label">สกุลเงิน</div>
      <div class="info-value">THB (บาท)</div>
    </div>
  </div>

  <!-- Items -->
  <table class="items">
    <thead>
      <tr>
        <th class="center" style="width:32px">#</th>
        <th style="text-align:left">รายการสินค้า / Description</th>
        <th class="center" style="width:52px">หน่วย</th>
        <th class="right"  style="width:60px">จำนวน</th>
        <th class="right"  style="width:85px">ราคา/หน่วย</th>
        <th class="center" style="width:44px">ภาษี</th>
        <th class="right"  style="width:90px">จำนวนเงิน</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
      ${Array.from({ length: Math.max(0, 8 - po.items.length) }, (_, i) =>
        `<tr class="${(po.items.length + i) % 2 === 0 ? "even" : ""}">
          <td class="center" style="color:#ddd">${po.items.length + i + 1}</td>
          <td></td><td></td><td></td><td></td><td></td><td></td>
        </tr>`).join("")}
    </tbody>
    <tfoot>
      <tr style="border-top:2px solid #eee">
        <td colspan="5" style="padding:6px 6px;font-size:9pt;color:#999;font-style:italic">
          ${po.items.length} รายการ · ${po.items.reduce((s,it)=>s+it.qty,0).toLocaleString()} ชิ้นรวม
        </td>
        <td class="right" style="font-size:9pt;color:#666">ยอดรวม</td>
        <td class="right bold">${fmt(subtotal)}</td>
      </tr>
    </tfoot>
  </table>

  <!-- Summary -->
  <div class="summary-wrap">
    <div class="summary-box">
      <div class="summary-row">
        <label>ยอดรวมก่อนภาษี</label>
        <span>${fmt(subtotal)}</span>
      </div>
      ${po.discountPct > 0 ? `
      <div class="summary-row">
        <label>ส่วนลด (${po.discountPct}%)</label>
        <span>-${fmt(discount)}</span>
      </div>` : ""}
      <div class="summary-row">
        <label>ภาษีมูลค่าเพิ่ม (VAT 7%)</label>
        <span>${fmt(vat)}</span>
      </div>
      <div class="summary-row total">
        <label>ยอดรวมสุทธิ</label>
        <span>${fmt(total)}</span>
      </div>
    </div>
  </div>

  <!-- Total words -->
  <div class="total-words">
    <strong>จำนวนเงิน (ตัวอักษร):</strong>
    ${numberToThaiWords(total)}
  </div>

  <!-- Note -->
  <div class="note-box">
    <div class="note-label">หมายเหตุ / REMARKS</div>
    ${po.note || "<span style='color:#ddd'>—</span>"}
  </div>

  <!-- Terms -->
  <div style="font-size:8.5pt;color:#888;line-height:1.7;margin-bottom:6px;">
    <strong style="font-size:8pt;letter-spacing:0.5px;color:#aaa">เงื่อนไข / TERMS & CONDITIONS</strong><br>
    1. กรุณายืนยันรับใบสั่งซื้อนี้ภายใน 3 วันทำการ<br>
    2. สินค้าต้องตรงตามข้อกำหนดและตัวอย่างที่ตกลงไว้<br>
    3. ราคาในใบสั่งซื้อนี้เป็นราคาสุดท้าย ไม่มีการเปลี่ยนแปลง
  </div>

  <!-- Signatures -->
  <div class="sigs">
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-title">ผู้จัดซื้อ / Purchaser</div>
      <div class="sig-name"></div>
      <div class="sig-date">วันที่ / Date: ________________</div>
    </div>
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-title">ผู้อนุมัติ / Authorized By</div>
      <div class="sig-name"></div>
      <div class="sig-date">วันที่ / Date: ________________</div>
    </div>
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-title">ผู้ขายรับทราบ / Supplier Acknowledged</div>
      <div class="sig-name"></div>
      <div class="sig-date">วันที่ / Date: ________________</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="doc-footer">
    <span>${po.buyer.name} — เอกสารนี้ออกโดยระบบจัดซื้อ</span>
    <span>PO: ${po.poNumber} · พิมพ์เมื่อ ${new Date().toLocaleDateString("th-TH")}</span>
  </div>
</div>

<script>
  window.addEventListener("load", () => {
    window.print();
    window.addEventListener("afterprint", () => window.close());
  });
</script>
</body>
</html>`;

  const w = window.open("", "_blank", "width=900,height=700");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
