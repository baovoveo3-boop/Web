# Homepage Coming Soon (Empty State) Fallback Design & Strategy

This document provides a comprehensive analysis and design strategy to restore/build the **Coming Soon (Empty State) fallback** on the Homepage (`app/page.tsx`) when the Firestore products list (specifically `TOOLS` or `COURSES`) is empty.

---

## 1. Problem Definition & Code Analysis

### 1.1 Render Sections in `app/page.tsx`
On the homepage (`app/page.tsx`), products are loaded using the custom hook `useStoreProducts()` on line 57:
```tsx
const { combos: COMBOS, tools: TOOLS, courses: COURSES, freeResources: FREE_RESOURCES, loading } = useStoreProducts();
```
The hook queries Firestore's `products` collection, filters them by category, and returns the lists along with a `loading` state.

Currently, `app/page.tsx` handles the sections as follows:
*   **Tools Section (Lines 351-473)**:
    Checks if `TOOLS.length > 5`. If true, it renders an `ElasticCarousel`. If false, it maps `TOOLS` directly inside a grid layout:
    ```tsx
    {TOOLS.length > 5 ? (
      <ElasticCarousel>...</ElasticCarousel>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map((tool) => { ... })}
      </div>
    )}
    ```
    *Issue*: If Firestore returns an empty list for tools (`TOOLS.length === 0`), this section maps over an empty array, rendering an empty grid wrapper. The section header remains visible, but there is no visual content underneath.
*   **Courses Section (Lines 475-541)**:
    Directly maps `COURSES.slice(0, 5)` inside a grid or carousel:
    ```tsx
    <div className={
      COURSES.length > 5 
        ? "flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 hide-scrollbar" 
        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    }>
      {COURSES.slice(0, 5).map((course) => { ... })}
    </div>
    ```
    *Issue*: If `COURSES.length === 0`, it similarly maps over nothing, leaving an empty section on the homepage.

---

## 2. Design Strategy for Coming Soon Cards

To restore high-fidelity Glassmorphic cards for the empty state, we design cards matching the neon dark theme. 

### 2.1 Visual Anatomy of the Coming Soon Card
1.  **Glassmorphic Background**: Translucent dark container (`bg-[#0B0510]/60 backdrop-blur-md`) with borders matching the neon theme with 30% opacity (`border-[#3A2266]/30`), shifting to 50% opacity and adding shadows on hover (`hover:border-neonPurple/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]`).
2.  **Ambient Blur Glow**: An absolute positioned radial element blurred deep inside the background (`absolute -top-12 -left-12 w-48 h-48 rounded-full blur-[80px] opacity-40`) to create depth.
3.  **Sparkling Stars Overlay**: Small dots styled with CSS `animate-ping` simulating sparkling stars blinking at different speeds.
4.  **Diagonal Shimmer Effect**: A linear gradient glare reflection moving across the card on hover (`before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent`).
5.  **Status Badges & Accent Colors**: A clear "Sắp ra mắt" badge matching the section accent (neon purple for tools, rose/red for courses).

### 2.2 Reusable Coming Soon Component Design

The following JSX and Tailwind classes recreate the exact high-fidelity sparkling coming soon cards.

```tsx
interface ComingSoonProps {
  title: string;
  type: string;
  glowColor: string;
  accentText: string;
  badgeBorder: string;
  badgeBg: string;
}

function ComingSoonCard({ 
  title, 
  type, 
  glowColor, 
  accentText, 
  badgeBorder, 
  badgeBg 
}: ComingSoonProps) {
  return (
    <div 
      data-testid="coming-soon-card"
      className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md p-6 flex flex-col justify-between group transition-all duration-500 hover:border-zinc-700 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] h-[320px]"
    >
      {/* CSS Keyframes Shimmer & Sparkle Injected in Scope */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />

      {/* Ambient background glow */}
      <div 
        className={`absolute -top-12 -left-12 w-48 h-48 rounded-full blur-[80px] pointer-events-none transition-all duration-700 group-hover:scale-125 opacity-30 group-hover:opacity-50 ${glowColor}`}
      />

      {/* Shimmer glare reflection */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none z-10" />

      {/* Sparkling Stars Blinking */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 group-hover:opacity-55 transition-opacity duration-500 z-10">
        <div className="absolute top-8 left-12 w-1 h-1 bg-white rounded-full animate-ping [animation-duration:1.5s]" />
        <div className="absolute top-24 right-16 w-1.5 h-1.5 bg-white rounded-full animate-ping [animation-duration:2.5s]" />
        <div className="absolute bottom-16 left-24 w-1 h-1 bg-white rounded-full animate-ping [animation-duration:2s]" />
      </div>

      <div>
        {/* Upper Pill Badge */}
        <span 
          data-testid="coming-soon-badge"
          className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6 border ${badgeBg} ${accentText} ${badgeBorder}`}
        >
          Sắp ra mắt
        </span>
        
        {/* Title */}
        <h3 
          data-testid="coming-soon-title"
          className="text-lg font-bold text-white mb-2 transition-colors duration-300"
        >
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-zinc-400 leading-relaxed">
          Giải pháp {type} thế hệ mới với hiệu năng tối ưu đột phá đang được hoàn thiện những bước cuối cùng để ra mắt cộng đồng MMO.
        </p>
      </div>

      {/* Bottom Mockup Action */}
      <div className="mt-8 flex items-center justify-between border-t border-zinc-800/50 pt-4 z-20">
        <span className="text-xs font-semibold text-zinc-500 italic">Đang cập nhật...</span>
        <button 
          disabled
          className="px-4 py-2 rounded-lg text-xs font-bold bg-zinc-850 border border-zinc-800 text-zinc-500 cursor-not-allowed shadow-[0_0_15px_rgba(0,0,0,0.3)]"
        >
          Nhận Thông Báo
        </button>
      </div>
    </div>
  );
}
```

---

## 3. Implementation Blueprint for `app/page.tsx`

We integrate this conditional render logic inside the existing sections of `app/page.tsx`.

### 3.1 Tools Section Integration (Lines 351-473)
Wrap the carousel and grid rendering inside `loading` checks and length logic:

```tsx
{/* 4. PRODUCT GRIDS */}
<section className="py-16 bg-transparent" id="tools">
  <div className="max-w-7xl mx-auto px-4 md:px-8">
    <div className="flex items-end justify-between mb-10">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">AUTOMATION CHUYÊN NGHIỆP</h2>
        <p className="text-zinc-400">Top các tool tự động hóa đang bán chạy nhất</p>
      </div>
      <Link href="/tools" className="hidden md:flex items-center gap-2 text-neonPurple hover:text-white transition">
        Xem tất cả <ArrowRight className="w-4 h-4" />
      </Link>
    </div>

    {loading ? (
      <div className="flex h-64 items-center justify-center" data-testid="tools-loading">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-neonPurple"></div>
      </div>
    ) : TOOLS.length > 0 ? (
      TOOLS.length > 5 ? (
        <ElasticCarousel>
          {/* existing tools rendering */}
        </ElasticCarousel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* existing tools rendering */}
        </div>
      )
    ) : (
      /* Fallback sparkling glow cards */
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="coming-soon-grid">
        <ComingSoonCard 
          title="Video Script Automation" 
          type="tự động hóa video kịch bản" 
          glowColor="bg-neonPurple/20" 
          accentText="text-neonPurple" 
          badgeBorder="border-neonPurple/20" 
          badgeBg="bg-neonPurple/10" 
        />
        <ComingSoonCard 
          title="Social Accounts Manager" 
          type="quản lý tài khoản mạng xã hội" 
          glowColor="bg-neonGreen/20" 
          accentText="text-neonGreen" 
          badgeBorder="border-neonGreen/20" 
          badgeBg="bg-neonGreen/10" 
        />
        <ComingSoonCard 
          title="AI Voice Clone Engine" 
          type="nhân bản giọng nói AI" 
          glowColor="bg-blue-500/20" 
          accentText="text-blue-500" 
          badgeBorder="border-blue-500/20" 
          badgeBg="bg-blue-500/10" 
        />
      </div>
    )}
  </div>
</section>
```

### 3.2 Courses Section Integration (Lines 475-541)
Apply similar fallback logic to the courses segment:

```tsx
{/* 5. COURSES GRIDS */}
<section className="py-16 bg-transparent border-t border-[#3A2266]/50/50" id="courses">
  <div className="max-w-7xl mx-auto px-4 md:px-8">
    <div className="flex items-end justify-between mb-10">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2 uppercase">Khóa Học Thực Chiến</h2>
        <p className="text-zinc-400">Làm chủ công nghệ - Tối ưu hóa quy trình kiếm tiền MMO</p>
      </div>
      <Link href="/courses" className="hidden md:flex items-center gap-2 text-blue-400 hover:text-white transition">
        Xem tất cả <ArrowRight className="w-4 h-4" />
      </Link>
    </div>

    {loading ? (
      <div className="flex h-64 items-center justify-center" data-testid="courses-loading">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    ) : COURSES.length > 0 ? (
      <div className={
        COURSES.length > 5 
          ? "flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 hide-scrollbar" 
          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      }>
        {COURSES.slice(0, 5).map((course) => {
          // existing course rendering
        })}
      </div>
    ) : (
      /* Fallback sparkling glow cards */
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="coming-soon-grid">
        <ComingSoonCard 
          title="YouTube Automation Masterclass" 
          type="khóa học làm YouTube AI" 
          glowColor="bg-red-500/20" 
          accentText="text-red-400" 
          badgeBorder="border-red-500/20" 
          badgeBg="bg-red-500/10" 
        />
        <ComingSoonCard 
          title="TikTok Affiliate Blueprint" 
          type="khóa học tiếp thị liên kết" 
          glowColor="bg-rose-500/20" 
          accentText="text-rose-400" 
          badgeBorder="border-rose-500/20" 
          badgeBg="bg-rose-500/10" 
        />
        <ComingSoonCard 
          title="Automation Workflows n8n" 
          type="khóa học tự động hóa n8n" 
          glowColor="bg-yellow-500/20" 
          accentText="text-yellow-400" 
          badgeBorder="border-yellow-500/20" 
          badgeBg="bg-yellow-500/10" 
        />
      </div>
    )}
  </div>
</section>
```

---

## 4. E2E Verification Method (Playwright)

To assert the empty state works correctly without impacting real data, we recommend writing E2E tests in `e2e/app.spec.ts` using Playwright's network routing mock or global state override.

Since `useStoreProducts.ts` accesses Firestore collection `products` via Firebase client library, the mock setup inside tests can mock the Firestore responses to return empty arrays.

### Proposed Test Case (`e2e/empty-state.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';

test.describe('Homepage Coming Soon Empty State Tests', () => {

  test('Verify Coming Soon cards render when products catalog is empty', async ({ page }) => {
    // Inject mock script to return empty lists in useStoreProducts
    await page.addInitScript(() => {
      window.webpackChunk_N_E = window.webpackChunk_N_E || [];
      const originalPush = window.webpackChunk_N_E.push;
      window.webpackChunk_N_E.push = function(...args) {
        const modules = args[0][1];
        if (modules) {
          for (const key of Object.keys(modules)) {
            const originalFunc = modules[key];
            modules[key] = function(module, exports, require) {
              originalFunc(module, exports, require);
              // Intercept getDocs to return an empty snap
              if (exports && exports.getDocs) {
                exports.getDocs = () => Promise.resolve({
                  size: 0,
                  docs: [],
                  forEach: () => {}
                });
              }
            };
          }
        }
        return originalPush.apply(this, args);
      };
    });

    await page.goto('/');

    // Check that empty state grid is visible for both Tools and Courses
    const comingSoonGrids = page.locator('[data-testid="coming-soon-grid"]');
    await expect(comingSoonGrids).toHaveCount(2);

    const comingSoonCards = page.locator('[data-testid="coming-soon-card"]');
    await expect(comingSoonCards).toHaveCount(6); // 3 for tools + 3 for courses

    // Verify title and badge visibility
    const firstTitle = comingSoonCards.first().locator('[data-testid="coming-soon-title"]');
    await expect(firstTitle).toBeVisible();
    await expect(firstTitle).not.toBeEmpty();

    const firstBadge = comingSoonCards.first().locator('[data-testid="coming-soon-badge"]');
    await expect(firstBadge).toBeVisible();
    await expect(firstBadge).toHaveText(/Sắp ra mắt/i);
  });
});
```
