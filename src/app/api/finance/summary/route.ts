import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Expense } from "@/models/Expense";

async function getModels() {
  const [orderMod, purchaseMod] = await Promise.all([
    import("@/models/Order"),
    import("@/models/Purchase"),
  ]);
  return { Order: orderMod.default, Purchase: purchaseMod.default };
}

const THAI_MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

// GET /api/finance/summary?from=2026-01-01&to=2026-12-31
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { Order, Purchase } = await getModels();
    const { searchParams } = new URL(req.url);

    const now   = new Date();
    const from  = searchParams.get("from")
      ? new Date(searchParams.get("from")!)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const to    = searchParams.get("to")
      ? new Date(searchParams.get("to")! + "T23:59:59")
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const dateRange = { $gte: from, $lte: to };
    const paidStatuses = ["confirmed", "processing", "shipped", "delivered"];

    // Monthly trend — always last 6 months for context
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [revenueAgg, cogsAgg, expensesAgg, expensesByCategory, monthlyRevAgg, monthlyExpAgg] =
      await Promise.all([
        Order.aggregate([
          { $match: { createdAt: dateRange, status: { $in: paidStatuses } } },
          { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
        ]),
        Purchase.aggregate([
          { $match: { createdAt: dateRange } },
          { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
        ]),
        Expense.aggregate([
          { $match: { date: dateRange } },
          { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
        ]),
        Expense.aggregate([
          { $match: { date: dateRange } },
          { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
          { $sort: { total: -1 } },
        ]),
        // Monthly revenue
        Order.aggregate([
          { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $in: paidStatuses } } },
          { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
          { $sort: { "_id.y": 1, "_id.m": 1 } },
        ]),
        // Monthly expenses
        Expense.aggregate([
          { $match: { date: { $gte: sixMonthsAgo } } },
          { $group: { _id: { y: { $year: "$date" }, m: { $month: "$date" } }, expenses: { $sum: "$amount" } } },
          { $sort: { "_id.y": 1, "_id.m": 1 } },
        ]),
      ]);

    const revenue  = revenueAgg[0]?.total  ?? 0;
    const cogs     = cogsAgg[0]?.total     ?? 0;
    const expenses = expensesAgg[0]?.total ?? 0;

    const grossProfit = revenue - cogs;
    const netProfit   = grossProfit - expenses;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const netMargin   = revenue > 0 ? (netProfit   / revenue) * 100 : 0;
    const avgOrderValue = revenueAgg[0]?.count > 0 ? revenue / revenueAgg[0].count : 0;

    // Build 6-month array
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const rev = (monthlyRevAgg as { _id: { y: number; m: number }; revenue: number; orders: number }[])
        .find(r => r._id.y === y && r._id.m === m);
      const exp = (monthlyExpAgg as { _id: { y: number; m: number }; expenses: number }[])
        .find(e => e._id.y === y && e._id.m === m);
      monthly.push({
        label:    THAI_MONTHS[m - 1],
        year:     y,
        month:    m,
        revenue:  rev?.revenue  ?? 0,
        orders:   rev?.orders   ?? 0,
        expenses: exp?.expenses ?? 0,
        profit:   (rev?.revenue ?? 0) - (exp?.expenses ?? 0),
      });
    }

    return NextResponse.json({
      period: { from, to },
      revenue:  { total: revenue,   orderCount: revenueAgg[0]?.count  ?? 0 },
      cogs:     { total: cogs,      poCount:    cogsAgg[0]?.count     ?? 0 },
      expenses: { total: expenses,  count:      expensesAgg[0]?.count ?? 0, byCategory: expensesByCategory },
      grossProfit,
      netProfit,
      grossMargin: Math.round(grossMargin * 10) / 10,
      netMargin:   Math.round(netMargin   * 10) / 10,
      avgOrderValue: Math.round(avgOrderValue),
      monthly,
    });
  } catch (err) {
    console.error("[GET /api/finance/summary]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
