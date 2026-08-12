import type { ImageSourcePropType } from "react-native";

export type LearningWorld = "business_skills" | "islamic_wisdom";
export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type LearningEpisode = {
  id: string;
  number: number;
  title: string;
  durationMinutes: number;
  completed?: boolean;
};

export type LearningCourse = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  world: LearningWorld;
  category: string;
  level: CourseLevel;
  image: ImageSourcePropType;
  instructor: string;
  instructorTitle: string;
  durationMinutes: number;
  episodesCount: number;
  rating: number;
  ratingsCount: number;
  hasCertificate: boolean;
  isTrending: boolean;
  isNew?: boolean;
  videoUrl: string;
  episodes: LearningEpisode[];
};

const marketingClassroom = { uri: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85" };
const onlineTraining = { uri: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=85" };

const sampleVideo = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export const learningCourses: LearningCourse[] = [
  {
    id: "meta-ads-mastery",
    slug: "meta-ads-mastery",
    title: "ยิงแอด Facebook และ Instagram สำหรับธุรกิจเริ่มต้น",
    shortDescription: "วางแผนคอนเทนต์ เลือกกลุ่มเป้าหมาย และอ่านผลลัพธ์ให้เปลี่ยนเป็นยอดขายได้จริง",
    world: "business_skills",
    category: "Digital Marketing",
    level: "beginner",
    image: marketingClassroom,
    instructor: "HOBEE Academy",
    instructorTitle: "Growth & Community Business",
    durationMinutes: 360,
    episodesCount: 12,
    rating: 4.9,
    ratingsCount: 128,
    hasCertificate: true,
    isTrending: true,
    videoUrl: sampleVideo,
    episodes: [
      { id: "meta-ads-01", number: 1, title: "เริ่มต้นทำความเข้าใจ Meta Ads", durationMinutes: 18, completed: true },
      { id: "meta-ads-02", number: 2, title: "กำหนดเป้าหมายแคมเปญให้ตรงธุรกิจ", durationMinutes: 22, completed: true },
      { id: "meta-ads-03", number: 3, title: "ออกแบบกลุ่มเป้าหมายชุมชน", durationMinutes: 26 },
      { id: "meta-ads-04", number: 4, title: "วัดผลและปรับงบโฆษณา", durationMinutes: 24 },
    ],
  },
  {
    id: "halal-food-storytelling",
    slug: "halal-food-storytelling",
    title: "เล่าเรื่องอาหารฮาลาลให้คนหยุดดู",
    shortDescription: "เปลี่ยนเมนูท้องถิ่นให้เป็นคอนเทนต์ที่น่าจดจำ พร้อมแนวทางถ่ายภาพและเขียนแคปชัน",
    world: "business_skills",
    category: "Creator Skills",
    level: "beginner",
    image: onlineTraining,
    instructor: "ซอฟียา มะลิ",
    instructorTitle: "Food Content Creator",
    durationMinutes: 145,
    episodesCount: 8,
    rating: 4.8,
    ratingsCount: 86,
    hasCertificate: false,
    isTrending: true,
    isNew: true,
    videoUrl: sampleVideo,
    episodes: [
      { id: "food-story-01", number: 1, title: "หาเรื่องเล่าจากจานอาหาร", durationMinutes: 16 },
      { id: "food-story-02", number: 2, title: "จัดแสงและมุมกล้องมือถือ", durationMinutes: 20 },
    ],
  },
  {
    id: "community-shop-finance",
    slug: "community-shop-finance",
    title: "วางเงินร้านชุมชนอย่างเป็นระบบ",
    shortDescription: "จัดบัญชีรายรับรายจ่าย ต้นทุน และเงินหมุนเวียนสำหรับผู้ประกอบการรายย่อย",
    world: "business_skills",
    category: "Finance",
    level: "intermediate",
    image: marketingClassroom,
    instructor: "อับดุลเลาะห์ สาและ",
    instructorTitle: "SME Finance Coach",
    durationMinutes: 210,
    episodesCount: 10,
    rating: 4.7,
    ratingsCount: 54,
    hasCertificate: true,
    isTrending: false,
    videoUrl: sampleVideo,
    episodes: [
      { id: "finance-01", number: 1, title: "แยกเงินธุรกิจออกจากเงินส่วนตัว", durationMinutes: 20 },
      { id: "finance-02", number: 2, title: "ทำต้นทุนเมนูและสินค้าหลัก", durationMinutes: 24 },
    ],
  },
  {
    id: "halal-business-ethics",
    slug: "halal-business-ethics",
    title: "จริยธรรมการค้าฮาลาลในชีวิตจริง",
    shortDescription: "หลักคิดสร้างความไว้วางใจ ดูแลลูกค้า และเติบโตอย่างยั่งยืนตามวิถีฮาลาล",
    world: "islamic_wisdom",
    category: "Halal Wisdom",
    level: "beginner",
    image: onlineTraining,
    instructor: "อุสตาซ อับดุลรอซัก",
    instructorTitle: "Halal Business Educator",
    durationMinutes: 180,
    episodesCount: 9,
    rating: 4.9,
    ratingsCount: 71,
    hasCertificate: true,
    isTrending: true,
    videoUrl: sampleVideo,
    episodes: [
      { id: "ethics-01", number: 1, title: "ความซื่อสัตย์คือทุนของร้านค้า", durationMinutes: 19 },
      { id: "ethics-02", number: 2, title: "ทำสัญญาและสื่อสารอย่างรับผิดชอบ", durationMinutes: 23 },
    ],
  },
  {
    id: "arabic-for-service",
    slug: "arabic-for-service",
    title: "ภาษาอาหรับเพื่อการบริการ",
    shortDescription: "ประโยคสั้นที่ใช้จริงในร้านอาหาร โรงแรม และบริการท่องเที่ยว",
    world: "islamic_wisdom",
    category: "Language",
    level: "beginner",
    image: marketingClassroom,
    instructor: "ครูอามีนะห์",
    instructorTitle: "Arabic for Tourism",
    durationMinutes: 95,
    episodesCount: 7,
    rating: 4.6,
    ratingsCount: 39,
    hasCertificate: false,
    isTrending: false,
    isNew: true,
    videoUrl: sampleVideo,
    episodes: [
      { id: "arabic-01", number: 1, title: "ทักทายและต้อนรับลูกค้า", durationMinutes: 12 },
      { id: "arabic-02", number: 2, title: "คำศัพท์การบริการอาหาร", durationMinutes: 14 },
    ],
  },
];

export const learningWorlds: Array<{ id: LearningWorld; label: string; shortLabel: string; icon: "auto-awesome" | "mosque" }> = [
  { id: "business_skills", label: "HOBEE Business & Skills", shortLabel: "ทักษะธุรกิจ", icon: "auto-awesome" },
  { id: "islamic_wisdom", label: "Islamic & Halal Wisdom", shortLabel: "Halal Wisdom", icon: "mosque" },
];

export const getCourse = (id: string) => learningCourses.find((course) => course.id === id);
export const coursesForWorld = (world: LearningWorld) => learningCourses.filter((course) => course.world === world);
export const formatCourseDuration = (minutes: number) => `${Math.floor(minutes / 60)} ชม. ${minutes % 60} นาที`;
export const levelLabel = (level: CourseLevel) => ({ beginner: "เบื้องต้น", intermediate: "ปานกลาง", advanced: "ขั้นสูง" })[level];
