# Scope: Admin Dashboard Milestone

## Architecture
- **Routing**: Next.js App Router.
  - Guarded root layout: `app/admin/layout.tsx`
  - Base dashboard page: `app/admin/page.tsx`
  - Products CRUD page: `app/admin/products/page.tsx`
  - Transactions history page: `app/admin/orders/page.tsx`
  - Users management page: `app/admin/users/page.tsx`
- **Security**: 
  - Admin Guard checks `userData?.role === 'admin'`. Redirects normal users using `useRouter` to `/`.
  - Shows warning / loading spinner while auth state is loading.
- **UI Design**:
  - Dark glassmorphism style (`#0B0510` background, purple/cyan glows, glass panels with `backdrop-blur`, neon-colored charts/badges).
  - Sticky sidebar with navigation links (`Dashboard`, `Products`, `Orders`, `Users`).
- **Database (Firestore & Storage)**:
  - Users: `users` collection. Field `role: "admin" | "user"`.
  - Products: `products` collection. Fields: `id` (slug), `name`, `description`, `price` (number or text), `image` (Storage URL).
  - Orders: `orders` collection (purchases). Top-ups: `transactions` collection.
  - Storage: Tải ảnh lên Firebase Storage dưới đường dẫn `products/{timestamp}_{fileName}`.

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Admin Guard & Layout | Setup `app/admin/layout.tsx`, check auth role, protect route, update `components/Header.tsx` with admin button. | None | PLANNED |
| M2 | Dashboard UI & Stats | Build `/admin` dashboard overview, sidebar, total users count, total revenue calculation (completed purchases & top-ups). | M1 | PLANNED |
| M3 | Product CRUD | Build `/admin/products` CRUD panel. Implement product creation, editing, deleting, image upload to Firebase Storage, and listing. | M2 | PLANNED |
| M4 | Orders & User List | Build `/admin/orders` transactions list. Build `/admin/users` user list with "Cấp quyền Admin" toggle action. | M2 | PLANNED |
| M5 | E2E Verification & Audits | Write Playwright tests in `e2e/admin.spec.ts`. Run verification, test coverage hardening, and Forensic Auditor verification. | M3, M4 | PLANNED |

## Interface Contracts
- **AuthContext**: `userData` contains `role: "admin" | "user"`.
- **Firebase storage**: Init storage instance using `getStorage(app)` in `lib/firebase.ts` and export it.
- **Firestore Users collection**: doc path `users/{uid}`, schema contains `{ role: "admin" | "user" }`.
- **Firestore Products collection**: schema `{ name: string, description: string, price: number, image: string, createdAt: string }`.
