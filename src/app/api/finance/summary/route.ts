import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Expense } from "@/models/Expense";

// Dynamic import to avoid model registration order issues
async function getModels() {
  const [{ Order }, { Purchase }] = await Promise.all([
    import("@/models/Order"),
    import("@/models/Purchase"),
  ]);
  return { Order, Purchase };
}

// GET /api/finance/summary?from=2026-01-01&to=2026-12-31&period=month
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
      ? new Date(searchParams.get("to")!)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const dateRange = { $gte: from, $lte: to };

    const [revenueAgg, cogsAgg, expensesAgg, expensesByCategory] = await Promise.all([
      // Revenue: sum of paid/completed orders
      Order.aggregate([
        { $match: { createdAt: dateRange, status: { $in: ["paid", "processing", "shipped", "delivered"] } } },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
      // COGS: sum of purchase costs
      Purchase.aggregate([
        { $match: { createdAt: dateRange } },
        { $group: { _id: null, total: { $sum: "$totalCost" }, count: { $sum: 1 } } },
      ]),
      // Expenses
      Expense.aggregate([
        { $match: { date: dateRange } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      // Expenses by category
      Expense.aggregate([
        { $match: { date: dateRange } },
        { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    const revenue  = revenueAgg[0]?.total  ?? 0;
    const cogs     = cogsAgg[0]?.total     ?? 0;
    const expenses = expensesAgg[0]?.total ?? 0;

    const grossProfit = revenue - cogs;
    const netProfit   = grossProfit - expenses;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const netMargin   = revenue > 0 ? (netProfit   / revenue) * 100 : 0;

    return NextResponse.json({
      period: { from, to },
      revenue:  { total: revenue,   orderCount: revenueAgg[0]?.count  ?? 0 },
      cogs:     { total: cogs,      poCount:    cogsAgg[0]?.count     ?? 0 },
      expenses: { total: expenses,  count:      expensesAgg[0]?.count ?? 0, byCategory: expensesByCategory },
      grossProfit,
      netProfit,
      grossMargin: Math.round(grossMargin * 10) / 10,
      netMargin:   Math.round(netMargin   * 10) / 10,
    });
  } catch (err) {
    console.error("[GET /api/finance/summary]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
