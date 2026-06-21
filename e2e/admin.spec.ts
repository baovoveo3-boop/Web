import { test, expect } from '@playwright/test';

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

test.describe('Admin Dashboard E2E Test Suite', () => {

  test.describe('1. Access Control / Guards', () => {

    test('Accessing /admin redirects unauthenticated users to /login', async ({ page }) => {
      // Setup: null user (unauthenticated)
      await setupMocks(page, null, mockDbData);
      
      await page.goto('/admin');
      
      // Wait for URL redirect to /login
      await expect(page).toHaveURL(/.*\/login\?redirect=%2Fadmin/);
    });

    test('Accessing /admin redirects standard users to /', async ({ page }) => {
      // Setup: Standard User
      const standardUser = {
        uid: 'user1',
        email: 'user@test.com',
        emailVerified: true
      };
      await setupMocks(page, standardUser, mockDbData);

      await page.goto('/admin');

      // Should be redirected to / (homepage)
      await expect(page).toHaveURL(/\/$/);
    });

    test('Accessing /admin permits admin users to enter', async ({ page }) => {
      // Setup: Admin User
      const adminUser = {
        uid: 'admin1',
        email: 'admin@test.com',
        emailVerified: true
      };
      await setupMocks(page, adminUser, mockDbData);

      await page.goto('/admin');

      // URL stays on /admin
      await expect(page).toHaveURL(/.*\/admin/);
      await expect(page.locator('h1')).toContainText('Tổng quan Thống kê');
    });

  });

  test.describe('2. Navigation and Header', () => {

    test('Header renders Admin Panel link for admins but not for standard users', async ({ page }) => {
      // Scenario A: Standard user
      const standardUser = {
        uid: 'user1',
        email: 'user@test.com'
      };
      await setupMocks(page, standardUser, mockDbData);
      await page.goto('/');
      await expect(page.locator('text=Admin Panel')).not.toBeVisible();

      // Scenario B: Admin user
      const adminUser = {
        uid: 'admin1',
        email: 'admin@test.com'
      };
      await setupMocks(page, adminUser, mockDbData);
      await page.goto('/');
      await expect(page.locator('text=Admin Panel').first()).toBeVisible();
    });

    test('Mobile view Header renders Admin Panel link for admins', async ({ page }) => {
      const adminUser = {
        uid: 'admin1',
        email: 'admin@test.com'
      };
      await setupMocks(page, adminUser, mockDbData);
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Open menu dropdown
      const menuBtn = page.locator('button[aria-label="Toggle menu"]');
      await menuBtn.click();

      // Check Mobile Admin link is present
      await expect(page.locator('nav').locator('text=Admin Panel')).toBeVisible();
    });

  });

  test.describe('3. Admin Layout & Sidebar', () => {

    test('Sidebar navigation contains all correct admin subpage links', async ({ page }) => {
      const adminUser = {
        uid: 'admin1',
        email: 'admin@test.com'
      };
      await setupMocks(page, adminUser, mockDbData);
      await page.goto('/admin');

      const sidebar = page.locator('aside');
      await expect(sidebar).toBeVisible();

      // Verify the links
      const overviewLink = sidebar.locator('a[href="/admin"]');
      const productsLink = sidebar.locator('a[href="/admin/products"]');
      const ordersLink = sidebar.locator('a[href="/admin/orders"]');
      const usersLink = sidebar.locator('a[href="/admin/users"]');
      const hubLink = sidebar.locator('a[href="/hub"]');

      await expect(overviewLink).toContainText('Thống kê Tổng quan');
      await expect(productsLink).toContainText('Quản lý Sản phẩm');
      await expect(ordersLink).toContainText('Giao dịch & Đơn hàng');
      await expect(usersLink).toContainText('Quản lý Người dùng');
      await expect(hubLink).toContainText('Quay về Hub');
    });

  });

  test.describe('4. Statistics Page', () => {

    test('Renders overview cards with computed dashboard stats correctly', async ({ page }) => {
      const adminUser = {
        uid: 'admin1',
        email: 'admin@test.com'
      };
      await setupMocks(page, adminUser, mockDbData);
      await page.goto('/admin');

      // Verify stats cards
      await expect(page.locator('text=TỔNG DOANH THU')).toBeVisible();
      // Total Revenue = 150,000 (order1) + 200,000 (tx1) = 350,000đ
      await expect(page.locator('h3:has-text("350.000đ")')).toBeVisible();

      await expect(page.locator('text=NGƯỜI DÙNG')).toBeVisible();
      // Total users count is 2 (user1 & admin1)
      await expect(page.locator('h3:has-text("2")')).toBeVisible();

      await expect(page.locator('text=ĐƠN MUA')).toBeVisible();
      // Order revenue is 150,000đ (1 completed order)
      await expect(page.locator('h3:has-text("150.000đ")')).toBeVisible();

      await expect(page.locator('text=Ví nạp')).toBeVisible();
      // Deposit revenue is 200,000đ (1 successful transaction)
      await expect(page.locator('h3:has-text("200.000đ")')).toBeVisible();
    });

  });

  test.describe('5. Products CRUD Panel', () => {

    test.beforeEach(async ({ page }) => {
      const adminUser = {
        uid: 'admin1',
        email: 'admin@test.com'
      };
      await setupMocks(page, adminUser, mockDbData);
      await page.goto('/admin/products');
      
      // Auto accept confirm dialogs
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
    });

    test('Renders existing product list', async ({ page }) => {
      await expect(page.locator('h3:has-text("Gói Quét Vàng")')).toBeVisible();
      await expect(page.locator('text=150.000đ')).toBeVisible();
    });

    test('Supports adding a new product', async ({ page }) => {
      await page.click('button:has-text("Thêm sản phẩm")');

      // Wait for Modal to open
      await expect(page.locator('h2:has-text("Thêm sản phẩm mới")')).toBeVisible();

      // Fill in forms
      await page.fill('input[placeholder="Nhập tên sản phẩm..."]', 'Gói Bạch Kim');
      await page.fill('textarea[placeholder="Chi tiết sản phẩm..."]', 'Mô tả tính năng gói Bạch Kim mới tinh');
      await page.fill('input[placeholder="Ví dụ: 150000"]', '500000');

      // Trigger Save
      await page.click('button:has-text("Lưu lại")');

      // Product should now be visible in list
      await expect(page.locator('h3:has-text("Gói Bạch Kim")')).toBeVisible();
      await expect(page.locator('text=500.000đ')).toBeVisible();
    });

    test('Supports editing an existing product', async ({ page }) => {
      // Find Gói Quét Vàng card and click edit icon button
      const card = page.locator('.rounded-xl', { hasText: 'Gói Quét Vàng' });
      await card.locator('button[title="Chỉnh sửa"]').click();

      // Wait for Modal
      await expect(page.locator('h2:has-text("Chỉnh sửa sản phẩm")')).toBeVisible();

      // Modify values
      await page.fill('input[placeholder="Nhập tên sản phẩm..."]', 'Gói Quét Vàng - Cải tiến');
      await page.fill('input[placeholder="Ví dụ: 150000"]', '180000');

      // Save
      await page.click('button:has-text("Lưu lại")');

      // Verify edits
      await expect(page.locator('h3:has-text("Gói Quét Vàng - Cải tiến")')).toBeVisible();
      await expect(page.locator('text=180.000đ')).toBeVisible();
    });

    test('Supports deleting a product', async ({ page }) => {
      // Count products cards before delete
      const countBefore = await page.locator('.rounded-xl:has(h3)').count();
      
      const card = page.locator('.rounded-xl', { hasText: 'Gói Quét Vàng' });
      await card.locator('button[title="Xóa"]').click();

      // Wait for deletion update and verify product list is updated
      await expect(async () => {
        const countAfter = await page.locator('.rounded-xl:has(h3)').count();
        expect(countAfter).toBe(countBefore - 1);
      }).toPass();
    });

  });

  test.describe('6. Transactions & Orders History Panel', () => {

    test('Renders tabs and list history logs for orders and deposits', async ({ page }) => {
      const adminUser = {
        uid: 'admin1',
        email: 'admin@test.com'
      };
      await setupMocks(page, adminUser, mockDbData);
      await page.goto('/admin/orders');

      // Verify active orders tab and completed order render
      await expect(page.locator('button:has-text("Đơn hàng (1)")')).toHaveClass(/border-neonPurple/);
      await expect(page.locator('td:has-text("order1")')).toBeVisible();
      await expect(page.locator('td:has-text("Gói Quét Vàng")')).toBeVisible();
      await expect(page.locator('td:has-text("150.000đ")')).toBeVisible();

      // Switch to Transactions Tab
      await page.click('button:has-text("Giao dịch nạp tiền (1)")');

      // Verify transaction list renders
      await expect(page.locator('td:has-text("123456")')).toBeVisible();
      await expect(page.locator('td:has-text("Nạp tiền vào tài khoản")')).toBeVisible();
      await expect(page.locator('td:has-text("+200.000đ")')).toBeVisible();
    });

  });

  test.describe('7. Users List & Permission Panel', () => {

    test('Renders user registrations and promotes normal member to admin', async ({ page }) => {
      const adminUser = {
        uid: 'admin1',
        email: 'admin@test.com'
      };
      await setupMocks(page, adminUser, mockDbData);
      await page.goto('/admin/users');

      // Handle promote confirmation prompt
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Cấp quyền quản trị viên Admin');
        await dialog.accept();
      });

      // Verify users list renders
      await expect(page.locator('td:has-text("Normal User")')).toBeVisible();
      await expect(page.locator('td:has-text("System Admin")')).toBeVisible();

      // Check Normal User is standard member and has active "Cấp quyền Admin" action
      const userRow = page.locator('tr:has-text("Normal User")');
      await expect(userRow.locator('text=Thành viên')).toBeVisible();
      
      const promoteBtn = userRow.locator('button:has-text("Cấp quyền Admin")');
      await expect(promoteBtn).toBeVisible();

      // Trigger promotion
      await promoteBtn.click();

      // Verify Normal User row has updated to Admin
      await expect(userRow.locator('text=Admin')).toBeVisible();
      await expect(userRow.locator('text=Đã là Admin')).toBeVisible();
    });

  });

});
