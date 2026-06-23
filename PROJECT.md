# Project: Advanced Reporting Dashboard

## Architecture
- **Tech Stack**: Next.js (App Router), React, Tailwind CSS, Lucide icons, Recharts for data visualization.
- **Database (Firebase Firestore)**:
  - `users`: Track user growth via `createdAt`.
  - `orders`: Calculate product purchases/revenue via `status == 'COMPLETED'`, `items` (for product names/rankings), and `createdAt`.
  - `transactions`: Calculate wallet top-ups/deposits via `status == 'SUCCESS'` and `createdAt`. Also calculate success vs failure rates from transaction status.
  - `products`: Fetch product catalogs if needed to resolve display names, though order items contain names.
- **Routing**: Integrated into `/admin` page (`app/admin/page.tsx`), maintaining original layout and security guards.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Dependency Setup | Install `recharts` package, configure and verify compilation | None | DONE |
| 2 | Frontend Implementation | Update `app/admin/page.tsx` to query data, apply time-range filters, and render Recharts visual components | M1 | DONE |
| 3 | Verification & Auditing | Run E2E test suite, perform integrity audit with Forensic Auditor | M2 | DONE |

## Code Layout
- `package.json` - Target for dependency updates.
- `app/admin/page.tsx` - Admin overview dashboard.

## Interface Contracts
- **Time Filter Boundaries** (relative to the current system time):
  - Today (Hôm nay): >= start of today (00:00:00 local)
  - This Week (Tuần này): >= start of current week (Monday 00:00:00 local)
  - This Month (Tháng này): >= start of current month (1st of month 00:00:00 local)
  - This Year (Năm nay): >= start of current year (Jan 1st 00:00:00 local)
- **Data Schemas**:
  - `Order.createdAt`, `User.createdAt`, `Transaction.createdAt` must be parsed safely using standard date parsing utility supporting Firestore Timestamp and strings.
