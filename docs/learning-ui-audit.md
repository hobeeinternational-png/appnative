# HOBEE LEARNING — CURRENT UI AUDIT

**ขอบเขต:** Audit → Map → Gap Analysis → Recommend เท่านั้น  
**วันที่ตรวจ:** 17 สิงหาคม 2026  
**ข้อจำกัด:** ไม่มีการสร้างหน้าใหม่, ลบของเดิม, เปลี่ยน Supabase/Auth/Payment/API contracts หรือเพิ่ม schema ในรอบนี้

> **สรุปผู้บริหาร:** HOBEE Learning มีแกนการเรียนแบบ on-demand ที่ใช้งานได้ในระดับ **MVP presentation** แล้ว ได้แก่ Learning Home, Course/Player, episode selection, local progress และ My Learning แต่ยังไม่ใช่ Learning ecosystem เต็มรูปแบบ เพราะยังไม่มี catalogue/search ที่สมบูรณ์, business models, enrollment/purchase gates, seminar/live/1-on-1, user-backed library, teacher-to-course data bridge หรือ navigation/deep-link safeguards ที่ครบถ้วน

## 1. Current Routes และ Current Screens

| Route จริง | หน้าจอ/หน้าที่ | การเชื่อมต่อปัจจุบัน | สถานะ |
|---|---|---|---|
| `/(tabs)/learn` | Learning Home | FloatingBottomNav → Learning tab; เปิด Course Detail ผ่าน rails | COMPLETE สำหรับ hub แบบ presentation |
| `/learning/[id]` | Course Detail + Video Lesson Player | รับ course ID จาก `learning-data.ts`; เลือก episode และบันทึก progress ในเครื่อง | PARTIAL |
| `/learning/my-learning` | My Learning | เปิดจาก avatar บน Learning Home; อ่าน local progress | PARTIAL |
| `/creative` | Unified Creator/Affiliate/Teacher workspace | สลับ Teacher presentation workspace และเปิด generic role screens | PARTIAL สำหรับ Teacher operations |
| `/workspace/teacher/[screen]` | Teacher tools แบบ generic role screen | Contract มี dashboard, courses, lessons, students, schedule, assignments, reviews, earnings และ profile | PARTIAL; ยังไม่เชื่อม Learning learner data |

ไม่มี route แยกจริงสำหรับ **Course Listing, Course Search, Lesson Detail, Video Player, Free/Paid/Subscription, Seminar/Event, Live Class, 1-on-1, Teacher Profile, Calendar, Certificate, Quiz, Assignment Detail, Notes/Bookmarks, Favorite Courses** หรือ **Learning Progress Detail** ในปัจจุบัน

## 2. สิ่งที่มีอยู่แล้ว

### Learning Home

Learning Home ใช้ visual language แบบ dark academy มี branded header, world tabs สองกลุ่ม, featured course, recommended rail, top-ten rail, certificate rail และ continue-watching card. การกด card ไปยัง `/learning/[id]` ใช้งานได้ และ avatar ไปยัง `/learning/my-learning` ได้

| รายการ | สถานะ | หมายเหตุจาก source |
|---|---|---|
| Hero / Featured Course | COMPLETE | มี featured image, rating, reviews, duration และ CTA |
| Search | MISSING | มี search icon แต่ไม่มี `onPress` หรือ search route |
| Categories | PARTIAL | มีเพียง 2 Learning Worlds; ไม่มี category catalogue/filter route |
| Featured / Recommended / Trending | COMPLETE | แสดงจาก local presentation data |
| Continue Watching | PARTIAL | มี card แต่ default episode/time/progress เป็นข้อความกำหนดไว้ |
| Free / Paid Course | MISSING | Course model ไม่มี price หรือ access mode |
| Subscription | MISSING | ไม่มี subscription model หรือ UI |
| Seminars / Teachers / Recently Viewed | MISSING | ไม่มี section/data/route |
| Loading / Skeleton / Empty / Error | MISSING | Home เป็น synchronous local presentation list |

### Course Detail, Lesson และ Video Learning

Route `/learning/[id]` รวม Course Detail และ Video Player ไว้หน้าเดียว โดยอ่าน `LearningCourse` จาก local repository และใช้ `expo-video` แสดง video source. ผู้เรียนเลือก episode, play/pause, seek ย้อน 10 วินาที, เปลี่ยน playback rate ระหว่าง 1.0x/1.25x, mark complete และบันทึก local progress ได้

| ความสามารถ | สถานะ | หมายเหตุ |
|---|---|---|
| Cover / Video / title / description / instructor | COMPLETE | มีใน route เดียว |
| Trailer/Preview ก่อน enroll | MISSING | เปิด player ทันที ไม่มี enrollment gate |
| Rating / student review count / duration / lesson count | COMPLETE | ใช้ local course metadata |
| Curriculum / lesson list / selected lesson | COMPLETE | เลือก episode และแสดง completed state ได้ |
| Learning outcomes / requirements | MISSING | Course model ไม่มี fields นี้ |
| Price / Free-Paid-Subscription badge | MISSING | ไม่มี access model หรือ price |
| Reviews / related courses | MISSING | ไม่มี route, data หรือ UI |
| Enroll / Buy / Start CTA | PARTIAL | มี play/complete CTA แต่ไม่มีกระบวนการ enroll/buy |
| Play/Pause / seek / fullscreen / PiP | COMPLETE | ใช้ `VideoView`, `useVideoPlayer`, native fullscreen และ PiP |
| Previous/Next lesson | MISSING | เลือกจาก lesson list ได้ แต่ไม่มี next/previous action |
| Progress / mark completed / continue watching | PARTIAL | persistence ทำงานใน AsyncStorage แต่ไม่มี watch position หรือ server sync |
| Notes / bookmark | MISSING | ไม่มี notes; ปุ่ม add ใน header ยังไม่มี handler |
| Subtitle / resources | PARTIAL | มี chip subtitle ที่ยังไม่ทำงาน; resources เป็นข้อความ integration boundary |
| Playback speed | PARTIAL | สลับได้เฉพาะ 1.0x และ 1.25x โดยไม่มี state label หรือ speed menu |

### My Learning

My Learning อ่าน `hobee_learning_progress_v1` จาก AsyncStorage และหา active course จาก progress ที่บันทึกไว้. หน้าจอแสดง profile shell, stat cards, resume card, short course list และ certificate card

| ความสามารถ | สถานะ | หมายเหตุ |
|---|---|---|
| In Progress / Continue Watching | PARTIAL | อ่าน progress จริงในเครื่อง แต่ selected course และ resume copy ยัง fallback/static |
| Completed | PARTIAL | มี completed episode IDs แต่ไม่มี completed-course tab/list |
| Purchased / Saved | MISSING | ไม่มี purchase/enrollment/save model |
| Certificates | PARTIAL | มี card เดี่ยวกำหนดข้อความไว้ ไม่ได้ derive จาก completion |
| Upcoming Classes / Seminars / 1-on-1 | MISSING | ไม่มี data หรือ route |
| Progress Detail | PARTIAL | มี completion percentage ใน player แต่ไม่มี progress screen |

## 3. Learning Business Models, Events และ 1-on-1

| Business model / Flow | Existing | Completion | Recommendation |
|---|---|---|---|
| Free Course | ไม่มี access model | MISSING | เพิ่ม `accessType` ใน presentation/data contract ก่อนทำ UI badge/filter |
| One-time Paid Course | ไม่มี price, checkout handoff หรือ entitlement | MISSING | Extend Course Detail และ reuse payment/order boundary หลังมี product mapping |
| Monthly Subscription | ไม่มี plan, status หรือ paywall | MISSING | สร้าง subscription presentation contract ก่อนสร้าง UI |
| Seminar / Event | ไม่มี listing/detail/booking/my-events route | MISSING | สร้าง event domain contract และ reuse Travel booking presentation patterns |
| Live Class | ไม่มี schedule, meeting link หรือ attendance flow | MISSING | Extend Learning with class/session contract; ไม่สร้าง Course module ใหม่ |
| 1-on-1 Teaching | ไม่มี teacher availability, booking หรือ confirmation | MISSING | Reuse Teacher role schedule screens เป็น base แล้วสร้าง learner booking bridge |

## 4. Teacher Integration

Teacher role มี presentation contracts ครบในเชิง operations ได้แก่ Teacher Dashboard, courses, course form, lessons, students, enrollment, schedule, attendance, assignments, progress, reviews, earnings, profile และ settings. อย่างไรก็ตาม role workspace เหล่านี้ยังเป็น generic UI contracts ไม่ได้อ่าน/เขียน `learning-data.ts`, local progress ของผู้เรียน หรือ learner-facing course IDs

| พื้นที่ Teacher | Existing | Completion | Gap สำคัญ |
|---|---|---|---|
| Dashboard / Courses / Lessons | มี role workspace presentation | PARTIAL | ไม่มี course entity connection กับ learner catalogue |
| Students / Progress / Attendance | มี route contract | PARTIAL | ไม่มี student/profile/progress data bridge |
| Schedule / Classes / Seminar / 1-on-1 | มี schedule/class contracts บางส่วน | PARTIAL | ไม่มี event, booking, availability หรือ session data |
| Assignments / Reviews | มี workspace contracts | PARTIAL | ไม่มี assignment/review records หรือ learner surfaces |
| Earnings / Profile | มี presentation route | PARTIAL | ไม่เชื่อม revenue/teacher public profile ใน Learning |

> **Duplicate-risk finding:** ไม่ควรสร้าง Teacher module ใหม่ เพราะ `/creative` และ `/workspace/teacher/*` มี foundation แล้ว ควร **extend** ด้วย shared course, lesson, enrollment, session และ learner-progress contracts เท่านั้น

## 5. Navigation, Deep Links และ Screen States

เส้นทางหลัก **Home → Learning → Course/Video → My Learning** มีจริง. Learning tab ใช้ FloatingBottomNav เดียวกับ app tabs แต่ Learning Home/Detail ใช้ header แบบเฉพาะโมดูล. Course Detail และ My Learning เรียก `router.back()` โดยตรง ขณะที่ `back-navigation.ts` มี fallback metadata สำหรับ Learning แต่ custom headers ไม่ได้ใช้ helper นี้อย่างชัดเจน. `deep-links.ts` ยังไม่มี Learning notification route allow-list

| ประเด็น | Completion | Findings |
|---|---|---|
| Entry navigation | COMPLETE | Tab `/learn` เปิด Learning Home |
| Course navigation | COMPLETE | Rails → `/learning/[id]` |
| My Learning navigation | COMPLETE | Header avatar → `/learning/my-learning` |
| Back / Android / iOS deep-link fallback | PARTIAL | มี fallback metadata แต่ custom buttons ใช้ `router.back()` โดยตรง |
| Deep-link allow-list | MISSING | Notification allow-list ไม่มี Learning path |
| Loading | PARTIAL | มี saving spinner ตอน mark complete เท่านั้น |
| Missing/Not found | COMPLETE | Unknown course มี MissingCourse state |
| Empty/Error/Offline/Permission denied | MISSING | ไม่มี shared state usage ใน Learning routes |
| Locked/Purchase/Subscription required | MISSING | ไม่มี access/entitlement model |
| Completed state | PARTIAL | episode completed state มีจริง แต่ course completion/certificate state ไม่ครบ |

## 6. Current Data Architecture

| Area | Current source | Persistence / Boundary | Readiness |
|---|---|---|---|
| Course catalogue, worlds, instructor, ratings, episodes | `lib/learning-data.ts` | Local TypeScript presentation repository; 5 sample courses | Presentation only |
| Video | `LearningCourse.videoUrl` | External sample MP4 URL | Demo playback only |
| Learning progress | `lib/learning-progress.ts` | AsyncStorage key `hobee_learning_progress_v1` | Device-local only |
| Course enrollment, purchase, entitlement | ไม่มี | ไม่มี Supabase/API/model | Missing |
| Reviews, certificates, saved courses | ไม่มี | ไม่มี data layer | Missing |
| Seminar/live/1-on-1 | ไม่มี | ไม่มี data layer | Missing |
| Teacher operations | `role-workspaces.ts` | Generic presentation contracts | Not connected to learner data |

ไม่มีการเรียก Supabase, tRPC, fetch หรือ API ภายใน `learn.tsx`, `app/learning/*`, `learning-data.ts` และ `learning-progress.ts` ที่ตรวจในรอบนี้

## 7. Design Consistency

Learning มี visual identity ชัดเจนแบบ dark academy: dark canvas, gold accent, compact media rails และ academy badge. คุณภาพ card, hierarchy และ player อยู่ในระดับดี แต่ยังใช้ hard-coded colour/spacing หลายจุดและไม่ได้ reuse fixed app shell, shared status states หรือ layer/elevation contracts ล่าสุดที่ใช้ใน Home, Travel, Local Stores, Food และ My HOBEE

| Design area | Completion | Recommendation |
|---|---|---|
| Typography / hierarchy | PARTIAL | รักษา academy personality แต่ map text scale ไป HOBEE type tokens |
| Spacing / cards / elevation | PARTIAL | Replace local hard-coded values ด้วย HOBEE spacing/radius/elevation tokens ทีละ component |
| Header / search / navigation | PARTIAL | Use FixedAppShell or shared BackHeader behavior โดยคง dark visual mode |
| Bottom sheets / filters / loading | MISSING | Reuse shared chips, modal/bottom-sheet and error/skeleton primitives |
| Imagery | PARTIAL | มี course imagery แต่ไม่มี teacher/event/live visual model |

## 8. Final Gap Matrix

| Area | Screen/Feature | Existing | Completion | Needs Extension | Missing | Recommendation |
|---|---|---|---|---|---|---|
| Routes | Learning Home | `/(tabs)/learn` | COMPLETE | Reuse as hub | — | Preserve route and extend sections only |
| Routes | Course Detail + Player | `/learning/[id]` | PARTIAL | Add course landing vs lesson state | Dedicated course/listen separation | Extend current route or add nested lesson route only when needed |
| Routes | My Learning | `/learning/my-learning` | PARTIAL | Add library tabs and derived data | Purchased/saved/events lists | Extend existing route |
| Discovery | Search / full listing / filters | Header icon and world tabs only | PARTIAL | Search handler, category/filter states | Search/listing route | Create one catalogue route, not another home |
| Home | Hero, featured, recommendations, trending | Present | COMPLETE | Bind to catalogue/personalization later | — | Retain visual rails |
| Home | Free/Paid/Subscription/Seminar/Teachers/Recent | Not present | MISSING | New data contracts | All required UI | Add after access/event models exist |
| Detail | Curriculum / player / instructor / rating | Present | COMPLETE | Add deeper curriculum metadata | — | Preserve and enrich current detail |
| Detail | Outcomes, requirements, pricing, reviews, related | Not present | MISSING | Course model expansion | All UI | Extend `LearningCourse` without duplicate detail route |
| Video | Playback, fullscreen, PiP, seek, lesson selection | Present | COMPLETE | Persist watch position | — | Preserve `expo-video` implementation |
| Video | Next/previous, notes, bookmark, subtitles, attachments | Partial chips/placeholder | PARTIAL | Functional controls and content assets | Notes/bookmark models | Extend current player |
| Progress | Local episode completion | AsyncStorage | PARTIAL | Course completion and sync | Multi-device data | Keep local fallback during backend phase |
| My Learning | Resume / list / certificate card | Present | PARTIAL | Derived progress and tabs | Purchases/saved/events | Extend existing screen |
| Monetization | Free/Paid/Subscription | No model | MISSING | Access, price, entitlement | UI and backend mapping | Design contracts before payment work |
| Events | Seminar / Live Class / My Events | No route/model | MISSING | Event/session model | All screens | Reuse Travel booking patterns where appropriate |
| 1-on-1 | Teacher schedule to learner booking | Teacher generic schedule exists | MISSING | Availability and learner booking bridge | All customer flow | Extend Teacher workspace + add learner route |
| Teacher | Teacher operations workspace | Generic contracts exist | PARTIAL | Data joins and publish states | Learner bridge | Extend `/creative` and role screens |
| Safety | Back fallback / deep-link allow-list | Partial metadata only | PARTIAL | Use safe helper and explicit allow-list | Notification routing | Do not add parallel navigation system |
| States | Loading/empty/error/offline/permission/access | Narrow saving/not-found coverage | PARTIAL | Shared state primitives | Most states | Reuse existing `error-screens.tsx` |
| Data | Catalogue/progress | Local data + AsyncStorage | PARTIAL | Repository interfaces and Supabase integration plan | API/server source | No schema change in this audit |
| Design | Academy visual system | Dark custom system | PARTIAL | Tokenization and shared shell/state reuse | Shared modal/skeleton patterns | Keep dark Learning identity within HOBEE system |

## 9. Features by Completion State

| COMPLETE | PARTIAL | MISSING |
|---|---|---|
| Learning tab, Home hub, featured/recommended/trending rails, world switcher, course route, embedded video, lesson list, local completion persistence, My Learning entry, Teacher generic workspace contracts | Search trigger, Course Detail as purchase-aware page, controls/subtitles/attachments, Continue Watching, My Learning library/certificates, Teacher integration, safe-back/deep links, loading/error states, design-token consistency | Course listing/search route, Free/Paid/Subscription, enroll/buy, review system, saved courses, seminar/event, live class, 1-on-1, teacher profile, calendar, quiz, assignment learner flow, notes/bookmarks, user-backed certificates, API/Supabase learning data |

## 10. Recommended UI Phase

| Priority | Proposed phase | Scope | Why this is the next non-duplicative step |
|---|---|---|---|
| 1 | **Learning Core Completion** | Extend `LearningCourse`, dedicated search/catalogue, course landing metadata, My Learning tabs, saved/recent, safe back/deep links, complete screen states | Makes existing routes consistent and usable without backend/schema change |
| 2 | **Learning Access & Progress** | Free/Paid/Subscription presentation, enrollment/access gates, watch position, bookmarks/notes, true course completion/certificate state | Establishes business and learner lifecycle contracts before payment integration |
| 3 | **Teacher ↔ Learner Bridge** | Connect Teacher workspace course/lesson/student/schedule contracts with learner catalogue and progress | Extends existing Teacher workspace rather than duplicating it |
| 4 | **Events & Live Learning** | Seminar, live class, event booking, 1-on-1 availability/booking, My Events | Requires session/availability and booking contracts; can reuse existing Travel booking patterns selectively |

## 11. Audit Conclusion

HOBEE Learning should be **extended, not rebuilt**. The existing three-route learner core and Teacher workspace contracts are valuable foundations. The immediate work is to standardize navigation and state handling, turn local course metadata into richer contracts, and make My Learning derive its UI from real local progress before planning any database or payment changes. Seminar, live and 1-on-1 should follow only after the core learner/access and Teacher-to-course bridge are defined.

### Source Evidence

| Evidence path | Used to verify |
|---|---|
| `app/(tabs)/learn.tsx` | Learning Home route, home sections, header actions and course navigation |
| `app/learning/[id].tsx` | Combined course/player, video controls, lesson list, local completion and missing state |
| `app/learning/my-learning.tsx` | My Learning current sections and local-progress consumption |
| `lib/learning-data.ts` | Course schema, local presentation catalogue and video source boundary |
| `lib/learning-progress.ts` | AsyncStorage persistence model |
| `lib/presentation-data/role-workspaces.ts` | Teacher operations contracts |
| `lib/back-navigation.ts`, `lib/deep-links.ts` | Current fallback metadata and allow-list scope |
