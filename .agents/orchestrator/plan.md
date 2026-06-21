# Project Plan: Tool Detail Page Integration

This plan details the steps required to build and integrate the Tool Detail Page for the Ban Content project.

## Milestones and Steps

### Milestone 1: E2E Test Suite Extension (E2E Track)
- [ ] Step 1.1: Define selector contracts for the Tool Detail Page in `TEST_INFRA.md`.
- [ ] Step 1.2: Design at least 15 new test cases (Tier 1: Feature Coverage, Tier 2: Edge Cases, Tier 3: Navigation combination, Tier 4: E2E user flow).
- [ ] Step 1.3: Extend E2E test suite by creating a new spec file `e2e/tools.spec.ts` or modifying `e2e/app.spec.ts`.
- [ ] Step 1.4: Run the test suite (expecting new tests to fail initially).

### Milestone 2: Shared Data Store implementation
- [ ] Step 2.1: Define tools data schema and create `data/tools.ts`.
- [ ] Step 2.2: Populate `data/tools.ts` with detailed information for `ban-content` and `healing-bird` tools.

### Milestone 3: Dynamic Routing and Detail Page UI
- [ ] Step 3.1: Implement dynamic route folder and page: `app/tools/[id]/page.tsx`.
- [ ] Step 3.2: Style the page with the Glassmorphism Dark Theme, matching existing headers/footers.
- [ ] Step 3.3: Implement fallback/not-found logic for non-existing ids.

### Milestone 4: Homepage Navigation Integration
- [ ] Step 4.1: Modify `app/page.tsx` to read from the shared data store if needed or hardcode links to `/tools/ban-content` and `/tools/healing-bird`.
- [ ] Step 4.2: Update the Carousel "Xem Chi Tiết" button to navigate to the current product's detail page.
- [ ] Step 4.3: Update the right column "Hot Tools" cards to link to their detail pages.

### Milestone 5: Verification & Integrity Audit
- [ ] Step 5.1: Build the Next.js static site using `npm run build`.
- [ ] Step 5.2: Run the full E2E test suite.
- [ ] Step 5.3: Run the Forensic Integrity Audit.
