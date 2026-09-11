import { Schema, model, models } from "mongoose";

export interface ICurrencySettings {
  key: string;
  enabledCurrencies: string[];
  allowCustomerSwitch: boolean;
  updatedAt: Date;
}

const CurrencySettingsSchema = new Schema<ICurrencySettings>(
  {
    key:                 { type: String, default: "main", unique: true },
    enabledCurrencies:   { type: [String], default: ["THB", "USD"] },
    allowCustomerSwitch: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CurrencySettings = models.CurrencySettings ?? model<ICurrencySettings>("CurrencySettings", CurrencySettingsSchema);
