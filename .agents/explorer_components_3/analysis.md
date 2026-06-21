# Tool Detail Page E2E Testing Strategy (Milestone 1)

## 1. Summary of Findings
The existing codebase is a Next.js 14 App Router project configured for static export (`output: 'export'`), meaning dynamic paths like `/tools/[id]` must implement `generateStaticParams()` to pre-render during build. E2E testing utilizes Playwright targeting `http-server` running on the compiled static `out` directory, and follows a structured 4-tier test structure (Feature Coverage, Boundary, Cross-Feature, and Real-world scenarios) that the new Tool Detail tests must integrate with.

---

## 2. Existing Codebase Analysis

### 2.1 E2E Test Suite (e.g., `e2e/app.spec.ts` & `playwright.config.ts`)
- **Execution Mechanism**: Tests run via `npm run test:e2e` (`playwright test`). The `playwright.config.ts` starts a background static server with `npx http-server out -p 3000` to serve the Next.js static output directory.
- **Strict Hierarchy**: The E2E tests are organized under four main blocks:
  - **Tier 1 (Feature Coverage)**: Simple, isolated feature checks.
  - **Tier 2 (Boundary & Corner Cases)**: Mobile viewports, extreme layouts, and invalid route handling (404/fallback check).
  - **Tier 3 (Cross-Feature Combinations)**: Multi-page navigation loops and query parameter persistence (e.g., plan selection routing to hub).
  - **Tier 4 (Real-World Application Scenarios)**: Simulated user journeys (checkout flows, multi-step explorations).
- **Selector Standards**: Tests heavily rely on `data-testid` attributes (e.g., `data-testid="header"`, `data-testid="nav-link-hub"`, etc.) for robust locator matching.

### 2.2 Homepage & Component Layout (`app/page.tsx`)
- **Carousel Structure**: The homepage features a split-layout hero carousel (`HERO_PRODUCTS` containing *Ban Content Automation* and *Healing Bird Tool*).
  - Transition state is handled via React state (`currentSlide`).
  - The "Xem Chi Tiết" button is currently a static client-side `<button>` without a link. It must be refactored into a next/link or router navigation pointing to `/tools/ban-content` or `/tools/healing-bird` based on the active slide.
- **Hot Tools List**: The right-column "Danh sách Tool Bán Chạy" currently renders hardcoded mockup items (*Grok Ban AI* and *Proxy IPv6 Generator*) wrapped in non-navigational `div` containers. These must be replaced with links pointing to `/tools/ban-content` and `/tools/healing-bird` in integration.

### 2.3 Static Export Constraints
- Because `next.config.js` sets `output: 'export'`, any dynamic route page (e.g., `app/tools/[id]/page.tsx`) **must** export a `generateStaticParams()` function.
- Without this, the build process will fail during static site generation (SSG) with an error indicating that dynamic routes cannot be exported without explicitly defined paths.

---

## 3. Proposed Shared Data Store Design

To maintain a single source of truth, a shared data store will be created at `data/tools.ts`. It will house tool metadata consumed by both the Homepage carousel/hot tools sections and the dynamic `/tools/[id]` pages.

### 3.1 Interface Definition (`data/tools.ts`)
```typescript
export interface ToolFeature {
  bold: string;
  text: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Tool {
  id: string; // Dynamic route key: 'ban-content' | 'healing-bird'
  tag: string; // Badge text: e.g. '🚀 SẢN PHẨM 1'
  titlePrefix: string;
  titleHighlight: string;
  title: string; // Standard page header title
  description: string;
  price: string; // e.g. '499,000đ'
  image: string; // Image path: '/software-box.jpg'
  features: ToolFeature[];
  theme: string; // Tailwind gradient classes: 'from-neonPurple to-neonGreen'
  glow: string; // Glow background styling class
  howToUse: string[]; // Steps for "How to Use" block
  faq: FAQItem[]; // FAQ section items
}
```

### 3.2 Mock Content Example
```typescript
export const tools: Tool[] = [
  {
    id: "ban-content",
    tag: "🚀 SẢN PHẨM 1",
    titlePrefix: "Ban Content",
    titleHighlight: "Automation",
    title: "Phần Mềm Ban Content Automation",
    description: "Giải pháp hô biến Kịch bản Text hoặc File Excel thành Video hoàn chỉnh chỉ với 1 click...",
    price: "499,000đ",
    image: "/software-box.jpg",
    features: [
      { bold: "Tích hợp All-in-one:", text: "Sinh ảnh AI, nhân bản giọng đọc (TTS) và ghép phụ đề..." }
    ],
    theme: "from-neonPurple to-neonGreen",
    glow: "bg-neonPurple/20",
    howToUse: [
      "Bước 1: Chuẩn bị file kịch bản Excel hoặc nhập text trực tiếp.",
      "Bước 2: Chọn giọng đọc AI (TTS) và cấu hình font phụ đề.",
      "Bước 3: Bấm nút 'Khởi Chạy Render' và nhận thành phẩm video."
    ],
    faq: [
      { question: "Tool có hỗ trợ render hàng loạt không?", answer: "Có, bạn có thể tải lên file excel chứa hàng trăm kịch bản." }
    ]
  },
  {
    id: "healing-bird",
    tag: "🌿 SẢN PHẨM 2",
    titlePrefix: "Healing Bird",
    titleHighlight: "Tool",
    title: "Hệ thống R&D & Render Kênh Chữa Lành",
    description: "Tự động quét đối thủ và mix hàng trăm Assets để xuất xưởng những luồng video Healing dài hàng giờ...",
    price: "599,000đ",
    image: "/software-box-2.jpg",
    features: [
      { bold: "R&D Tự Động:", text: "Quét dữ liệu các video chim chóc, thiên nhiên Top 1 thị trường..." }
    ],
    theme: "from-emerald-400 to-cyan-400",
    glow: "bg-emerald-400/20",
    howToUse: [
      "Bước 1: Nhập từ khóa hoặc link kênh đối thủ cần quét.",
      "Bước 2: Cấu hình thư mục assets chứa âm thanh nền và SFX.",
      "Bước 3: Chọn thời lượng video mong muốn và bấm 'Bắt đầu trộn'."
    ],
    faq: [
      { question: "Thời gian render trung bình là bao lâu?", answer: "Với video dài 1 tiếng, máy cấu hình trung bình mất khoảng 15-20 phút." }
    ]
  }
];
```

---

## 4. E2E Test Suite Design (Playwright-based)

To be appended to `e2e/app.spec.ts` (or separated into `e2e/tool-detail.spec.ts` depending on modularity preferences).

### 4.1 Tier 1: Feature Coverage (5 Test Cases per Sub-Feature)

#### Sub-Feature 1: UI Layout
1. **TD-T1-UI-1: Verify glassmorphism container and dark theme styles**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: Main wrapper has background class matching dark mode (e.g. `bg-zinc-950`), and details card features border styles with backdrop blur (`backdrop-blur-md`, `border-zinc-800`).
2. **TD-T1-UI-2: Verify Header visibility on detail page**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: `page.locator('[data-testid="header"]')` is visible.
3. **TD-T1-UI-3: Verify Footer visibility on detail page**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: `page.locator('[data-testid="footer"]')` is visible.
4. **TD-T1-UI-4: Verify responsive layout grid container exists**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: Layout grid `data-testid="tool-detail-container"` exists.
5. **TD-T1-UI-5: Verify ambient glow element is displayed**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: Ambient blur glow element (e.g. background glow) exists in the DOM.

#### Sub-Feature 2: Breadcrumb / Header Navigation
1. **TD-T1-BC-1: Verify Breadcrumb container is visible**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: `page.locator('[data-testid="tool-breadcrumb"]')` is visible.
2. **TD-T1-BC-2: Verify Home link exists in Breadcrumb**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: Breadcrumb has link `data-testid="tool-breadcrumb-home"` pointing to `/`.
3. **TD-T1-BC-3: Verify Current Item text in Breadcrumb matches tool title**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: `data-testid="tool-breadcrumb-current"` contains text "Ban Content".
4. **TD-T1-BC-4: Verify breadcrumb homepage redirect works**
   - *Action*: Click `data-testid="tool-breadcrumb-home"`.
   - *Assert*: URL changes to base home URL `/`.
5. **TD-T1-BC-5: Verify breadcrumb contains separation symbols**
   - *Action*: Verify children of `data-testid="tool-breadcrumb"`.
   - *Assert*: Text contents contain separator characters (e.g., `/` or `>`).

#### Sub-Feature 3: Main Info Block
1. **TD-T1-MI-1: Verify product title displays correctly**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: `data-testid="tool-detail-title"` displays "Phần Mềm Ban Content Automation".
2. **TD-T1-MI-2: Verify main product description is loaded**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: `data-testid="tool-detail-description"` is visible and contains correct text.
3. **TD-T1-MI-3: Verify pricing value is rendered properly**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: `data-testid="tool-detail-price"` contains "499,000đ".
4. **TD-T1-MI-4: Verify product mockup image/video frame is visible**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: `data-testid="tool-detail-media"` is visible and has source path containing `/software-box.jpg`.
5. **TD-T1-MI-5: Verify features bullet list matches data store**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: `data-testid="tool-detail-feature-item"` count is greater than or equal to 1, and text contains correct features.

#### Sub-Feature 4: Additional Info Blocks
1. **TD-T1-AI-1: Verify "How to use" section title exists**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: Section `data-testid="tool-detail-instructions"` is visible.
2. **TD-T1-AI-2: Verify step-by-step tutorial list contains details**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: Sub-elements `data-testid="tool-detail-step"` count is 3.
3. **TD-T1-AI-3: Verify FAQ accordion container is visible**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: FAQ container `data-testid="tool-detail-faq"` is visible.
4. **TD-T1-AI-4: Verify FAQ items show questions**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: Questions `data-testid="tool-detail-faq-question"` are visible.
5. **TD-T1-AI-5: Verify FAQ answers are accessible**
   - *Action*: Click a question `data-testid="tool-detail-faq-question"`.
   - *Assert*: Answer `data-testid="tool-detail-faq-answer"` expands and displays correct text.

#### Sub-Feature 5: Dynamic Route Loading
1. **TD-T1-DR-1: Verify `/tools/ban-content` route loads successfully**
   - *Action*: Go to `/tools/ban-content`.
   - *Assert*: Response status is 200 OK (no client-side crash).
2. **TD-T1-DR-2: Verify `/tools/healing-bird` route loads successfully**
   - *Action*: Go to `/tools/healing-bird`.
   - *Assert*: Response status is 200 OK and text contains "Healing Bird".
3. **TD-T1-DR-3: Verify route transition works via URL typing**
   - *Action*: Direct navigation from `/tools/ban-content` to `/tools/healing-bird` via script.
   - *Assert*: Page updates dynamically without full-page error.
4. **TD-T1-DR-4: Verify page meta title updates to match tool name**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: Page title contains "Ban Content Automation".
5. **TD-T1-DR-5: Verify page meta description matches tool description**
   - *Action*: Navigate to `/tools/ban-content`.
   - *Assert*: Description meta tag is injected with correct tool excerpt.

---

### 4.2 Tier 2: Boundary & Edge Cases (5 Cases)

1. **TD-T2-1: Verify invalid ID fallback handles not-found state gracefully**
   - *Action*: Navigate to `/tools/khong-ton-tai` or `/tools/12345`.
   - *Assert*: Page renders a clean "Không tìm thấy" fallback page (`data-testid="tool-not-found"`), showing a Back to Home button (`data-testid="tool-not-found-back"`) rather than a raw React crash screen.
2. **TD-T2-2: Verify viewport responsiveness on mobile screens**
   - *Action*: Set viewport size to `375`x`667`, navigate to `/tools/ban-content`.
   - *Assert*: No horizontal scrollbar appears. The main grid columns stack vertically (image on top, content text below).
3. **TD-T2-3: Verify behavior with missing optional data fields**
   - *Action*: (Mocking database condition where `faq` or `howToUse` is empty).
   - *Assert*: Sections do not render empty headers; instead, they are hidden from the layout to avoid broken whitespace.
4. **TD-T2-4: Verify layout stability with long string injections**
   - *Action*: Test with simulated data containing an extremely long title (e.g., 200 chars).
   - *Assert*: Text wraps correctly inside the glassmorphism container and does not overflow adjacent layout bounds.
5. **TD-T2-5: Verify URL-encoded special character navigation**
   - *Action*: Navigate to `/tools/ban%20content`.
   - *Assert*: Redirects to `/tools/ban-content` or falls back to not-found view gracefully.

---

### 4.3 Tier 3: Cross-Feature Cases (4 Cases)

1. **TD-T3-1: Full Homepage-to-Detail dynamic navigation loop**
   - *Action*: Go to `/`. Carousel is on Slide 1 ("Ban Content"). Click "Xem Chi Tiết" (`data-testid="carousel-view-detail"`).
   - *Assert*: URL changes to `/tools/ban-content`.
   - *Action*: Click Breadcrumb "Trang chủ" (`data-testid="tool-breadcrumb-home"`).
   - *Assert*: URL returns to `/`.
2. **TD-T3-2: Hot Tools dynamic card click navigation**
   - *Action*: Go to `/`. Click the first hot tool card (`data-testid="hot-tool-link-ban-content"`).
   - *Assert*: URL updates to `/tools/ban-content` and loads corresponding title.
3. **TD-T3-3: Purchase CTA redirect logic with Plan query mapping**
   - *Action*: Navigate to `/tools/healing-bird`, click "Mua Ngay" (`data-testid="tool-detail-cta"`).
   - *Assert*: URL redirects to `/hub?plan=healing-bird&billing=monthly` (or matches subscription onboarding parameters).
4. **TD-T3-4: Dark mode styling parity checks**
   - *Action*: Check background color and text element classes on `/` and `/tools/ban-content`.
   - *Assert*: Body background classes match (`bg-zinc-950`) ensuring smooth visual parity.

---

### 4.4 Tier 4: Real-World Scenarios (2 Cases)

1. **TD-T4-1: Standard user discovery and purchase path**
   - *Step 1*: User arrives at Homepage (`/`).
   - *Step 2*: Click Carousel next button (`data-testid="chevron-right"`) to switch to "Healing Bird".
   - *Step 3*: Click "Xem Chi Tiết" (`data-testid="carousel-view-detail"`) to enter the dynamic page.
   - *Step 4*: Scroll down to inspect the FAQ and click the first FAQ question to view details.
   - *Step 5*: Click the "Mua Ngay" CTA button (`data-testid="tool-detail-cta"`).
   - *Assert*: User successfully lands on `/hub` with subscription statistics showing "Healing Bird (Monthly)" and active state.
2. **TD-T4-2: Direct link entry, breadcrumb backtracking, and backup navigation**
   - *Step 1*: User enters via direct marketing link: `/tools/ban-content`.
   - *Step 2*: Read content, verify title and features are populated.
   - *Step 3*: Click Breadcrumb link "Trang chủ".
   - *Step 4*: On Homepage, click "Hot Tools" card for "Healing Bird".
   - *Assert*: Details load for the second tool seamlessly.

---

## 5. Selector Contracts (`data-testid`)

The following test selectors must be integrated into the page components for E2E tests to run successfully:

| Component Element | Selector Name (`data-testid`) | Target Behavior / Purpose |
| :--- | :--- | :--- |
| **Breadcrumb Nav Container** | `tool-breadcrumb` | Wraps the breadcrumb trail. |
| **Breadcrumb Home Link** | `tool-breadcrumb-home` | Anchor link routing to `/`. |
| **Breadcrumb Current Item** | `tool-breadcrumb-current` | Label containing active tool name. |
| **Page Detail Grid Wrapper** | `tool-detail-container` | Main content structural layout. |
| **Tool Title Heading** | `tool-detail-title` | Header showing specific tool name. |
| **Tool Tag Badge** | `tool-detail-tag` | Upper pill text showing category or tag. |
| **Tool Image/Video Showcase** | `tool-detail-media` | Thumbnail image / video demo container. |
| **Tool Description Paragraph** | `tool-detail-description` | Main body introduction text. |
| **Tool Features Unordered List** | `tool-detail-features` | Parent wrapper of feature items. |
| **Individual Feature Item** | `tool-detail-feature-item` | Text item inside the feature checklist. |
| **Tool Display Price** | `tool-detail-price` | Pricing string including subscription interval. |
| **Purchase CTA Button** | `tool-detail-cta` | Primary purchase action button routing to hub. |
| **How to Use Section Wrapper**| `tool-detail-instructions` | Parent block for tutorial lists. |
| **How to Use Step Item** | `tool-detail-step` | List items detailing a tutorial instruction. |
| **FAQ Block Wrapper** | `tool-detail-faq` | Container block for FAQs. |
| **FAQ Question Accordion** | `tool-detail-faq-question` | Clickable question trigger. |
| **FAQ Answer Container** | `tool-detail-faq-answer` | Expandable answer body text. |
| **Dynamic Fallback Container** | `tool-not-found` | Section shown for missing/invalid tool ID. |
| **Fallback Exit Button** | `tool-not-found-back` | Button routing from fallback back to home. |
| **Carousel Detail Link** | `carousel-view-detail` | homepage button linking to active carousel tool detail. |
| **Hot Tool Anchor Card** | `hot-tool-link-[id]` | Homepage hot tool card linking to `/tools/[id]`. |

---

## 6. Execution and Verification Plan

Once the implementation is complete, the testing strategy can be verified through the following steps:

1. **Clean Workspace Build**:
   ```powershell
   npm run build
   ```
   *Expected result*: Next.js static files compile successfully, exporting pages to the `out/` directory, including static paths for `/tools/ban-content` and `/tools/healing-bird`.

2. **Verify Static Export Files**:
   Ensure the following file structure is created in the output directory:
   - `out/tools/ban-content/index.html` (or `out/tools/ban-content.html`)
   - `out/tools/healing-bird/index.html` (or `out/tools/healing-bird.html`)

3. **Run E2E Test Suite**:
   ```powershell
   npm run test:e2e
   ```
   *Expected result*: All Playwright E2E test cases execute against the static build on port 3000 and pass, showing 0 failures.
