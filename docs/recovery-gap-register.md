# HOBEE Mobile — Baseline B Recovery Gap Register

> **Decision:** ผู้ใช้อนุมัติแนวทาง B เมื่อไม่สามารถกู้ Final UI Audit checkpoint `fab34c50` ผ่าน automation ได้ ฐาน source ที่ใช้งานต่อคือ Git HEAD `7e3856f3` (After-Sales Operations Center) ซึ่งเป็นฐานเก่ากว่า Final UI Audit และมี regression suite ปัจจุบัน **93 passed / 1 skipped** ก่อน Controlled Backend Wiring changes ถูกนำกลับมา

งาน Controlled Backend Wiring Phase 1 ดำเนินบนฐานนี้โดยตั้งใจ ไม่ได้อ้างว่า source เทียบเท่า checkpoint Final UI Audit เดิม และไม่เปลี่ยน production database, payment, Vercel deployment หรือ API contracts

| พื้นที่ | สถานะบน baseline B | Recovery requirement | ผลต่อ Phase 1 |
|---|---|---|---|
| After-Sales Operations Center | มี | ไม่มี | ใช้เป็นฐาน schema/organization/RLS ปัจจุบัน |
| My HOBEE Phase 1–2 | มี | ไม่มี | ใช้ role, application และ organization contracts เดิม |
| Local Stores | ไม่พบ source/routes/tests ที่ checkpoint B | กู้จาก artifact/checkpoint หรือ rebuild ภายหลัง | ไม่อยู่ใน Phase 1 |
| Travel Ecosystem UI Complete | ไม่พบ source/routes/tests ที่ checkpoint B | กู้จาก artifact/checkpoint หรือ rebuild ภายหลัง | ไม่อยู่ใน Phase 1 |
| Restaurant & Food Experience UI Complete | ไม่พบ source/routes/tests ที่ checkpoint B | กู้จาก artifact/checkpoint หรือ rebuild ภายหลัง | ไม่อยู่ใน Phase 1 |
| Learning Platform UI Complete | ไม่พบ source/routes/tests ที่ checkpoint B | กู้จาก artifact/checkpoint หรือ rebuild ภายหลัง | ไม่อยู่ใน Phase 1 |
| Community Hub UI Complete | ไม่พบ source/routes/tests ที่ checkpoint B | กู้จาก artifact/checkpoint หรือ rebuild ภายหลัง | ไม่อยู่ใน Phase 1 |
| Final UI Audit route hardening/docs | ไม่พบ source/routes/tests ที่ checkpoint B | ดำเนิน audit ใหม่เมื่อ UI modules ถูกกู้กลับ | ไม่อยู่ใน Phase 1 |

## Guardrails for this baseline

The QA environment remains the disposable branch `hobee-qa-identity` (`islisdlzuadwvxsocozj`), created from production without production rows. The QA seed scripts are kept outside the migration history, require pre-provisioned disposable Auth identities, and cannot create production payment, order, travel, learning, or community transactions.

When a recovered source is available, compare its route inventory and tests against this register before merging the Phase 1 files. Treat this document as a visible recovery boundary rather than evidence that the listed UI modules have been rebuilt.
