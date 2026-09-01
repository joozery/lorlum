import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

export type AdminRole = "super_admin" | "admin" | "manager" | "staff";

export interface IAdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: AdminRole;
  avatarUrl?: string;
  isActive: boolean;
  passwordHash: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone:        { type: String, default: "" },
    role:         { type: String, enum: ["super_admin", "admin", "manager", "staff"], default: "staff" },
    avatarUrl:    { type: String, default: "" },
    isActive:     { type: Boolean, default: true },
    passwordHash: { type: String, required: true },
    lastLoginAt:  { type: Date },
  },
  { timestamps: true }
);

AdminUserSchema.index({ email: 1 });
AdminUserSchema.index({ role: 1 });

AdminUserSchema.methods.verifyPassword = function (plain: string) {
  return bcrypt.compare(plain, this.passwordHash);
};

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export const AdminUser = models.AdminUser ?? model<IAdminUser>("AdminUser", AdminUserSchema);
