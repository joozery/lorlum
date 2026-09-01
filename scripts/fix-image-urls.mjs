/**
 * Backfills imageUrl from colorVariants[0].images[0] for products where imageUrl is empty.
 * Usage: node scripts/fix-image-urls.mjs
 */
import mongoose from "mongoose";
import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
const env = readFileSync(envPath, "utf8");
const mongoUri = env.match(/^MONGODB_URI=(.+)$/m)?.[1]?.trim();

if (!mongoUri) { console.error("MONGODB_URI not found in .env.local"); process.exit(1); }

await mongoose.connect(mongoUri);
const col = mongoose.connection.collection("products");

const products = await col.find({ $or: [{ imageUrl: "" }, { imageUrl: { $exists: false } }] }).toArray();
console.log(`Found ${products.length} products with empty imageUrl`);

let fixed = 0;
for (const p of products) {
  const firstImg = p.colorVariants?.[0]?.images?.[0];
  if (firstImg) {
    await col.updateOne({ _id: p._id }, { $set: { imageUrl: firstImg } });
    console.log(`  ✅ ${p.name} → ${firstImg.slice(0, 60)}...`);
    fixed++;
  } else {
    console.log(`  ⚠️  ${p.name} — no variant images either`);
  }
}

console.log(`\nFixed ${fixed} / ${products.length} products`);
await mongoose.disconnect();
