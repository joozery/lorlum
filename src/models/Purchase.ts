import mongoose, { Schema, model, models } from "mongoose";

const PurchaseItemSchema = new Schema(
  { name: String, sku: String, unit: { type: String, default: "ชิ้น" }, qty: Number, cost: Number, vatRate: { type: Number, default: 7 } },
  { _id: false }
);

const SupplierSchema = new Schema(
  { name: String, address: String, taxId: String, contact: String, phone: String, email: String },
  { _id: false }
);

const BuyerSchema = new Schema(
  { name: String, nameEn: String, address: String, taxId: String, phone: String, email: String },
  { _id: false }
);

const PurchaseSchema = new Schema(
  {
    poNumber:       { type: String, default: "" },
    supplier:       { type: String, required: true },
    supplierContact:{ type: String, default: "" },
    supplierInfo:   { type: SupplierSchema, default: {} },
    buyerInfo:      { type: BuyerSchema, default: {} },
    issueDate:      { type: Date, default: Date.now },
    deliveryDate:   { type: Date },
    paymentTerms:   { type: String, default: "เครดิต 30 วัน" },
    shippingMethod: { type: String, default: "" },
    items:          { type: [PurchaseItemSchema], default: [] },
    discountPct:    { type: Number, default: 0 },
    total:          { type: Number, default: 0 },
    status:         { type: String, enum: ["draft", "ordered", "received", "cancelled"], default: "draft" },
    note:           { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Purchase ?? model("Purchase", PurchaseSchema);
