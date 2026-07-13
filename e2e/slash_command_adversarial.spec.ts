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
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu).not.toBeVisible();
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
    await page.locator('button[title="Xóa bước"]').first().click();

    // Verify step 1 is removed from DOM
    await expect(page.locator('#input-howToUse-1')).toHaveCount(0);

    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu).toBeVisible();

    await menu.locator('button').first().click();
    await expect(menu).not.toBeVisible();
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

    // With the fix, the menu should still be visible because focus cleared the timeout
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu).toBeVisible();
  });

  test('Adversarial - Vietnamese normalizer stripping digits', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();

    // Type a query that ends with a digit, like '/down1'
    await input.type('/down1');

    // cleanVietnameseInput("down1") returns "down1" which should NOT match "Trang Download".
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu).not.toBeVisible();
  });
});
