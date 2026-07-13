# Analysis Report: Admin Products Page Fields & E2E Testing Configuration

## 1. Analysis of `app/admin/products/page.tsx` Dynamic Fields

We analyzed the structure of the dynamic input/textarea fields in the Admin Products Modal of `app/admin/products/page.tsx`. Here are the exact structures, attributes, and how to target them using Playwright:

### A. "Cách sử dụng" (howToUse) Dynamic Input Fields
- **Container Structure**:
  - The section has a label with the text `"Cách sử dụng (How to Use)"`.
  - The add button has the text `"Thêm hướng dẫn"` (with a `Plus` icon).
  - Each item container is a `div` with the class `flex gap-3 items-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-800`.
- **Field Details**:
  - Element: `<input type="text">`
  - Attributes:
    - `value={step.value}`
    - `placeholder="Nhập bước hướng dẫn..."`
    - `className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-neonPurple"`
    - **No** `id`, `name`, or `data-testid` attributes are set.
  - Sibling elements inside the container:
    - An index badge: `<div className="...">{idx + 1}</div>`
    - Move up/down buttons: `↑` and `↓`
    - Delete button: `<button type="button" title="Xóa bước" ...>` containing a `<Trash2>` icon.
- **Playwright Target Strategy**:
  1. **Direct selection by placeholder**:
     ```typescript
     const steps = page.getByPlaceholder('Nhập bước hướng dẫn...');
     // To get the first step input:
     await steps.nth(0).fill('Step 1 description');
     ```
  2. **Scoped selection via parent container** (for robustness if other fields share this placeholder):
     ```typescript
     const section = page.locator('div', { has: page.locator('label:text-is("Cách sử dụng (How to Use)")') });
     const stepInputs = section.getByPlaceholder('Nhập bước hướng dẫn...');
     await stepInputs.first().fill('My instruction step');
     ```

---

### B. FAQ "Câu hỏi" (faq.question / question) Dynamic Input Fields
- **Container Structure**:
  - The section has a label with the text `"Câu hỏi thường gặp (Q&A)"`.
  - The add button has the text `"Thêm câu hỏi"` (with a `Plus` icon).
  - Each item container is a `div` with the class `flex gap-3 items-start bg-zinc-900/50 p-3 rounded-lg border border-zinc-800`.
- **Field Details**:
  - Element: `<input type="text">`
  - Attributes:
    - `value={faq.question}`
    - `placeholder="Câu hỏi (Ví dụ: Dùng được vĩnh viễn không?)"`
    - `className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-neonPurple"`
    - **No** `id`, `name`, or `data-testid` attributes are set.
- **Playwright Target Strategy**:
  1. **Direct selection by placeholder**:
     ```typescript
     const faqQuestions = page.getByPlaceholder('Câu hỏi (Ví dụ: Dùng được vĩnh viễn không?)');
     await faqQuestions.nth(0).fill('What is this package?');
     ```
  2. **Scoped selection via parent container**:
     ```typescript
     const qaSection = page.locator('div', { has: page.locator('label:text-is("Câu hỏi thường gặp (Q&A)")') });
     const questions = qaSection.getByPlaceholder('Câu hỏi (Ví dụ: Dùng được vĩnh viễn không?)');
     ```

---

### C. FAQ "Câu trả lời" (faq.answer / answer) Dynamic Textarea Fields
- **Container Structure**:
  - Placed right below the corresponding FAQ Question input field inside the same item container.
- **Field Details**:
  - Element: `<textarea>`
  - Attributes:
    - `value={faq.answer}`
    - `placeholder="Câu trả lời..."`
    - `className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-neonPurple h-16 resize-none"`
    - **No** `id`, `name`, or `data-testid` attributes are set.
- **Playwright Target Strategy**:
  1. **Direct selection by placeholder**:
     ```typescript
     const faqAnswers = page.getByPlaceholder('Câu trả lời...');
     await faqAnswers.nth(0).fill('This package contains premium tools.');
     ```
  2. **Scoped selection via parent container**:
     ```typescript
     const qaSection = page.locator('div', { has: page.locator('label:text-is("Câu hỏi thường gặp (Q&A)")') });
     const answers = qaSection.getByPlaceholder('Câu trả lời...');
     ```

---

## 2. Next.js Build and E2E Test Execution Configuration

### A. Current Setup Analysis
- **`playwright.config.ts`**:
  - `webServer` configures:
    - `command: 'npx http-server out -p 3000'`
    - `url: 'http://localhost:3000'`
- **`next.config.js`**:
  - Does **not** specify `output: 'export'`.
- **`package.json`**:
  - `build` script: `next build`
  - `test:e2e` script: `playwright test`

### B. Issues with the Current Setup
1. **Empty/Non-existent `out` directory**:
   Running `npx playwright test` triggers the `webServer` command `npx http-server out -p 3000`. Since `output: 'export'` is not configured in `next.config.js`, running `npm run build` generates Next.js production files under `.next/`, **not** static assets in `out/`. Because `out` does not exist or is empty, `http-server` fails or serves nothing, causing Playwright tests to fail with a network/timeout error when accessing `http://localhost:3000`.
2. **Incompatibility of `output: 'export'`**:
   We cannot simply add `output: 'export'` to `next.config.js` to generate the `out/` folder. This application includes several Node.js API routes under `app/api/...` (e.g., `app/api/payment/create-link/route.ts`, `app/api/desktop-auth/route.ts`, and `app/api/purchase/route.ts`). Next.js static exports (`output: 'export'`) do not support dynamic server-side API routes or middleware. If you attempt to run `next build` with `output: 'export'`, the build process will throw an error and fail.

### C. Recommended Solutions

There are two recommended ways to resolve the issue:

#### Option 1: Run Next.js Production Server (Recommended)
This approach tests the application exactly as it would run in production, preserving support for API routes and Firestore backend integration.
1. **Update `playwright.config.ts`**:
   Change the `webServer` command to start the Next.js server instead of serving a static folder:
   ```typescript
   webServer: {
     command: 'npm run start',
     url: 'http://localhost:3000',
     reuseExistingServer: !process.env.CI,
     timeout: 120 * 1000,
   },
   ```
2. **Execution workflow**:
   Before running E2E tests, build the project and then run the tests:
   ```bash
   npm run build
   npx playwright test
   ```

#### Option 2: Run Next.js Development Server (Alternative for local tests)
Useful for rapid local feedback without needing to run a build first:
1. **Update `playwright.config.ts`**:
   Change the `webServer` command to run the Next.js dev server:
   ```typescript
   webServer: {
     command: 'npm run dev',
     url: 'http://localhost:3000',
     reuseExistingServer: !process.env.CI,
     timeout: 120 * 1000,
   },
   ```
2. **Execution workflow**:
   ```bash
   npx playwright test
   ```
