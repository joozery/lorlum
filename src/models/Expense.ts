import mongoose, { Schema, model, models } from "mongoose";
import { EXPENSE_CATEGORIES, ExpenseCategory } from "@/lib/expense-categories";

export { EXPENSE_CATEGORIES, ExpenseCategory };

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
