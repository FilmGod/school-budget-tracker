# Implementation Plan: Fluid Motion, Fast Page Transitions, and Mobile/Tablet Responsiveness

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the School Budget Tracker website into a lively, fluid, modern web experience with snappy page transitions, animated number counters, smooth shimmer progress bars, micro-interactions, and fully responsive layouts across mobile phones, tablets, and desktops, keeping performance at 60 FPS without lag.

**Architecture:** 
1. Use GPU-accelerated CSS keyframes and Tailwind utility classes for high-performance zero-overhead micro-interactions and transitions.
2. Implement a snappy page-transition wrapper in `src/app/template.tsx` (Next.js 14 native per-route template) with ease-out cubic-bezier curves (220ms, instant and fluid, no frustrating wait times).
3. Create a lightweight `AnimatedCounter` component using `requestAnimationFrame` and ease-out expo curve for numbers to roll up smoothly on mount.
4. Enhance `DashboardCharts`, budget cards, and project badges with pulsing status indicators and shimmer progress bars.
5. Upgrade all pages (`/`, `/projects`, `/reports`, `/documents`), Navbar, and Modals to be 100% responsive on phones (<640px) and tablets (640-1024px).

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind CSS, Lucide React, Recharts.

---

## Tasks

- [ ] Task 1: CSS Animation Keyframes & Performance Tokens in `globals.css`
  - Add `@keyframes pageEnter`, `@keyframes shimmer`, `@keyframes subtlePulse`
  - Add utility classes `.animate-page-enter`, `.animate-shimmer`
  - Ensure `@media print` disables all animations and transitions (`animation: none !important; transition: none !important;`)

- [ ] Task 2: Fast Snappy Page Transition in `src/app/template.tsx`
  - Create `src/app/template.tsx` using `animate-page-enter` with 220ms duration and smooth GPU acceleration
  - Ensure zero layout shift and immediate responsiveness

- [ ] Task 3: Animated Number Counter Component
  - Create `src/components/AnimatedCounter.tsx` supporting integer and decimal formatting with Thai/Arabic locale formatting
  - Replace static numbers on Dashboard overview cards with `AnimatedCounter`

- [ ] Task 4: Interactive Micro-interactions, Shimmer Progress, & Pulsing Status
  - Add hover elevation and soft glow to all budget cards and action cards (`hover:-translate-y-1 hover:shadow-md transition-all duration-200`)
  - Add active tap bounce (`active:scale-[0.98]`) to buttons
  - Add animated shimmer layer to budget progress bars
  - Add pulsing dots (`animate-ping` / `animate-pulse`) to active/completed statuses

- [ ] Task 5: Mobile & Tablet Responsiveness Optimization across All Pages
  - **Navbar**: Optimize logo, text wrapping, and horizontal scroll nav pills for phones (360px+) and tablets
  - **Dashboard (`/`)**: 1 col on mobile (<640px), 2 cols on tablet/desktop, touch-friendly tap targets
  - **Projects (`/projects`)**: Stack search and filters on mobile, horizontal scroll wrapper for data tables, touch-optimized action buttons
  - **Reports (`/reports`)**: Responsive selector and clean mobile preview container
  - **Documents (`/documents`)**: Grid 1 col on mobile, 2 cols on tablet, 3 on desktop
  - **Modals**: Full viewport height / scrollable on mobile with safe-area padding

- [ ] Task 6: Verification & Quality Assurance Audit
  - Verify with `npx tsc --noEmit`
  - Verify dev server HTTP 200 on all pages
  - Run QA auditor subagent across mobile viewport, tablet viewport, and desktop
