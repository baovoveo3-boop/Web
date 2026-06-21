## 2026-06-20T11:02:45Z
You are a Worker subagent (teamwork_preview_worker).
Your working directory is: E:\Youtube\Ban Content\Web\.agents\worker_milestone_2_3_4
Your parent is: 9e0b793c-c84b-446e-be2f-5aea00a722ea

Your task is to implement the Tool Detail Page data store, dynamic route UI, and homepage integration (Milestones 2, 3, and 4).

Detailed Requirements:
1. **Shared Data Store (data/tools.ts)**:
   - Create a TypeScript file data/tools.ts.
   - Export an interface `ToolData` and an array of tools.
   - Must contain details for at least 'ban-content' and 'healing-bird'.
   - Include fields: id (slug), name, tag, titlePrefix, titleHighlight, description, price, image, features (bold, text), theme, glow, howToUse (string array), and faq (question, answer array).
   - Extract the default data from `HERO_PRODUCTS` in `app/page.tsx` for these tools.

2. **Dynamic Route (app/tools/[id]/page.tsx)**:
   - Implement dynamic routing. The page must display the details of the active tool using Next.js App Router.
   - Design the UI to strictly match the project's Glassmorphism Dark Theme (dark body background, neon violet/cyan highlights, border glows, backdrop blurs).
   - Must render: Header, Breadcrumbs (Home -> Tools -> Current), Main Info Block (Showcase image, title, tag, description, features list, price, CTA button), How to Use Guide, and FAQ Section (interactive collapsible/expandable cards).
   - The CTA button must point to the Hub page with correct query parameters (e.g., `/hub?plan=vip&billing=monthly` for Ban Content, `/hub?plan=ultimate&billing=monthly` for Healing Bird).
   - Must implement `generateStaticParams()` to support static HTML export.
   - If the tool ID is not found (e.g. `/tools/khong-ton-tai`), it must display a clean Not Found/fallback interface showing an error state and a return button.
   - Apply all data-testid selectors specified in `TEST_READY.md` (e.g. data-testid="tool-detail-container", data-testid="breadcrumb", data-testid="tool-title", etc.).

3. **Homepage Integration (app/page.tsx)**:
   - Update the Carousel's "Xem Chi Tiết" button to navigate to the currently selected product's detail page (`/tools/ban-content` or `/tools/healing-bird`). Wrap or replace it using Next.js `<Link>` with `data-testid="carousel-view-details"`.
   - Update the "Hot Tools" cards in the right column of the main section to link to their detail pages.

4. **Build Verification**:
   - Run `npm run build` to confirm the static compilation completes successfully and no Next.js build errors occur.

Write your work summary, command execution outputs, and handoff report (handoff.md) in your working directory. Notify the parent orchestrator via send_message when complete.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
