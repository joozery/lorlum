import mongoose, { Schema, model, models } from "mongoose";

export interface IContactMessage {
  _id: string;
  title: string;
  first: string;
  last: string;
  email: string;
  phone: string;
  object: string;
  topic: string;
  message: string;
  attachmentUrl: string;
  attachmentName: string;
  status: "new" | "read" | "replied";
  createdAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    title:          { type: String, default: "" },
    first:          { type: String, default: "" },
    last:           { type: String, default: "" },
    email:          { type: String, default: "" },
    phone:          { type: String, default: "" },
    object:         { type: String, default: "" },
    topic:          { type: String, default: "" },
    message:        { type: String, default: "" },
    attachmentUrl:  { type: String, default: "" },
    attachmentName: { type: String, default: "" },
    status:  { type: String, enum: ["new", "read", "replied"], default: "new" },
  },
  { timestamps: true }
);

export const ContactMessage = models.Contact ?? model<IContactMessage>("Contact", ContactMessageSchema);
