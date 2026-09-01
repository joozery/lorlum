import mongoose, { Schema, model, models } from "mongoose";

export interface ISiteSettings {
  key: string;
  hero: {
    bgImages: string[];
    headingLine1: string;
    headingLine2: string;
    subtext: string;
    ctaLabel: string;
    badge: string;
  };
  contact: {
    phone: string;
    phoneDisplay: string;
    whatsappLink: string;
    email: string;
    hours: string;
  };
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    key: { type: String, default: "main", unique: true },
    hero: {
      bgImages:      { type: [String], default: [] },
      headingLine1:  { type: String, default: "Linen" },
      headingLine2:  { type: String, default: "Collection" },
      subtext:       { type: String, default: "Thomas Mason Gold Linen, hand-lasted by masterpiece artisans on the exclusive private curated." },
      ctaLabel:      { type: String, default: "Explore the Collection" },
      badge:         { type: String, default: "Season 2026 · Exclusive Release" },
    },
    contact: {
      phone:        { type: String, default: "+66960824578" },
      phoneDisplay: { type: String, default: "+66 96 082 4578" },
      whatsappLink: { type: String, default: "#" },
      email:        { type: String, default: "support@lorlum.com" },
      hours:        { type: String, default: "Monday to Friday, 4am–11am CET\nSaturday and Sunday, 5am–10am CET" },
    },
  },
  { timestamps: true }
);

export const SiteSettings = models.SiteSettings ?? model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
