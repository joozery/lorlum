import mongoose, { Schema, model, models } from "mongoose";

export interface ISiteSettings {
  key: string;
  faviconUrl: string;
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
  shippingCopy: {
    deliveryTitle: { en: string; th: string };
    deliveryDesc: { en: string; th: string };
    cartNote: { en: string; th: string };
    accordShippingBody: { en: string; th: string };
  };
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    key:        { type: String, default: "main", unique: true },
    faviconUrl: { type: String, default: "/logolorlum.svg" },
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
    shippingCopy: {
      deliveryTitle: {
        en: { type: String, default: "Complimentary Insured Delivery" },
        th: { type: String, default: "จัดส่งฟรีพร้อมประกัน" },
      },
      deliveryDesc: {
        en: { type: String, default: "EMS within Thailand — arrives 2–3 working days. International by DHL Express." },
        th: { type: String, default: "EMS ในไทย — ได้รับสินค้า 2–3 วันทำการ ต่างประเทศทาง DHL Express" },
      },
      cartNote: {
        en: { type: String, default: "Complimentary insured EMS within Thailand. Secure SSL payment." },
        th: { type: String, default: "จัดส่ง EMS ในไทยพร้อมประกัน ชำระเงินผ่าน SSL ปลอดภัย" },
      },
      accordShippingBody: {
        en: { type: String, default: "Complimentary insured EMS within Thailand (2–3 working days). International by DHL Express. Returns accepted within 14 days in unworn condition." },
        th: { type: String, default: "จัดส่ง EMS ในประเทศไทย (2–3 วันทำการ) พร้อมประกัน ต่างประเทศทาง DHL Express คืนสินค้าได้ภายใน 14 วัน ในสภาพที่ไม่ได้ใช้" },
      },
    },
  },
  { timestamps: true }
);

export const SiteSettings = models.SiteSettings ?? model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
