import { Schema, model, models } from "mongoose";

const SectionSchema = new Schema(
  { title: { type: String, default: "" }, body: { type: String, default: "" } },
  { _id: false }
);

const LegalContentSchema = new Schema({
  type:      { type: String, enum: ["terms", "privacy", "cookies"], required: true, unique: true },
  sections:  { type: [SectionSchema], default: [] },
  updatedBy: { type: String, default: "" },
}, { timestamps: true });

export default models.LegalContent ?? model("LegalContent", LegalContentSchema);
