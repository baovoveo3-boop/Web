# Homepage Coming Soon (Empty State) Fallback Design & Strategy

This report analyzes the structure of the homepage (`app/page.tsx`) and the custom data loading hook (`useStoreProducts.ts`) to propose a robust strategy and styling for high-fidelity "Sắp ra mắt" (Coming Soon) glow/sparkle fallback cards when Firestore databases are empty.

---

## 1. Codebase Analysis & Render Sections

### 1.1 Firestore Loading Hook (`hooks/useStoreProducts.ts`)
The homepage queries Firestore products catalog through `useStoreProducts()`. The hook fetches all documents from the `products` collection:
- It maps documents to `StoreItem` structures.
- It filters them by the `category` field into four arrays: `combos`, `tools`, `courses`, and `freeResources`.
- If Firestore is empty (or unreachable/not seeded), all product arrays will return as empty arrays (`[]`), and `loading` changes to `false`.

### 1.2 Tools Render Section (`app/page.tsx`, Lines 339-473)
The current Tools section rendering logic:
```tsx
{TOOLS.length > 5 ? (
  <ElasticCarousel>
    {TOOLS.slice(0, 5).map((tool) => { ... })}
  </ElasticCarousel>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {TOOLS.map((tool) => { ... })}
  </div>
)}
```
* **Limitation**: When `TOOLS.length === 0`, `TOOLS.length > 5` evaluates to `false`. The render path falls back to mapping over the empty `TOOLS` array. This results in an empty `<div className="grid ...">` block. The section header remains visible, but there is no visual indicator or fallback for the user.

### 1.3 Courses Render Section (`app/page.tsx`, Lines 475-540)
The current Courses section rendering logic:
```tsx
<div className={
  COURSES.length > 5 
    ? "flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 hide-scrollbar" 
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
}>
  {COURSES.slice(0, 5).map((course) => { ... })}
</div>
```
* **Limitation**: When `COURSES.length === 0`, it maps over the empty slice, leaving a blank region under the "Khóa học thực chiến" header.

---

## 2. Forensic Discovery of Original Design
We performed a thorough inspection of the repository's configuration and history:
1. **Git History Inspection**: We checked the Git logs at `.git/logs/HEAD`. Only a single commit exists:
   `0000000000000000000000000000000000000000 23ad5275e89602aaad142d2848a39b7b6558d870 baovoveo3-boop <baovoveo3@gmail.com> 1782060192 +0700 commit (initial): Initial commit`
   This indicates there are no previous historical versions in the repository to extract prior code from.
2. **Code Comment Audit**: We searched `data/tools.ts`, `data/courses.ts`, `data/store.ts`, and `app/page.tsx` for commented-out card markup or the Vietnamese keyword "Sắp ra mắt" and confirmed no trace remains in the code.
3. **Scraped Content Check**: Verified `scraped_content.txt` line 45 which has a placeholder text: `Đang cập nhật những khóa học chất lượng cao`.

Consequently, we must design the high-fidelity Coming Soon sparkle/glow cards from scratch, ensuring perfect styling parity with the project's existing dark glassmorphic design system.

---

## 3. High-Fidelity Coming Soon Card Specification

To match the existing theme (dark glassmorphic container, neon highlights, circuit brain backgrounds), the "Sắp ra mắt" card should contain these core design elements:
1. **Ambient Glow**: A blurred radial background element (e.g. `bg-neonPurple/20`) that expands on hover.
2. **Sparkling Stars**: Small blinking points using Tailwind's `animate-ping` with variable speed delays to simulate twinkling stars.
3. **Diagonal Shimmer (Glare)**: A moving linear gradient glare running across the card when hovered.
4. **Theme Parity**: Translucent borders (`border-zinc-800/80`) and backgrounds (`bg-zinc-900/30 backdrop-blur-md`) that scale and shadow dynamically.

### 3.1 Reusable JSX Coming Soon Component
```tsx
import React from 'react';

interface ComingSoonProps {
  title: string;
  type: string;
  glowColor: string;      // e.g. "bg-neonPurple/20"
  accentText: string;     // e.g. "text-neonPurple"
  badgeBorder: string;    // e.g. "border-neonPurple/20"
  badgeBg: string;        // e.g. "bg-neonPurple/10"
}

export function ComingSoonCard({ 
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
      {/* CSS Keyframes for Shimmer effect */}
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

      {/* Twinkling Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 group-hover:opacity-60 transition-opacity duration-500 z-10">
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
          className="text-lg font-bold text-white mb-2"
        >
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-zinc-400 leading-relaxed">
          Giải pháp {type} thế hệ mới với hiệu năng tối ưu đột phá đang được hoàn thiện những bước cuối cùng để ra mắt cộng đồng MMO.
        </p>
      </div>

      {/* Bottom Footer & Action */}
      <div className="mt-8 flex items-center justify-between border-t border-zinc-800/50 pt-4 z-20">
        <span className="text-xs font-semibold text-zinc-500 italic">Đang phát triển...</span>
        <button 
          disabled
          className="px-4 py-2 rounded-lg text-xs font-bold bg-zinc-850 border border-zinc-800 text-zinc-500 cursor-not-allowed shadow-[0_0_15px_rgba(0,0,0,0.3)]"
        >
          Nhận thông báo
        </button>
      </div>
    </div>
  );
}
```

---

## 4. Integration Blueprint for `app/page.tsx`

### 4.1 Tools Section Fallback
Modify lines 351-473 in `app/page.tsx` as follows:
```tsx
    {loading ? (
      <div className="flex h-64 items-center justify-center" data-testid="tools-loading">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-neonPurple"></div>
      </div>
    ) : TOOLS.length > 0 ? (
      TOOLS.length > 5 ? (
        <ElasticCarousel>
          {/* existing tools mapping */}
        </ElasticCarousel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* existing tools mapping */}
        </div>
      )
    ) : (
      /* Fallback sparkling glow cards when TOOLS is empty */
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
```

### 4.2 Courses Section Fallback
Modify lines 487-538 in `app/page.tsx` as follows:
```tsx
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
      /* Fallback sparkling glow cards when COURSES is empty */
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
```

---

## 5. Proposed Playwright E2E Integration Test

To verify this empty state layout reliably, add the following test case. It intercepts Firestore's `getDocs` request to mock a 0-product response:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Homepage Empty State Fallback Tests', () => {

  test('Verify Coming Soon cards render when products catalog is empty', async ({ page }) => {
    // Inject mock script to intercept getDocs and return an empty collection response
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

    // Assert that the coming soon grids are rendered for both Tools and Courses
    const comingSoonGrids = page.locator('[data-testid="coming-soon-grid"]');
    await expect(comingSoonGrids).toHaveCount(2);

    // Assert that 6 cards (3 tools + 3 courses) are rendered in total
    const comingSoonCards = page.locator('[data-testid="coming-soon-card"]');
    await expect(comingSoonCards).toHaveCount(6);

    // Assert text elements on the first card
    const firstCard = comingSoonCards.first();
    const badge = firstCard.locator('[data-testid="coming-soon-badge"]');
    const title = firstCard.locator('[data-testid="coming-soon-title"]');

    await expect(badge).toBeVisible();
    await expect(badge).toHaveText(/Sắp ra mắt/i);
    await expect(title).toBeVisible();
    await expect(title).not.toBeEmpty();
  });
});
```
