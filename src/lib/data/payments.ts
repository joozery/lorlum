export const mockTransactions = [
  { id: "TXN-001", orderId: "ORD-20250001", customer: "สมชาย ใจดี",   amount: 2670, currency: "THB", method: "Credit Card", gateway: "Omise",  status: "success",  txRef: "charge_test_001", createdAt: "2025-08-30T09:05:00" },
  { id: "TXN-002", orderId: "ORD-20250002", customer: "มาลี สวยงาม",  amount: 790,  currency: "THB", method: "PromptPay",   gateway: "SCB",    status: "pending",  txRef: "pp_test_002",     createdAt: "2025-08-30T08:32:00" },
  { id: "TXN-003", orderId: "ORD-20250003", customer: "John Smith",   amount: 2470, currency: "USD", method: "Credit Card", gateway: "Stripe", status: "success",  txRef: "pi_test_003",     createdAt: "2025-08-30T07:20:00" },
  { id: "TXN-004", orderId: "ORD-20250004", customer: "ปิยะ รักสะอาด",amount: 590,  currency: "THB", method: "PromptPay",   gateway: "KBank",  status: "failed",   txRef: "qr_test_004",     createdAt: "2025-08-30T06:05:00" },
  { id: "TXN-005", orderId: "ORD-20250005", customer: "Sara Lee",     amount: 3780, currency: "USD", method: "Credit Card", gateway: "Stripe", status: "refunded", txRef: "pi_test_005",     createdAt: "2025-08-29T22:10:00" },
];

export type Transaction = typeof mockTransactions[0];

export const mockReceipts = [
  { id: "RCP-001", orderId: "ORD-20250001", customer: "สมชาย ใจดี", email: "somchai@email.com", amount: 2670, sentAt: "2025-08-30T09:10:00", sentCount: 1 },
  { id: "RCP-002", orderId: "ORD-20250003", customer: "John Smith",  email: "john@email.com",    amount: 2470, sentAt: "2025-08-30T07:25:00", sentCount: 1 },
];

export const txStatusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "info" | "default" | "purple" }> = {
  success:  { label: "สำเร็จ",          variant: "success" },
  pending:  { label: "รอดำเนินการ",     variant: "warning" },
  failed:   { label: "ล้มเหลว",         variant: "destructive" },
  refunded: { label: "คืนเงินแล้ว",     variant: "info" },
};
