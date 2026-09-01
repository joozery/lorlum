import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ICustomer extends Document {
  name:         string;
  firstName:    string;
  lastName:     string;
  email:        string;
  phone:        string;
  passwordHash: string;
  addresses:    { label: string; line1: string; line2: string; province: string; city: string; zip: string; country: string; isDefault: boolean }[];
  wishlist:     mongoose.Types.ObjectId[];
  otpCode:      string;
  otpExpiresAt: Date;
  isVerified:   boolean;
  isActive:     boolean;
  lastLoginAt:  Date;
  createdAt:    Date;
  updatedAt:    Date;
}

const AddressSchema = new Schema({
  label:     { type: String, default: "Home" },
  line1:     { type: String, default: "" },
  line2:     { type: String, default: "" },
  province:  { type: String, default: "" },
  city:      { type: String, default: "" },
  zip:       { type: String, default: "" },
  country:   { type: String, default: "Thailand" },
  isDefault: { type: Boolean, default: false },
}, { _id: false });

const CustomerSchema = new Schema<ICustomer>({
  name:         { type: String, default: "" },
  firstName:    { type: String, default: "" },
  lastName:     { type: String, default: "" },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:        { type: String, default: "" },
  passwordHash: { type: String, default: "" },
  addresses:    { type: [AddressSchema], default: [] },
  wishlist:     [{ type: Schema.Types.ObjectId, ref: "Product" }],
  otpCode:      { type: String, default: "" },
  otpExpiresAt: { type: Date },
  isVerified:   { type: Boolean, default: false },
  isActive:     { type: Boolean, default: true },
  lastLoginAt:  { type: Date },
}, { timestamps: true });

export default models.Customer ?? model<ICustomer>("Customer", CustomerSchema);
