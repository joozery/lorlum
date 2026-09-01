import mongoose, { Schema, model, models } from "mongoose";

export interface ICategory {
  _id: string;
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  productCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name:         { type: String, required: true, trim: true },
    nameEn:       { type: String, required: true, trim: true },
    slug:         { type: String, required: true, unique: true, trim: true, lowercase: true },
    description:  { type: String, default: "" },
    productCount: { type: Number, default: 0, min: 0 },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1 });

export const Category = models.Category ?? model<ICategory>("Category", CategorySchema);
