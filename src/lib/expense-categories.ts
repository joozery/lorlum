export const EXPENSE_CATEGORIES = [
  "ค่าเช่า", "ค่าไฟฟ้า", "ค่าน้ำ", "ค่าอินเทอร์เน็ต",
  "ค่าแรงพนักงาน", "ค่าขนส่ง/โลจิสติกส์", "การตลาด/โฆษณา",
  "ค่าบรรจุภัณฑ์", "ค่าซ่อมบำรุง", "ค่าธรรมเนียมธนาคาร",
  "ค่าซอฟต์แวร์/สมาชิก", "อื่นๆ",
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
