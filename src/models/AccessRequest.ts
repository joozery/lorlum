import { Schema, model, models } from "mongoose";

export interface IAccessRequest {
  _id: string;
  fname: string;
  email: string;
  location: string;
  interest: string;
  applicationNo: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

const AccessRequestSchema = new Schema<IAccessRequest>(
  {
    fname:         { type: String, required: true },
    email:         { type: String, required: true },
    location:      { type: String, required: true },
    interest:      { type: String, default: "" },
    applicationNo: { type: String, required: true, unique: true },
    status:        { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export const AccessRequest = models.AccessRequest ?? model<IAccessRequest>("AccessRequest", AccessRequestSchema);
