export type OrderStatus =
  | "pending"
  | "confirmed"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type StockMovement = "in" | "out" | "adjustment";

export interface SizeStock {
  size: number;   // EU size e.g. 38
  stock: number;  // qty for this size
}

export interface ColorVariant {
  name: string;
  hex: string;
  images: string[];
  stock: number;           // total (sum of sizeStocks, or manual when no sizes)
  sizeStocks: SizeStock[]; // per-size stock for this color
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  costPrice?: number;
  category: string;
  imageUrl: string;
  stock: number;
  isActive: boolean;
  featured: boolean;
  colorVariants: ColorVariant[];
  sizes: number[];            // EU sizes e.g. [36,37,38,39,40]
  materials: string;          // accordion: Materials & Construction
  fitSizing: string;          // accordion: Fit & Sizing
  careInstructions: string;   // accordion: Care Instructions
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  province: string;
  city: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  currency: string;
  paymentMethod: string;
  shippingAddress?: ShippingAddress;
  trackingNumber?: string;
  trackingUrl?: string;
  note?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export type CustomerTier = "vip" | "regular" | "new";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  lastOrderAt: string;
  tier: CustomerTier;
  note?: string;
  tags?: string[];
}

export interface StockRecord {
  id: string;
  productId: string;
  productName: string;
  type: StockMovement;
  quantity: number;
  note: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  supplier: string;
  items: PurchaseItem[];
  total: number;
  status: "draft" | "ordered" | "received" | "cancelled";
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
}
