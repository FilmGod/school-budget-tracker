# UI Redesign (Ledger style) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปลี่ยนหน้าตาเว็บทั้งระบบเป็นสไตล์ระบบบัญชีโรงเรียน (sidebar, การ์ดขอบบาง, ตัวเลขเด่น, ตารางมี progress bar) โดยข้อมูลและตรรกะเดิมไม่เปลี่ยน

**Architecture:** ใช้ CSS variables เป็น token สี/เส้น/มุม แล้ว map เข้า Tailwind `theme.extend.colors`; สร้าง utility class ชุดเดียว (`.card`, `.stat-value`, `.table-base`, `.progress-*`, `.btn-*`) ให้ทุกหน้าเรียกใช้; เปลี่ยน `Navbar` เป็น sidebar บนจอใหญ่ + แถบบน/ลิ้นชักบนมือถือ โดยคง state และ modal เดิมทั้งหมดไว้ในไฟล์เดียว

**Tech Stack:** Next.js 14 App Router, Tailwind 3, recharts, lucide-react

**Spec:** `docs/superpowers/specs/2026-11-13-ui-redesign-ledger-style-design.md`

## Global Constraints

- ห้ามแก้ `src/app/api/**`, `src/lib/docxExport.ts`, `src/components/ReportPrintView.tsx`
- ห้ามแก้ schema/ข้อมูลใน `src/data/**`
- คงฟอนต์ Sarabun และระบบปรับขนาดตัวอักษร (16/18/19.2/21px)
- คงสีแยกหมวดงบ 4 หมวดตาม token `--budget-*`
- dark mode ต้องอ่านได้ทุกหน้า
- `print-page` ต้องคงพื้นขาว A4
- ทุกงานต้องจบด้วย `npx tsc --noEmit` ผ่าน

## Review Focus

- ตัวเลขยาว (เช่น `1,069,675`) ต้องไม่ล้นการ์ดเมื่อผู้ใช้ตั้งฟอนต์ 21px
- ตารางบนมือถือ 390px ต้องไม่ดันหน้าให้ scroll แนวนอน
- dark mode: ช่องกรอก/ตัวเลือกต้องไม่เป็นขาวบนขาว
- หน้าพิมพ์ PDF ต้องไม่ติด sidebar หรือพื้นเทา
- ปุ่ม/ลิงก์ที่เดิมมี `aria-label` และ `id` ต้องไม่หลุด

---

### Task 1: Design tokens + utility classes

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces (CSS vars): `--canvas --surface --line --ink --body --muted --brand --brand-soft --budget-subsidy --budget-innovation --budget-dev --budget-other` (light ที่ `:root`, dark ที่ `.dark`)
- Produces (Tailwind colors): `canvas surface line ink body muted brand brandSoft`
- Produces (utility classes): `.card`, `.card-title`, `.stat-value`, `.stat-label`, `.table-base`, `.chip`, `.btn-primary`, `.btn-ghost`, `.progress-track`, `.progress-fill`

- [ ] **Step 1:** เพิ่ม vars ใน `:root` และ `.dark` ตามค่าที่ระบุใน spec
- [ ] **Step 2:** extend colors ใน `tailwind.config.ts` เป็น `var(--…)`
- [ ] **Step 3:** เพิ่ม `@layer components` utility ตามรายการ (การ์ดขอบ 1px `--line`, มุม 8px, เงา `0 1px 2px rgba(15,27,45,.05)`; `stat-value` ใช้ `font-variant-numeric: tabular-nums`)
- [ ] **Step 4:** ตรวจ `npx tsc --noEmit` ผ่าน และเปิด `/login` ยังไม่พัง
- [ ] **Step 5:** Commit

### Task 2: App shell (sidebar + mobile drawer)

**Files:**
- Modify: `src/components/Navbar.tsx` (โครง render ใหม่, คง state/modal เดิม)
- Modify: `src/app/layout.tsx` (โครง flex: sidebar + main)

**Interfaces:**
- Produces: `Navbar` ยัง export default เดิม, รับ props เดิม (ไม่มี)
- Produces: layout ใช้ `<div className="flex min-h-screen"><Navbar /><div className="flex-1 …">{children}</div></div>`

- [ ] **Step 1:** ทำ sidebar 248px: โลโก้+ชื่อระบบ, เมนู 2 กลุ่ม, ล่างเป็นปีงบ/โหมด/ออกจากระบบ (ย้ายจาก top bar เดิม)
- [ ] **Step 2:** เพิ่ม mobile top bar 56px + ลิ้นชัก (state `mobileOpen`), ปุ่มเปิด/ปิด, ปิดเมื่อคลิกเมนู
- [ ] **Step 3:** `print:hidden` ที่ shell ทั้งก้อน, main กว้างสุด 1200px
- [ ] **Step 4:** ตรวจ 4 หน้า + มือถือ 390px ไม่มี scroll แนวนอน
- [ ] **Step 5:** Commit

### Task 3: Dashboard

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/DashboardCharts.tsx`

**Interfaces:**
- Consumes: utility classes จาก Task 1
- Produces: ไม่มี export ใหม่

- [ ] **Step 1:** การ์ดสรุป 3 ใบ (ได้รับจัดสรร/ใช้ไป/คงเหลือ) ด้วย `.card` + `.stat-value`
- [ ] **Step 2:** กราฟ: กริด/แกน/tooltip ตาม spec, แท่งสีตามหมวด, ไม่มี animation ยาว
- [ ] **Step 3:** การ์ดรายฝ่ายใช้ `.progress-track`/`.progress-fill` แท่งแบน
- [ ] **Step 4:** ตรวจ desktop + 390px + dark mode
- [ ] **Step 5:** Commit

### Task 4: Projects

**Files:**
- Modify: `src/app/projects/page.tsx`

- [ ] **Step 1:** ตัวกรองเป็นแถบ segmented แบบเรียบ, ช่องค้นหาขอบตาม token
- [ ] **Step 2:** การ์ดกิจกรรม/โครงการใช้ `.card`, ป้ายงบใช้ `.chip` + สี `--budget-*`
- [ ] **Step 3:** ตารางค่าใช้จ่ายใช้ `.table-base` ตัวเลขชิดขวา
- [ ] **Step 4:** ตรวจ desktop + 390px
- [ ] **Step 5:** Commit

### Task 5: Reports

**Files:**
- Modify: `src/app/reports/page.tsx`
- Modify: `src/app/globals.css` (ลบ/ปรับ `.dark .reports-scope` ที่ซ้ำกับ token ใหม่)

- [ ] **Step 1:** section header ใช้ `.card-title`, ช่องกรอกใช้ token
- [ ] **Step 2:** ตารางประเมิน/รายการรายงานใช้ `.table-base` + `.chip`
- [ ] **Step 3:** ลบ override `.reports-scope` ส่วนที่ token ใหม่ครอบแล้ว เหลือเท่าที่จำเป็น
- [ ] **Step 4:** ตรวจ: ฟอร์มกรอกได้, validation ยังขึ้น, dark mode อ่านได้, preview PDF ยังขาว A4
- [ ] **Step 5:** Commit

### Task 6: Documents

**Files:**
- Modify: `src/app/documents/page.tsx`

- [ ] **Step 1:** การ์ดไฟล์/ตารางใช้ `.card` + `.table-base`
- [ ] **Step 2:** ตรวจ desktop + 390px + dark mode
- [ ] **Step 3:** Commit

### Task 7: Login

**Files:**
- Modify: `src/app/login/page.tsx`

- [ ] **Step 1:** การ์ดกลางจอ ขอบบาง ไม่มีเงาฟุ้ง, ตราโรงเรียนคงเดิม, ปุ่มหลัก `brand`
- [ ] **Step 2:** ตรวจ: ล็อกอินสำเร็จ, ข้อความ error อ่านได้, dark mode
- [ ] **Step 3:** Commit

### Task 8: Final verification

- [ ] **Step 1:** `npx tsc --noEmit` และ `npx next build` ผ่าน
- [ ] **Step 2:** ถ่ายภาพ 1440px: `/`, `/projects`, `/reports`, `/documents`, `/login` (light + dark)
- [ ] **Step 3:** ถ่ายภาพ 390px ทุกหน้า + เปิด/ปิดลิ้นชัก
- [ ] **Step 4:** เปิด `/reports` → ดูตัวอย่าง/พิมพ์ PDF: กระดาษขาว A4, ไม่มี sidebar
- [ ] **Step 5:** เทียบ `GET /api/data` ก่อน/หลัง: จำนวน activities/reports เท่าเดิม
- [ ] **Step 6:** Commit
