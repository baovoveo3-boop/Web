import { test, expect } from '@playwright/test';

test.describe('Ban Content Adversarial Test Suite - Tier 5', () => {

  test.describe('Query Parameter Boundary Cases & Sanitization', () => {

    test('A-T5-1: Fallback behavior for invalid, missing, or empty query parameters', async ({ page }) => {
      // 1. Missing parameters entirely (Guest state)
      await page.goto('/hub');
      const tierStat1 = page.locator('[data-testid="stat-account-tier"]');
      await expect(tierStat1).toContainText('Free');

      // 2. Empty query parameters
      await page.goto('/hub?plan=&billing=');
      const tierStat2 = page.locator('[data-testid="stat-account-tier"]');
      await expect(tierStat2).toContainText('Free');

      // 3. Invalid billing parameter for VIP (should default to monthly)
      await page.goto('/hub?plan=vip&billing=invalid-period-123');
      const tierStat3 = page.locator('[data-testid="stat-account-tier"]');
      await expect(tierStat3).toContainText('VIP (Monthly)');

      // 4. Invalid billing parameter for Ultimate (should default to monthly)
      await page.goto('/hub?plan=ultimate&billing=nonsense');
      const tierStat4 = page.locator('[data-testid="stat-account-tier"]');
      await expect(tierStat4).toContainText('Ultimate (Monthly)');

      // 5. Invalid plan parameter (should fall back to Free)
      await page.goto('/hub?plan=super-vip-custom&billing=yearly');
      const tierStat5 = page.locator('[data-testid="stat-account-tier"]');
      await expect(tierStat5).toContainText('Free');
    });

    test('A-T5-2: Security payload injection isolation in query parameters', async ({ page }) => {
      const maliciousPlan = '<script>alert("xss")</script><svg/onload=alert(1)>';
      const maliciousBilling = '"><iframe src="javascript:alert(2)">';

      await page.goto(`/hub?plan=${encodeURIComponent(maliciousPlan)}&billing=${encodeURIComponent(maliciousBilling)}`);

      // Verify it doesn't crash the application
      const tierStat = page.locator('[data-testid="stat-account-tier"]');
      await expect(tierStat).toBeVisible();

      // Since the plan is not vip/ultimate, it must fall back to Free
      await expect(tierStat).toContainText('Free');

      // Verify no raw unescaped script tag got appended to DOM body
      const bodyContent = await page.locator('body').innerHTML();
      expect(bodyContent).not.toContain('<script>alert("xss")</script>');
    });
  });

  test.describe('User Settings State Transitions', () => {

    test('A-T5-3: User Settings multi-click toggle cycles and state retention', async ({ page }) => {
      await page.goto('/hub');

      const deepScanRow = page.locator('div:has-text("Kích hoạt chế độ Quét sâu (Deep Scan)")').first();
      const autoCleanRow = page.locator('div:has-text("Tự động xoá nhật ký rác sau 24h")').first();
      const notifySupportRow = page.locator('div:has-text("Thông báo cho quản trị viên khi phát hiện lỗi")').first();

      // Initial checkmark states (default values)
      await expect(deepScanRow.locator('text=✓')).toBeVisible(); // default true
      await expect(autoCleanRow.locator('text=✓')).not.toBeVisible(); // default false
      await expect(notifySupportRow.locator('text=✓')).toBeVisible(); // default true

      // Click cycle for deepScan
      await deepScanRow.click();
      await expect(deepScanRow.locator('text=✓')).not.toBeVisible();
      await deepScanRow.click();
      await expect(deepScanRow.locator('text=✓')).toBeVisible();
      await deepScanRow.click();
      await expect(deepScanRow.locator('text=✓')).not.toBeVisible();

      // Click cycle for autoClean
      await autoCleanRow.click();
      await expect(autoCleanRow.locator('text=✓')).toBeVisible();
      await autoCleanRow.click();
      await expect(autoCleanRow.locator('text=✓')).not.toBeVisible();

      // Click cycle for notifySupport
      await notifySupportRow.click();
      await expect(notifySupportRow.locator('text=✓')).not.toBeVisible();
      await notifySupportRow.click();
      await expect(notifySupportRow.locator('text=✓')).toBeVisible();
    });
  });

  test.describe('Quick Controls & Background Logging', () => {

    test('A-T5-4: Quick control buttons log stress test and log visibility', async ({ page }) => {
      await page.goto('/hub?plan=vip&billing=monthly');

      const terminal = page.locator('div.font-mono');
      await expect(terminal).toBeVisible();

      const startSeqBtn = page.locator('button:has-text("Start Sequence (Blue)")');
      const startAsmBtn = page.locator('button:has-text("Start Assemble (Green)")');
      const configBtn = page.locator('button:has-text("Configure AI (Orange)")');
      const stopBtn = page.locator('button:has-text("STOP RUN (Red)")');

      // Click each button once
      await startSeqBtn.click();
      await expect(terminal).toContainText("[INFO] Bắt đầu chạy 'Start Sequence'...");

      await startAsmBtn.click();
      await expect(terminal).toContainText("[INFO] Bắt đầu chạy 'Start Assemble'...");

      await configBtn.click();
      await expect(terminal).toContainText("Mở bảng cấu hình nâng cao...");

      await stopBtn.click();
      await expect(terminal).toContainText("[DANGER] DỪNG KHẨN CẤP TIẾN TRÌNH QUÉT!");

      // Rapid stress clicking STOP RUN (Red) button
      for (let i = 0; i < 12; i++) {
        await stopBtn.click();
      }

      // Verify logs exist and container holds the clicked content
      const logItems = await terminal.locator('div').count();
      expect(logItems).toBeGreaterThanOrEqual(10);
    });

    test('A-T5-5: Simulated interval-based background logging behavior', async ({ page }) => {
      // 1. Guest account: verify NO background interval logging happens
      await page.goto('/hub');
      const terminalFree = page.locator('div.font-mono');
      
      const initialCountFree = await terminalFree.locator('div').count();
      expect(initialCountFree).toBe(3); // Start hub, Config, and Guest Warning message

      await page.waitForTimeout(5000); // Wait 5 seconds (interval is 4 seconds)

      const postCountFree = await terminalFree.locator('div').count();
      expect(postCountFree).toBe(3); // Log count should still be 3

      // 2. VIP account: verify background logging appends messages every 4 seconds
      await page.goto('/hub?plan=vip&billing=yearly');
      const terminalVip = page.locator('div.font-mono');

      await page.waitForTimeout(4500); // Wait 4.5 seconds

      const logsText = await terminalVip.textContent() || '';
      const hasIntervalLog = logsText.includes('Đang quét') || 
                             logsText.includes('Không phát hiện') || 
                             logsText.includes('Hiệu năng máy chủ') || 
                             logsText.includes('Đã phân tích');
      expect(hasIntervalLog).toBe(true);
    });
  });

  test.describe('Plan Activations & Lock/Unlock Boundaries', () => {

    test('A-T5-6: Free plan boundary enforcement (Lock indicators & Auto Run alert)', async ({ page }) => {
      await page.goto('/hub?plan=free&billing=monthly');

      // Verify status is Guest/Free
      const statusText = page.locator('footer').locator('text=Tài khoản: Khách (Chưa kích hoạt)');
      await expect(statusText).toBeVisible();

      // Verify both tool cards are disabled and show Lock indicator
      const cardAIO = page.locator('div.rounded-xl', { hasText: 'BanContent All-in-One' });
      const cardHealing = page.locator('div.rounded-xl', { hasText: 'Healing Video Maker' });

      const btnAIO = cardAIO.locator('button');
      const btnHealing = cardHealing.locator('button');

      await expect(btnAIO).toBeDisabled();
      await expect(btnAIO).toContainText('Đã khóa');
      await expect(btnHealing).toBeDisabled();
      await expect(btnHealing).toContainText('Đã khóa');

      // Handle Auto Run alert dialog
      let dialogMessage = '';
      page.on('dialog', async dialog => {
        dialogMessage = dialog.message();
        await dialog.accept();
      });

      await page.locator('button:has-text("TỰ ĐỘNG (AUTO RUN)")').click();
      expect(dialogMessage).toBe('Vui lòng kích hoạt tài khoản để sử dụng chức năng AUTO RUN.');
    });

    test('A-T5-7: VIP plan access boundaries (Unlock AIO tool, lock Healing Maker)', async ({ page }) => {
      await page.goto('/hub?plan=vip&billing=monthly');

      // Verify status is active VIP
      const statusText = page.locator('footer').locator('text=Tài khoản: Hoạt động (VIP (Monthly))');
      await expect(statusText).toBeVisible();

      // BanContent All-in-One should be unlocked
      const cardAIO = page.locator('div.rounded-xl', { hasText: 'BanContent All-in-One' });
      const btnAIO = cardAIO.locator('button');
      await expect(btnAIO).toBeEnabled();
      await expect(btnAIO).toContainText('Mở Công Cụ');

      // Healing Video Maker should still be locked
      const cardHealing = page.locator('div.rounded-xl', { hasText: 'Healing Video Maker' });
      const btnHealing = cardHealing.locator('button');
      await expect(btnHealing).toBeDisabled();
      await expect(btnHealing).toContainText('Đã khóa');

      // Clicking AIO tool button appends success log
      const terminal = page.locator('div.font-mono');
      await btnAIO.click();
      await expect(terminal).toContainText("[SUCCESS] Kích hoạt công cụ BanContent All-in-One thành công.");

      // Auto Run button works without warning dialog
      let dialogTriggered = false;
      page.on('dialog', async dialog => {
        dialogTriggered = true;
        await dialog.accept();
      });

      await page.locator('button:has-text("TỰ ĐỘNG (AUTO RUN)")').click();
      expect(dialogTriggered).toBe(false);
      await expect(terminal).toContainText("[SYSTEM] [AUTO RUN] Đã bắt đầu tiến trình chạy tự động liên tục.");
    });

    test('A-T5-8: Ultimate plan access boundaries (Unlock all tools)', async ({ page }) => {
      await page.goto('/hub?plan=ultimate&billing=yearly');

      // Verify status is active Ultimate
      const statusText = page.locator('footer').locator('text=Tài khoản: Hoạt động (Ultimate (Yearly))');
      await expect(statusText).toBeVisible();

      // Both tools should be unlocked
      const cardAIO = page.locator('div.rounded-xl', { hasText: 'BanContent All-in-One' });
      const cardHealing = page.locator('div.rounded-xl', { hasText: 'Healing Video Maker' });

      const btnAIO = cardAIO.locator('button');
      const btnHealing = cardHealing.locator('button');

      await expect(btnAIO).toBeEnabled();
      await expect(btnAIO).toContainText('Mở Công Cụ');
      await expect(btnHealing).toBeEnabled();
      await expect(btnHealing).toContainText('Mở Công Cụ');

      // Click and verify logs for both tools
      const terminal = page.locator('div.font-mono');
      await btnAIO.click();
      await expect(terminal).toContainText("[SUCCESS] Kích hoạt công cụ BanContent All-in-One thành công.");

      await btnHealing.click();
      await expect(terminal).toContainText("[SUCCESS] Kích hoạt công cụ Healing Video Maker thành công.");
    });
  });

  test.describe('Responsive Layout & Dialog Interaction UI', () => {

    test('A-T5-9: Responsive viewport sidebar overlay states and transitions', async ({ page }) => {
      // 1. Set desktop viewport and check sidebar is visible by default without backdrop
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/hub');
      const sidebar = page.locator('[data-testid="hub-sidebar"]');
      await expect(sidebar).toBeVisible();

      const backdrop = page.locator('div.fixed.z-40');
      await expect(backdrop).not.toBeVisible();

      // 2. Switch to mobile viewport (sidebar should translate out of screen)
      await page.setViewportSize({ width: 375, height: 667 });
      const openMenuBtn = page.locator('button[aria-label="Open sidebar"]');
      await expect(openMenuBtn).toBeVisible();
      await openMenuBtn.click();

      // 3. Now sidebar should be visible and backdrop overlay should exist
      await expect(sidebar).toBeVisible();
      await expect(backdrop).toBeVisible();

      // 4. Click backdrop to close sidebar
      await backdrop.click();
      await expect(backdrop).not.toBeVisible();

      // 5. Open again, then click close button (X)
      await openMenuBtn.click();
      await expect(sidebar).toBeVisible();
      await expect(backdrop).toBeVisible();

      const closeBtn = page.locator('button[aria-label="Close sidebar"]');
      await closeBtn.click();
      await expect(backdrop).not.toBeVisible();
    });

    test('A-T5-10: Footer login action dialog assertion', async ({ page }) => {
      await page.goto('/hub');

      let dialogMsg = '';
      page.on('dialog', async dialog => {
        dialogMsg = dialog.message();
        await dialog.accept();
      });

      const loginBtn = page.locator('button:has-text("Đăng Nhập")');
      await loginBtn.click();
      expect(dialogMsg).toBe('Chức năng Đăng nhập đang được cập nhật.');
    });
  });

  test.describe('GSAP Scroll Animation Assertions', () => {

    test('A-T5-11: GSAP Scroll sequence boundary style assertions', async ({ page }) => {
      await page.goto('/');

      const textOverlay = page.locator('[data-testid="scroll-text-overlay"]');
      await expect(textOverlay).toBeVisible();

      // Get initial opacity (should be low/default)
      const initialOpacity = await textOverlay.evaluate(el => window.getComputedStyle(el).opacity);
      expect(parseFloat(initialOpacity)).toBeLessThanOrEqual(0.8);

      // Scroll down progressively to features section middle
      const scrollSection = page.locator('[data-testid="scroll-sequence-section"]');
      await scrollSection.scrollIntoViewIfNeeded();

      await page.evaluate(() => {
        const el = document.getElementById('features');
        if (el) {
          const rect = el.getBoundingClientRect();
          const absoluteTop = rect.top + window.pageYOffset;
          window.scrollTo(0, absoluteTop + (el.offsetHeight / 2));
        }
      });

      // Wait brief moment for GSAP to apply update
      await page.waitForTimeout(500);

      // Verify opacity increased due to scroll trigger
      const scrolledOpacity = await textOverlay.evaluate(el => window.getComputedStyle(el).opacity);
      expect(parseFloat(scrolledOpacity)).toBeGreaterThan(parseFloat(initialOpacity));

      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);

      const resetOpacity = await textOverlay.evaluate(el => window.getComputedStyle(el).opacity);
      expect(parseFloat(resetOpacity)).toBeLessThanOrEqual(0.8);
    });
  });

});
