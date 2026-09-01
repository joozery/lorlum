import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import Order from "@/models/Order";
import { Product } from "@/models/Product";
import Customer from "@/models/Customer";

const THAI_DAY = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"] as const;
const CAT_COLORS = ["#111111", "#6b7280", "#d1d5db", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981"];

function bangkokMidnight() {
  const now = new Date();
  // UTC+7
  const bkk = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  bkk.setHours(0, 0, 0, 0);
  // convert back to UTC
  const offsetMs = now.getTime() - new Date(now.toLocaleString("en-US", { timeZone: "UTC" })).getTime();
  const utcMidnight = new Date(bkk.getTime() - offsetMs);
  return utcMidnight;
}

export async function GET() {
  await connectDB();
  const col = mongoose.connection.collection("orders");

  const todayStart  = bangkokMidnight();
  const monthStart  = new Date(todayStart);
  monthStart.setDate(1);
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [
    todayStats,
    weeklyRaw,
    categoryRaw,
    recentOrders,
    totalProducts,
    totalCustomers,
    newCustomers,
    lowStockProducts,
    todayShipped,
  ] = await Promise.all([
    // Today's revenue & order count
    col.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: todayStart } } },
      { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
    ]).toArray(),

    // Last 7 days revenue & orders grouped by local date
    col.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Bangkok" } },
        revenue: { $sum: "$total" },
        orders:  { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]).toArray(),

    // Revenue by product category (from paid orders)
    col.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      { $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      }},
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      { $group: {
        _id:   { $ifNull: ["$product.category", "อื่นๆ"] },
        total: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
      }},
      { $sort: { total: -1 } },
      { $limit: 6 },
    ]).toArray(),

    // Recent 5 paid orders
    col.find(
      { paymentStatus: "paid" },
      { sort: { createdAt: -1 }, limit: 5 }
    ).toArray(),

    // Total active products
    Product.countDocuments({ isActive: true }),

    // Total customers
    Customer.countDocuments({}),

    // New customers this month
    Customer.countDocuments({ createdAt: { $gte: monthStart } }),

    // Low stock products (stock > 0 to avoid showing discontinued, sorted asc)
    Product.find({ isActive: true, stock: { $gt: 0, $lte: 10 } })
      .sort({ stock: 1 })
      .limit(5)
      .select("name sku stock")
      .lean(),

    // Today shipped / delivered
    col.countDocuments({
      status: { $in: ["shipped", "delivered"] },
      updatedAt: { $gte: todayStart },
    }),
  ]);

  // ── KPIs ──────────────────────────────────────────
  const todayRevenue = (todayStats[0]?.revenue as number) ?? 0;
  const todayOrders  = (todayStats[0]?.count  as number) ?? 0;
  const lowStockCount = await Product.countDocuments({ isActive: true, stock: { $lte: 10, $gt: 0 } });

  // ── Weekly revenue chart ──────────────────────────
  // Build a map: dateStr -> { revenue, orders }
  const weekMap: Record<string, { revenue: number; orders: number }> = {};
  for (const row of weeklyRaw) {
    weekMap[row._id as string] = { revenue: row.revenue as number, orders: row.orders as number };
  }
  // Generate last 7 dates
  const weeklyRevenue = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    // convert to Bangkok local date string
    const dateStr = d.toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" }); // "YYYY-MM-DD"
    const jsDay   = new Date(dateStr + "T12:00:00+07:00").getDay(); // 0=Sun..6=Sat
    return {
      day:     THAI_DAY[jsDay],
      revenue: weekMap[dateStr]?.revenue ?? 0,
      orders:  weekMap[dateStr]?.orders  ?? 0,
    };
  });

  // ── Category chart ────────────────────────────────
  const catTotal = (categoryRaw as Array<{ _id: string; total: number }>).reduce((s, r) => s + r.total, 0) || 1;
  const categoryBreakdown = (categoryRaw as Array<{ _id: string; total: number }>).map((r, i) => ({
    name:  r._id || "อื่นๆ",
    value: Math.round((r.total / catTotal) * 100),
    color: CAT_COLORS[i] ?? "#e5e7eb",
  }));

  // ── Recent orders ─────────────────────────────────
  const recentOrdersMapped = recentOrders.map((o) => ({
    id:           String(o._id),
    orderNumber:  (o.orderNumber as string) || String(o._id).slice(-8).toUpperCase(),
    customerName: (o.shippingAddress as { name?: string })?.name || (o.guestEmail as string) || "—",
    status:       o.status as string,
    total:        o.total as number,
    createdAt:    o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
    items:        (o.items as Array<{ imageUrl?: string }>) ?? [],
  }));

  // ── Low stock ─────────────────────────────────────
  const lowStock = lowStockProducts.map((p) => ({
    name:     (p as { name: string }).name,
    sku:      (p as { sku: string }).sku,
    stock:    (p as { stock: number }).stock,
    maxStock: 50, // default display max; relative bar
  }));

  return NextResponse.json({
    kpis: {
      todayRevenue,
      todayOrders,
      totalProducts,
      totalCustomers,
      newCustomersThisMonth: newCustomers,
      lowStockCount,
    },
    weeklyRevenue,
    categoryBreakdown,
    recentOrders: recentOrdersMapped,
    lowStock,
    todaySummary: {
      newOrders: todayOrders,
      paid:      todayOrders,
      shipped:   todayShipped,
      revenue:   todayRevenue,
    },
  });
}
