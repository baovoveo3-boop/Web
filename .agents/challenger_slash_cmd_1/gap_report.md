# Slash Command Implementation - White-Box Analysis & Gap Report

This report presents a white-box analysis of the Slash Command implementation in `app/admin/products/page.tsx` compared to the current E2E test suite in `e2e/slash_command.spec.ts`.

---

## 1. Executive Summary

- **Component Analyzed**: `app/admin/products/page.tsx` (specifically the slash command states, trigger logic `checkSlashCommandTrigger`, selection handler `handleSelectSlashSuggestion`, keydown listener `handleSlashCommandKeyDown`, input cleaner `cleanVietnameseInput`, and popup UI `renderSlashCommandPopup`).
- **Existing Test Coverage**: `e2e/slash_command.spec.ts` contains E2E tests focusing on basic triggers, simple query suggestions, casing, tab switches, and basic boundary cases (like `/` with spaces).
- **Core Findings**: 
  - **Persistent Active State (Key Hijacking)**: Typing a space after a trigger word (e.g. `/down test`) does not close the suggestions menu. The context remains active, hijacking `Enter` and arrow keys for the rest of the sentence.
  - **NaN Selection Index**: Typing a query with no matches (e.g. `/invalid`) leaves the slash context active. Pressing `ArrowDown` inside the input will trigger `e.preventDefault()`, block normal cursor navigation, and set `slashCommandSelectedIndex` to `NaN` due to modulo-by-zero division.
  - **Early Exit on Step Deletion (Stuck Menu)**: Deleting a step or FAQ item while the suggestions menu is active on a subsequent index shifts the DOM element IDs. When a user clicks a suggestion, the target input element is no longer found. The handler exits early *without* clearing the context, leaving the menu permanently stuck.
  - **Blur Race Condition**: The `onBlur` timeout (150ms) is not cleared or tracked. If a user blurs and immediately focuses back within 150ms, the timeout still fires and closes the menu during typing.
  - **Improper Digit Stripping**: `cleanVietnameseInput` aggressively strips all trailing digits `1-9` (intended for VNI tone marks). This makes it impossible to query suggestions with numbers (e.g., `/down1` incorrectly matches `Trang Download`).

---

## 2. Deep-Dive Gap Analysis & Critical Vulnerabilities

### Gap 1: Persistent Active State & Key Hijacking
* **Code Location**: `checkSlashCommandTrigger` (lines 174-205)
* **Mechanics**:
  ```typescript
  const textAfterSlash = value.slice(lastSlashIndex + 1);
  const firstSpaceIndex = textAfterSlash.indexOf(' ');
  const query = firstSpaceIndex === -1 ? textAfterSlash : textAfterSlash.slice(0, firstSpaceIndex);
  const startsWithSpace = textAfterSlash.startsWith(' ');
  ```
  If `value` is `"/down test"`, `textAfterSlash` is `"down test"`. The `firstSpaceIndex` is `4`. `query` is resolved as `"down"`. Since `startsWithSpace` is `false` (it starts with `'d'`), the context is successfully set:
  ```typescript
  setSlashCommandContext({ fieldType, index, triggerIndex: lastSlashIndex, query });
  ```
  The menu stays open even though the user has typed a space and is now typing `"test"`. Because the context is active, pressing `Enter` will prevent form submission or text linebreaks and instead force-replace `/down` with the selected suggestion.
* **Severity**: High (严重) - Directly impacts basic typing UX, form submissions, and text formatting.

### Gap 2: Modulo-by-Zero causing NaN Selection Index
* **Code Location**: `handleSlashCommandKeyDown` (lines 253)
* **Mechanics**:
  ```typescript
  setSlashCommandSelectedIndex(prev => (prev + 1) % filteredCount);
  ```
  If the user types a query that has no matching suggestions (e.g. `/invalid`), `filteredCount` is `0`. However, `slashCommandContext` is NOT set to null. If the user presses `ArrowDown` or `ArrowUp`, the handler executes:
  - `(prev + 1) % 0` which equals `NaN`.
  - `e.preventDefault()` is called, blocking the cursor from moving to the end of the input field.
* **Severity**: Medium - Causes internal state pollution (`NaN`) and blocks default keyboard navigation.

### Gap 3: Early Exit and Stuck Popup on DOM Shift / Step Deletion
* **Code Location**: `handleSelectSlashSuggestion` (lines 207-240)
* **Mechanics**:
  ```typescript
  const handleSelectSlashSuggestion = (markdown: string) => {
    if (!slashCommandContext) return;
    const { fieldType, index, triggerIndex, query } = slashCommandContext;

    const inputId = `input-${fieldType}-${index}`;
    const inputElement = document.getElementById(inputId) as HTMLInputElement | HTMLTextAreaElement;
    if (!inputElement) return; // <--- Exits early here!

    // ... (sets state and does cleanup)
    setSlashCommandContext(null);
  ```
  If a user opens the slash menu on step 1, then deletes step 0, step 1 is shifted to index 0 in the React state. The input with ID `input-howToUse-1` is deleted from the DOM. When the user clicks on a menu suggestion, the selector fails to find `input-howToUse-1` and exits early. The cleanup code (`setSlashCommandContext(null)`) is never reached. The suggestions menu stays open indefinitely.
* **Severity**: Medium - Leaves broken UI components floating on the screen.

### Gap 4: Blur Race Condition (Timeout Hijack)
* **Code Location**: Input `onBlur` handlers (lines 1418-1422, 1513-1517)
* **Mechanics**:
  ```typescript
  onBlur={() => {
    setTimeout(() => {
      setSlashCommandContext(null);
    }, 150);
  }}
  ```
  A static `setTimeout` is used to allow `onClick` events on the menu to fire before the menu is unmounted. However, if the user rapidly tabs out and back in (or click/focus cycles), a new focus event triggers the menu, but the previously scheduled 150ms blur timeout still fires and closes the menu.
* **Severity**: Low/Medium - Frustrates fast typists or users with touch screens.

### Gap 5: Non-Vietnamese Digit Stripping in Search Normalization
* **Code Location**: `cleanVietnameseInput` (lines 164-172)
* **Mechanics**:
  ```typescript
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[sfrxj123456789]$/g, ''); // Strips terminal tone marks
  ```
  The regex `/[sfrxj123456789]$/` strips trailing digits. If the user types `/down1`, the input normalizes to `down`. Since `Trang Download` contains `down`, it matches. If we add new suggestions in the future that end in digits (e.g. `App V1` vs `App V2`), the digits will be stripped, resulting in incorrect matching behavior.
* **Severity**: Low - Limits the scalability of the suggestions vocabulary.

---

## 3. Adversarial Test Cases (Executable Playwright Specs)

Below is the test suite that targets these gaps. This has been saved to `e2e/slash_command_adversarial.spec.ts`.

```typescript
import { test, expect } from '@playwright/test';

// Seed mock database state
const mockDbData = {
  users: {
    'admin1': {
      uid: 'admin1',
      email: 'admin@test.com',
      displayName: 'System Admin',
      walletBalance: 250000,
      currentTier: 'premium',
      role: 'admin',
      createdAt: '2026-06-19T08:30:00Z'
    }
  },
  products: {
    'prod1': {
      id: 'prod1',
      name: 'Gói Quét Vàng',
      description: 'Quét tự động nội dung vi phạm bản quyền nâng cao',
      price: 150000,
      imageUrl: 'https://example.com/gold-package.png',
      createdAt: '2026-06-19T09:00:00Z'
    }
  },
  orders: {},
  transactions: {}
};

async function setupMocks(page, userObj, dbState) {
  await page.addInitScript(({ user, db }) => {
    window.webpackChunk_N_E = window.webpackChunk_N_E || [];
    const originalPush = window.webpackChunk_N_E.push;
    window.webpackChunk_N_E.push = function(...args) {
      const modules = args[0][1];
      if (modules) {
        for (const key of Object.keys(modules)) {
          const originalFunc = modules[key];
          modules[key] = function(module, exports, require) {
            originalFunc(module, exports, require);
            if (exports && (exports.getFirestore || exports.getAuth || exports.getStorage)) {
              Object.keys(exports).forEach(prop => {
                if (typeof exports[prop] === 'function') {
                  const orig = exports[prop];
                  exports[prop] = function(...args) {
                    const mockName = 'mock_' + prop;
                    if (window[mockName]) {
                      return window[mockName](...args);
                    }
                    return orig(...args);
                  };
                }
              });
            }
          };
        }
      }
      return originalPush.apply(this, args);
    };

    window.mock_getFirestore = () => ({ mock: true });
    window.mock_getAuth = () => ({ mock: true });
    window.mock_getStorage = () => ({ mock: true });

    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('api.imgbb.com')) {
        return new Response(JSON.stringify({
          success: true,
          data: { url: 'https://example.com/mock-uploaded-image.png' }
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return originalFetch.apply(this, arguments);
    };

    window.mockDbState = JSON.parse(JSON.stringify(db)) || {
      users: {},
      products: {},
      orders: {},
      transactions: {}
    };

    window.mockUser = user;
    window.mockAuthCallbacks = [];

    window.setMockUser = (user) => {
      window.mockUser = user;
      window.mockAuthCallbacks.forEach(cb => cb(user));
    };

    window.mock_onAuthStateChanged = (auth, callback) => {
      window.mockAuthCallbacks.push(callback);
      setTimeout(() => callback(window.mockUser), 0);
      return () => {
        window.mockAuthCallbacks = window.mockAuthCallbacks.filter(cb => cb !== callback);
      };
    };

    window.mock_signOut = (auth) => {
      window.setMockUser(null);
      return Promise.resolve();
    };

    window.mock_doc = (dbOrCollection, pathOrId, ...more) => {
      if (dbOrCollection && dbOrCollection.collectionName) {
        return { collectionName: dbOrCollection.collectionName, id: pathOrId };
      }
      return { collectionName: pathOrId, id: more[0] };
    };

    window.mock_collection = (db, name) => {
      return { db, collectionName: name };
    };

    window.mock_getDoc = (docRef) => {
      const collection = docRef.collectionName;
      const id = docRef.id;
      const data = window.mockDbState[collection]?.[id] || null;
      return Promise.resolve({
        exists: () => !!data,
        data: () => data,
        id: id
      });
    };

    window.mock_getDocs = (collectionRef) => {
      const collectionName = collectionRef.collectionName || collectionRef.query?.collectionName || collectionRef.name;
      let items = Object.entries(window.mockDbState[collectionName] || {}).map(([id, data]) => ({
        id,
        data: () => data,
        exists: () => true
      }));

      if (collectionRef.filters) {
        collectionRef.filters.forEach(f => {
          items = items.filter(item => {
            const val = item.data()[f.field];
            if (val === undefined) return false;
            if (f.op === '==') return String(val) === String(f.value);
            return true;
          });
        });
      }

      return Promise.resolve({
        size: items.length,
        docs: items,
        forEach: (cb) => items.forEach(cb)
      });
    };

    window.mock_query = (collectionRef, ...constraints) => {
      const q = { collectionName: collectionRef.collectionName, filters: [] };
      constraints.forEach(c => {
        if (c && c.field) q.filters.push(c);
      });
      return q;
    };

    window.mock_where = (field, op, value) => {
      return { field, op, value };
    };

    window.mock_addDoc = (collectionRef, data) => {
      const collectionName = collectionRef.collectionName;
      const id = 'mock_id_' + Math.random().toString(36).substr(2, 9);
      if (!window.mockDbState[collectionName]) window.mockDbState[collectionName] = {};
      window.mockDbState[collectionName][id] = { ...data, id };
      return Promise.resolve({ id });
    };

    window.mock_updateDoc = (docRef, data) => {
      const collectionName = docRef.collectionName;
      const id = docRef.id;
      if (!window.mockDbState[collectionName]) window.mockDbState[collectionName] = {};
      if (!window.mockDbState[collectionName][id]) window.mockDbState[collectionName][id] = {};
      Object.assign(window.mockDbState[collectionName][id], data);
      return Promise.resolve();
    };

    window.mock_deleteDoc = (docRef) => {
      const collectionName = docRef.collectionName;
      const id = docRef.id;
      if (window.mockDbState[collectionName]) {
        delete window.mockDbState[collectionName][id];
      }
      return Promise.resolve();
    };

    window.mock_setDoc = (docRef, data) => {
      const collectionName = docRef.collectionName;
      const id = docRef.id;
      if (!window.mockDbState[collectionName]) window.mockDbState[collectionName] = {};
      window.mockDbState[collectionName][id] = data;
      return Promise.resolve();
    };

    window.mock_serverTimestamp = () => new Date().toISOString();

    window.mock_ref = (storage, path) => ({ path });
    window.mock_uploadBytes = (storageRef, file) => Promise.resolve({ ref: storageRef });
    window.mock_getDownloadURL = (storageRef) => Promise.resolve('https://example.com/mock-image.png');

    if (user) {
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      localStorage.removeItem('isLoggedIn');
    }
  }, { user: userObj, db: dbState });
}

async function addHowToUseStep(page) {
  await page.click('button:has-text("Thêm hướng dẫn")');
}

test.describe('Admin Products Slash Command Adversarial Test Suite', () => {
  const adminUser = {
    uid: 'admin1',
    email: 'admin@test.com',
    emailVerified: true
  };

  test.beforeEach(async ({ page }) => {
    await setupMocks(page, adminUser, mockDbData);
    await page.goto('/admin/products');
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await page.click('button:has-text("Thêm sản phẩm")');
    await expect(page.locator('h2:has-text("Thêm sản phẩm mới")')).toBeVisible();
  });

  test('Adversarial - Space persistence / key hijacking issue', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/down');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();

    // Type a space and some words
    await input.type(' test more words');
    // The menu should ideally be closed under correct UX because a space was typed.
    // However, in the current implementation, it remains open and active because /down is still considered the query.
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    
    const isMenuVisible = await menu.isVisible();
    console.log('Menu visible after typing space and additional text:', isMenuVisible);
    
    // Attempting to press Enter should normally submit or go to next line (if textarea), 
    // but here it hijacks Enter and autocompletes the suggestion, replacing '/down' instead.
    if (isMenuVisible) {
      await input.press('Enter');
      await expect(input).toHaveValue('[Trang Download](/download) test more words');
    }
  });

  test('Adversarial - Inactive menu key navigation intercept (NaN index bug)', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/invalid');

    // Menu should NOT be visible because no suggestions match
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu).not.toBeVisible();

    // Since context is still active, pressing ArrowDown will call preventDefault and set state to NaN.
    // We test that pressing ArrowDown shouldn't block key behavior or cause exceptions.
    await input.press('ArrowDown');
    
    // Pressing Enter should reset the context
    await input.press('Enter');
    
    // Verify input retains its typed value
    await expect(input).toHaveValue('/invalid');
  });

  test('Adversarial - Deletion of step during open menu causes stuck context', async ({ page }) => {
    await addHowToUseStep(page); // step 0
    await addHowToUseStep(page); // step 1

    const input1 = page.locator('#input-howToUse-1');
    await input1.focus();
    await input1.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();

    // Delete step 0 (the first one)
    // This shifts step 1 (index 1) to step 0 (index 0).
    // The input '#input-howToUse-1' is removed from DOM.
    await page.locator('button[title="Xóa bước"]').first().click();

    // Verify step 1 is removed from DOM
    await expect(page.locator('#input-howToUse-1')).toHaveCount(0);

    // The menu is still rendered in DOM or slashCommandContext is still active
    // Try to click on the first suggestion item
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    if (await menu.isVisible()) {
      await menu.locator('button').first().click();
      
      // Under the bug, the menu stays open because the element '#input-howToUse-1' is not found,
      // and the function returns early without calling setSlashCommandContext(null).
      const isMenuStillVisible = await menu.isVisible();
      console.log('Menu still visible after clicking suggestion on deleted step:', isMenuStillVisible);
    }
  });

  test('Adversarial - Blur race condition (rapid blur/focus cycles)', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();

    // Blur the input
    await input.blur();
    // Immediately focus back within 50ms (before the 150ms setTimeout runs)
    await page.waitForTimeout(30);
    await input.focus();

    // Wait for the blur timeout (150ms) to fire
    await page.waitForTimeout(200);

    // If the timeout was not cancelled (which it isn't), it will have called setSlashCommandContext(null)
    // and closed the menu even though the input is now refocused.
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    console.log('Menu visibility after rapid blur/focus cycle:', await menu.isVisible());
  });

  test('Adversarial - Vietnamese normalizer stripping digits', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();

    // Type a query that ends with a digit, like '/down1'
    await input.type('/down1');

    // cleanVietnameseInput("down1") returns "down" which matches "Trang Download".
    // This shows that typing trailing digits unexpectedly filters to matches without that digit.
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu).toBeVisible();
    await expect(menu.locator('button').first()).toContainText('Trang Download');
  });
});
```
