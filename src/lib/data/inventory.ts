export const mockStockItems = [
  { id: "1", sku: "TSH-001", name: "เสื้อยืด Basic สีขาว",  category: "เสื้อผ้า", stock: 45, minStock: 10, maxStock: 60, lastUpdated: "2025-08-30" },
  { id: "2", sku: "PNT-002", name: "กางเกง Slim Fit สีดำ",   category: "กางเกง",   stock: 5,  minStock: 10, maxStock: 40, lastUpdated: "2025-08-28" },
  { id: "3", sku: "SHO-003", name: "รองเท้า Casual",         category: "รองเท้า",  stock: 2,  minStock: 5,  maxStock: 25, lastUpdated: "2025-08-27" },
  { id: "4", sku: "ACC-004", name: "กระเป๋าสะพาย",           category: "กระเป๋า",  stock: 18, minStock: 5,  maxStock: 30, lastUpdated: "2025-08-25" },
  { id: "5", sku: "TSH-005", name: "เสื้อ Polo สีน้ำเงิน",   category: "เสื้อผ้า", stock: 30, minStock: 10, maxStock: 50, lastUpdated: "2025-08-20" },
];

export type StockItem = typeof mockStockItems[0];

export const mockStockHistory = [
  { id: "h1", sku: "TSH-001", name: "เสื้อยืด Basic สีขาว",  type: "in",         qty: 50,  note: "รับสินค้าจาก Supplier A",       date: "2025-08-25T10:00:00" },
  { id: "h2", sku: "PNT-002", name: "กางเกง Slim Fit สีดำ",  type: "out",        qty: -3,  note: "ขายออก · ORD-20250001",          date: "2025-08-30T09:00:00" },
  { id: "h3", sku: "SHO-003", name: "รองเท้า Casual",         type: "out",        qty: -1,  note: "ขายออก · ORD-20250003",          date: "2025-08-30T07:15:00" },
  { id: "h4", sku: "ACC-004", name: "กระเป๋าสะพาย",           type: "in",         qty: 20,  note: "รับสินค้าจาก Supplier B",       date: "2025-08-22T14:00:00" },
  { id: "h5", sku: "TSH-001", name: "เสื้อยืด Basic สีขาว",  type: "adjustment", qty: -2,  note: "ปรับยอด — สินค้าชำรุด",          date: "2025-08-20T11:00:00" },
  { id: "h6", sku: "TSH-005", name: "เสื้อ Polo สีน้ำเงิน",  type: "in",         qty: 30,  note: "รับสินค้าจาก Supplier A",       date: "2025-08-18T09:30:00" },
  { id: "h7", sku: "PNT-002", name: "กางเกง Slim Fit สีดำ",  type: "out",        qty: -5,  note: "ขายออก · ORD-20250002",          date: "2025-08-15T13:00:00" },
];
