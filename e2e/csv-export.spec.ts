import { test, expect } from '@playwright/test';
import * as fs from 'fs';

// Seed mock database state
const mockDbData = {
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
      createdAt: '2026-06-19T09:00:00Z'
    },
    'free1': {
      id: 'free1',
      name: 'Tài liệu Free',
      description: 'Tài liệu miễn phí',
      price: 0,
      imageUrl: 'https://example.com/free.png',
      createdAt: '2026-06-19T09:00:00Z',
      category: 'free'
    }
  },
  orders: {
    'order1': {
      id: 'order1',
      userId: 'user1',
      items: [{ id: 'prod1', name: 'Gói Quét Vàng', price: '150000' }],
      totalAmount: 150000,
      status: 'COMPLETED',
      createdAt: '2026-06-20T15:30:00Z'
    },
    'order2': {
      id: 'order2',
      userId: 'user1',
      items: [{ id: 'free1', name: 'Tài liệu Free', price: '0' }],
      totalAmount: 0,
      status: 'COMPLETED',
      createdAt: '2026-06-20T16:00:00Z'
    }
  },
  transactions: {
    'tx1': {
      id: 'tx1',
      orderCode: 123456,
      userId: 'user1',
      userEmail: 'user@test.com',
      amount: 200000,
      description: 'Nạp tiền vào tài khoản',
      status: 'SUCCESS',
      createdAt: '2026-06-20T14:00:00Z'
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

test.describe('Advanced CSV Export E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Authenticate as admin user
    const adminUser = {
      uid: 'admin1',
      email: 'admin@test.com',
      emailVerified: true
    };
    await setupMocks(page, adminUser, mockDbData);
    await page.goto('/admin');
  });

  test('Export Monthly Revenue Report as CSV', async ({ page }) => {
    // Click the "Xuất CSV Nâng cao" button to open the Export Modal
    const exportBtn = page.locator('button:has-text("Xuất CSV Nâng cao")');
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();

    // Wait for the modal to be visible
    const modalHeader = page.locator('h3:has-text("Xuất Báo cáo CSV Nâng cao")');
    await expect(modalHeader).toBeVisible();

    // Configure filters: Select "Báo cáo doanh thu hàng tháng" (monthly-revenue)
    await page.selectOption('select', 'monthly-revenue');

    // Capture the triggered download event
    const downloadPromise = page.waitForEvent('download');

    // Click "Xuất file CSV" button
    await page.click('button:has-text("Xuất file CSV")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('Bao_cao_doanh_thu_hang_thang');
    expect(download.suggestedFilename()).toContain('.csv');

    // Save the downloaded file, read its content, and assert
    const path = await download.path();
    const content = fs.readFileSync(path, 'utf8');

    // Assert UTF-8 BOM '\uFEFF' compatibility
    expect(content.startsWith('\uFEFF')).toBe(true);

    // Assert the content contains valid CSV data (headers and values)
    // Monthly report keys: "Tháng", "Doanh thu đơn hàng trực tiếp (VND)", "Doanh thu nạp ví (VND)", "Tổng cộng (VND)"
    expect(content).toContain('Tháng');
    expect(content).toContain('Doanh thu đơn hàng trực tiếp (VND)');
    expect(content).toContain('Doanh thu nạp ví (VND)');
    expect(content).toContain('Tổng cộng (VND)');

    // Contains month '2026-06' and correct values
    expect(content).toContain('2026-06');
    expect(content).toContain('150000');
    expect(content).toContain('200000');
    expect(content).toContain('350000');
  });

  test('Export Product Revenue Report as CSV', async ({ page }) => {
    // Click the "Xuất CSV Nâng cao" button to open the Export Modal
    const exportBtn = page.locator('button:has-text("Xuất CSV Nâng cao")');
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();

    // Wait for the modal to be visible
    const modalHeader = page.locator('h3:has-text("Xuất Báo cáo CSV Nâng cao")');
    await expect(modalHeader).toBeVisible();

    // Configure filters: Select "Báo cáo doanh thu theo sản phẩm" (product-revenue)
    await page.selectOption('select', 'product-revenue');

    // Capture the triggered download event
    const downloadPromise = page.waitForEvent('download');

    // Click "Xuất file CSV" button
    await page.click('button:has-text("Xuất file CSV")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('Bao_cao_doanh_thu_theo_san_pham');
    expect(download.suggestedFilename()).toContain('.csv');

    // Save the downloaded file, read its content, and assert
    const path = await download.path();
    const content = fs.readFileSync(path, 'utf8');

    // Assert UTF-8 BOM '\uFEFF' compatibility
    expect(content.startsWith('\uFEFF')).toBe(true);

    // Assert headers: "Mã sản phẩm", "Tên sản phẩm", "Số lượng bán", "Doanh thu tích lũy (VND)"
    expect(content).toContain('Mã sản phẩm');
    expect(content).toContain('Tên sản phẩm');
    expect(content).toContain('Số lượng bán');
    expect(content).toContain('Doanh thu tích lũy (VND)');

    // Contains product details
    expect(content).toContain('prod1');
    expect(content).toContain('Gói Quét Vàng');
    expect(content).toContain('1');
    expect(content).toContain('150000');
  });

  test('Export Top Spending Users Report as CSV', async ({ page }) => {
    const exportBtn = page.locator('button:has-text("Xuất CSV Nâng cao")');
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();

    await page.selectOption('select', 'top-spending');
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Xuất file CSV")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('Top_khach_hang_chi_tieu_nhieu_nhat');
    
    const path = await download.path();
    const content = fs.readFileSync(path, 'utf8');

    expect(content.startsWith('\uFEFF')).toBe(true);
    expect(content).toContain('Mã tài khoản (User ID)');
    expect(content).toContain('Email');
    expect(content).toContain('Tổng chi tiêu (VND)');
    expect(content).toContain('user1');
    expect(content).toContain('user@test.com');
    expect(content).toContain('150000');
  });

  test('Export Top Free Resource Users Report as CSV', async ({ page }) => {
    const exportBtn = page.locator('button:has-text("Xuất CSV Nâng cao")');
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();

    await page.selectOption('select', 'top-free');
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Xuất file CSV")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('Top_tai_khoan_tai_nguyen_mien_phi');
    
    const path = await download.path();
    const content = fs.readFileSync(path, 'utf8');

    expect(content.startsWith('\uFEFF')).toBe(true);
    expect(content).toContain('Mã tài khoản (User ID)');
    expect(content).toContain('Số lượt tải miễn phí');
    expect(content).toContain('Tên các tài nguyên miễn phí đã dùng');
    expect(content).toContain('user1');
    expect(content).toContain('Tài liệu Free');
  });

  test('Export Tool/Course Ranking Report as CSV', async ({ page }) => {
    const exportBtn = page.locator('button:has-text("Xuất CSV Nâng cao")');
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();

    await page.selectOption('select', 'tool-course-ranking');
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Xuất file CSV")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('Bang_xep_hang_tool_khoa_hoc');
    
    const path = await download.path();
    const content = fs.readFileSync(path, 'utf8');

    expect(content.startsWith('\uFEFF')).toBe(true);
    expect(content).toContain('Mã sản phẩm');
    expect(content).toContain('Tên sản phẩm');
    expect(content).toContain('Phân loại');
    expect(content).toContain('Tổng lượt sử dụng (Đơn hàng)');
    expect(content).toContain('prod1');
    expect(content).toContain('Gói Quét Vàng');
  });

});
