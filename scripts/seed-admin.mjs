/**
 * สร้างหรือ reset password ของ admin user
 * Usage: node scripts/seed-admin.mjs
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local
const envPath = resolve(process.cwd(), ".env.local");
const env = readFileSync(envPath, "utf8");
const mongoUri = env.match(/^MONGODB_URI=(.+)$/m)?.[1]?.trim();

if (!mongoUri) { console.error("MONGODB_URI not found in .env.local"); process.exit(1); }

const ADMIN_EMAIL    = "admin@ecomjame.com";
const ADMIN_PASSWORD = "Admin@1234";
const ADMIN_NAME     = "Super Admin";

await mongoose.connect(mongoUri);
const col = mongoose.connection.collection("adminusers");

const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
const exists = await col.findOne({ email: ADMIN_EMAIL });

if (exists) {
  await col.updateOne({ email: ADMIN_EMAIL }, { $set: { passwordHash, isActive: true } });
  console.log(`✅ Reset password สำเร็จ`);
} else {
  await col.insertOne({
    name: ADMIN_NAME, email: ADMIN_EMAIL, role: "super_admin",
    passwordHash, isActive: true, phone: "", avatarUrl: "",
    createdAt: new Date(), updatedAt: new Date(),
  });
  console.log(`✅ สร้าง admin user สำเร็จ`);
}

console.log(`\n📧 Email   : ${ADMIN_EMAIL}`);
console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
console.log(`\n⚠️  อย่าลืมเปลี่ยน password หลัง login!`);

await mongoose.disconnect();
