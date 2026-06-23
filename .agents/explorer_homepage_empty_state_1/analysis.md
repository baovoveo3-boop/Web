# Homepage Coming Soon (Empty State) Fallback Design

This document details the analysis of `app/page.tsx` and proposes a comprehensive design strategy for restoring or building the "Sắp ra mắt" (Coming Soon) glow/sparkle cards when the Firestore product list is empty (e.g. `TOOLS.length === 0` or `COURSES.length === 0`).

---

## 1. Codebase Analysis (`app/page.tsx`)

### 1.1 Render Sections
We inspected `E:\Youtube\Ban Content\Web\app\page.tsx` and identified the render sections for products loaded via the custom React hook `useStoreProducts()`. These arrays are filtered based on the category:
- **`COMBOS` Section (Combo Siêu Hời)**: Lines 270–336
- **`TOOLS` Section (Automation Chuyên Nghiệp)**: Lines 339–473
- **`COURSES` Section (Khóa Học Thực Chiến)**: Lines 475–540
- **`FREE_RESOURCES` Section (Tài Nguyên Miễn Phí)**: Lines 546–605

### 1.2 Current Empty State Behavior
When the Firestore `products` collection is empty, the hook `useStoreProducts()` returns empty arrays for all categories (`combos`, `tools`, `courses`, `freeResources`). 
Currently, in `app/page.tsx`:
- The conditional render check is based on array length exceeding 5:
  `TOOLS.length > 5 ? <ElasticCarousel>...</ElasticCarousel> : <div className="grid">...</div>`
- If the arrays are empty, the code falls back to the `<div className="grid">...</div>` layout. However, it maps over the empty array (`TOOLS.map(...)` or `COURSES.slice(0, 5).map(...)`), rendering **absolutely nothing** inside the grid wrapper.
- This leaves the sections with headings but empty black spaces, breaking the visual balance and user experience of the homepage.

---

## 2. "Sắp ra mắt" (Coming Soon) Card Design

We propose a high-fidelity Glassmorphic design to replace the empty grids. It fits seamlessly with the dark mode layout (`bg-[#0B0510]`), neon green/purple accents, and circuit animations.

### 2.1 Visual Specifications
1. **Glassmorphic Card Background**: Semi-transparent dark background (`bg-zinc-900/40`), backdrop blur (`backdrop-blur-md`), and a subtle neon purple border (`border-[#3A2266]/30`).
2. **Hover Interactions**: Glowing border expansion (`hover:border-neonPurple/50`), neon purple shadow glow (`hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]`), and a slight zoom transition (`hover:scale-[1.02]`).
3. **Ambient Glow Effect**: Absolute positioned background radial gradient (`bg-gradient-to-br from-neonPurple/10 via-transparent to-neonGreen/10`) that brightens on hover.
4. **Sparkle Particles**: Small absolute-positioned elements simulating stars (`animate-ping` and `animate-pulse`) to add a sparkling, high-fidelity atmosphere.
5. **Interactive Actions**: A "Sắp ra mắt" tag, a release schedule calendar date, and a clickable bell icon button to "Nhận thông báo" (Notify Me).

---

## 3. Implementation Strategy & JSX/CSS Code

### 3.1 Proposed `ComingSoonCard` Component
We define a reusable React component that maps title, description, glow colors, and icons dynamically:

```tsx
import { Sparkles, Calendar, Bell } from 'lucide-react';

interface ComingSoonCardProps {
  title: string;
  description: string;
  glowColor: string;
  icon: React.ComponentType<any>;
}

export function ComingSoonCard({ title, description, glowColor, icon: Icon }: ComingSoonCardProps) {
  return (
    <div className="relative group overflow-hidden rounded-2xl border border-[#3A2266]/30 bg-zinc-900/40 backdrop-blur-md p-8 flex flex-col justify-between min-h-[280px] transition-all duration-500 hover:border-neonPurple/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:scale-[1.02]">
      {/* Background Ambient Glow */}
      <div className={`absolute -right-20 -top-20 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${glowColor}`} />
      
      {/* Sparkle Particles */}
      <div className="absolute top-4 right-4 animate-ping duration-1000 opacity-60 w-1.5 h-1.5 rounded-full bg-white" />
      <div className="absolute bottom-10 left-6 animate-pulse opacity-40 w-1 h-1 rounded-full bg-purple-400" />
      <div className="absolute top-1/2 right-12 animate-bounce opacity-30 w-1.5 h-1.5 rounded-full bg-cyan-400" />

      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-neonPurple shadow-lg group-hover:scale-110 transition duration-500">
            <Icon className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-[10px] bg-neonPurple/20 text-neonPurple px-3 py-1 rounded-full border border-neonPurple/30 font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.2)]">
            Sắp ra mắt
          </span>
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neonPurple transition-colors duration-300">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Card Footer */}
      <div className="mt-8 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
        <span className="text-xs text-zinc-500 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> Dự kiến Q3/2026
        </span>
        <button 
          onClick={() => alert("Chúng tôi sẽ thông báo cho bạn khi tính năng này ra mắt!")}
          className="text-xs font-bold text-neonPurple hover:text-white flex items-center gap-1 transition"
        >
          <Bell className="w-3.5 h-3.5" /> Nhận thông báo
        </button>
      </div>
    </div>
  );
}
```

### 3.2 Mock Card Datasets
To fill the grids naturally, we can render 3 cards per section:

```typescript
import { Sparkles, Zap, Shield, BookOpen, Star, Users } from 'lucide-react';

const COMING_SOON_TOOLS = [
  {
    title: "AI Video Script Generator",
    description: "Tự động nghiên cứu từ khóa, lập kịch bản và sinh video ngắn hàng loạt từ AI chỉ với một click.",
    glowColor: "bg-neonPurple/20",
    icon: Sparkles
  },
  {
    title: "Facebook Automation Suite",
    description: "Hệ thống tự động nuôi nick, tương tác, tham gia nhóm và đăng bài hàng loạt chống checkpoint.",
    glowColor: "bg-neonGreen/20",
    icon: Zap
  },
  {
    title: "MMO Competitor Tracker",
    description: "Quét dữ liệu đối thủ trực tiếp trên các mạng xã hội để đề xuất xu hướng và từ khóa SEO tốt nhất.",
    glowColor: "bg-blue-500/20",
    icon: Shield
  }
];

const COMING_SOON_COURSES = [
  {
    title: "Làm Chủ CapCut & Premiere",
    description: "Khóa học thực chiến giúp bạn tối ưu hóa tốc độ edit video ngắn triệu views bằng các mẫu tự động.",
    glowColor: "bg-blue-500/20",
    icon: BookOpen
  },
  {
    title: "Mindset MMO Đột Phá 2026",
    description: "Quy trình xây dựng hệ thống thu nhập thụ động bền vững từ các chuyên gia hàng đầu LVC MEDIA.",
    glowColor: "bg-rose-500/20",
    icon: Star
  },
  {
    title: "Affiliate Marketing Tự Động",
    description: "Bí quyết vận hành hàng trăm tài khoản TikTok Shop affiliate tự động để thu hoa hồng cực lớn.",
    glowColor: "bg-amber-500/20",
    icon: Users
  }
];
```

### 3.3 Integration in `app/page.tsx`
We will replace the static render conditions in `app/page.tsx` as follows:

**For Tools (`app/page.tsx` line 351–472)**:
```tsx
                {loading ? (
                  /* Loading Skeleton State */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-[280px] bg-zinc-900/50 border border-zinc-800 rounded-2xl" />
                    ))}
                  </div>
                ) : TOOLS.length > 0 ? (
                  TOOLS.length > 5 ? (
                    <ElasticCarousel>
                       {/* Carousel Content */}
                    </ElasticCarousel>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {TOOLS.map((tool) => (
                         /* Tool Card Content */
                      ))}
                    </div>
                  )
                ) : (
                  /* Empty State Fallback */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {COMING_SOON_TOOLS.map((item, idx) => (
                      <ComingSoonCard key={idx} {...item} />
                    ))}
                  </div>
                )}
```

**For Courses (`app/page.tsx` line 487–539)**:
```tsx
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-[280px] bg-zinc-900/50 border border-zinc-800 rounded-2xl" />
                    ))}
                  </div>
                ) : COURSES.length > 0 ? (
                  <div className={
                    COURSES.length > 5 
                      ? "flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 hide-scrollbar" 
                      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  }>
                    {COURSES.slice(0, 5).map((course) => (
                       /* Course Card Content */
                    ))}
                  </div>
                ) : (
                  /* Empty State Fallback */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {COMING_SOON_COURSES.map((item, idx) => (
                      <ComingSoonCard key={idx} {...item} />
                    ))}
                  </div>
                )}
```

---

## 4. Verification & Testing

### 4.1 Mock Verification in Playwright E2E tests
To verify this fallback mechanism:
1. Extend `e2e/app.spec.ts` or add a new test file checking the homepage empty states.
2. Intercept the Firestore products API request (or mock the custom hook data returning empty arrays) during test execution.
3. Assert that the landing page renders 3 cards containing the "Sắp ra mắt" badge text.
4. Verify that clicking "Nhận thông báo" triggers an alert dialog.
