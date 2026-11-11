# Implementation Plan: Smooth Slide Page Transitions & Teacher User Preferences (Dark Mode, Font Sizing, Motion Settings)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide a smooth slide-in page transition between views, and introduce a user-friendly "Settings & Preferences" system accessible via a gear icon in the Navbar so individual teachers can customize Dark Mode (gentle slate/navy dark tone, never pure black #000), font size (Standard / Comfortable / Large), and motion levels, saving their choices persistently in `localStorage`.

**Architecture:**
1. **Preferences Context & Persistence**:
   - Create `src/context/PreferencesContext.tsx` managing:
     - `theme`: `'light'` | `'dark'` | `'system'` (Dark mode uses `#0f172a` slate-900 / navy base, soft borders `#334155`, avoiding pure black for eye comfort)
     - `fontSize`: `'compact'` (16px) | `'standard'` (18px) | `'comfortable'` (19.2px) | `'large'` (21px)
     - `reducedMotion`: boolean (allows turning off animations for accessibility)
   - Store choices in `localStorage` under key `school_budget_user_prefs`
   - Apply `.dark` class and `data-font-size` on `<html>` / `<body>` dynamically
2. **Smooth Slide Page Transition**:
   - Update `globals.css` with `@keyframes pageSlideEnter`:
     - `transform: translateX(12px); opacity: 0;` to `translateX(0); opacity: 1;` with snappy 250ms cubic-bezier curve
     - Zero lag, GPU-accelerated with `will-change: transform, opacity`
   - In `@media print`, dissolve containing blocks with `display: contents !important;`
3. **Settings Modal (`src/components/SettingsModal.tsx`)**:
   - Clean, elegant modal opened from a Gear icon in Navbar
   - Preview toggles:
     - Theme selector: Light (ดั้งเดิม) vs Soft Dark (โหมดมืดสบายตา)
     - Font size radio/stepper: เล็ก (16px) / ปกติ (18px) / สบายตา (19.2px) / ใหญ่ (21px)
     - Animation toggle: เปิด/ปิดการเคลื่อนไหว
4. **Dark Mode Styling Support**:
   - Add Tailwind `dark:` variants across Navbar, Dashboard cards, Projects list, Document cards, and modals
   - Dark palette:
     - Background: `dark:bg-[#0f172a]` (Slate 900)
     - Cards: `dark:bg-[#1e293b]` (Slate 800) with `dark:border-slate-700/80`
     - Text: `dark:text-slate-100` and `dark:text-slate-400`
   - **Crucial:** In `@media print`, lock strictly to `#ffffff` and text `#000000` with 16px scale, guaranteeing 100% compliance with government A4 single-page rules.

---

## Tasks

- [ ] Task 1: Create `PreferencesContext` and Hook
  - State: `theme`, `fontSize`, `reducedMotion`
  - Hydrate from `localStorage` on mount
  - Apply classes to `document.documentElement`
  
- [ ] Task 2: Smooth Slide Transition Keyframes & CSS Updates
  - Update `globals.css` with `@keyframes pageSlideEnter`
  - Update `src/app/template.tsx` to use the slide transition
  - Add dark mode color tokens & root variables

- [ ] Task 3: Build Settings Modal Component
  - Create `src/components/SettingsModal.tsx`
  - Add Settings Gear button to `src/components/Navbar.tsx`

- [ ] Task 4: Dark Mode Styling Coverage across Core Components
  - Update `Navbar.tsx`
  - Update `src/app/page.tsx` (Dashboard)
  - Update `DashboardCharts.tsx`
  - Update `src/app/projects/page.tsx`
  - Update `src/app/documents/page.tsx`

- [ ] Task 5: Print Mode Safety Lock
  - Ensure `@media print` forces pure white background and standard text colors regardless of user dark mode preference

- [ ] Task 6: Quality Assurance Audit
  - Verify with `npx tsc --noEmit`
  - Test all routes on localhost:3000
  - Run QA auditor subagent across theme switches, font scaling, and print rendering
