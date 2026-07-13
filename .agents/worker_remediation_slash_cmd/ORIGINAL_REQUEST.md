## 2026-06-26T04:18:59Z
You are a teamwork_preview_worker.
Your working directory is: E:\Youtube\Ban Content\Web\.agents\worker_remediation_slash_cmd
Your task is to apply remediation fixes to `app/admin/products/page.tsx` based on the Challenger gap reports, and verify them against the Playwright tests.

Please make the following changes in `app/admin/products/page.tsx`:
1. In `cleanVietnameseInput`:
   Update the regex to only strip Telex tone marks (`/[sfrxj]$/`) and NOT strip digits `1-9`.
2. In `checkSlashCommandTrigger`:
   Change the query parsing to look at `textBeforeCursor.slice(lastSlashIndex + 1)`. If this query contains any whitespace (`/\s/.test(query)`), set the context to `null` and return. This ensures the menu closes as soon as a space is typed.
3. In `handleSelectSlashSuggestion`:
   If the target input element is not found (`if (!inputElement)`), make sure to call `setSlashCommandContext(null)` before returning early, to prevent the menu from getting stuck.
4. In `handleSlashCommandKeyDown`:
   Add a check `if (filteredCount === 0) return;` at the very beginning, so that keyboard navigation (arrows, Enter) is not intercepted when no matching suggestions are visible.
5. Focus/Blur Timeout tracking:
   - Add a ref: `const slashCommandTimeoutRef = useRef<any>(null);`
   - In all inputs/textareas `onBlur` handlers, store the timeout in the ref:
     `slashCommandTimeoutRef.current = setTimeout(() => { setSlashCommandContext(null); }, 150);`
   - Add `onFocus` handlers to all inputs/textareas to clear the timeout if it exists:
     `onFocus={() => { if (slashCommandTimeoutRef.current) { clearTimeout(slashCommandTimeoutRef.current); slashCommandTimeoutRef.current = null; } }}`
6. Dynamic list change handlers:
   Ensure that clicking "Thêm hướng dẫn", "Di chuyển lên", "Di chuyển xuống", "Xóa bước", "Thêm câu hỏi", and FAQ "Xóa câu hỏi" also calls `setSlashCommandContext(null)` to prevent state mismatch.
7. Also ensure that opening the modal, closing the modal, or changing editing product resets `slashCommandContext` to `null`.

After making these modifications:
1. Run `npx tsc --noEmit` to verify type safety.
2. Run both Playwright test suites:
   - `npx playwright test e2e/slash_command.spec.ts`
   - `npx playwright test e2e/slash_command_adversarial.spec.ts`
3. Document the results in your handoff report.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
