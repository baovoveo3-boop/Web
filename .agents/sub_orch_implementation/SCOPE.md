# Scope: System Settings, Products Form Upgrade, and Public Download Page

## Architecture
- **Tech Stack**: Next.js (App Router), React, Tailwind CSS, Lucide icons, Firebase Firestore.
- **Database (Firebase Firestore)**:
  - `settings/general`: Holds the global configurations for the App Launcher (`version`, `download_url`, `force_update`).
  - `products`: Product catalog document schema includes `howToUse` and `features` fields.
- **Routing**:
  - `/admin/settings` - Admin System Settings configuration form (R1).
  - `/download` - Public page to download the App Launcher (R3).
- **Navigation**:
  - `components/Header.tsx` - Updated to include a link to the `/download` page (R3).
  - `app/admin/products/page.tsx` - Upgraded with Up/Down buttons for ordering arrays, and autofill logic for Step 1 from `settings/general` `download_url` on product creation (R2).

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|---|---|---|---|---|
| 2 | Admin System Settings (R1) | Create `/admin/settings/page.tsx`, link sidebar navigation in `/admin/layout.tsx`, save settings to `settings/general` Firestore, auto-convert Google Drive URLs on save | None | DONE | 93393d3b-910b-4ac8-8ccf-ed85b8f08d25, 0a058dc3-4e04-426f-8f05-55891a9ae8fd, 2ef1a42f-c5aa-4ccc-80a6-f32d058e5ba5, 95efbd3a-72cf-437a-9901-d11243c73e7e |
| 3 | Product Form Upgrade (R2) | Add Up/Down buttons next to lists in `app/admin/products/page.tsx` for reordering; retrieve download URL from settings to autofill Step 1 when creating a product | M2 | DONE | 5a06415c-1489-4641-a863-0af0b2e2df2c, 4e859390-76e3-4453-b20f-44c2b6d53cef, 75e8d33b-4c9f-4d8e-9467-d7453e09df20, e338eca1-6784-42cc-9822-9f48645e162f |
| 4 | Public Download Page & Navbar (R3) | Create `/download/page.tsx` reading launcher URL from Firestore, add "Download" tab to Header navigation | M2 | DONE | da98ae8b-d811-460c-b5aa-7d7058b358ff, 277a032d-c813-43a1-ae60-90f3072b1c14, ecaab5f1-1c8b-4889-b9a6-43f5a49d465c, 5b4407be-a63c-422a-95f0-0bb3e006270c |
| 5 | E2E Verification & Audit | Run npm run build & npx playwright test e2e/settings.spec.ts, run Forensic Auditor to verify integrity | M2, M3, M4 | DONE | abd6b8dc-7c3d-4e98-b4b2-7c7b74de050d, 1a5c02b5-d199-4ac4-9b51-9669af8a7d3b |

## Interface Contracts
- **Firebase settings collection**:
  - Document path: `settings/general`
  - Fields:
    - `version`: string
    - `download_url`: string (fully converted direct download URL if Google Drive link)
    - `force_update`: boolean
- **Product Step 1 Auto-Generation**:
  - When admin creates a new product (Thêm sản phẩm mới), Step 1 of `howToUse` must default to:
    `Cài đặt App Launcher để tải và quản lý các tool. Link tải: [LINK]` where `[LINK]` is replaced by the current `download_url` from `settings/general`.
