# Tool Detail Page E2E Testing Strategy (Milestone 1)

This document provides a comprehensive E2E testing strategy and specifications for the new **Tool Detail Page (`/tools/[id]`)** for the Ban Content application. It covers selector contracts, test case specifications categorized by testing tiers, and integration guidelines.

---

## 1. Technical Context & Constraints

### 1.1 Next.js Static Export (`output: 'export'`)
The application is configured to run as a static export (`next.config.js` sets `output: 'export'`). This introduces specific constraints and requirements:
- **`generateStaticParams` Requirement**: For dynamic routing `/tools/[id]` to be exported successfully at build time, `app/tools/[id]/page.tsx` must export a `generateStaticParams` function that returns the list of valid IDs (at least `[{ id: 'ban-content' }, { id: 'healing-bird' }]`).
- **Dynamic Routing Fallback**: Since it is a static build, the server (`http-server` serving `out/`) cannot generate pages on demand at runtime. When navigating to `/tools/khong-ton-tai`, the web server will return a 404. We must ensure the app provides a static `404.tsx` (which exports as `404.html`) and/or handles empty/invalid states gracefully when dynamic parameters are loaded, using Next.js's standard `notFound()` mechanism.

### 1.2 Data Store Configuration
The tool detail pages should read from a shared data store `data/tools.ts`. To ensure test stability, the store must expose typed objects containing titles, descriptions, features, pricing, images, and additional information (How to Use steps and FAQs).

---

## 2. Selector Contracts (`data-testid`)

To ensure robust, decoupled, and maintainable E2E selectors, the implementation of components must adhere to the following selector contracts:

### 2.1 Navigation & Breadcrumbs
- `data-testid="breadcrumb"`: Container element for the breadcrumb navigation.
- `data-testid="breadcrumb-home"`: Link pointing to home (`/`).
- `data-testid="breadcrumb-tools"`: Link/text element representing the tools segment.
- `data-testid="breadcrumb-current"`: Text element representing the current tool name.

### 2.2 Main Information Block
- `data-testid="tool-detail-container"`: Top-level wrapper for the detail page.
- `data-testid="tool-main-info"`: Wrapper containing title, description, features, price, and CTA.
- `data-testid="tool-media-container"`: Media wrapper (showing image and/or video).
- `data-testid="tool-image"`: The showcase image tag.
- `data-testid="tool-video"`: The showcase video tag (if present).
- `data-testid="tool-title"`: The main heading element for the tool name.
- `data-testid="tool-tag"`: Small tag element (e.g. "AI Tool", "Automation").
- `data-testid="tool-description"`: Description paragraph.
- `data-testid="tool-features-list"`: Unordered list of features.
- `data-testid="tool-feature-item"`: List item containing a specific feature of the tool.
- `data-testid="tool-price"`: Pricing details text element.
- `data-testid="tool-cta"`: Call-to-action button (e.g. "Mua Ngay" / "Kích Hoạt").

### 2.3 Additional Information Blocks
- `data-testid="tool-how-to-use"`: Hướng dẫn sử dụng section wrapper.
- `data-testid="tool-how-to-use-step"`: An individual step in the instructions list.
- `data-testid="tool-faq"`: Câu hỏi thường gặp section wrapper.
- `data-testid="tool-faq-item"`: An individual FAQ item (wrapper for Q&A).
- `data-testid="tool-faq-question"`: The clickable FAQ question text.
- `data-testid="tool-faq-answer"`: The collapsible/expandable FAQ answer text.

### 2.4 Fallback / Not Found
- `data-testid="not-found-container"`: Error/404 container.
- `data-testid="not-found-back-home"`: Link button to return back to home page.

### 2.5 Home Page Integration
- `data-testid="carousel-view-details"`: The "Xem Chi Tiết →" button in the carousel (points to current tool).
- `data-testid="hot-tool-ban-content"`: Hot Tool card for Ban Content in the right sidebar.
- `data-testid="hot-tool-healing-bird"`: Hot Tool card for Healing Bird in the right sidebar.

---

## 3. Playwright E2E Test Suite Specification

### Tier 1: Feature Coverage (5 tests per feature area)

#### Feature Area 1: UI Layout (Glassmorphism Dark Mode)
- **TD-T1-1: Verify Glassmorphic page background color**
  - *Action*: Navigate to `/tools/ban-content`.
  - *Check*: Page body has dark styling: `background-color` has RGB values each `< 30` (e.g. zinc-950).
- **TD-T1-2: Verify Glassmorphic card styling classes**
  - *Action*: Locate `[data-testid="tool-detail-container"]` and primary cards.
  - *Check*: CSS class list contains `backdrop-blur`, `border-zinc-800`, and translucent background styling (e.g. `bg-zinc-950/80` or similar).
- **TD-T1-3: Verify no horizontal overflow in desktop**
  - *Action*: Load `/tools/ban-content` at viewport `1280x800`.
  - *Check*: Document body `overflowX` style is `hidden` or document doesn't trigger scrollbar width.
- **TD-T1-4: Verify layout elements display order**
  - *Action*: Locate main sections on `/tools/ban-content`.
  - *Check*: Header, Breadcrumb, Main Info, Additional Info, and Footer are all visible and ordered correctly.
- **TD-T1-5: Verify responsive container width**
  - *Action*: Load `/tools/ban-content`.
  - *Check*: Main content container is centered and limited in width (e.g. `max-w-7xl`).

#### Feature Area 2: Breadcrumb / Header
- **TD-T1-6: Verify Header is visible on detail page**
  - *Action*: Navigate to `/tools/ban-content`.
  - *Check*: `[data-testid="header"]` is visible.
- **TD-T1-7: Verify Breadcrumb structure**
  - *Action*: Navigate to `/tools/ban-content`.
  - *Check*: `[data-testid="breadcrumb"]` contains elements `[data-testid="breadcrumb-home"]`, `[data-testid="breadcrumb-tools"]`, and `[data-testid="breadcrumb-current"]`.
- **TD-T1-8: Verify Breadcrumb home navigation**
  - *Action*: Navigate to `/tools/ban-content`, click `[data-testid="breadcrumb-home"]`.
  - *Check*: URL changes to `/` (home page).
- **TD-T1-9: Verify Breadcrumb current node text**
  - *Action*: Navigate to `/tools/ban-content`.
  - *Check*: `[data-testid="breadcrumb-current"]` contains text matching the tool's name (e.g., "Ban Content").
- **TD-T1-10: Verify Breadcrumb tools node text**
  - *Action*: Navigate to `/tools/ban-content`.
  - *Check*: `[data-testid="breadcrumb-tools"]` displays text representing the category or section (e.g., "Công cụ" or "Tools").

#### Feature Area 3: Main Info Block
- **TD-T1-11: Verify showcase media is visible**
  - *Action*: Navigate to `/tools/ban-content`.
  - *Check*: `[data-testid="tool-media-container"]` contains either `[data-testid="tool-image"]` or `[data-testid="tool-video"]`.
- **TD-T1-12: Verify title, tag, and description match data store**
  - *Action*: Load `/tools/ban-content`.
  - *Check*: `[data-testid="tool-title"]` matches "Ban Content", `[data-testid="tool-tag"]` is visible, and description text is non-empty.
- **TD-T1-13: Verify features list exists and has items**
  - *Action*: Load `/tools/ban-content`.
  - *Check*: `[data-testid="tool-features-list"]` has at least 3 children matching `[data-testid="tool-feature-item"]`.
- **TD-T1-14: Verify price displays correctly**
  - *Action*: Load `/tools/ban-content`.
  - *Check*: `[data-testid="tool-price"]` contains the correct price formatting (e.g., "499,000đ/tháng").
- **TD-T1-15: Verify CTA button is visible and active**
  - *Action*: Load `/tools/ban-content`.
  - *Check*: `[data-testid="tool-cta"]` is visible and `isEnabled()` is true.

#### Feature Area 4: Additional Info Blocks
- **TD-T1-16: Verify How to Use section existence**
  - *Action*: Navigate to `/tools/ban-content`.
  - *Check*: `[data-testid="tool-how-to-use"]` is visible.
- **TD-T1-17: Verify How to Use steps count**
  - *Action*: Navigate to `/tools/ban-content`.
  - *Check*: Count of `[data-testid="tool-how-to-use-step"]` is greater than or equal to 3.
- **TD-T1-18: Verify FAQ section existence**
  - *Action*: Navigate to `/tools/ban-content`.
  - *Check*: `[data-testid="tool-faq"]` is visible.
- **TD-T1-19: Verify FAQ items text**
  - *Action*: Locate `[data-testid="tool-faq-item"]` elements.
  - *Check*: Each FAQ item contains non-empty elements for both question and answer.
- **TD-T1-20: Verify FAQ interactive expansion**
  - *Action*: If FAQs are collapsible, click `[data-testid="tool-faq-question"]` on the first item.
  - *Check*: The corresponding `[data-testid="tool-faq-answer"]` transitions to visible/active state.

#### Feature Area 5: Dynamic Route Loading
- **TD-T1-21: Load Ban Content page directly**
  - *Action*: Direct navigation to `/tools/ban-content`.
  - *Check*: Response status is OK and page renders tool detail for Ban Content.
- **TD-T1-22: Load Healing Bird page directly**
  - *Action*: Direct navigation to `/tools/healing-bird`.
  - *Check*: Page loads successfully and displays the Healing Bird tool title and image.
- **TD-T1-23: Verify document page title update**
  - *Action*: Navigate to `/tools/ban-content`.
  - *Check*: Page `<title>` contains "Ban Content".
- **TD-T1-24: Verify state updates correctly when switching tools**
  - *Action*: Load `/tools/ban-content`, then click a link pointing to `/tools/healing-bird`.
  - *Check*: Content dynamically shifts to Healing Bird data without caching issues.
- **TD-T1-25: Verify Footer is visible on detail page**
  - *Action*: Navigate to `/tools/healing-bird`.
  - *Check*: `[data-testid="footer"]` is visible.

---

### Tier 2: Boundary & Edge Cases

- **TD-T2-1: Invalid ID Fallback**
  - *Scenario*: User navigates to `/tools/khong-ton-tai` directly.
  - *Check*: The page handles the invalid ID gracefully, displaying `[data-testid="not-found-container"]` with a friendly error message and a back-to-home button (`[data-testid="not-found-back-home"]`).
- **TD-T2-2: Mobile Viewport Responsiveness**
  - *Scenario*: Set viewport size to `375x667` (mobile), load `/tools/ban-content`.
  - *Check*: Main layout adapts vertically; media wrapper and details stack; CTA button remains fully visible and clickable without horizontal overflow.
- **TD-T2-3: Long Strings Handling**
  - *Scenario*: Mock a tool record in the data store containing extremely long text values (e.g., 200-character title, 1000-character description).
  - *Check*: Verify that the layout does not break, text wraps correctly, and buttons do not get pushed off the screen.
- **TD-T2-4: Missing Optional Fields Handling**
  - *Scenario*: Mock a tool record with missing optional fields (e.g., no `video` link, empty `faq` array, or no `howToUse` steps).
  - *Check*: The page renders successfully. The missing sections (like FAQ or Video Player) are omitted from the DOM/UI, and no runtime JS errors are thrown.
- **TD-T2-5: Query Parameter Sanitization & Fallback on CTA**
  - *Scenario*: Load `/tools/ban-content?promo=<script>alert('xss')</script>`.
  - *Check*: Verify that no script gets executed, parameters are handled safely, and the CTA button's destination is generated securely.

---

### Tier 3: Cross-Feature Combinations

- **TD-T3-1: Navigation Loop (Home -> Detail -> Hub -> Home)**
  - *Scenario*:
    1. Start at `/`.
    2. Click the Carousel's "Xem Chi Tiết" button (navigates to `/tools/ban-content`).
    3. Click the CTA button (redirects to `/hub?plan=vip`).
    4. Click the "Đăng xuất" or "Home" button in the Hub (navigates back to `/`).
  - *Check*: URLs transition correctly at each step, and states are correctly retained.
- **TD-T3-2: Theme and Asset Continuity**
  - *Scenario*: Load home page, capture body background color, then navigate to `/tools/ban-content` and `/hub`.
  - *Check*: Background color remains consistent across pages, confirming consistent application of dark mode/glassmorphism design system.
- **TD-T3-3: CTA Plan Redirect with Query Params**
  - *Scenario*: Navigate to `/tools/ban-content` and check CTA link. Do the same for `/tools/healing-bird`.
  - *Check*: CTA links redirect to `/hub` with plan-specific parameters matching the tool (e.g. `/hub?plan=vip` for Ban Content, `/hub?plan=ultimate` for Healing Bird).

---

### Tier 4: Real-World Application Scenarios

- **TD-T4-1: User Exploration Journey**
  - *Scenario*:
    1. User lands on `/` and scrolls to explore the products.
    2. User views the second item in the product carousel (Healing Bird).
    3. User clicks "Xem Chi Tiết" on the Carousel.
    4. User arrives at `/tools/healing-bird`, reads the features, and scrolls down to read the "How to Use" guide and FAQs.
    5. User decides to proceed and clicks the CTA button.
    6. User is redirected to `/hub?plan=ultimate` (the subscription dashboard matching Healing Bird).
  - *Check*: The browser reaches each step successfully, all relevant content matches the `healing-bird` record, and the onboarding hub correctly reflects the activated tier.

---

## 4. Implementation Recommendations for Developer

To ensure the new page conforms to this testing strategy:
1. **Dynamic Routing Setup**:
   Ensure `app/tools/[id]/page.tsx` implements:
   ```typescript
   export async function generateStaticParams() {
     return [
       { id: 'ban-content' },
       { id: 'healing-bird' }
     ];
   }
   ```
2. **Layout Integration**:
   - In `app/page.tsx` (Carousel), wrap the "Xem Chi Tiết" button with:
     ```typescript
     <Link href={`/tools/${currentSlide === 0 ? 'ban-content' : 'healing-bird'}`} data-testid="carousel-view-details">
       <button ...>Xem Chi Tiết →</button>
     </Link>
     ```
   - In the right column, update/wrap the cards with links and apply `data-testid="hot-tool-ban-content"` and `data-testid="hot-tool-healing-bird"`.
3. **Data Model**:
   Define a structured interface in `data/tools.ts`:
   ```typescript
   export interface Tool {
     id: string;
     title: string;
     tag: string;
     description: string;
     price: string;
     image: string;
     video?: string;
     features: Array<{ bold: string; text: string }>;
     howToUse: string[];
     faq: Array<{ question: string; answer: string }>;
   }
   ```
