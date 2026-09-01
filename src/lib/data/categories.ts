export interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const mockCategories: Category[] = [
  {
    id: "1",
    name: "เสื้อผ้า",
    nameEn: "Tops",
    slug: "tops",
    description: "เสื้อยืด เสื้อโปโล เสื้อเชิ้ต และเสื้อกันหนาวทุกรูปแบบ",
    productCount: 4,
    isActive: true,
    createdAt: "2025-07-01",
    updatedAt: "2025-08-28",
  },
  {
    id: "2",
    name: "กางเกง",
    nameEn: "Bottoms",
    slug: "bottoms",
    description: "กางเกงขายาว กางเกงขาสั้น ทุกสไตล์",
    productCount: 2,
    isActive: true,
    createdAt: "2025-07-01",
    updatedAt: "2025-08-27",
  },
  {
    id: "3",
    name: "รองเท้า",
    nameEn: "Shoes",
    slug: "shoes",
    description: "รองเท้าผ้าใบ รองเท้าบูท รองเท้าแตะ",
    productCount: 2,
    isActive: true,
    createdAt: "2025-07-01",
    updatedAt: "2025-08-25",
  },
  {
    id: "4",
    name: "กระเป๋า",
    nameEn: "Bags",
    slug: "bags",
    description: "กระเป๋าสะพาย กระเป๋าเป้ หมวก และเครื่องประดับ",
    productCount: 2,
    isActive: true,
    createdAt: "2025-07-01",
    updatedAt: "2025-08-29",
  },
  {
    id: "5",
    name: "ชุดกีฬา",
    nameEn: "Sportswear",
    slug: "sportswear",
    description: "เสื้อและกางเกงออกกำลังกาย ระบายอากาศดี",
    productCount: 0,
    isActive: false,
    createdAt: "2025-07-15",
    updatedAt: "2025-08-10",
  },
  {
    id: "6",
    name: "เครื่องประดับ",
    nameEn: "Accessories",
    slug: "accessories",
    description: "เข็มขัด ผ้าพันคอ ถุงเท้า และของแต่งกายอื่นๆ",
    productCount: 0,
    isActive: true,
    createdAt: "2025-08-01",
    updatedAt: "2025-08-20",
  },
];
