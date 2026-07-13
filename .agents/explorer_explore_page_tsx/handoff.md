# Handoff Report — explorer_explore_page_tsx

## 1. Observation
We analyzed `app/admin/products/page.tsx` in `E:\Youtube\Ban Content\Web`.

* **How to Use Fields**:
  * Line 125: `const [howToUse, setHowToUse] = useState<{ id: string; value: string }[]>([]);`
  * Line 1226-1241: Renders using dynamic array map.
    ```tsx
    1226:                   {howToUse.map((step, idx) => (
    ...
    1231:                       <input
    1232:                         type="text"
    1233:                         value={step.value}
    1234:                         onChange={(e) => {
    1235:                           const newSteps = [...howToUse];
    1236:                           newSteps[idx] = { ...newSteps[idx], value: e.target.value };
    1237:                           setHowToUse(newSteps);
    1238:                         }}
    ...
    ```
* **FAQ Q&A Fields**:
  * Line 127: `const [faqs, setFaqs] = useState<{question: string, answer: string}[]>([]);`
  * Line 1311-1334: Renders question input and answer textarea inside a grid:
    ```tsx
    1311:                   {faqs.map((faq, idx) => (
    ...
    1314:                         <input
    1315:                           type="text"
    1316:                           value={faq.question}
    1317:                           onChange={(e) => {
    1318:                             const newFaqs = [...faqs];
    1319:                             newFaqs[idx].question = e.target.value;
    1320:                             setFaqs(newFaqs);
    1321:                           }}
    ...
    1325:                         <textarea
    1326:                           value={faq.answer}
    1327:                           onChange={(e) => {
    1328:                             const newFaqs = [...faqs];
    1329:                             newFaqs[idx].answer = e.target.value;
    1330:                             setFaqs(newFaqs);
    1331:                           }}
    ...
    ```
* **State Hydration / Dehydration**:
  * `openEditModal` maps incoming `howToUse` array strings or objects to structured `{ id, value }` representations (lines 269-281).
  * `handleSave` sanitizes `howToUse` back into an array of strings before saving (line 429): `const sanitizedHowToUse = howToUse.map(step => step.value || "");`.

---

## 2. Logic Chain
1. **Dynamic Inputs Placement**: The `howToUse` inputs are rendered inside a list of dynamic items mapped from state. The FAQ question/answers are similarly mapped from the `faqs` state.
2. **Context Selection**: When typing a slash command, we must know which item in the array is being modified. Since we have list elements with indexes, tracking the active index and field identifier (e.g., `'howToUse'`, `'faq-question'`, `'faq-answer'`) is sufficient.
3. **Cursor and Trigger Checking**: By using `target.selectionStart` and matching the text segment preceding the cursor with `lastIndexOf('/')`, we can dynamically verify if a slash command trigger is currently active, extract the filter query, and record the exact index of the `/` character.
4. **Positioning and Overflow**: By wrapping the `<input>` or `<textarea>` in a `relative` div container, the suggestions popup can be positioned using `absolute left-0 top-full` without needing window coordinate calculations.
5. **Blur/Click Conflict Prevention**: Standard click triggers blur before the click callback is handled, hiding the element. Attaching `onMouseDown` on the suggestion element with `e.preventDefault()` prevents the input focus from shifting, allowing the selection logic to process.
6. **Focus Restoration**: React state update is asynchronous. Changing the value in state does not update the DOM immediately. Therefore, scheduling the `.focus()` and `.setSelectionRange()` using `setTimeout(..., 0)` forces it to run in the next event loop tick after the DOM update.

---

## 3. Caveats
- The UI handles `faqs` state mutation directly inside `onChange` (e.g., `newFaqs[idx].question = e.target.value;`). While this is functional in React since `newFaqs` is shallow-copied, we should clean it up to use a proper spread operation `newFaqs[idx] = { ...newFaqs[idx], question: e.target.value }` to follow React state immutability best practices.
- The `products` list is already loaded in `AdminProducts`, making it extremely easy to offer dynamic autocomplete links referencing existing products in the system.

---

## 4. Conclusion
We have mapped the form fields in `app/admin/products/page.tsx` and formulated a complete, high-performance implementation strategy for Slash Command popups. The proposed strategy utilizes native HTML cursor targeting, local `relative` wrapper styling, and React focus deferred handlers. The analysis and implementation strategy is written to:
`E:\Youtube\Ban Content\Web\.agents\explorer_explore_page_tsx\analysis.md`

---

## 5. Verification Method
1. Inspect the details written to `analysis.md` inside `E:\Youtube\Ban Content\Web\.agents\explorer_explore_page_tsx\analysis.md`.
2. Inspect the file `app/admin/products/page.tsx` at lines 1211-1351 to confirm it matches the highlighted lines in the observation section.
