export type HobeeProduct = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  category: string;
  shopName: string;
  origin: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  badge?: string;
};

export type HobeeStory = {
  id: string;
  title: string;
  description: string;
  image: string;
  label: string;
  readTime: string;
};

export const hobeeProducts: HobeeProduct[] = [
  {
    id: "prod_hobee_itama_700g",
    slug: "hobee-itama-stingless-bee-honey-700g",
    name: "HOBEE น้ำผึ้งชันโรงแท้ 100% สายพันธุ์อิตาม่า 700 กรัม",
    shortName: "HOBEE น้ำผึ้งชันโรงแท้ 700g",
    description:
      "น้ำผึ้งชันโรงแท้ 100% สายพันธุ์อิตาม่า จากฟาร์มผึ้งชันโรง HOBEE นราธิวาส คัดสรรสำหรับผู้ที่มองหาผลิตภัณฑ์จากธรรมชาติ บรรจุขนาดสุทธิ 700 กรัม",
    price: 1290,
    compareAtPrice: 1590,
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&q=85&w=900",
    category: "น้ำผึ้งและผลิตภัณฑ์จากผึ้ง",
    shopName: "HOBEE Official Store",
    origin: "ฟาร์มผึ้งชันโรง HOBEE นราธิวาส",
    rating: 5,
    reviewsCount: 128,
    stock: 50,
    badge: "HOBEE SELECT",
  },
  {
    id: "NW-01-01-PR-0002",
    slug: "nw-01-01-pr-0002",
    name: "น้ำผึ้งป่า ดอยสุเทพ 100%",
    shortName: "น้ำผึ้งป่า 700 ml.",
    description:
      "น้ำผึ้งป่าแท้ 100% เก็บรวบรวมตามฤดูกาล มีกลิ่นหอมจากเกสรดอกไม้ป่า และเป็นผลิตภัณฑ์ของกลุ่มอนุรักษ์ชันโรงและน้ำผึ้งป่า",
    price: 350,
    compareAtPrice: 390,
    image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=85&w=900",
    category: "อาหารและเครื่องดื่ม",
    shopName: "ของดีชุมชนยะลา",
    origin: "กลุ่มอนุรักษ์ชันโรงและน้ำผึ้งป่า",
    rating: 4.8,
    reviewsCount: 35,
    stock: 35,
    badge: "LOCAL",
  },
  {
    id: "NW-01-01-PR-0001",
    slug: "nw-01-01-pr-0001",
    name: "กาแฟคั่วเข้ม อาราบิก้า 100%",
    shortName: "กาแฟคั่วเข้ม 250g",
    description:
      "กาแฟอาราบิก้าคั่วเข้มแท้ 100% จากเกษตรกรในพื้นที่จังหวัดยะลา ให้กลิ่นหอมและรสเข้มข้นอย่างมีเอกลักษณ์",
    price: 250,
    compareAtPrice: 290,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=85&w=900",
    category: "อาหารและเครื่องดื่ม",
    shopName: "ของดีชุมชนยะลา",
    origin: "วิสาหกิจชุมชนกาแฟยะลา",
    rating: 4.9,
    reviewsCount: 48,
    stock: 50,
    badge: "LOCAL",
  },
  {
    id: "CM-01-01-PR-0001",
    slug: "cm-01-01-pr-0001",
    name: "ข้าวหอมมะลิ เชียงใหม่ 1 กก.",
    shortName: "ข้าวหอมมะลิ 1 กก.",
    description:
      "ข้าวหอมมะลิคุณภาพจากชุมชนเกษตรกร คัดเมล็ดและบรรจุเพื่อส่งต่อรสชาติท้องถิ่นถึงครัวของคุณ",
    price: 120,
    image: "https://images.unsplash.com/photo-1586208958839-06c17cacdf08?auto=format&fit=crop&q=85&w=900",
    category: "อาหารและเครื่องดื่ม",
    shopName: "เครือข่ายชุมชน HOBEE",
    origin: "ชุมชนเกษตรกรเชียงใหม่",
    rating: 4.7,
    reviewsCount: 22,
    stock: 40,
    badge: "LOCAL",
  },
];

export const hobeeStories: HobeeStory[] = [
  {
    id: "story-honey-origin",
    title: "จากฟาร์มชันโรงนราธิวาส สู่ขวดน้ำผึ้ง HOBEE",
    description: "พบกับวิถีการดูแลผึ้งชันโรงและความตั้งใจของชุมชนผู้ผลิตในชายแดนใต้",
    image: "https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?auto=format&fit=crop&q=85&w=900",
    label: "LOCAL STORY",
    readTime: "อ่าน 4 นาที",
  },
  {
    id: "story-southern-table",
    title: "รสชาติบ้านเรา: ของดีจากผู้ผลิตท้องถิ่น",
    description: "เลือกสรรสินค้าจากชุมชนที่ตั้งใจผลิตและเล่าเรื่องราวของพื้นที่ผ่านทุกคำ",
    image: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?auto=format&fit=crop&q=85&w=900",
    label: "COMMUNITY",
    readTime: "อ่าน 3 นาที",
  },
  {
    id: "story-narathiwat",
    title: "ชวนเที่ยว ชิม และพบผู้คนที่นราธิวาส",
    description: "บันทึกแรงบันดาลใจจากปลายด้ามขวานและผู้คนที่ทำให้ทุกการเดินทางมีความหมาย",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=85&w=900",
    label: "TRAVEL",
    readTime: "อ่าน 5 นาที",
  },
];

export const formatThaiBaht = (amount: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);

