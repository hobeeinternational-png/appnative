# Layered Visual System QA

## Browser smoke test — 13 สิงหาคม 2026

| Route | Result | Evidence |
|---|---|---|
| `/` | Pass | Search, 8 categories, HOBEE Local Discovery hero, interest rail, discovery tabs/cards และ Ecosystem render โดยไม่มี runtime error |
| `/shop` | Pass | Search, category/filter controls, catalogue cards, favorite/quick-add actions, community origins, member CTA และ FloatingBottomNav render โดยไม่มี runtime error |
| `/discover` | Pass | Topic filters, featured Local Discovery, travel/place/food/service/story/community rails และ Opportunity CTA render โดยไม่มี runtime error |
| `/account` | Pass | Profile hero, member/reward card, account stats, order states, settings และ referral banner render โดยไม่มี runtime error |

ข้อจำกัด: เครื่องมือ capture mobile screenshot ล้มเหลวสองรูปแบบใน session นี้ แม้ Metro bundle และ browser smoke tests สำเร็จ จึงต้องยืนยัน aesthetics บน mobile portrait ด้วย preview หรืออุปกรณ์ของเจ้าของระบบเพิ่มเติม
