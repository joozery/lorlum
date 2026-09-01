import mongoose from "mongoose";

const URI = "mongodb://wooyou_app:dGpjJTAz7RPGYhUYKxPapDfx@72.60.195.203:27017/lorlumjame?authSource=admin";

const schema = new mongoose.Schema({
  sku:           { type: String, required: true, unique: true },
  name:          String,
  nameEn:        String,
  description:   String,
  descriptionEn: String,
  price:         Number,
  costPrice:     Number,
  category:      String,
  imageUrl:      String,
  stock:         Number,
  isActive:      Boolean,
  featured:      Boolean,
}, { timestamps: true });

const Product = mongoose.models.Product ?? mongoose.model("Product", schema);

const products = [
  { sku:"TSH-001", name:"เสื้อยืด Basic สีขาว",    nameEn:"Basic White T-Shirt",      description:"เสื้อยืดคอกลม ผ้า Cotton 100%",       descriptionEn:"Round neck cotton shirt",        price:390,  category:"เสื้อผ้า", imageUrl:"/productexam/01/batch_0303-34910.jpg",         stock:45, isActive:true,  featured:true  },
  { sku:"PNT-002", name:"กางเกง Slim Fit สีดำ",     nameEn:"Black Slim Fit Pants",     description:"กางเกงขายาวทรง Slim",                 descriptionEn:"Slim fit long pants",            price:790,  category:"กางเกง",   imageUrl:"/productexam/01/model_021420nerdy-1756.jpg",  stock:5,  isActive:true,  featured:false },
  { sku:"SHO-003", name:"รองเท้า Casual",            nameEn:"Casual Sneakers",          description:"รองเท้าผ้าใบสไตล์ Casual",            descriptionEn:"Casual canvas shoes",            price:1290, category:"รองเท้า",  imageUrl:"/productexam/01/model_021420nerdy-1757.jpg",  stock:2,  isActive:false, featured:false },
  { sku:"ACC-004", name:"กระเป๋าสะพาย",              nameEn:"Shoulder Bag",             description:"กระเป๋าหนัง PU ขนาดกลาง",             descriptionEn:"Medium PU leather bag",          price:1890, category:"กระเป๋า",  imageUrl:"/productexam/01/model_021420nerdy-1758.jpg",  stock:18, isActive:true,  featured:true  },
  { sku:"TSH-005", name:"เสื้อ Polo สีน้ำเงิน",     nameEn:"Blue Polo Shirt",          description:"เสื้อโปโลคอปก ผ้า Pique",             descriptionEn:"Pique polo shirt",               price:590,  category:"เสื้อผ้า", imageUrl:"/productexam/01/model_021420nerdy-1759.jpg",  stock:30, isActive:true,  featured:false },
  { sku:"TSH-006", name:"เสื้อฮู้ด Oversize",        nameEn:"Oversize Hoodie",          description:"เสื้อกันหนาวมีฮู้ด ทรง Oversize",     descriptionEn:"Oversize hoodie sweatshirt",     price:990,  category:"เสื้อผ้า", imageUrl:"/productexam/01/model_021420nerdy-1760.jpg",  stock:22, isActive:true,  featured:true  },
  { sku:"PNT-007", name:"กางเกงขาสั้น Chino",        nameEn:"Chino Shorts",             description:"กางเกงขาสั้นผ้า Chino เนื้อดี",       descriptionEn:"Chino fabric shorts",            price:590,  category:"กางเกง",   imageUrl:"/productexam/01/model_021420nerdy-1764.jpg",  stock:8,  isActive:true,  featured:false },
  { sku:"SHO-008", name:"รองเท้าบูท Chelsea",        nameEn:"Chelsea Boots",            description:"รองเท้าบูทหนัง Chelsea สไตล์คลาสสิก",descriptionEn:"Classic leather Chelsea boots",  price:2490, category:"รองเท้า",  imageUrl:"/productexam/01/batch_0303-34910.jpg",         stock:7,  isActive:true,  featured:true  },
  { sku:"ACC-009", name:"หมวก Cap ปักโลโก้",         nameEn:"Logo Cap",                 description:"หมวก Cap ปีกแบน ปักโลโก้แบรนด์",      descriptionEn:"Embroidered logo cap",           price:490,  category:"กระเป๋า",  imageUrl:"/productexam/01/model_021420nerdy-1756.jpg",  stock:3,  isActive:false, featured:false },
  { sku:"TSH-010", name:"เสื้อเชิ้ต Oxford สีฟ้า",  nameEn:"Oxford Blue Shirt",        description:"เสื้อเชิ้ตผ้า Oxford ทรง Regular",     descriptionEn:"Regular fit Oxford shirt",       price:890,  category:"เสื้อผ้า", imageUrl:"/productexam/01/model_021420nerdy-1757.jpg",  stock:15, isActive:true,  featured:false },
];

await mongoose.connect(URI);
console.log("✅ Connected");

let inserted = 0, skipped = 0;
for (const p of products) {
  try {
    await Product.create(p);
    console.log(`  ✅ ${p.sku} — ${p.name}`);
    inserted++;
  } catch (e) {
    if (e.code === 11000) { console.log(`  ⏭  ${p.sku} already exists`); skipped++; }
    else throw e;
  }
}

console.log(`\nDone: ${inserted} inserted, ${skipped} skipped`);
await mongoose.disconnect();
