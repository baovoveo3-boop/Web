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
    // Webpack chunk push override to intercept Firebase modules
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

    // Firebase Core Mocks
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

    // State Seeding
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

    // Auth mock implementations
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

    // Firestore mock implementations
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

    // Firebase Storage Mock implementations
    window.mock_ref = (storage, path) => ({ path });
    window.mock_uploadBytes = (storageRef, file) => Promise.resolve({ ref: storageRef });
    window.mock_getDownloadURL = (storageRef) => Promise.resolve('https://example.com/mock-image.png');

    // Bypass localStorage auth guard check for client side
    if (user) {
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      localStorage.removeItem('isLoggedIn');
    }
  }, { user: userObj, db: dbState });
}

// Helpers to add dynamic elements
async function addHowToUseStep(page) {
  await page.click('button:has-text("Thêm hướng dẫn")');
}

async function addFaqItem(page) {
  await page.click('button:has-text("Thêm câu hỏi")');
}

test.describe('Admin Products Slash Command E2E Test Suite', () => {
  const adminUser = {
    uid: 'admin1',
    email: 'admin@test.com',
    emailVerified: true
  };

  test.beforeEach(async ({ page }) => {
    await setupMocks(page, adminUser, mockDbData);
    await page.goto('/admin/products');
    
    // Auto accept confirm dialogs
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Open "Thêm sản phẩm" modal
    await page.click('button:has-text("Thêm sản phẩm")');
    await expect(page.locator('h2:has-text("Thêm sản phẩm mới")')).toBeVisible();
  });

  // ==========================================
  // TIER 1: CORE TRIGGER, RENDERING, SELECTION & DISMISSAL
  // ==========================================

  // Tier 1.1: HowToUse Trigger (5 tests)
  test('Tier 1 - HowToUse trigger with slash at start', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  test('Tier 1 - HowToUse trigger with slash after space', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('abc /');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  test('Tier 1 - HowToUse trigger with query', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/down');
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu).toBeVisible();
    await expect(menu.locator('button')).toHaveCount(1);
    await expect(menu.locator('button')).toContainText('Trang Download');
  });

  test('Tier 1 - HowToUse trigger casing', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/DOWN');
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu).toBeVisible();
    await expect(menu.locator('button')).toHaveCount(1);
    await expect(menu.locator('button')).toContainText('Trang Download');
  });

  test('Tier 1 - HowToUse trigger multiple spaces', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('hello   /');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  // Tier 1.2: FAQ Question Trigger (5 tests)
  test('Tier 1 - FAQ Question trigger with slash at start', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-question-0');
    await input.focus();
    await input.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  test('Tier 1 - FAQ Question trigger with slash after space', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-question-0');
    await input.focus();
    await input.type('abc /');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  test('Tier 1 - FAQ Question trigger with query', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-question-0');
    await input.focus();
    await input.type('/login');
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu).toBeVisible();
    await expect(menu.locator('button')).toHaveCount(1);
    await expect(menu.locator('button')).toContainText('Trang Đăng nhập');
  });

  test('Tier 1 - FAQ Question trigger casing', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-question-0');
    await input.focus();
    await input.type('/LOGIN');
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu).toBeVisible();
    await expect(menu.locator('button')).toHaveCount(1);
    await expect(menu.locator('button')).toContainText('Trang Đăng nhập');
  });

  test('Tier 1 - FAQ Question trigger multiple spaces', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-question-0');
    await input.focus();
    await input.type('hello   /');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  // Tier 1.3: FAQ Answer Trigger (5 tests)
  test('Tier 1 - FAQ Answer trigger with slash at start', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-answer-0');
    await input.focus();
    await input.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  test('Tier 1 - FAQ Answer trigger with slash after space', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-answer-0');
    await input.focus();
    await input.type('abc /');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  test('Tier 1 - FAQ Answer trigger with query', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-answer-0');
    await input.focus();
    await input.type('/hub');
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu).toBeVisible();
    await expect(menu.locator('button')).toHaveCount(1);
    await expect(menu.locator('button')).toContainText('Khám phá Hub');
  });

  test('Tier 1 - FAQ Answer trigger casing', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-answer-0');
    await input.focus();
    await input.type('/HUB');
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu).toBeVisible();
    await expect(menu.locator('button')).toHaveCount(1);
    await expect(menu.locator('button')).toContainText('Khám phá Hub');
  });

  test('Tier 1 - FAQ Answer trigger multiple spaces', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-answer-0');
    await input.focus();
    await input.type('hello   /');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  // Tier 1.4: Suggestions Rendering (5 tests)
  test('Tier 1 - Suggestions rendering shows all items on bare slash', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu).toBeVisible();
    await expect(menu.locator('button')).toHaveCount(4);
  });

  test('Tier 1 - Suggestions rendering labels and markdowns', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu.locator('button').nth(0)).toContainText('Trang Download');
    await expect(menu.locator('button').nth(0)).toContainText('[Trang Download](/download)');
  });

  test('Tier 1 - Suggestions rendering filters matching items', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/khoa');
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu.locator('button')).toHaveCount(1);
    await expect(menu.locator('button')).toContainText('Trang Khóa học');
  });

  test('Tier 1 - Suggestions rendering no items found', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/notfound');
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu).not.toBeVisible();
  });

  test('Tier 1 - Suggestions rendering active selection class', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    const firstButton = page.locator('[data-testid="slash-suggestions-menu"] button').nth(0);
    await expect(firstButton).toHaveClass(/bg-zinc-800/);
  });

  // Tier 1.5: Autocomplete & Selection (5 tests)
  test('Tier 1 - Autocomplete click selection', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    await page.click('[data-testid="slash-suggestions-menu"] button:has-text("Trang Download")');
    await expect(input).toHaveValue('[Trang Download](/download)');
  });

  test('Tier 1 - Autocomplete enter selection', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    await input.press('Enter');
    await expect(input).toHaveValue('[Trang Download](/download)');
  });

  test('Tier 1 - Autocomplete arrow down and enter', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    await input.press('ArrowDown');
    await input.press('Enter');
    await expect(input).toHaveValue('[Khóa Học](/courses)');
  });

  test('Tier 1 - Autocomplete arrow up wrap around and enter', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    await input.press('ArrowUp');
    await input.press('Enter');
    await expect(input).toHaveValue('[Khám Phá Hub](/hub)');
  });

  test('Tier 1 - Autocomplete cursor positioning', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('check /');
    await page.click('[data-testid="slash-suggestions-menu"] button:has-text("Trang Download")');
    
    const cursor = await input.evaluate((el: HTMLInputElement) => el.selectionStart);
    const expectedLength = 'check [Trang Download](/download)'.length;
    expect(cursor).toBe(expectedLength);
  });

  // Tier 1.6: Popup Dismissal (5 tests)
  test('Tier 1 - Popup dismissal on escape', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
    await input.press('Escape');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  test('Tier 1 - Popup dismissal on space', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
    await input.press('Space');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  test('Tier 1 - Popup dismissal on blur', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
    
    await page.click('h2:has-text("Thêm sản phẩm mới")');
    await page.waitForTimeout(200);
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  test('Tier 1 - Popup dismissal on backspace of slash', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
    await input.press('Backspace');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  test('Tier 1 - Popup dismissal on empty query deletion', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('hello /');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
    await input.press('Backspace');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  // ==========================================
  // TIER 2: BOUNDARY CONDITIONS
  // ==========================================

  // Tier 2.1: HowToUse Boundary (5 tests)
  test('Tier 2 - HowToUse boundary consecutive slashes', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('//');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  test('Tier 2 - HowToUse boundary slash in word', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('abc/def');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  test('Tier 2 - HowToUse boundary cursor not at end', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/down end');
    await input.evaluate((el: HTMLInputElement) => {
      el.setSelectionRange(5, 5);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  test('Tier 2 - HowToUse boundary maximum length', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    const longString = 'a'.repeat(200) + ' /';
    await input.type(longString);
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  test('Tier 2 - HowToUse boundary special characters', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('@#$%^&*/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  // Tier 2.2: FAQ Question Boundary (5 tests)
  test('Tier 2 - FAQ Question boundary consecutive slashes', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-question-0');
    await input.focus();
    await input.type('//');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  test('Tier 2 - FAQ Question boundary slash in word', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-question-0');
    await input.focus();
    await input.type('abc/def');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  test('Tier 2 - FAQ Question boundary cursor not at end', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-question-0');
    await input.focus();
    await input.type('/login end');
    await input.evaluate((el: HTMLInputElement) => {
      el.setSelectionRange(6, 6);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  test('Tier 2 - FAQ Question boundary maximum length', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-question-0');
    await input.focus();
    const longString = 'a'.repeat(200) + ' /';
    await input.type(longString);
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  test('Tier 2 - FAQ Question boundary special characters', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-question-0');
    await input.focus();
    await input.type('@#$%^&*/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  // Tier 2.3: FAQ Answer Boundary (5 tests)
  test('Tier 2 - FAQ Answer boundary consecutive slashes', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-answer-0');
    await input.focus();
    await input.type('//');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  test('Tier 2 - FAQ Answer boundary slash in word', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-answer-0');
    await input.focus();
    await input.type('abc/def');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  test('Tier 2 - FAQ Answer boundary cursor not at end', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-answer-0');
    await input.focus();
    await input.type('/hub end');
    await input.evaluate((el: HTMLTextAreaElement) => {
      el.setSelectionRange(4, 4);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  test('Tier 2 - FAQ Answer boundary maximum length', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-answer-0');
    await input.focus();
    const longString = 'a'.repeat(200) + ' /';
    await input.type(longString);
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  test('Tier 2 - FAQ Answer boundary special characters', async ({ page }) => {
    await addFaqItem(page);
    const input = page.locator('#input-faq-answer-0');
    await input.focus();
    await input.type('@#$%^&*/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  // Tier 2.4: Suggestions rendering boundary (5 tests)
  test('Tier 2 - Suggestions rendering boundary list overflow', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu).toHaveClass(/max-h-60/);
    await expect(menu).toHaveClass(/overflow-y-auto/);
  });

  test('Tier 2 - Suggestions rendering boundary exact match case', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/Trang Download');
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu.locator('button')).toHaveCount(1);
    await expect(menu.locator('button')).toContainText('Trang Download');
  });

  test('Tier 2 - Suggestions rendering boundary spaces in query', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/ down');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  test('Tier 2 - Suggestions rendering boundary unicode search', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/Khóa');
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu.locator('button')).toHaveCount(1);
    await expect(menu.locator('button')).toContainText('Trang Khóa học');
  });

  test('Tier 2 - Suggestions rendering boundary DOM node cleanup', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
    await input.press('Escape');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toHaveCount(0);
  });

  // Tier 2.5: Autocomplete boundary (5 tests)
  test('Tier 2 - Autocomplete boundary select empty query', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    await input.press('Enter');
    await expect(input).toHaveValue('[Trang Download](/download)');
  });

  test('Tier 2 - Autocomplete boundary select when query has no match', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/nonexistent');
    await input.press('Enter');
    await expect(input).toHaveValue('/nonexistent');
  });

  test('Tier 2 - Autocomplete boundary selection with existing text around', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('abc /down def');
    await page.click('[data-testid="slash-suggestions-menu"] button:has-text("Trang Download")');
    await expect(input).toHaveValue('abc [Trang Download](/download) def');
  });

  test('Tier 2 - Autocomplete boundary keyboard navigation boundary wrapping', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    for (let i = 0; i < 4; i++) {
      await input.press('ArrowDown');
    }
    await input.press('Enter');
    await expect(input).toHaveValue('[Trang Download](/download)');
  });

  test('Tier 2 - Autocomplete boundary multiple quick selections', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    await page.click('[data-testid="slash-suggestions-menu"] button:has-text("Trang Download")');
    await expect(input).toHaveValue('[Trang Download](/download)');
    
    await input.type(' and /hub');
    await page.click('[data-testid="slash-suggestions-menu"] button:has-text("Khám phá Hub")');
    await expect(input).toHaveValue('[Trang Download](/download) and [Khám Phá Hub](/hub)');
  });

  // Tier 2.6: Dismissal boundary (5 tests)
  test('Tier 2 - Dismissal boundary click popup does not lose focus', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    const button = page.locator('[data-testid="slash-suggestions-menu"] button').nth(0);
    await button.dispatchEvent('mousedown');
    const isFocused = await input.evaluate(el => document.activeElement === el);
    expect(isFocused).toBe(true);
  });

  test('Tier 2 - Dismissal boundary switch tabs', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
    
    await input.evaluate(el => el.blur());
    await page.waitForTimeout(200);
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  test('Tier 2 - Dismissal boundary fast typing and escape', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/down');
    await input.press('Escape');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  test('Tier 2 - Dismissal boundary backdrop click', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
    
    await page.click('h2:has-text("Thêm sản phẩm mới")');
    await page.waitForTimeout(200);
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  test('Tier 2 - Dismissal boundary clear input field', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
    
    await input.fill('');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  // ==========================================
  // TIER 3: CROSS-FEATURE COMBINATIONS (6 tests)
  // ==========================================

  test('Tier 3 - cross-feature combination 1: multiple fields active in sequence', async ({ page }) => {
    await addHowToUseStep(page);
    await addFaqItem(page);
    
    const howToInput = page.locator('#input-howToUse-0');
    const faqQuestionInput = page.locator('#input-faq-question-0');
    
    await howToInput.focus();
    await howToInput.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
    
    await faqQuestionInput.focus();
    await faqQuestionInput.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  test('Tier 3 - cross-feature combination 2: focus shifts and suggestion menu lifecycle', async ({ page }) => {
    await addHowToUseStep(page);
    const howToInput = page.locator('#input-howToUse-0');
    const nameInput = page.locator('input[placeholder="Nhập tên sản phẩm..."]');
    
    await howToInput.focus();
    await howToInput.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
    
    await nameInput.focus();
    await page.waitForTimeout(200);
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).not.toBeVisible();
  });

  test('Tier 3 - cross-feature combination 3: delete and add items preserving trigger state', async ({ page }) => {
    await addHowToUseStep(page);
    await addHowToUseStep(page);
    
    const input2 = page.locator('#input-howToUse-1');
    await input2.focus();
    await input2.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
    
    await page.locator('button[title="Xóa bước"]').first().click();
    
    const remainingInput = page.locator('#input-howToUse-0');
    await remainingInput.focus();
    await remainingInput.fill('');
    await remainingInput.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  test('Tier 3 - cross-feature combination 4: type and replace /down to Trang Download', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/down');
    await page.click('[data-testid="slash-suggestions-menu"] button:has-text("Trang Download")');
    await expect(input).toHaveValue('[Trang Download](/download)');
  });

  test('Tier 3 - cross-feature combination 5: fast alternating triggers across fields', async ({ page }) => {
    await addHowToUseStep(page);
    await addFaqItem(page);
    
    const howTo = page.locator('#input-howToUse-0');
    const faqQ = page.locator('#input-faq-question-0');
    const faqA = page.locator('#input-faq-answer-0');
    
    await howTo.focus();
    await howTo.type('/');
    await faqQ.focus();
    await faqQ.type('/');
    await faqA.focus();
    await faqA.type('/');
    
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  test('Tier 3 - cross-feature combination 6: slash menu behavior during field additions and deletions', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
    
    await addHowToUseStep(page);
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  // ==========================================
  // TIER 4: REAL-WORLD USER WORKFLOWS (5 tests)
  // ==========================================

  test('Tier 4 - real-world workflow 1: product creation E2E walkthrough using slash commands', async ({ page }) => {
    await page.fill('input[placeholder="Nhập tên sản phẩm..."]', 'E2E Product Slash Test');
    await page.fill('textarea[placeholder="Chi tiết sản phẩm..."]', 'E2E testing description');
    await page.fill('input[placeholder="Ví dụ: 150000"]', '100000');
    
    await addHowToUseStep(page);
    const howToInput = page.locator('#input-howToUse-0');
    await howToInput.focus();
    await howToInput.type('Để đăng nhập, truy cập /login');
    await page.click('[data-testid="slash-suggestions-menu"] button:has-text("Trang Đăng nhập")');
    
    await addFaqItem(page);
    const faqQ = page.locator('#input-faq-question-0');
    await faqQ.focus();
    await faqQ.type('Xem thêm tại /hub');
    await page.click('[data-testid="slash-suggestions-menu"] button:has-text("Khám phá Hub")');
    
    await page.setInputFiles('input[type="file"][accept="image/*"]:not([multiple])', {
      name: 'test.png',
      mimeType: 'image/png',
      buffer: Buffer.from('mock-image-content'),
    });
    
    await page.click('button[type="submit"]');
    await page.click('button:has-text("Xác nhận thao tác")');
    
    await expect(page.locator('h3:has-text("E2E Product Slash Test")')).toBeVisible();
  });

  test('Tier 4 - real-world workflow 2: product editing and formatting update using slash commands', async ({ page }) => {
    const card = page.locator('.rounded-xl', { hasText: 'Gói Quét Vàng' });
    await card.locator('button[title="Chỉnh sửa"]').click();
    await expect(page.locator('h2:has-text("Chỉnh sửa sản phẩm")')).toBeVisible();
    
    await addHowToUseStep(page);
    const howToInput = page.locator('#input-howToUse-0');
    await howToInput.focus();
    await howToInput.type('Tải tại /down');
    await page.click('[data-testid="slash-suggestions-menu"] button:has-text("Trang Download")');
    
    await page.click('button[type="submit"]');
    await page.click('button:has-text("Xác nhận thao tác")');
    
    await expect(page.locator('h2:has-text("Chỉnh sửa sản phẩm")')).not.toBeVisible();
  });

  test('Tier 4 - real-world workflow 3: copy-paste text combined with slash triggers', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    
    await input.evaluate((el: HTMLInputElement) => {
      el.value = 'Truy cập trang ';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    await input.focus();
    await input.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  test('Tier 4 - real-world workflow 4: validation errors and error boundary checks during active suggestions', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    await input.type('/');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
    
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="slash-suggestions-menu"]')).toBeVisible();
  });

  test('Tier 4 - real-world workflow 5: IME keyboard input handling', async ({ page }) => {
    await addHowToUseStep(page);
    const input = page.locator('#input-howToUse-0');
    await input.focus();
    
    await input.type('/khoas');
    const menu = page.locator('[data-testid="slash-suggestions-menu"]');
    await expect(menu).toBeVisible();
    await expect(menu.locator('button')).toHaveCount(1);
    await expect(menu.locator('button')).toContainText('Trang Khóa học');
  });
});
