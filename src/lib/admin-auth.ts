import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AdminSession {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export function verifyAdminRequest(req: NextRequest): AdminSession | null {
  const token = req.cookies.get("admin-token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as AdminSession;
  } catch {
    return null;
  }
}
