import { test, expect } from '@playwright/test';
import * as fs from 'fs';

// Seed mock database state
const mockDbData = {
  settings: {
    'general': {
      version: '1.0.0',
      download_url: 'https://example.com/launcher.exe',
      force_update: false
    }
  },
  users: {
    'user1': {
      uid: 'user1',
      email: 'user@test.com',
      displayName: 'Normal User',
      walletBalance: 50000,
      currentTier: 'free',
      role: 'user',
      createdAt: '2026-06-20T10:00:00Z'
    },
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
      createdAt: '2026-06-19T09:00:00Z',
      features: ['Feature 1', 'Feature 2'],
      howToUse: ['Step 1', 'Step 2'],
      category: 'tool'
    }
  }
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
      settings: {},
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

test.describe('E2E Settings and Reordering Test Suite', () => {

  test.describe('Tier 1: Feature Coverage', () => {

    test.describe('R1: System Settings Page', () => {
      test('R1-F1: Page Element Rendering', async ({ page }) => {
        const adminUser = { uid: 'admin1', email: 'admin@test.com' };
        await setupMocks(page, adminUser, mockDbData);
        await page.goto('/admin/settings');
        
        await expect(page.locator('h1, h2')).toContainText('Cấu hình Hệ thống');
        await expect(page.locator('input[placeholder="VD: 1.0.0"]')).toBeVisible();
        await expect(page.locator('input[placeholder="Nhập link Google Drive..."]')).toBeVisible();
        await expect(page.locator('button[role="switch"], input[type="checkbox"]')).toBeVisible();
        await expect(page.locator('button:has-text("Lưu"), button[type="submit"]')).toBeVisible();
        await expect(page.locator('button:has-text("Hủy")')).toBeVisible();
      });

      test('R1-F2: Role-based Guard Allowed', async ({ page }) => {
        const adminUser = { uid: 'admin1', email: 'admin@test.com' };
        await setupMocks(page, adminUser, mockDbData);
        await page.goto('/admin/settings');
        
        await expect(page).toHaveURL(/.*\/admin\/settings/);
        await expect(page.locator('text=Cấu hình Hệ thống')).toBeVisible();
      });

      test('R1-F3: Form Data Binding', async ({ page }) => {
        const adminUser = { uid: 'admin1', email: 'admin@test.com' };
        await setupMocks(page, adminUser, mockDbData);
        await page.goto('/admin/settings');

        const versionInput = page.locator('input[placeholder="VD: 1.0.0"]');
        const urlInput = page.locator('input[placeholder="Nhập link Google Drive..."]');
        
        await versionInput.fill('1.2.5');
        await urlInput.fill('https://example.com/mock.exe');

        await expect(versionInput).toHaveValue('1.2.5');
        await expect(urlInput).toHaveValue('https://example.com/mock.exe');
      });

      test('R1-F4: Save Configuration Flow', async ({ page }) => {
        const adminUser = { uid: 'admin1', email: 'admin@test.com' };
        await setupMocks(page, adminUser, mockDbData);
        await page.goto('/admin/settings');

        await page.fill('input[placeholder="VD: 1.0.0"]', '1.2.5');
        await page.fill('input[placeholder="Nhập link Google Drive..."]', 'https://example.com/mock.exe');
        
        // Toggle force update
        const forceUpdateToggle = page.locator('button[role="switch"], input[type="checkbox"]');
        await forceUpdateToggle.click();

        await page.click('button:has-text("Lưu"), button[type="submit"]');
        await page.click('button:has-text("Xác nhận thao tác")');

        const dbState = await page.evaluate(() => window.mockDbState);
        expect(dbState.settings.general.version).toBe('1.2.5');
        expect(dbState.settings.general.download_url).toBe('https://example.com/mock.exe');
        expect(dbState.settings.general.force_update).toBe(true);
      });

      test('R1-F5: Google Drive Link Auto-Conversion on Save', async ({ page }) => {
        const adminUser = { uid: 'admin1', email: 'admin@test.com' };
        await setupMocks(page, adminUser, mockDbData);
        await page.goto('/admin/settings');

        await page.fill('input[placeholder="VD: 1.0.0"]', '1.0.0');
        await page.fill('input[placeholder="Nhập link Google Drive..."]', 'https://drive.google.com/file/d/abc123xyz/view');
        
        await page.click('button:has-text("Lưu"), button[type="submit"]');
        await page.click('button:has-text("Xác nhận thao tác")');

        const dbState = await page.evaluate(() => window.mockDbState);
        expect(dbState.settings.general.download_url).toBe('https://drive.google.com/uc?export=download&id=abc123xyz');
      });
    });

    test.describe('R2: Product Form Upgrade', () => {
      test('R2-F1: Reorder Buttons Render', async ({ page }) => {
        const adminUser = { uid: 'admin1', email: 'admin@test.com' };
        await setupMocks(page, adminUser, mockDbData);
        await page.goto('/admin/products');

        await page.click('button:has-text("Thêm sản phẩm")');
        
        // Open features or how to use lists
        await expect(page.locator('button[title="Di chuyển lên"], button:has-text("↑")').first()).toBeVisible();
        await expect(page.locator('button[title="Di chuyển xuống"], button:has-text("↓")').first()).toBeVisible();
      });

      test('R2-F2: Reorder Features List (Up/Down)', async ({ page }) => {
        const adminUser = { uid: 'admin1', email: 'admin@test.com' };
        await setupMocks(page, adminUser, mockDbData);
        await page.goto('/admin/products');

        await page.click('button:has-text("Thêm sản phẩm")');
        
        // Add 3 features
        const featureInputs = page.locator('input[placeholder="Nhập tính năng..."]');
        await featureInputs.nth(0).fill('Feature A');
        await page.click('button:has-text("Thêm tính năng")');
        await featureInputs.nth(1).fill('Feature B');
        await page.click('button:has-text("Thêm tính năng")');
        await featureInputs.nth(2).fill('Feature C');

        // Click Down on Feature A (index 0)
        await page.locator('button[title="Di chuyển xuống"], button:has-text("↓")').nth(0).click();

        // Verify values reordered: Feature B, Feature A, Feature C
        await expect(featureInputs.nth(0)).toHaveValue('Feature B');
        await expect(featureInputs.nth(1)).toHaveValue('Feature A');
        await expect(featureInputs.nth(2)).toHaveValue('Feature C');
      });

      test('R2-F3: Reorder How to Use List (Up/Down)', async ({ page }) => {
        const adminUser = { uid: 'admin1', email: 'admin@test.com' };
        await setupMocks(page, adminUser, mockDbData);
        await page.goto('/admin/products');

        await page.click('button:has-text("Thêm sản phẩm")');
        
        const stepInputs = page.locator('input[placeholder="Nhập bước hướng dẫn..."], textarea[placeholder="Nhập bước hướng dẫn..."]');
        await stepInputs.nth(0).fill('Step A');
        await page.click('button:has-text("Thêm hướng dẫn")');
        await stepInputs.nth(1).fill('Step B');
        await page.click('button:has-text("Thêm hướng dẫn")');
        await stepInputs.nth(2).fill('Step C');

        // Click Down on Step A (index 0)
        await page.locator('button[title="Di chuyển xuống"], button:has-text("↓")').nth(0).click();

        await expect(stepInputs.nth(0)).toHaveValue('Step B');
        await expect(stepInputs.nth(1)).toHaveValue('Step A');
        await expect(stepInputs.nth(2)).toHaveValue('Step C');
      });

      test('R2-F4: Product Creation Step 1 Autofill', async ({ page }) => {
        const adminUser = { uid: 'admin1', email: 'admin@test.com' };
        const seededDb = JSON.parse(JSON.stringify(mockDbData));
        seededDb.settings.general.download_url = 'https://drive.google.com/uc?export=download&id=launcher123';
        
        await setupMocks(page, adminUser, seededDb);
        await page.goto('/admin/products');

        await page.click('button:has-text("Thêm sản phẩm")');
        await page.fill('input[placeholder="VD: tool, course..."]', 'tool');

        const step1Input = page.locator('input[placeholder="Nhập bước hướng dẫn..."], textarea[placeholder="Nhập bước hướng dẫn..."]').first();
        await expect(step1Input).toHaveValue('Cài đặt App Launcher để tải và quản lý các tool. Link tải: https://drive.google.com/uc?export=download&id=launcher123');
      });

      test('R2-F5: Array Boundary Controls', async ({ page }) => {
        const adminUser = { uid: 'admin1', email: 'admin@test.com' };
        await setupMocks(page, adminUser, mockDbData);
        await page.goto('/admin/products');

        await page.click('button:has-text("Thêm sản phẩm")');
        
        // Add step A, step B
        const stepInputs = page.locator('input[placeholder="Nhập bước hướng dẫn..."], textarea[placeholder="Nhập bước hướng dẫn..."]');
        await stepInputs.nth(0).fill('Step A');
        await page.click('button:has-text("Thêm hướng dẫn")');
        await stepInputs.nth(1).fill('Step B');

        // First item's UP button is disabled/hidden
        const upBtn0 = page.locator('button[title="Di chuyển lên"], button:has-text("↑")').nth(0);
        await expect(upBtn0).toBeDisabled();

        // Last item's DOWN button is disabled/hidden
        const downBtn1 = page.locator('button[title="Di chuyển xuống"], button:has-text("↓")').nth(1);
        await expect(downBtn1).toBeDisabled();
      });
    });

    test.describe('R3: Public Download Page', () => {
      test('R3-F1: Public Access', async ({ page }) => {
        await setupMocks(page, null, mockDbData);
        const response = await page.goto('/download');
        expect(response?.status()).toBe(200);
      });

      test('R3-F2: Display Version & URL Binding', async ({ page }) => {
        const seededDb = JSON.parse(JSON.stringify(mockDbData));
        seededDb.settings.general.version = '1.9.9';
        seededDb.settings.general.download_url = 'https://example.com/launcher.exe';

        await setupMocks(page, null, seededDb);
        await page.goto('/download');

        await expect(page.locator('text=Phiên bản: 1.9.9')).toBeVisible();
        
        const dlButton = page.locator('a:has-text("Tải App Launcher"), button:has-text("Tải App Launcher")');
        await expect(dlButton).toHaveAttribute('href', 'https://example.com/launcher.exe');
      });

      test('R3-F3: Download Action Redirection', async ({ page }) => {
        const seededDb = JSON.parse(JSON.stringify(mockDbData));
        seededDb.settings.general.download_url = 'https://example.com/launcher.exe';

        await setupMocks(page, null, seededDb);
        await page.goto('/download');

        const dlButton = page.locator('a:has-text("Tải App Launcher")');
        await expect(dlButton).toHaveAttribute('target', '_blank');
      });

      test('R3-F4: Header Navbar Link presence', async ({ page }) => {
        await setupMocks(page, null, mockDbData);
        await page.goto('/');

        const navbarDownloadLink = page.locator('header a[href="/download"]');
        await expect(navbarDownloadLink).toContainText('Download');
      });

      test('R3-F5: Mobile Menu Link presence', async ({ page }) => {
        await setupMocks(page, null, mockDbData);
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        await page.click('button[aria-label="Toggle menu"]');
        await expect(page.locator('nav a[href="/download"]')).toBeVisible();
      });
    });
  });

  test.describe('Tier 2: Boundary & Corner Cases', () => {

    test('R1-B1: Unauthenticated Redirect', async ({ page }) => {
      await setupMocks(page, null, mockDbData);
      await page.goto('/admin/settings');
      await expect(page).toHaveURL(/.*\/login\?redirect=%2Fadmin%2Fsettings/);
    });

    test('R1-B2: Standard User Access Guard', async ({ page }) => {
      const standardUser = { uid: 'user1', email: 'user@test.com' };
      await setupMocks(page, standardUser, mockDbData);
      await page.goto('/admin/settings');
      await expect(page).toHaveURL(/\/$/);
    });

    test('R1-B3: Empty Fields Validation', async ({ page }) => {
      const adminUser = { uid: 'admin1', email: 'admin@test.com' };
      await setupMocks(page, adminUser, mockDbData);
      await page.goto('/admin/settings');

      await page.fill('input[placeholder="VD: 1.0.0"]', '');
      await page.fill('input[placeholder="Nhập link Google Drive..."]', '');

      await page.click('button:has-text("Lưu"), button[type="submit"]');

      // Check that HTML5 validation prevents submission or showing validation messages
      const isInvalid = await page.evaluate(() => {
        const input = document.querySelector('input[placeholder="VD: 1.0.0"]') as HTMLInputElement;
        return input && !input.validity.valid;
      });
      expect(isInvalid).toBe(true);
    });

    test('R1-B4: Cancel Modifications', async ({ page }) => {
      const adminUser = { uid: 'admin1', email: 'admin@test.com' };
      await setupMocks(page, adminUser, mockDbData);
      await page.goto('/admin/settings');

      await page.fill('input[placeholder="VD: 1.0.0"]', '2.0.0');
      await page.click('button:has-text("Hủy")');

      const dbState = await page.evaluate(() => window.mockDbState);
      expect(dbState.settings.general.version).toBe('1.0.0'); // remains unchanged
    });

    test('R1-B5: Google Drive ID Extraction Edge Cases', async ({ page }) => {
      const adminUser = { uid: 'admin1', email: 'admin@test.com' };
      await setupMocks(page, adminUser, mockDbData);
      await page.goto('/admin/settings');

      // Alternative drive pattern with queries
      await page.fill('input[placeholder="Nhập link Google Drive..."]', 'https://drive.google.com/open?id=1234567890abcdef-XYZ&usp=sharing');
      await page.click('button:has-text("Lưu"), button[type="submit"]');
      await page.click('button:has-text("Xác nhận thao tác")');

      const dbState = await page.evaluate(() => window.mockDbState);
      expect(dbState.settings.general.download_url).toBe('https://drive.google.com/uc?export=download&id=1234567890abcdef-XYZ');
    });

    test('R2-B1: Reordering Array of Size 1', async ({ page }) => {
      const adminUser = { uid: 'admin1', email: 'admin@test.com' };
      await setupMocks(page, adminUser, mockDbData);
      await page.goto('/admin/products');

      await page.click('button:has-text("Thêm sản phẩm")');
      const stepInputs = page.locator('input[placeholder="Nhập bước hướng dẫn..."], textarea[placeholder="Nhập bước hướng dẫn..."]');
      await stepInputs.nth(0).fill('Step A');

      await expect(page.locator('button[title="Di chuyển lên"], button:has-text("↑")')).toBeDisabled();
      await expect(page.locator('button[title="Di chuyển xuống"], button:has-text("↓")')).toBeDisabled();
    });

    test('R2-B2: Empty settings/general Doc Autofill', async ({ page }) => {
      const adminUser = { uid: 'admin1', email: 'admin@test.com' };
      const customDb = JSON.parse(JSON.stringify(mockDbData));
      delete customDb.settings;

      await setupMocks(page, adminUser, customDb);
      await page.goto('/admin/products');

      await page.click('button:has-text("Thêm sản phẩm")');
      await page.fill('input[placeholder="VD: tool, course..."]', 'tool');

      // Verify page loaded successfully and didn't crash
      const modalHeader = page.locator('h2:has-text("Thêm sản phẩm mới")');
      await expect(modalHeader).toBeVisible();
      
      const step1Input = page.locator('input[placeholder="Nhập bước hướng dẫn..."], textarea[placeholder="Nhập bước hướng dẫn..."]').first();
      await expect(step1Input).toHaveValue(''); // fallback to empty
    });

    test('R2-B3: Post-Autofill Editability', async ({ page }) => {
      const adminUser = { uid: 'admin1', email: 'admin@test.com' };
      await setupMocks(page, adminUser, mockDbData);
      await page.goto('/admin/products');

      await page.click('button:has-text("Thêm sản phẩm")');
      await page.fill('input[placeholder="VD: tool, course..."]', 'tool');

      const step1Input = page.locator('input[placeholder="Nhập bước hướng dẫn..."], textarea[placeholder="Nhập bước hướng dẫn..."]').first();
      await step1Input.fill('Custom launcher download step overrides default');

      await page.fill('input[placeholder="Nhập tên sản phẩm..."]', 'Custom Tool');
      await page.fill('textarea[placeholder="Chi tiết sản phẩm..."]', 'Tool description');
      await page.fill('input[placeholder="Ví dụ: 150000"]', '100000');
      
      await page.setInputFiles('input[type="file"][accept="image/*"]:not([multiple])', {
        name: 'test.png',
        mimeType: 'image/png',
        buffer: Buffer.from('mock-image'),
      });

      await page.click('button[type="submit"]');
      await page.click('button:has-text("Xác nhận thao tác")');

      const dbState = await page.evaluate(() => window.mockDbState);
      const product = Object.values(dbState.products).find((p: any) => p.name === 'Custom Tool') as any;
      expect(product.howToUse[0]).toBe('Custom launcher download step overrides default');
    });

    test('R2-B4: Empty Fields Reordering', async ({ page }) => {
      const adminUser = { uid: 'admin1', email: 'admin@test.com' };
      await setupMocks(page, adminUser, mockDbData);
      await page.goto('/admin/products');

      await page.click('button:has-text("Thêm sản phẩm")');
      
      const stepInputs = page.locator('input[placeholder="Nhập bước hướng dẫn..."], textarea[placeholder="Nhập bước hướng dẫn..."]');
      await stepInputs.nth(0).fill('Step 1 content');
      await page.click('button:has-text("Thêm hướng dẫn")');
      await stepInputs.nth(1).fill(''); // Blank
      await page.click('button:has-text("Thêm hướng dẫn")');
      await stepInputs.nth(2).fill('Step 3 content');

      // Click Up on Step 3 (index 2) to swap it with blank (index 1)
      await page.locator('button[title="Di chuyển lên"], button:has-text("↑")').nth(2).click();

      await expect(stepInputs.nth(1)).toHaveValue('Step 3 content');
      await expect(stepInputs.nth(2)).toHaveValue('');
    });

    test('R2-B5: Duplicate Array Deletion Re-indexing', async ({ page }) => {
      const adminUser = { uid: 'admin1', email: 'admin@test.com' };
      await setupMocks(page, adminUser, mockDbData);
      await page.goto('/admin/products');

      await page.click('button:has-text("Thêm sản phẩm")');
      const stepInputs = page.locator('input[placeholder="Nhập bước hướng dẫn..."], textarea[placeholder="Nhập bước hướng dẫn..."]');
      await stepInputs.nth(0).fill('Step A');
      await page.click('button:has-text("Thêm hướng dẫn")');
      await stepInputs.nth(1).fill('Step B');
      await page.click('button:has-text("Thêm hướng dẫn")');
      await stepInputs.nth(2).fill('Step C');

      // Delete Step B (index 1)
      await page.locator('button[title="Xóa bước"], button:has-text("Xóa")').nth(1).click();

      // Check bounds are re-evaluated: now only Step A and Step C exist
      await expect(stepInputs.nth(0)).toHaveValue('Step A');
      await expect(stepInputs.nth(1)).toHaveValue('Step C');
      await expect(page.locator('button[title="Di chuyển xuống"], button:has-text("↓")').nth(1)).toBeDisabled();
    });

    test('R3-B1: DB Offline/Missing Document Fallback', async ({ page }) => {
      const customDb = JSON.parse(JSON.stringify(mockDbData));
      delete customDb.settings;

      await setupMocks(page, null, customDb);
      await page.goto('/download');

      await expect(page.locator('text=Không tìm thấy phiên bản ứng dụng')).toBeVisible();
      const dlBtn = page.locator('button:has-text("Tải App Launcher")');
      await expect(dlBtn).toBeDisabled();
    });

    test('R3-B2: Long Version Styling Layout', async ({ page }) => {
      const customDb = JSON.parse(JSON.stringify(mockDbData));
      customDb.settings.general.version = '2.0.1-beta-build-9999-final-release-critical-patch';

      await setupMocks(page, null, customDb);
      await page.goto('/download');

      const versionText = page.locator('text=Phiên bản: 2.0.1-beta-build-9999-final-release-critical-patch');
      await expect(versionText).toBeVisible();
      
      const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(hasHorizontalScroll).toBe(false);
    });

    test('R3-B3: Stale Cache Validation', async ({ page }) => {
      const customDb = JSON.parse(JSON.stringify(mockDbData));
      await setupMocks(page, null, customDb);
      await page.goto('/download');

      await expect(page.locator('text=Phiên bản: 1.0.0')).toBeVisible();

      // Dynamically update Firestore setting inside browser window context
      await page.evaluate(() => {
        window.mockDbState.settings.general.version = '1.0.9';
      });

      await page.reload();
      await expect(page.locator('text=Phiên bản: 1.0.9')).toBeVisible();
    });

    test('R3-B4: Navbar Active Styling', async ({ page }) => {
      await setupMocks(page, null, mockDbData);
      await page.goto('/download');

      const activeLink = page.locator('header a[href="/download"]');
      await expect(activeLink).toHaveClass(/active|text-neonPurple/); // expects some active styles
    });

    test('R3-B5: Non-converted URL direct route', async ({ page }) => {
      const customDb = JSON.parse(JSON.stringify(mockDbData));
      customDb.settings.general.download_url = 'https://github.com/myorg/myapp/releases/download/v1.0.0/app.exe';

      await setupMocks(page, null, customDb);
      await page.goto('/download');

      const dlBtn = page.locator('a:has-text("Tải App Launcher")');
      await expect(dlBtn).toHaveAttribute('href', 'https://github.com/myorg/myapp/releases/download/v1.0.0/app.exe');
    });
  });

  test.describe('Tier 3: Cross-Feature Combinations', () => {

    test('XF-1: Admin Settings update propagates to Public Download', async ({ page }) => {
      const adminUser = { uid: 'admin1', email: 'admin@test.com' };
      await setupMocks(page, adminUser, mockDbData);

      // Log in and update settings
      await page.goto('/admin/settings');
      await page.fill('input[placeholder="VD: 1.0.0"]', '4.2.1');
      await page.fill('input[placeholder="Nhập link Google Drive..."]', 'https://example.com/launcher-4.2.1.exe');
      await page.click('button:has-text("Lưu"), button[type="submit"]');
      await page.click('button:has-text("Xác nhận thao tác")');

      // Logout and go to download
      await page.goto('/download');
      await expect(page.locator('text=Phiên bản: 4.2.1')).toBeVisible();
      const dlBtn = page.locator('a:has-text("Tải App Launcher")');
      await expect(dlBtn).toHaveAttribute('href', 'https://example.com/launcher-4.2.1.exe');
    });

    test('XF-2: Admin Settings update propagates to Product Creation Autofill', async ({ page }) => {
      const adminUser = { uid: 'admin1', email: 'admin@test.com' };
      await setupMocks(page, adminUser, mockDbData);

      await page.goto('/admin/settings');
      await page.fill('input[placeholder="Nhập link Google Drive..."]', 'https://drive.google.com/file/d/newLaunchId/view');
      await page.click('button:has-text("Lưu"), button[type="submit"]');
      await page.click('button:has-text("Xác nhận thao tác")');

      await page.goto('/admin/products');
      await page.click('button:has-text("Thêm sản phẩm")');
      await page.fill('input[placeholder="VD: tool, course..."]', 'tool');

      const step1Input = page.locator('input[placeholder="Nhập bước hướng dẫn..."], textarea[placeholder="Nhập bước hướng dẫn..."]').first();
      await expect(step1Input).toHaveValue('Cài đặt App Launcher để tải và quản lý các tool. Link tải: https://drive.google.com/uc?export=download&id=newLaunchId');
    });

    test('XF-3: Products array reordering matches Public Tool Details Guide', async ({ page }) => {
      const adminUser = { uid: 'admin1', email: 'admin@test.com' };
      await setupMocks(page, adminUser, mockDbData);

      await page.goto('/admin/products');
      // Edit prod1
      const card = page.locator('.rounded-xl', { hasText: 'Gói Quét Vàng' });
      await card.locator('button[title="Chỉnh sửa"]').click();

      // Add a step
      await page.click('button:has-text("Thêm hướng dẫn")');
      const stepInputs = page.locator('input[placeholder="Nhập bước hướng dẫn..."], textarea[placeholder="Nhập bước hướng dẫn..."]');
      await stepInputs.nth(2).fill('Step 3 manual instructions');

      // Reorder: Move Step 3 up
      await page.locator('button[title="Di chuyển lên"], button:has-text("↑")').nth(2).click();

      await page.click('button[type="submit"]');
      await page.click('button:has-text("Xác nhận thao tác")');

      // Navigate to public page
      await page.goto('/tools/prod1');
      const steps = page.locator('[data-testid="tool-how-to-use-step"]');
      await expect(steps.nth(1)).toHaveText('Step 3 manual instructions');
    });

    test('XF-4: Auth State toggles Header visibility', async ({ page }) => {
      await setupMocks(page, null, mockDbData);
      await page.goto('/');

      await expect(page.locator('header a[href="/admin"]')).not.toBeVisible();
      await expect(page.locator('header a[href="/download"]')).toBeVisible();

      // Log in admin
      await page.evaluate(() => {
        window.setMockUser({ uid: 'admin1', email: 'admin@test.com' });
        localStorage.setItem('isLoggedIn', 'true');
      });

      await page.reload();
      await expect(page.locator('header a[href="/admin"]')).toBeVisible();
      await expect(page.locator('header a[href="/download"]')).toBeVisible();
    });

    test('XF-5: Google Drive Conversion Consistency', async ({ page }) => {
      const adminUser = { uid: 'admin1', email: 'admin@test.com' };
      await setupMocks(page, adminUser, mockDbData);

      // Verify settings page conversion
      await page.goto('/admin/settings');
      await page.fill('input[placeholder="Nhập link Google Drive..."]', 'https://drive.google.com/file/d/driveA/view');
      await page.click('button:has-text("Lưu"), button[type="submit"]');
      await page.click('button:has-text("Xác nhận thao tác")');

      let dbState = await page.evaluate(() => window.mockDbState);
      expect(dbState.settings.general.download_url).toBe('https://drive.google.com/uc?export=download&id=driveA');

      // Verify product page conversion
      await page.goto('/admin/products');
      await page.click('button:has-text("Thêm sản phẩm")');
      await page.fill('input[placeholder="VD: tool, course..."]', 'tool');
      await page.fill('input[placeholder="Nhập link Google Drive..."]', 'https://drive.google.com/file/d/driveB/view');
      await page.fill('input[placeholder="Nhập tên sản phẩm..."]', 'New Tool B');
      await page.fill('textarea[placeholder="Chi tiết sản phẩm..."]', 'Description');
      await page.fill('input[placeholder="Ví dụ: 150000"]', '100000');
      
      await page.setInputFiles('input[type="file"][accept="image/*"]:not([multiple])', {
        name: 'test.png',
        mimeType: 'image/png',
        buffer: Buffer.from('mock'),
      });
      await page.click('button[type="submit"]');
      await page.click('button:has-text("Xác nhận thao tác")');

      dbState = await page.evaluate(() => window.mockDbState);
      const product = Object.values(dbState.products).find((p: any) => p.name === 'New Tool B') as any;
      expect(product.download_url).toBe('https://drive.google.com/uc?export=download&id=driveB');
    });
  });

  test.describe('Tier 4: Real-world User Flows', () => {

    test('Flow 1: Admin Persona System Update & Product Creation', async ({ page }) => {
      const adminUser = { uid: 'admin1', email: 'admin@test.com' };
      await setupMocks(page, adminUser, mockDbData);

      // 1. Admin configures System Settings
      await page.goto('/admin/settings');
      await page.fill('input[placeholder="VD: 1.0.0"]', '3.0.0');
      await page.fill('input[placeholder="Nhập link Google Drive..."]', 'https://drive.google.com/file/d/launcher300/view');
      
      const forceUpdateToggle = page.locator('button[role="switch"], input[type="checkbox"]');
      const isChecked = await forceUpdateToggle.isChecked();
      if (!isChecked) {
        await forceUpdateToggle.click();
      }

      await page.click('button:has-text("Lưu"), button[type="submit"]');
      await page.click('button:has-text("Xác nhận thao tác")');

      // 2. Admin creates a new product
      await page.goto('/admin/products');
      await page.click('button:has-text("Thêm sản phẩm")');
      await page.fill('input[placeholder="VD: tool, course..."]', 'tool');

      // Verify prefill
      const step1Input = page.locator('input[placeholder="Nhập bước hướng dẫn..."], textarea[placeholder="Nhập bước hướng dẫn..."]').first();
      await expect(step1Input).toHaveValue('Cài đặt App Launcher để tải và quản lý các tool. Link tải: https://drive.google.com/uc?export=download&id=launcher300');

      // Add two more steps
      await page.click('button:has-text("Thêm hướng dẫn")');
      const steps = page.locator('input[placeholder="Nhập bước hướng dẫn..."], textarea[placeholder="Nhập bước hướng dẫn..."]');
      await steps.nth(1).fill('Chạy app.exe');
      
      await page.click('button:has-text("Thêm hướng dẫn")');
      await steps.nth(2).fill('Cấp quyền admin');

      // Reorder Step 3 ("Cấp quyền admin") to Step 2
      await page.locator('button[title="Di chuyển lên"], button:has-text("↑")').nth(2).click();

      // Add features
      const featureInputs = page.locator('input[placeholder="Nhập tính năng..."]');
      await featureInputs.nth(0).fill('Nhanh');
      await page.click('button:has-text("Thêm tính năng")');
      await featureInputs.nth(1).fill('Mạnh');
      await page.click('button:has-text("Thêm tính năng")');
      await featureInputs.nth(2).fill('Rẻ');

      // Move "Nhanh" down to index 1
      await page.locator('button[title="Di chuyển xuống"], button:has-text("↓")').nth(0).click();

      // Fill basic details
      await page.fill('input[placeholder="Nhập tên sản phẩm..."]', 'Tool Youtube V3');
      await page.fill('textarea[placeholder="Chi tiết sản phẩm..."]', 'Mô tả chi tiết V3');
      await page.fill('input[placeholder="Ví dụ: 150000"]', '299000');
      
      await page.setInputFiles('input[type="file"][accept="image/*"]:not([multiple])', {
        name: 'thumbnail.png',
        mimeType: 'image/png',
        buffer: Buffer.from('mock-thumbnail'),
      });

      await page.click('button[type="submit"]');
      await page.click('button:has-text("Xác nhận thao tác")');

      // Verify db updates
      const dbState = await page.evaluate(() => window.mockDbState);
      const product = Object.values(dbState.products).find((p: any) => p.name === 'Tool Youtube V3') as any;
      expect(product).toBeDefined();
      expect(product.features).toEqual(['Mạnh', 'Nhanh', 'Rẻ']);
      expect(product.howToUse).toEqual([
        'Cài đặt App Launcher để tải và quản lý các tool. Link tải: https://drive.google.com/uc?export=download&id=launcher300',
        'Cấp quyền admin',
        'Chạy app.exe'
      ]);
    });

    test('Flow 2: End-User Download & Guide Verification', async ({ page }) => {
      // Seed DB with state from Flow 1
      const flowDb = JSON.parse(JSON.stringify(mockDbData));
      flowDb.settings.general.version = '3.0.0';
      flowDb.settings.general.download_url = 'https://drive.google.com/uc?export=download&id=launcher300';
      flowDb.products['tool-v3'] = {
        id: 'tool-v3',
        name: 'Tool Youtube V3',
        description: 'Mô tả chi tiết V3',
        price: 299000,
        imageUrl: 'https://example.com/thumbnail.png',
        category: 'tool',
        features: ['Mạnh', 'Nhanh', 'Rẻ'],
        howToUse: [
          'Cài đặt App Launcher để tải và quản lý các tool. Link tải: https://drive.google.com/uc?export=download&id=launcher300',
          'Cấp quyền admin',
          'Chạy app.exe'
        ]
      };

      await setupMocks(page, null, flowDb);

      // 1. Guest clicks "Download" in header
      await page.goto('/');
      await page.click('header a[href="/download"]');
      await expect(page).toHaveURL(/\/download/);

      // 2. Verify download page launcher options
      await expect(page.locator('text=Phiên bản: 3.0.0')).toBeVisible();
      const dlBtn = page.locator('a:has-text("Tải App Launcher")');
      await expect(dlBtn).toHaveAttribute('href', 'https://drive.google.com/uc?export=download&id=launcher300');

      // 3. User navigates to tool detail page
      await page.goto('/tools/tool-v3');
      
      // Verify features
      const features = page.locator('[data-testid="tool-feature-item"]');
      await expect(features.nth(0)).toHaveText('Mạnh');
      await expect(features.nth(1)).toHaveText('Nhanh');
      await expect(features.nth(2)).toHaveText('Rẻ');

      // Verify how-to-use guide
      const steps = page.locator('[data-testid="tool-how-to-use-step"]');
      await expect(steps.nth(0)).toContainText('launcher300');
      await expect(steps.nth(1)).toHaveText('Cấp quyền admin');
      await expect(steps.nth(2)).toHaveText('Chạy app.exe');
    });
  });

});
