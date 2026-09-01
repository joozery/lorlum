import mongoose, { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema({
  productId:   { type: Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  imageUrl:    { type: String, default: "" },
  color:       { type: String, default: "" },
  size:        { type: Number },
  price:       { type: Number, required: true },
  qty:         { type: Number, required: true, min: 1 },
}, { _id: false });

const OrderSchema = new Schema({
  customerId:     { type: Schema.Types.ObjectId, ref: "Customer" },
  guestEmail:     { type: String, default: "" },
  items:          { type: [OrderItemSchema], required: true },
  subtotal:       { type: Number, required: true },
  shippingFee:    { type: Number, default: 0 },
  total:          { type: Number, required: true },
  status:         { type: String, enum: ["pending","confirmed","processing","shipped","delivered","cancelled","refunded"], default: "pending" },
  paymentMethod:  { type: String, default: "" },
  paymentStatus:  { type: String, enum: ["unpaid","paid","refunded"], default: "unpaid" },
  trackingNumber: { type: String, default: "" },
  trackingUrl:    { type: String, default: "" },
  shippingAddress: {
    name:     { type: String, default: "" },
    phone:    { type: String, default: "" },
    line1:    { type: String, default: "" },
    line2:    { type: String, default: "" },
    province: { type: String, default: "" },
    city:     { type: String, default: "" },
    zip:      { type: String, default: "" },
    country:  { type: String, default: "Thailand" },
  },
  orderNumber:           { type: String, default: "" },
  stripePaymentIntentId: { type: String, default: "" },
  note:                  { type: String, default: "" },
  paidAt:      { type: Date },
  shippedAt:   { type: Date },
}, { timestamps: true });

export default models.Order ?? model("Order", OrderSchema);
