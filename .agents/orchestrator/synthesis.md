# Synthesis Report: Tool Detail Page Integration (Milestone 1)

## Consensus
- **Next.js Static Export Constraint**: Next.js is configured for static export (`output: 'export'` in `next.config.js`). Consequently, the dynamic page `app/tools/[id]/page.tsx` must export `generateStaticParams()` returning `[{ id: 'ban-content' }, { id: 'healing-bird' }]` to pre-render the pages.
- **Fallback Page Behavior**: An invalid route (e.g. `/tools/khong-ton-tai`) must resolve to a fallback or standard Next.js `notFound()` page. In static output mode, this falls back to a 404 page, which must show a back-to-home button (`data-testid="not-found-back-home"`).
- **Shared Data Store**: Create `data/tools.ts` (exporting a typed array of tools with schema) containing details for `ban-content` and `healing-bird`.
- **Homepage Integration**: Wrap homepage Carousel button ("Xem Chi Tiết") and right-column "Hot Tools" cards (like Grok Ban AI or others) in Next.js `<Link>` components pointing to `/tools/[id]`.
- **Selector Contract**: Standardize the following selectors:
  - Container: `[data-testid="tool-detail-container"]`
  - Breadcrumbs: `[data-testid="breadcrumb"]`, `[data-testid="breadcrumb-home"]`, `[data-testid="breadcrumb-tools"]`, `[data-testid="breadcrumb-current"]`
  - Media: `[data-testid="tool-media-container"]`, `[data-testid="tool-image"]`
  - Text Content: `[data-testid="tool-title"]`, `[data-testid="tool-tag"]`, `[data-testid="tool-description"]`, `[data-testid="tool-price"]`
  - Features: `[data-testid="tool-features-list"]`, `[data-testid="tool-feature-item"]`
  - CTA Button: `[data-testid="tool-cta"]` (must route to `/hub?plan=vip` for Ban Content, `/hub?plan=ultimate` for Healing Bird)
  - Guides: `[data-testid="tool-how-to-use"]`, `[data-testid="tool-how-to-use-step"]`
  - FAQ: `[data-testid="tool-faq"]`, `[data-testid="tool-faq-item"]`, `[data-testid="tool-faq-question"]`, `[data-testid="tool-faq-answer"]`
  - Fallback: `[data-testid="not-found-container"]`, `[data-testid="not-found-back-home"]`

## Resolved Conflicts
- **Test Suite Location**: Explorer 1 suggested expanding `e2e/app.spec.ts` while Explorer 2 suggested creating `e2e/tools.spec.ts`.
  * *Resolution*: We will create `e2e/tools.spec.ts` to keep the codebase modular, but ensure `playwright.config.ts` runs it seamlessly and it adopts the same tier structure.
- **Carousel Button Element**: Explorer 1 wrapped the button with `<Link>`, Explorer 3 suggested replacing the `<button>` completely with a `<Link>`.
  * *Resolution*: We will keep the button's visual design but wrap it or replace it with `<Link href="..." passHref>` and place the `data-testid` on the interactive tag.

## Dissenting Views
- None. All three explorers aligned on the core architecture and build constraints.

## Gaps
- **Video Player**: Explorer 1 recommended supporting a `video` element, but the original request only mentions "Hình ảnh/Video Demo nổi bật" without enforcing video playback.
  * *Resolution*: We will design the page to optionally support a video player but fallback to a static demo image if no video URL is provided.
- **Product Slugs**: Ensure that the slugs (`ban-content` and `healing-bird`) are lowercase and consistently handled between home page carousel indices and dynamic routing.
