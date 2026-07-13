# Slash Command Gap & Vulnerability Report

## Executive Summary

- **Target Component**: `app/admin/products/page.tsx` (Slash Command feature)
- **Target Test Suite**: `e2e/slash_command.spec.ts`
- **Overall Risk Assessment**: **MEDIUM-HIGH** (due to navigation locks, unexpected form submissions, and text corruption in edge cases)
- **Key Findings**: 5 major logical gaps, boundary bugs, and unhandled keyboard event cases were identified in the React implementation. These can cause interface lockups, unwanted form submission, or data corruption when editing existing text.

---

## 1. Code Review & Analysis

The Slash Command autocomplete feature in the Admin Products page is triggered in three fields: `howToUse`, `faq-question`, and `faq-answer`. It matches a user-typed query starting with `/` against static suggestions (`SUGGESTIONS`) and replaces it with markdown links.

### Critical Code Paths Analyzed

#### A. Trigger Detection (`checkSlashCommandTrigger`)
```typescript
const checkSlashCommandTrigger = (
  value: string,
  selectionStart: number,
  fieldType: 'howToUse' | 'faq-question' | 'faq-answer',
  index: number
) => {
  const textBeforeCursor = value.slice(0, selectionStart);
  const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

  if (lastSlashIndex !== -1) {
    const isStartOrPrecededBySpace = lastSlashIndex === 0 || /\s/.test(textBeforeCursor[lastSlashIndex - 1]);

    if (isStartOrPrecededBySpace) {
      const textAfterSlash = value.slice(lastSlashIndex + 1);
      const firstSpaceIndex = textAfterSlash.indexOf(' ');
      const query = firstSpaceIndex === -1 ? textAfterSlash : textAfterSlash.slice(0, firstSpaceIndex);
      const startsWithSpace = textAfterSlash.startsWith(' ');

      if (!startsWithSpace) {
        setSlashCommandContext({
          fieldType,
          index,
          triggerIndex: lastSlashIndex,
          query,
        });
        setSlashCommandSelectedIndex(0);
        return;
      }
    }
  }
  setSlashCommandContext(null);
};
```
*Vulnerability identified here:* `textAfterSlash` is sliced from the *entire value* rather than stopping at the cursor position. When editing in the middle of a string, this causes the parser to include trailing characters (up to the next space character) as part of the query, resulting in incorrect suggestion matching.

#### B. Keyboard Event Handling (`handleSlashCommandKeyDown`)
```typescript
const handleSlashCommandKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  fieldType: 'howToUse' | 'faq-question' | 'faq-answer',
  index: number,
  filteredCount: number,
  filteredSuggestions: typeof SUGGESTIONS
) => {
  if (!slashCommandContext || slashCommandContext.fieldType !== fieldType || slashCommandContext.index !== index) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setSlashCommandSelectedIndex(prev => (prev + 1) % filteredCount);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    setSlashCommandSelectedIndex(prev => (prev - 1 + filteredCount) % filteredCount);
  } else if (e.key === 'Enter') {
    if (filteredCount > 0) {
      e.preventDefault();
      const selected = filteredSuggestions[slashCommandSelectedIndex];
      if (selected) {
        handleSelectSlashSuggestion(selected.markdown);
      }
    } else {
      setSlashCommandContext(null);
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    setSlashCommandContext(null);
  }
};
```
*Vulnerability identified here:* 
1. If the query does not match any suggestions (`filteredCount === 0`), `slashCommandContext` is still active. Pressing `ArrowDown` or `ArrowUp` runs `e.preventDefault()`, which intercepts and blocks the native cursor navigation. It also updates the selected index to `NaN` (because of modulo by 0).
2. Pressing `Enter` when `filteredCount === 0` closes the context but does not call `e.preventDefault()`. Because the input is inside a form, this causes the form to submit immediately and unexpectedly.

#### C. Replacement Logic (`handleSelectSlashSuggestion`)
```typescript
const newValue = originalValue.slice(0, triggerIndex) + markdown + originalValue.slice(triggerIndex + 1 + query.length);
```
*Vulnerability identified here:* Because `query` includes trailing characters beyond the cursor position, replacing the text removes or repeats characters, leading to text corruption.

---

## 2. Identified Gaps & Edge Cases

### Gap 1: Arrow Navigation Lock on Non-matching Query (High Risk UX Bug)
- **Attack Scenario**: User types `/xyz` (with no matching suggestions). The dropdown menu is hidden, but the slash context is still active. The user presses `ArrowDown` or `ArrowUp` to navigate or edit their text.
- **Root Cause**: `handleSlashCommandKeyDown` intercepts arrow keys and executes `e.preventDefault()` regardless of whether `filteredCount > 0`.
- **Impact**: The user's arrow keys are disabled/locked in the input. React state `slashCommandSelectedIndex` is set to `NaN` (calculated as `1 % 0`).

### Gap 2: Enter Key Form Submission (Medium Risk UX Bug)
- **Attack Scenario**: User types `/xyz` (no matching suggestions) and presses `Enter`.
- **Root Cause**: The keydown handler intercepts `Enter` but does not call `e.preventDefault()` if `filteredCount === 0`.
- **Impact**: Instead of simply dismissing the autocomplete context or acting as a normal key press, the browser submits the entire product form, showing the validation/confirmation modal unexpectedly.

### Gap 3: Query Prefix Replacement Bug in the Middle of a String (Medium Risk Bug)
- **Attack Scenario**: User edits an existing string like `abc /down def`, places the cursor after `/do`, and types `w` to make it `/dow`. They select `Trang Download`.
- **Root Cause**: `checkSlashCommandTrigger` slices `textAfterSlash` from the entire value instead of stopping at the cursor (`selectionStart`). If there are trailing characters of the word, they are appended to the query.
- **Impact**: The calculated query is `down` rather than `dow`. If the query length is mismatching or if the cursor is at a different place, the substring slicing in `handleSelectSlashSuggestion` is incorrect, resulting in truncated or garbled text.

### Gap 4: Multiple Consecutive Slashes Trigger Cancel (Low Risk Bug)
- **Attack Scenario**: User types `/down/login` in the input field.
- **Root Cause**: Slashes inside a path are processed by `textBeforeCursor.lastIndexOf('/')`. The last slash (`/login`) is not preceded by space, so the trigger condition `isStartOrPrecededBySpace` is false.
- **Impact**: This resets/cancels the slash command context, even if the first slash was a valid command.

### Gap 5: Non-space Whitespace Characters (Low Risk Bug)
- **Attack Scenario**: User enters `/down\n` (newline character).
- **Root Cause**: The parser checks `textAfterSlash.indexOf(' ')` to find query delimiters. It only searches for space `' '` rather than all whitespace characters `\s` (like newlines or tabs).
- **Impact**: Newlines are considered part of the query, preventing the query from being dismissed properly on newline boundaries.

---

## 3. Playwright Adversarial Test Suite

We have written an adversarial E2E test suite in `e2e/slash_command_adversarial.spec.ts` that specifically targets these untested boundaries.

```typescript
import { test, expect } from '@playwright/test';

// [Mock Setup matches e2e/slash_command.spec.ts]

test.describe('Admin Products Slash Command Adversarial Test Suite', () => {
  // ... beforeEach setup ...

  test('Adversarial 1 - Navigation locking on non-matching query', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/xyz'); // No matching suggestions (menu hidden)
    
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
    const initialCursor = await input.evaluate((el: HTMLInputElement) => el.selectionStart);

    // Press ArrowDown. Should be blocked if the bug exists.
    await input.press('ArrowDown');

    const afterArrowDownCursor = await input.evaluate((el: HTMLInputElement) => el.selectionStart);
    expect(afterArrowDownCursor).toBe(initialCursor); // Fails/Asserts lock
  });

  test('Adversarial 2 - Enter key submits the form on non-matching query', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/xyz');

    await page.fill('input[placeholder="Nhập tên sản phẩm..."]', 'Adversarial Test Product');
    await page.fill('textarea[placeholder="Chi tiết sản phẩm..."]', 'This is a description');
    await page.fill('input[placeholder="Ví dụ: 150000"]', '200000');
    
    await input.focus();
    await input.press('Enter');

    // Asserts form submission modal is visible (which is a bug)
    const confirmModalTitle = page.locator('h3:has-text("Thêm mới Sản phẩm")');
    await expect(confirmModalTitle).toBeVisible();
  });

  test('Adversarial 3 - Query prefix replacement bug in the middle of a string', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('abc /down def');

    await input.evaluate((el: HTMLInputElement) => {
      el.setSelectionRange(7, 7); // after /do
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await input.press('w'); // make it /dow
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
    await page.click('[data-testid="slash-suggestions-menu"] button:has-text("Trang Download")');

    // Expected correct output: "abc [Trang Download](/download) def"
    await expect(input).toHaveValue('abc [Trang Download](/download) def');
  });
});
```

---

## 4. Recommended Mitigations & Code Fixes

### Fix 1: Restrict Arrow Keys to Visible Suggestions Only
In `handleSlashCommandKeyDown`, check that suggestions are actually available (`filteredCount > 0`) before preventing defaults and handling ArrowUp/ArrowDown:
```typescript
if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && filteredCount === 0) {
  return; // Let standard cursor navigation happen
}
```

### Fix 2: Prevent Default Form Submission on Enter
Always prevent default behavior when pressing `Enter` if the autocomplete context is active, even if no suggestions are matched:
```typescript
} else if (e.key === 'Enter') {
  e.preventDefault(); // ALWAYS prevent default form submission when context is active
  if (filteredCount > 0) {
    const selected = filteredSuggestions[slashCommandSelectedIndex];
    if (selected) {
      handleSelectSlashSuggestion(selected.markdown);
    }
  } else {
    setSlashCommandContext(null);
  }
}
```

### Fix 3: Limit Query Slicing to Cursor Position
Modify `checkSlashCommandTrigger` to slice `textAfterSlash` up to the cursor position or use a regex to capture only the active word being typed, ensuring the replacement replaces exactly from the slash to the cursor:
```typescript
const textAfterSlash = textBeforeCursor.slice(lastSlashIndex + 1);
// Query is now exactly the word being typed before the cursor
const query = textAfterSlash; 
```
This guarantees that any text after the cursor is completely untouched and prevents replacement misalignment.
