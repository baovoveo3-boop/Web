# Milestone 2 Explorer Handoff Report

## 1. Observation
We have inspected the project structure under `E:\Youtube\Ban Content\Web\`, read the E2E tests in `e2e/app.spec.ts`, and read the selector contracts in `g:\My Drive\Youtube\Automation (AG)\Ban content\TEST_INFRA.md`.

*   **Existing Page Structure**:
    *   `app/page.tsx` is currently a simple hero page lacking required E2E selectors (`hero-heading`, `hero-subtitle`, `hero-cta-hub`, `hero-cta-pricing`).
    *   `app/layout.tsx` defines the core HTML wrapper and does not set `overflow-x: hidden` on the body, which is checked by E2E test `S-T2-3`.
    *   `app/hub/page.tsx` is a placeholder dashboard that lacks required sidebar elements, stats containers, and is unable to parse checkout parameters (`plan` and `billing`), which will cause checkout tests (`A-T4-1`, `A-T4-2`, `A-T4-4`, `A-T4-5`) to fail.
*   **Missing Core Components**:
    *   `components/Header.tsx`, `components/Footer.tsx`, and `components/Pricing.tsx` are missing.

---

## 2. Logic Chain
To satisfy the E2E test requirements:
1.  **Header (`components/Header.tsx`)**:
    *   Must be responsive. To avoid Playwright strict-mode locator duplication errors (which happen when separate desktop and mobile nav containers exist in the DOM), we use a single set of links styled dynamically using Tailwind classes (visible on mobile only when menu state `isOpen` is active; always visible on desktop `md:flex`).
2.  **Footer (`components/Footer.tsx`)**:
    *   Needs basic semantic structure with the `footer` and `footer-copyright` test IDs.
3.  **Pricing (`components/Pricing.tsx`)**:
    *   Needs a dynamic state toggle (`monthly` / `yearly`) that changes displayed values (so that clicking the toggle triggers a text update checked by `P-T2-1`).
    *   Redirection URLs for the CTAs must dynamically update to: `/hub?plan=<free|vip|ultimate>&billing=<monthly|yearly>`.
4.  **Integration (`app/page.tsx`)**:
    *   Imports and renders `<Header />`, `<Pricing />`, `<Footer />` inside a `bg-zinc-950` wrapper.
    *   Implements a mock/skeleton for the **Scroll Sequence Section** featuring selectors `scroll-sequence-section`, `scroll-sticky-wrapper`, `scroll-image`, and `scroll-text-overlay` to satisfy Tier 1 and 2 scroll test cases.
5.  **Layout (`app/layout.tsx`)**:
    *   Appends `overflow-x-hidden` to `body` to ensure layout checks in `S-T2-3` pass.
6.  **Hub (`app/hub/page.tsx`)**:
    *   Uses a client-side component wrapped in `<Suspense>` to read URL search parameters `plan` and `billing`, rendering the chosen tier as `"VIP (Yearly)"`, `"Ultimate (Monthly)"`, etc., on the stat card `stat-account-tier`.

---

## 3. Caveats
*   **Static Export**: Because the project uses `output: 'export'` (Static HTML Export), React components that parse URL parameters dynamically (like `/hub`) must read them client-side. The use of `useSearchParams` requires a `<Suspense>` wrapper to prevent build-time pre-render exceptions.
*   **Image Assets**: The scroll sequence uses a placeholder CSS background. In Milestone 4, actual sequence frame logic using GSAP ScrollTrigger should replace this mock.

---

## 4. Conclusion & Proposed Code

Here are the exact proposed file contents to implement.

### File: `components/Header.tsx`
```tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header 
      data-testid="header"
      className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4 md:px-8">
        {/* Brand Logo */}
        <Link 
          href="/" 
          data-testid="brand-logo"
          className="text-xl font-bold tracking-tight text-white hover:text-cyan-400 transition"
        >
          Ban Content
        </Link>

        {/* Mobile Menu Toggle Button */}
        <button
          data-testid="menu-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white md:hidden focus:outline-none"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Navigation Links */}
        <nav
          className={`${
            isOpen ? 'flex' : 'hidden'
          } absolute left-0 right-0 top-full flex-col gap-4 border-b border-zinc-800 bg-zinc-950 p-6 md:static md:flex md:w-auto md:flex-row md:border-none md:p-0 md:bg-transparent`}
        >
          <Link
            href="/"
            data-testid="nav-link-home"
            className="text-sm font-medium text-zinc-400 hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <a
            href="#features"
            data-testid="nav-link-features"
            className="text-sm font-medium text-zinc-400 hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            Features
          </Link>
          <a
            href="#pricing"
            data-testid="nav-link-pricing"
            className="text-sm font-medium text-zinc-400 hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/hub"
            data-testid="nav-link-hub"
            className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

### File: `components/Footer.tsx`
```tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer 
      data-testid="footer"
      className="w-full border-t border-zinc-800 bg-zinc-950 py-6 text-center text-sm text-zinc-500"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <div data-testid="footer-copyright">
          &copy; {new Date().getFullYear()} Ban Content AI. All rights reserved.
        </div>
        <div className="flex gap-4">
          <Link href="/hub" className="hover:text-zinc-300 transition">
            Privacy Policy
          </Link>
          <Link href="/hub" className="hover:text-zinc-300 transition">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
```

### File: `components/Pricing.tsx`
```tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';

interface PricingProps {
  activeTab?: 'monthly' | 'yearly';
  onChange?: (billing: 'monthly' | 'yearly') => void;
}

export default function Pricing({ activeTab, onChange }: PricingProps) {
  const [internalBilling, setInternalBilling] = useState<'monthly' | 'yearly'>('monthly');
  const billing = activeTab || internalBilling;

  const handleToggle = () => {
    const nextBilling = billing === 'monthly' ? 'yearly' : 'monthly';
    if (onChange) {
      onChange(nextBilling);
    } else {
      setInternalBilling(nextBilling);
    }
  };

  return (
    <section 
      id="pricing"
      data-testid="pricing-section"
      className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Simple, Transparent Pricing
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-xl text-zinc-400">
          Choose the plan that fits your production needs. Cancel anytime.
        </p>
      </div>

      {/* Toggle */}
      <div className="mt-10 flex justify-center items-center gap-4">
        <span className={`text-sm ${billing === 'monthly' ? 'text-white' : 'text-zinc-500'}`}>Monthly</span>
        <button
          type="button"
          data-testid="pricing-toggle"
          onClick={handleToggle}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <span
            className={`${
              billing === 'yearly' ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-purple-500 transition-transform`}
          />
        </button>
        <span className={`text-sm ${billing === 'yearly' ? 'text-white' : 'text-zinc-500'}`}>
          Yearly <span className="ml-1.5 rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400 font-semibold">Save ~20%</span>
        </span>
      </div>

      {/* Cards */}
      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {/* Free Plan */}
        <div 
          data-testid="pricing-card-free"
          className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-sm"
        >
          <div>
            <h3 className="text-lg font-semibold text-zinc-300">Free</h3>
            <p className="mt-4 text-zinc-400 text-sm">Essential features for starters.</p>
            <div className="mt-6 flex items-baseline">
              <span data-testid="price-value-free" className="text-4xl font-extrabold text-white">
                $0
              </span>
              <span className="ml-1 text-xl font-semibold text-zinc-500">
                /{billing === 'monthly' ? 'mo' : 'yr'}
              </span>
            </div>
            <ul className="mt-8 space-y-4 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="text-cyan-500">✓</span> 3 scan runs per day
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-500">✓</span> Basic AI detection
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-500">✓</span> Standard support
              </li>
            </ul>
          </div>
          <Link
            href={`/hub?plan=free&billing=${billing}`}
            data-testid="pricing-select-free"
            className="mt-8 block w-full rounded-lg bg-zinc-800 py-3 text-center text-sm font-semibold text-white hover:bg-zinc-700 transition"
          >
            Start Free
          </Link>
        </div>

        {/* VIP Plan */}
        <div 
          data-testid="pricing-card-vip"
          className="relative flex flex-col justify-between rounded-2xl border-2 border-purple-500 bg-[#1e1e24] p-8 shadow-xl"
        >
          <div 
            data-testid="pricing-vip-badge"
            className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-purple-500 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white"
          >
            Most Popular
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">VIP</h3>
            <p className="mt-4 text-zinc-300 text-sm">Advanced tools for professional creators.</p>
            <div className="mt-6 flex items-baseline">
              <span data-testid="price-value-vip" className="text-4xl font-extrabold text-white">
                {billing === 'monthly' ? '$19' : '$15'}
              </span>
              <span className="ml-1 text-xl font-semibold text-zinc-500">
                /{billing === 'monthly' ? 'mo' : 'yr'}
              </span>
            </div>
            <ul className="mt-8 space-y-4 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="text-purple-500">✓</span> Unlimited scan runs
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">✓</span> Deep AI analysis
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">✓</span> Priority processing
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">✓</span> Email support
              </li>
            </ul>
          </div>
          <Link
            href={`/hub?plan=vip&billing=${billing}`}
            data-testid="pricing-select-vip"
            className="mt-8 block w-full rounded-lg bg-purple-600 py-3 text-center text-sm font-semibold text-white hover:bg-purple-500 transition"
          >
            Go VIP
          </Link>
        </div>

        {/* Ultimate Plan */}
        <div 
          data-testid="pricing-card-ultimate"
          className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-sm"
        >
          <div>
            <h3 className="text-lg font-semibold text-zinc-300">Ultimate</h3>
            <p className="mt-4 text-zinc-400 text-sm">Powerhouse for production teams.</p>
            <div className="mt-6 flex items-baseline">
              <span data-testid="price-value-ultimate" className="text-4xl font-extrabold text-white">
                {billing === 'monthly' ? '$49' : '$39'}
              </span>
              <span className="ml-1 text-xl font-semibold text-zinc-500">
                /{billing === 'monthly' ? 'mo' : 'yr'}
              </span>
            </div>
            <ul className="mt-8 space-y-4 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="text-cyan-500">✓</span> All VIP features
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-500">✓</span> Custom model training
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-500">✓</span> Dedicated 24/7 account manager
              </li>
            </ul>
          </div>
          <Link
            href={`/hub?plan=ultimate&billing=${billing}`}
            data-testid="pricing-select-ultimate"
            className="mt-8 block w-full rounded-lg bg-cyan-500 py-3 text-center text-sm font-semibold text-zinc-955 hover:bg-cyan-400 transition"
          >
            Get Ultimate
          </Link>
        </div>
      </div>
    </section>
  );
}
```

### File: `app/page.tsx`
```tsx
import Header from '@/components/Header';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Header />
      
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 
            data-testid="hero-heading"
            className="text-5xl font-extrabold tracking-tight sm:text-6xl text-white"
          >
            Ban Content AI <span className="text-purple-500">Automation</span>
          </h1>
          <p 
            data-testid="hero-subtitle"
            className="text-xl text-zinc-400"
          >
            Elevate your production with lightning-fast automation. Experience the landing page and interactive hub.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/hub" 
              data-testid="hero-cta-hub"
              className="px-6 py-3 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition"
            >
              Go to App Hub
            </Link>
            <a 
              href="#pricing" 
              data-testid="hero-cta-pricing"
              className="px-6 py-3 rounded-lg border border-zinc-700 hover:border-purple-500 hover:text-purple-400 transition"
            >
              View Pricing
            </a>
          </div>
        </div>
      </main>

      {/* Scroll Sequence Mock Section */}
      <section 
        id="features"
        data-testid="scroll-sequence-section"
        className="relative min-h-[150vh] w-full bg-zinc-950"
      >
        <div 
          data-testid="scroll-sticky-wrapper"
          className="sticky top-16 flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center overflow-hidden"
        >
          <div 
            data-testid="scroll-image"
            className="absolute inset-0 z-0 h-full w-full bg-cover bg-center opacity-40"
            style={{ width: '100%', height: '100%', backgroundImage: "url('/assets/sequence-placeholder.jpg')" }}
          />
          <div 
            data-testid="scroll-text-overlay"
            className="relative z-10 px-4 text-center max-w-2xl"
          >
            <h3 className="text-3xl font-bold text-white mb-2">Revolutionary Automation</h3>
            <p className="text-zinc-400">
              Our advanced algorithms automatically scan and ban unwanted content across all channels.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <Pricing />

      <Footer />
    </div>
  );
}
```

### File: `app/layout.tsx` (Recommended Changes)
Ensure the `body` tag includes class `overflow-x-hidden`:
```tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
```

### File: `app/hub/page.tsx` (Recommended Changes)
```tsx
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Activity, Cpu, LogOut, BarChart3, Settings, LayoutDashboard, User } from 'lucide-react';

function HubContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const billing = searchParams.get('billing');

  // Format account tier display text
  let tierText = 'Free';
  if (plan === 'vip') {
    tierText = billing === 'yearly' ? 'VIP (Yearly)' : 'VIP (Monthly)';
  } else if (plan === 'ultimate') {
    tierText = billing === 'yearly' ? 'Ultimate (Yearly)' : 'Ultimate (Monthly)';
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside 
        data-testid="hub-sidebar"
        className="w-64 border-r border-zinc-800 bg-zinc-900/50 p-6 flex flex-col justify-between"
      >
        <div className="space-y-6">
          <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-purple-500 font-extrabold shadow-purple-500/50">B.T AI Labs</span>
          </div>
          <nav className="space-y-2">
            <Link 
              href="/hub" 
              data-testid="sidebar-link-overview"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-800 text-white font-medium transition"
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </Link>
            <Link 
              href="/hub" 
              data-testid="sidebar-link-analytics"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
            <Link 
              href="/hub" 
              data-testid="sidebar-link-settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>

        <div className="space-y-4">
          <div 
            data-testid="hub-user-profile"
            className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/80 border border-zinc-800"
          >
            <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <User className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs text-zinc-400">User Profile</div>
              <div className="text-sm font-semibold text-white">Guest User</div>
            </div>
          </div>

          <Link
            href="/"
            data-testid="hub-logout-btn"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/20 transition w-full text-left font-medium"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-purple-500">BAN CONTENT HUB</h1>
            <p className="text-zinc-400 text-sm">Welcome to your dashboard</p>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div data-testid="stat-banned-content" className="rounded-xl border border-zinc-800 bg-[#1e1e24] p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-zinc-400">Total Banned</p>
                <h3 className="text-2xl font-bold text-white mt-2">14,204</h3>
              </div>
              <span className="p-2 rounded-lg bg-red-500/10 text-red-500">
                <Shield className="h-5 w-5" />
              </span>
            </div>
          </div>

          <div data-testid="stat-active-scans" className="rounded-xl border border-zinc-800 bg-[#1e1e24] p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-zinc-400">Active Scans</p>
                <h3 className="text-2xl font-bold text-white mt-2">42</h3>
              </div>
              <span className="p-2 rounded-lg bg-green-500/10 text-green-500">
                <Activity className="h-5 w-5" />
              </span>
            </div>
          </div>

          <div data-testid="stat-cpu-usage" className="rounded-xl border border-zinc-800 bg-[#1e1e24] p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-zinc-400">CPU Usage</p>
                <h3 className="text-2xl font-bold text-white mt-2">12.4%</h3>
              </div>
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Cpu className="h-5 w-5" />
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#1e1e24] p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-zinc-400">Account Tier</p>
                <h3 data-testid="stat-account-tier" className="text-xl font-bold text-purple-400 mt-2">
                  {tierText}
                </h3>
              </div>
              <span className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <User className="h-5 w-5" />
              </span>
            </div>
          </div>
        </section>

        {/* Charts Mockup */}
        <section 
          data-testid="hub-charts-container" 
          className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 flex flex-col items-center justify-center min-h-[300px]"
        >
          <h3 className="text-lg font-semibold text-white mb-6 w-full text-left">Scan Trends</h3>
          <svg 
            data-testid="hub-chart-graphic" 
            className="w-full max-w-xl h-48"
            viewBox="0 0 100 50"
          >
            <path 
              d="M0 45 Q20 35 40 40 T80 15 T100 10" 
              fill="none" 
              stroke="#a855f7" 
              strokeWidth="2" 
            />
            <path 
              d="M0 45 Q20 40 40 42 T80 25 T100 20" 
              fill="none" 
              stroke="#06b6d4" 
              strokeWidth="2" 
              strokeDasharray="2"
            />
          </svg>
        </section>
      </main>
    </div>
  );
}

export default function Hub() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center">Loading dashboard...</div>}>
      <HubContent />
    </Suspense>
  );
}
```

---

## 5. Verification Method

To verify these implementation plans independently:
1.  **Inspect file existence**: Ensure all files (`components/Header.tsx`, `components/Footer.tsx`, `components/Pricing.tsx`) are correctly created under `components/` and both `app/page.tsx` and `app/hub/page.tsx` are updated as shown.
2.  **Verify compilation**: Run:
    ```bash
    npm run build
    ```
    This verifies Next.js compiles correctly and outputs statically under `./out/` with no JSX syntax errors or missing dependencies.
3.  **Run E2E Tests**: Run:
    ```bash
    npm run test:e2e
    ```
    (or `npx playwright test`). This executes the Playwright test suite and should report passing assertions for all Landing Page, Pricing, and Checkout flows.
