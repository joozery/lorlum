import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import { Product } from "@/models/Product";
import Customer from "@/models/Customer";

const THAI_DAY = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"] as const;
const CAT_COLORS = ["#111111", "#6b7280", "#d1d5db", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981"];

function bangkokMidnight() {
  const now = new Date();
  const bkk = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  bkk.setHours(0, 0, 0, 0);
  const offsetMs = now.getTime() - new Date(now.toLocaleString("en-US", { timeZone: "UTC" })).getTime();
  return new Date(bkk.getTime() - offsetMs);
}

function pctChange(curr: number, prev: number) {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

export async function GET() {
  await connectDB();
  const col = mongoose.connection.collection("orders");

  const todayStart = bangkokMidnight();

  // Yesterday
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  // This week (Mon–today)
  const weekStart = new Date(todayStart);
  const dow = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (dow === 0 ? 6 : dow - 1));
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  // This month
  const monthStart = new Date(todayStart);
  monthStart.setDate(1);
  const prevMonthStart = new Date(monthStart);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

  // 7-day chart
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const aggRevenue = (from: Date, to?: Date) => col.aggregate([
    { $match: { paymentStatus: "paid", createdAt: to ? { $gte: from, $lt: to } : { $gte: from } } },
    { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
  ]).toArray();

  const [
    todayStats,
    yesterdayStats,
    weekStats,
    prevWeekStats,
    monthStats,
    prevMonthStats,
    weeklyRaw,
    categoryRaw,
    recentOrders,
    totalProducts,
    totalCustomers,
    newCustomers,
    lowStockProducts,
    todayShipped,
  ] = await Promise.all([
    aggRevenue(todayStart),
    aggRevenue(yesterdayStart, todayStart),
    aggRevenue(weekStart),
    aggRevenue(prevWeekStart, weekStart),
    aggRevenue(monthStart),
    aggRevenue(prevMonthStart, monthStart),

    col.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
        _id:     { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Bangkok" } },
        revenue: { $sum: "$total" },
        orders:  { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]).toArray(),

    col.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      { $lookup: { from: "products", localField: "items.productId", foreignField: "_id", as: "product" } },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      { $group: { _id: { $ifNull: ["$product.category", "อื่นๆ"] }, total: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },
      { $sort: { total: -1 } },
      { $limit: 6 },
    ]).toArray(),

    col.find({ paymentStatus: "paid" }, { sort: { createdAt: -1 }, limit: 5 }).toArray(),

    Product.countDocuments({ isActive: true }),
    Customer.countDocuments({}),
    Customer.countDocuments({ createdAt: { $gte: monthStart } }),

    Product.find({ isActive: true, stock: { $gt: 0, $lte: 10 } })
      .sort({ stock: 1 }).limit(5).select("name sku stock").lean(),

    col.countDocuments({ status: { $in: ["shipped", "delivered"] }, updatedAt: { $gte: todayStart } }),
  ]);

  // ── Period stats ──────────────────────────────────
  const todayRevenue  = (todayStats[0]?.revenue     as number) ?? 0;
  const todayOrders   = (todayStats[0]?.count        as number) ?? 0;
  const yesterdayRev  = (yesterdayStats[0]?.revenue  as number) ?? 0;
  const yesterdayOrd  = (yesterdayStats[0]?.count    as number) ?? 0;
  const weekRevenue   = (weekStats[0]?.revenue       as number) ?? 0;
  const weekOrders    = (weekStats[0]?.count         as number) ?? 0;
  const prevWeekRev   = (prevWeekStats[0]?.revenue   as number) ?? 0;
  const prevWeekOrd   = (prevWeekStats[0]?.count     as number) ?? 0;
  const monthRevenue  = (monthStats[0]?.revenue      as number) ?? 0;
  const monthOrders   = (monthStats[0]?.count        as number) ?? 0;
  const prevMonthRev  = (prevMonthStats[0]?.revenue  as number) ?? 0;
  const prevMonthOrd  = (prevMonthStats[0]?.count    as number) ?? 0;

  const lowStockCount = await Product.countDocuments({ isActive: true, stock: { $lte: 10, $gt: 0 } });

  // ── Weekly revenue chart ──────────────────────────
  const weekMap: Record<string, { revenue: number; orders: number }> = {};
  for (const row of weeklyRaw) {
    weekMap[row._id as string] = { revenue: row.revenue as number, orders: row.orders as number };
  }
  const weeklyRevenue = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" });
    const jsDay   = new Date(dateStr + "T12:00:00+07:00").getDay();
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
    maxStock: 50,
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
    periods: {
      today:    { revenue: todayRevenue,  orders: todayOrders,  revPct: pctChange(todayRevenue, yesterdayRev),  ordPct: pctChange(todayOrders, yesterdayOrd) },
      week:     { revenue: weekRevenue,   orders: weekOrders,   revPct: pctChange(weekRevenue, prevWeekRev),    ordPct: pctChange(weekOrders, prevWeekOrd) },
      month:    { revenue: monthRevenue,  orders: monthOrders,  revPct: pctChange(monthRevenue, prevMonthRev),  ordPct: pctChange(monthOrders, prevMonthOrd) },
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
