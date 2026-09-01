import mongoose, { Schema, model, models } from "mongoose";
import type { ColorVariant } from "@/types";

export interface IProduct {
  _id: string;
  sku: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  costPrice?: number;
  category: string;
  imageUrl: string;
  stock: number;
  isActive: boolean;
  featured: boolean;
  colorVariants: ColorVariant[];
  sizes: number[];
  materials: string;
  fitSizing: string;
  careInstructions: string;
  createdAt: Date;
  updatedAt: Date;
}

const SizeStockSchema = new Schema<{ size: number; stock: number }>(
  { size: { type: Number, required: true }, stock: { type: Number, default: 0, min: 0 } },
  { _id: false }
);

const ColorVariantSchema = new Schema<ColorVariant>(
  {
    name:       { type: String, required: true, trim: true },
    hex:        { type: String, required: true },
    images:     { type: [String], default: [] },
    stock:      { type: Number, required: true, default: 0, min: 0 },
    sizeStocks: { type: [SizeStockSchema], default: [] },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    sku:           { type: String, required: true, unique: true, trim: true, uppercase: true },
    name:          { type: String, required: true, trim: true },
    nameEn:        { type: String, required: true, trim: true },
    description:   { type: String, default: "" },
    descriptionEn: { type: String, default: "" },
    price:         { type: Number, required: true, min: 0 },
    costPrice:     { type: Number, min: 0 },
    category:      { type: String, required: true, trim: true },
    imageUrl:      { type: String, default: "" },
    stock:         { type: Number, required: true, default: 0, min: 0 },
    isActive:         { type: Boolean, default: true },
    featured:         { type: Boolean, default: false },
    colorVariants:    { type: [ColorVariantSchema], default: [] },
    sizes:            { type: [Number], default: [] },
    materials:        { type: String, default: "" },
    fitSizing:        { type: String, default: "" },
    careInstructions: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-sync imageUrl from first variant image (only if imageUrl is empty)
// Stock is NOT auto-calculated here — it's set explicitly by the form or
// by per-variant stock updates so the user's value is always preserved.
ProductSchema.pre("save", async function () {
  if (this.colorVariants?.length) {
    const allImages = this.colorVariants.flatMap((v) => v.images);
    if (allImages[0] && !this.imageUrl) this.imageUrl = allImages[0];

    // Only sum variant stocks when at least one variant has stock > 0
    // (i.e. per-variant stock management is being used)
    const variantTotal = this.colorVariants.reduce((s, v) => s + (v.stock ?? 0), 0);
    if (variantTotal > 0) this.stock = variantTotal;
  }
});

ProductSchema.index({ sku: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1 });

export const Product = models.Product ?? model<IProduct>("Product", ProductSchema);
