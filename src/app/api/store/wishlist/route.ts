import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { Product } from "@/models/Product";
import { getSession } from "@/lib/store-auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const customer = await Customer.findById(session.customerId).select("wishlist");
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const products = await Product.find({ _id: { $in: customer.wishlist }, isActive: true })
    .select("name nameEn price imageUrl colorVariants category");
  return NextResponse.json({ wishlist: products });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, action } = await req.json(); // action: "add" | "remove"
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  await connectDB();
  const oid = new mongoose.Types.ObjectId(productId);

  if (action === "remove") {
    await Customer.findByIdAndUpdate(session.customerId, { $pull: { wishlist: oid } });
  } else {
    await Customer.findByIdAndUpdate(session.customerId, { $addToSet: { wishlist: oid } });
  }

  const customer = await Customer.findById(session.customerId).select("wishlist");
  return NextResponse.json({ wishlist: customer?.wishlist ?? [] });
}
