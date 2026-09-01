import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";

export async function GET() {
  await connectDB();

  // Aggregate customers — convert both sides to string so ObjectId vs string doesn't matter
  const customers = await Customer.aggregate([
    { $match: { isActive: { $ne: false } } },
    {
      $lookup: {
        from: "orders",
        let: { cid: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [{ $toString: "$customerId" }, "$$cid"],
              },
              paymentStatus: "paid",
            },
          },
        ],
        as: "orders",
      },
    },
    {
      $addFields: {
        totalOrders: { $size: "$orders" },
        totalSpent:  { $sum: "$orders.total" },
        lastOrderAt: { $max: "$orders.createdAt" },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        passwordHash: 0, otpCode: 0, otpExpiresAt: 0,
        wishlist: 0, orders: 0,
      },
    },
  ]);

  const result = customers.map((c: {
    _id: mongoose.Types.ObjectId;
    firstName?: string; lastName?: string; name?: string;
    email: string; phone?: string;
    addresses?: Array<{ line1?: string; city?: string; province?: string }>;
    createdAt: Date;
    totalOrders: number; totalSpent: number; lastOrderAt?: Date;
    note?: string;
  }) => {
    const totalOrders = c.totalOrders ?? 0;
    const totalSpent  = c.totalSpent  ?? 0;
    const tier = totalSpent >= 10000 ? "vip" : totalOrders > 0 ? "regular" : "new";

    const addr    = c.addresses?.[0];
    const address = [addr?.line1, addr?.city, addr?.province].filter(Boolean).join(", ") || "-";
    const displayName = [c.firstName, c.lastName].filter(Boolean).join(" ") || c.name || c.email;

    return {
      id:          c._id.toString(),
      name:        displayName,
      email:       c.email,
      phone:       c.phone || "-",
      address,
      totalOrders,
      totalSpent,
      createdAt:   c.createdAt ? new Date(c.createdAt).toISOString().split("T")[0] : "-",
      lastOrderAt: c.lastOrderAt ? new Date(c.lastOrderAt).toISOString().split("T")[0] : "-",
      tier,
      note:  c.note ?? "",
      tags:  [] as string[],
    };
  });

  return NextResponse.json({ customers: result });
}
