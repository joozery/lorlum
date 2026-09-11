import { Schema, model, models } from "mongoose";

export interface IPaymentSettings {
  key: string;
  enabled: boolean;
  mode: "test" | "live";
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  updatedAt: Date;
}

const PaymentSettingsSchema = new Schema<IPaymentSettings>(
  {
    key:     { type: String, default: "main", unique: true },
    enabled: { type: Boolean, default: true },
    mode:    { type: String, enum: ["test", "live"], default: "test" },
    publishableKey: {
      type: String,
      default: () => process.env.STRIPE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    },
    secretKey: {
      type: String,
      default: () => process.env.STRIPE_SECRET_KEY ?? "",
    },
    webhookSecret: {
      type: String,
      default: () => process.env.STRIPE_WEBHOOK_SECRET ?? "",
    },
  },
  { timestamps: true }
);

export const PaymentSettings = models.PaymentSettings ?? model<IPaymentSettings>("PaymentSettings", PaymentSettingsSchema);
