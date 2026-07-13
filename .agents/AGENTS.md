# Project Scope Rules

## Firebase Database Architecture
- **System Settings:** Configurations that apply to the whole platform (e.g. PC App Launcher version and download links) are strictly stored in the `settings` collection, document `general`.
- **App Launcher Integration:** The App Launcher is treated as a system configuration, not a normal commercial product. Therefore, its download link is retrieved from `settings/general` and used to autofill the first step of "How to Use" when new products are created in the Admin dashboard.

## Code Conventions
- **TypeScript Strict Null Checks:** Always verify array lengths safely when checking optional chaining in JSX or component logic (e.g., `(product.features && product.features.length > 0)` instead of `product.features?.length > 0`), as Next.js build strict-mode will fail on the latter.

## UI Design & Consistency
- **Strict Adherence:** Never insert mockup/dummy data (e.g., random charts, generic stats like 'CPU Usage') into customer-facing dashboards. Always respect the finalized UI designs. Do not arbitrarily add or remove tabs without explicit user approval.
