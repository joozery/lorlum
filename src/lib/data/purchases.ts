export const mockPurchases = [
  {
    id: "PO-001",
    supplier: "Supplier A Co., Ltd.",
    supplierContact: "คุณสมศักดิ์ · 081-111-2222",
    items: [
      { name: "เสื้อยืด Basic สีขาว", sku: "TSH-001", qty: 100, cost: 150 },
    ],
    total: 15000,
    status: "received",
    note: "รับสินค้าครบถ้วน ไม่มีเสียหาย",
    createdAt: "2025-08-25T10:00:00",
  },
  {
    id: "PO-002",
    supplier: "Fashion Import Ltd.",
    supplierContact: "คุณมานี · 089-333-4444",
    items: [
      { name: "กางเกง Slim Fit สีดำ",  sku: "PNT-002", qty: 50,  cost: 400 },
      { name: "เสื้อ Polo สีน้ำเงิน", sku: "TSH-005", qty: 80,  cost: 250 },
    ],
    total: 40000,
    status: "ordered",
    note: "ETA 3–5 วันทำการ",
    createdAt: "2025-08-28T14:00:00",
  },
  {
    id: "PO-003",
    supplier: "Shoe World Co.",
    supplierContact: "คุณวิภา · 062-555-6666",
    items: [
      { name: "รองเท้า Casual", sku: "SHO-003", qty: 30, cost: 600 },
    ],
    total: 18000,
    status: "draft",
    note: "",
    createdAt: "2025-08-30T09:00:00",
  },
  {
    id: "PO-004",
    supplier: "Bag & Accessories Co.",
    supplierContact: "คุณพรชัย · 095-777-8888",
    items: [
      { name: "กระเป๋าสะพาย", sku: "ACC-004", qty: 20, cost: 900 },
    ],
    total: 18000,
    status: "cancelled",
    note: "ยกเลิก — ราคาไม่ตรงตามเสนอ",
    createdAt: "2025-08-20T08:00:00",
  },
];

export type Purchase = typeof mockPurchases[0];

export const purchaseStatusConfig: Record<string, {
  label: string;
  variant: "success" | "info" | "default" | "warning" | "destructive" | "purple";
  step: number;
}> = {
  draft:     { label: "ร่าง",           variant: "default",     step: 0 },
  ordered:   { label: "สั่งซื้อแล้ว",   variant: "info",        step: 1 },
  received:  { label: "รับสินค้าแล้ว",  variant: "success",     step: 2 },
  cancelled: { label: "ยกเลิก",          variant: "destructive", step: -1 },
};
