import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Expense } from "@/models/Expense";

// GET /api/finance/expenses?from=&to=&category=&page=1&limit=50
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const from     = searchParams.get("from");
    const to       = searchParams.get("to");
    const category = searchParams.get("category") ?? "";
    const page     = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit    = Math.min(100, Number(searchParams.get("limit") ?? 50));

    const filter: Record<string, unknown> = {};
    if (from || to) {
      filter.date = {};
      if (from) (filter.date as Record<string, Date>).$gte = new Date(from);
      if (to)   (filter.date as Record<string, Date>).$lte = new Date(to + "T23:59:59");
    }
    if (category) filter.category = category;

    const [items, total] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Expense.countDocuments(filter),
    ]);

    return NextResponse.json({ items, total, page, limit });
  } catch (err) {
    console.error("[GET /api/finance/expenses]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// POST /api/finance/expenses  body: { date, category, description, amount, note? }
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { date, category, description, amount, note = "" } = body;
    if (!date || !description || amount == null) {
      return NextResponse.json({ error: "date, description, amount required" }, { status: 400 });
    }
    const item = await Expense.create({ date: new Date(date), category, description, amount: Number(amount), note });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("[POST /api/finance/expenses]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// PUT /api/finance/expenses  body: { id, ...fields }
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { id, date, category, description, amount, note } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const updated = await Expense.findByIdAndUpdate(
      id,
      { date: new Date(date), category, description, amount: Number(amount), note },
      { new: true, runValidators: true }
    ).lean();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/finance/expenses]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// DELETE /api/finance/expenses  body: { id }
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await Expense.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/finance/expenses]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
