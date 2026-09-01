const T = {
  th: {
    // Sidebar sections
    sMain:           "MAIN",
    sCatalogue:      "CATALOGUE",
    sSales:          "SALES",
    sWarehouse:      "WAREHOUSE",
    sStorefront:     "STOREFRONT",
    sAdministration: "ADMINISTRATION",
    // Nav labels
    dashboard:       "แดชบอร์ด",
    products:        "สินค้า",
    allProducts:     "ทั้งหมด",
    categories:      "หมวดหมู่",
    allCategories:   "หมวดหมู่ทั้งหมด",
    orders:          "คำสั่งซื้อ",
    payments:        "การชำระเงิน",
    customers:       "ลูกค้า",
    allCustomers:    "ลูกค้าทั้งหมด",
    inventory:       "คลังสินค้า",
    purchases:       "จัดซื้อ",
    storefront:      "หน้าร้าน",
    banner:          "แบนเนอร์",
    adminUsers:      "ผู้ดูแลระบบ",
    roles:           "สิทธิ์การใช้งาน",
    settings:        "ตั้งค่า",
    // Header
    changeLang:      "เปลี่ยนภาษา",
    notifications:   "การแจ้งเตือน",
    markAllRead:     "อ่านทั้งหมด",
    noNotifications: "ไม่มีการแจ้งเตือน",
    // Sidebar UI
    expandMenu:      "ขยายเมนู",
    collapseMenu:    "ย่อเมนู",
    logout:          "ออกจากระบบ",
  },
  en: {
    // Sidebar sections
    sMain:           "MAIN",
    sCatalogue:      "CATALOGUE",
    sSales:          "SALES",
    sWarehouse:      "WAREHOUSE",
    sStorefront:     "STOREFRONT",
    sAdministration: "ADMINISTRATION",
    // Nav labels
    dashboard:       "Dashboard",
    products:        "Products",
    allProducts:     "All Products",
    categories:      "Categories",
    allCategories:   "All Categories",
    orders:          "Orders",
    payments:        "Payments",
    customers:       "Customers",
    allCustomers:    "All Customers",
    inventory:       "Inventory",
    purchases:       "Purchasing",
    storefront:      "Storefront",
    banner:          "Banner",
    adminUsers:      "Admin Users",
    roles:           "Roles & Permissions",
    settings:        "Settings",
    // Header
    changeLang:      "Change Language",
    notifications:   "Notifications",
    markAllRead:     "Mark all read",
    noNotifications: "No notifications",
    // Sidebar UI
    expandMenu:      "Expand menu",
    collapseMenu:    "Collapse menu",
    logout:          "Log out",
  },
} as const;

export type Translations = Record<keyof typeof T.th, string>;
export default T as Record<string, Translations>;
