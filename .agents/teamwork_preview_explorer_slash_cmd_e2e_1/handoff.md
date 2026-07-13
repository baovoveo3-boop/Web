# Handoff Report: E2E Playwright Fields & Build Configuration Analysis

## 1. Observation

Direct observations made in the codebase:

### A. Dynamic Fields in `app/admin/products/page.tsx`
1. **"Cách sử dụng" (howToUse) Fields**:
   - Located around lines 1211–1242.
   - Text input element (lines 1231–1241):
     ```tsx
     <input
       type="text"
       value={step.value}
       onChange={(e) => {
         const newSteps = [...howToUse];
         newSteps[idx] = { ...newSteps[idx], value: e.target.value };
         setHowToUse(newSteps);
       }}
       placeholder="Nhập bước hướng dẫn..."
       className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-neonPurple"
     />
     ```
2. **FAQ "Câu hỏi" Fields**:
   - Located around lines 1297–1325.
   - Text input element (lines 1315–1324):
     ```tsx
     <input
       type="text"
       value={faq.question}
       onChange={(e) => {
         const newFaqs = [...faqs];
         newFaqs[idx].question = e.target.value;
         setFaqs(newFaqs);
       }}
       placeholder="Câu hỏi (Ví dụ: Dùng được vĩnh viễn không?)"
       className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-neonPurple"
     />
     ```
3. **FAQ "Câu trả lời" Fields**:
   - Located around lines 1326–1335.
   - Textarea element (lines 1326–1334):
     ```tsx
     <textarea
       value={faq.answer}
       onChange={(e) => {
         const newFaqs = [...faqs];
         newFaqs[idx].answer = e.target.value;
         setFaqs(newFaqs);
       }}
       placeholder="Câu trả lời..."
       className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-neonPurple h-16 resize-none"
     />
     ```

### B. Testing & Build Configuration
1. **`playwright.config.ts`**:
   - Web server command and target URL (lines 20–25):
     ```typescript
     webServer: {
       command: 'npx http-server out -p 3000',
       url: 'http://localhost:3000',
       reuseExistingServer: !process.env.CI,
       timeout: 120 * 1000,
     },
     ```
2. **`next.config.js`**:
   - No `output: 'export'` property is defined.
3. **`package.json`**:
   - Build scripts (lines 5–11):
     ```json
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint",
       "test:e2e": "playwright test"
     },
     ```
4. **API Routes presence**:
   - Found backend API routes in the file tree, such as `app/api/payment/create-link/route.ts` and `app/api/desktop-auth/route.ts`.

---

## 2. Logic Chain

1. **Test Failure Condition**:
   - The current `playwright.config.ts` runs `npx http-server out -p 3000` to serve the application on port 3000 (from Observation B.1).
   - `next.config.js` does not have `output: 'export'` configured (from Observation B.2), meaning running `npm run build` (Observation B.3) compiles files to `.next/` and does not generate an `out/` folder.
   - Therefore, running `npx playwright test` fails because `http-server` cannot find the `out/` folder, making the dev server unreachable.

2. **Incompatibility of Static Export**:
   - Adding `output: 'export'` to `next.config.js` forces Next.js to export statically to `out/` during build.
   - However, Next.js static exports do not support backend API routes or server-side functions.
   - Since the project uses multiple API routes (e.g. `app/api/...` as seen in Observation B.4), `next build` will throw a build-time exception and fail if `output: 'export'` is set.

3. **Required Adjustments**:
   - To successfully run E2E tests, the Playwright web server command must run the Next.js server (`next dev` or `next start`).
   - For production testing, we must build the application first via `npm run build` and run it via `npm run start` (or change the web server command to run `npm run dev` directly if we wish to skip manual pre-building).

---

## 3. Caveats

- We were unable to execute the `npm run build` command directly because the shell execution prompt timed out waiting for user confirmation (read-only/interactive restrictions). However, static code examination of Next.js and Firebase integration verifies these findings.
- The Playwright tests (`e2e/admin.spec.ts` and `e2e/adversarial.spec.ts`) mock client-side Firestore/Auth behaviors dynamically inside the page context via `page.addInitScript`, meaning the tests themselves do not require a live Firestore connection, but they still require a running Next.js server to server the JS chunks and pages correctly.

---

## 4. Conclusion

- **Playwright Selectors**:
  - The dynamic fields should be targeted by their respective placeholders: `getByPlaceholder('Nhập bước hướng dẫn...')`, `getByPlaceholder('Câu hỏi (Ví dụ: Dùng được vĩnh viễn không?)')`, and `getByPlaceholder('Câu trả lời...')`.
  - For robustness, scopes should be established using the labels `"Cách sử dụng (How to Use)"` and `"Câu hỏi thường gặp (Q&A)"`.
- **E2E execution issue**:
  - Running E2E tests via `npx playwright test` under the current configuration will fail because `playwright.config.ts` attempts to serve a static `out` folder which doesn't exist and cannot be created using `output: 'export'` (due to API routes incompatibilities).
  - **Action item**: Update the `webServer` command in `playwright.config.ts` to `npm run start` (or `npm run dev`) and run `npm run build` before executing `npx playwright test`.

---

## 5. Verification Method

To verify the E2E test execution:
1. Update `playwright.config.ts` line 21:
   - Replace `npx http-server out -p 3000` with `npm run start` or `npm run dev`.
2. Execute the build and test flow in your terminal:
   ```bash
   npm run build
   npx playwright test
   ```
3. Verify that the server successfully starts on `localhost:3000` and Playwright tests compile and run.
