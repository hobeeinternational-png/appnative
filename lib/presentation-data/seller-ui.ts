export type SellerTab = "operations" | "catalog" | "customers" | "growth" | "more";

export const SELLER_TABS: Array<{ id: SellerTab; label: string }> = [
  { id: "operations", label: "วันนี้" },
  { id: "catalog", label: "สินค้า" },
  { id: "customers", label: "ลูกค้า" },
  { id: "growth", label: "เติบโต" },
  { id: "more", label: "เพิ่มเติม" },
];

export const SELLER_DAILY_STATES = [
  { icon: "receipt-long", label: "Orders", detail: "ดูคิวออเดอร์และงานจัดส่ง" },
  { icon: "inventory-2", label: "Stock", detail: "ตรวจสินค้าที่ต้องดูแล" },
  { icon: "support-agent", label: "Claims", detail: "ติดตามงานหลังการขาย" },
];
