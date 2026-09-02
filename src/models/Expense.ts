import mongoose, { Schema, model, models } from "mongoose";

export const EXPENSE_CATEGORIES = [
  "ค่าเช่า", "ค่าไฟฟ้า", "ค่าน้ำ", "ค่าอินเทอร์เน็ต",
  "ค่าแรงพนักงาน", "ค่าขนส่ง/โลจิสติกส์", "การตลาด/โฆษณา",
  "ค่าบรรจุภัณฑ์", "ค่าซ่อมบำรุง", "ค่าธรรมเนียมธนาคาร",
  "ค่าซอฟต์แวร์/สมาชิก", "อื่นๆ",
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export interface IExpense {
  _id: string;
  date: Date;
  category: ExpenseCategory;
  description: string;
  amount: number;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    date:        { type: Date,   required: true },
    category:    { type: String, enum: EXPENSE_CATEGORIES, default: "อื่นๆ" },
    description: { type: String, required: true, trim: true },
    amount:      { type: Number, required: true, min: 0 },
    note:        { type: String, default: "" },
  },
  { timestamps: true }
);

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1 });

export const Expense = models.Expense ?? model<IExpense>("Expense", ExpenseSchema);
