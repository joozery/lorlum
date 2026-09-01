import type { Order, OrderStatus } from "@/types";

export const mockOrders: Order[] = [
  { id: "1", orderNumber: "ORD-20250001", customerId: "c1", customerName: "สมชาย ใจดี", customerEmail: "somchai@email.com", items: [{ productId: "1", productName: "เสื้อยืด Basic", quantity: 2, price: 390 }, { productId: "4", productName: "กระเป๋าสะพาย", quantity: 1, price: 1890 }], subtotal: 2670, total: 2670, status: "paid", currency: "THB", paymentMethod: "Credit Card", createdAt: "2025-08-30T09:00:00" },
  { id: "2", orderNumber: "ORD-20250002", customerId: "c2", customerName: "มาลี สวยงาม", customerEmail: "malee@email.com", items: [{ productId: "2", productName: "กางเกง Slim Fit", quantity: 1, price: 790 }], subtotal: 790, total: 790, status: "processing", currency: "THB", paymentMethod: "PromptPay", createdAt: "2025-08-30T08:30:00" },
  { id: "3", orderNumber: "ORD-20250003", customerId: "c3", customerName: "John Smith", customerEmail: "john@email.com", items: [{ productId: "3", productName: "รองเท้า Casual", quantity: 1, price: 1290 }, { productId: "5", productName: "เสื้อ Polo", quantity: 2, price: 590 }], subtotal: 2470, total: 2470, status: "shipped", currency: "USD", paymentMethod: "Credit Card", createdAt: "2025-08-30T07:15:00" },
  { id: "4", orderNumber: "ORD-20250004", customerId: "c4", customerName: "ปิยะ รักสะอาด", customerEmail: "piya@email.com", items: [{ productId: "5", productName: "เสื้อ Polo", quantity: 1, price: 590 }], subtotal: 590, total: 590, status: "pending", currency: "THB", paymentMethod: "PromptPay", createdAt: "2025-08-30T06:00:00" },
  { id: "5", orderNumber: "ORD-20250005", customerId: "c5", customerName: "Sara Lee", customerEmail: "sara@email.com", items: [{ productId: "4", productName: "กระเป๋าสะพาย", quantity: 2, price: 1890 }], subtotal: 3780, total: 3780, status: "cancelled", currency: "USD", paymentMethod: "Credit Card", createdAt: "2025-08-29T22:00:00" },
];

export const orderStatusConfig: Record<OrderStatus, { label: string; variant: "success" | "warning" | "info" | "destructive" | "default" | "purple" }> = {
  pending:    { label: "รอชำระเงิน",     variant: "warning" },
  confirmed:  { label: "ยืนยันแล้ว",     variant: "success" },
  paid:       { label: "ยืนยันแล้ว",     variant: "success" },  // alias for confirmed
  processing: { label: "กำลังเตรียมของ", variant: "info" },
  shipped:    { label: "จัดส่งแล้ว",     variant: "purple" },
  delivered:  { label: "ได้รับแล้ว",     variant: "success" },
  cancelled:  { label: "ยกเลิก",         variant: "destructive" },
  refunded:   { label: "คืนเงินแล้ว",    variant: "default" },
};

export const nextOrderStatus: Record<OrderStatus, OrderStatus | null> = {
  pending:    "confirmed",
  confirmed:  "processing",
  paid:       "processing",
  processing: "shipped",
  shipped:    "delivered",
  delivered:  null,
  cancelled:  null,
  refunded:   null,
};

export const nextOrderStatusLabel: Record<string, string> = {
  confirmed:  "เริ่มเตรียมของ",
  paid:       "เริ่มเตรียมของ",
  processing: "กดเมื่อจัดส่งแล้ว",
  shipped:    "กดเมื่อลูกค้าได้รับ",
};
