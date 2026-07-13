# Milestone 4 - Analysis Report: Public Download Page & Navbar (R3)

This report details the architectural investigation, test requirements, and concrete implementation plan for implementing **R3: Public Download Page & Navbar** in the Ban Content web application.

---

## 1. Executive Summary
The target is to implement the `/download` public route where visitors can download the App Launcher for PC. This page needs to:
1. Load the App Launcher's download URL and version from the Firestore document path `settings/general`.
2. Render a clean, glassmorphism dark theme UI featuring a prominent download button "Tải App Launcher cho PC".
3. Gracefully handle offline states or missing settings documents/empty URLs by disabling the download button and displaying the warning: `"Không tìm thấy phiên bản ứng dụng"`.
4. Include a new "Download" tab in the desktop and mobile menus of `components/Header.tsx` which links to `/download` and highlights using active styling (`text-neonPurple` or `active`) when the route matches.

All requirements must satisfy the Playwright E2E tests defined in `e2e/settings.spec.ts`.

---

## 2. Codebase Investigation Details

### 2.1 Firestore Settings Document Structure
Based on `app/admin/settings/page.tsx`, settings are retrieved and updated under:
- **Collection**: `settings`
- **Document ID**: `general`
- **Schema properties**:
  - `download_url`: `string` (e.g. `https://drive.google.com/uc?export=download&id=...` or other direct download link).
  - `version`: `string` (e.g. `1.0.0`).
  - `force_update`: `boolean` (optional).

### 2.2 Client-Side Interception Constraint
The E2E tests in `e2e/settings.spec.ts` mock Firestore database transactions by overriding the browser's global Firebase modules (using Webpack chunk interception) and seeding data inside `window.mockDbState`.
- **Constraint**: The Firestore fetch in `app/download/page.tsx` must be executed **client-side** (e.g. inside a `"use client"` React hook or `useEffect`) rather than on the server (SSR). If the fetch occurs on the server, the test framework will bypass the browser-side mock, resulting in fallback failure.

### 2.3 Navigation Header (`components/Header.tsx`)
- The header is a `"use client"` component.
- It uses Next.js `usePathname()` to get the current route:
  ```typescript
  const pathname = usePathname();
  ```
- Active class styling check: `e2e/settings.spec.ts` asserts active styling by looking for `header a[href="/download"]` having either `active` or `text-neonPurple` class names when loading `/download`.

---

## 3. E2E Test Specifications (Extracted from `e2e/settings.spec.ts`)
The implementation must comply with the following playwright test expectations:
- **R3-F2: Display Version & URL Binding**:
  - Looks for text matching `/Phiên bản: \d+\.\d+\.\d+/` (specifically `text=Phiên bản: [version]`).
  - Expects the download link `a:has-text("Tải App Launcher")` to bind to `settings.general.download_url` and have target `_blank` (`R3-F3`).
- **R3-B1: DB Offline/Missing Document Fallback**:
  - If `settings.general` is missing or empty, expects a warning text: `"Không tìm thấy phiên bản ứng dụng"` to be visible.
  - Expects the download button `button:has-text("Tải App Launcher")` to be disabled (needs to render as a `<button>` tag with the `disabled` attribute instead of an anchor `<a>` tag when inactive).
- **R3-B2: Long Version Styling Layout**:
  - The version text must support very long version strings without triggering horizontal scroll on the HTML viewport (e.g., wrap using Tailwind's `break-all` class).
- **R3-B4: Navbar Active Styling**:
  - The header link pointing to `/download` must acquire the class `active` or `text-neonPurple` when `pathname === '/download'`.

---

## 4. Proposed Implementation Plan

### 4.1 Changes to `components/Header.tsx`

We propose adding the "Download" link to both the desktop and mobile nav subcomponents.

#### Desktop Navbar Modification (approx. lines 124–125):
```tsx
            {/* Existing Links */}
            <Link href="/#free" data-testid="nav-link-free" onClick={(e) => handleAnchorClick(e, '/#free')} className="text-zinc-300 hover:text-white transition flex items-center gap-1">
              <span>🎁</span> Miễn Phí
            </Link>
            {/* Proposed Addition */}
            <Link 
              href="/download" 
              data-testid="nav-link-download" 
              className={`${
                pathname === '/download' ? 'text-neonPurple active font-bold' : 'text-zinc-300 hover:text-white'
              } transition flex items-center gap-1`}
            >
              <span>📥</span> Download
            </Link>
```

#### Mobile Navigation Dropdown Modification (approx. lines 218–220):
```tsx
          {/* Existing Mobile Links */}
          <Link href="/#free" data-testid="nav-link-free" className="text-sm font-medium text-zinc-400 hover:text-white transition flex items-center gap-1" onClick={(e) => handleAnchorClick(e, '/#free')}>
            <span>🎁</span> Miễn Phí
          </Link>
          {/* Proposed Addition */}
          <Link 
            href="/download" 
            data-testid="nav-link-download" 
            className={`text-sm font-medium ${
              pathname === '/download' ? 'text-neonPurple active font-bold' : 'text-zinc-400 hover:text-white'
            } transition flex items-center gap-1`} 
            onClick={() => setIsOpen(false)}
          >
            <span>📥</span> Download
          </Link>
```

---

### 4.2 Creation of `app/download/page.tsx`

We propose creating the `/download` page from scratch using a glassmorphism theme and Client-Side Firestore loading.

#### Proposed Code Structure:
```tsx
"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Download, Laptop, AlertCircle, RefreshCw } from "lucide-react";

interface SettingsData {
  version?: string;
  download_url?: string;
}

export default function DownloadPage() {
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [version, setVersion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDownloadLink = async () => {
      try {
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as SettingsData;
          if (data && data.download_url) {
            setDownloadUrl(data.download_url);
            setVersion(data.version || "1.0.0");
            setError(null);
          } else {
            setError("Không tìm thấy phiên bản ứng dụng");
          }
        } else {
          setError("Không tìm thấy phiên bản ứng dụng");
        }
      } catch (err) {
        console.error("Error fetching download settings:", err);
        setError("Không tìm thấy phiên bản ứng dụng");
      } finally {
        setLoading(false);
      }
    };

    fetchDownloadLink();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-neonPurple/30 relative flex flex-col justify-between overflow-x-hidden">
      <Header />
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neonPurple/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-neonGreen/5 rounded-full blur-[120px] pointer-events-none" />
      
      <main className="flex-grow pt-32 pb-20 px-4 md:px-8 relative z-10 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {/* Glassmorphism Card */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl p-8 md:p-12 shadow-2xl flex flex-col items-center text-center space-y-8">
            
            {/* Visual Icon Badge */}
            <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-neonPurple/20 to-neonPurple/5 border border-neonPurple/30 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
              <Laptop className="w-12 h-12 text-neonPurple" />
              <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800">
                <Download className="w-4 h-4 text-neonPurple" />
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white uppercase bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                Tải App Launcher
              </h1>
              <p className="text-zinc-400 text-sm md:text-base max-w-md mx-auto">
                Trải nghiệm toàn bộ các công cụ và workflow MMO mượt mà, ổn định nhất trực tiếp trên PC của bạn.
              </p>
            </div>

            {/* Version & Status Badge */}
            {loading ? (
              <div className="flex items-center gap-2 text-zinc-400 text-sm bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-full">
                <RefreshCw className="w-4 h-4 animate-spin text-neonPurple" />
                <span>Đang kiểm tra phiên bản mới nhất...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/20 border border-red-900/30 px-4 py-2 rounded-full">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs md:text-sm">
                <span className="w-2 h-2 rounded-full bg-neonGreen animate-pulse"></span>
                <span className="text-zinc-300 font-semibold break-all">
                  Phiên bản: {version}
                </span>
              </div>
            )}

            {/* Call to Action Button */}
            <div className="w-full flex justify-center pt-2">
              {loading ? (
                <button
                  disabled
                  className="px-8 py-4 bg-zinc-800 text-zinc-500 border border-zinc-700/50 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-3 w-full sm:w-auto transition-all"
                >
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Tải App Launcher cho PC
                </button>
              ) : error || !downloadUrl ? (
                <button
                  disabled
                  className="px-8 py-4 bg-zinc-800 text-zinc-500 border border-zinc-700/50 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-3 w-full sm:w-auto transition-all"
                >
                  <Download className="w-5 h-5" />
                  Tải App Launcher cho PC
                </button>
              ) : (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-gradient-to-r from-neonPurple to-neonPurple-dark hover:from-neonPurple-light hover:to-neonPurple rounded-xl text-white font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] flex items-center justify-center gap-3 w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download className="w-5 h-5" />
                  Tải App Launcher cho PC
                </a>
              )}
            </div>

            {/* Subtle Requirements Footnote */}
            <p className="text-xs text-zinc-500">
              * Tương thích với Windows 10/11 64-bit.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

---

## 5. Verification Plan

To verify that the implementation works correctly, the following commands and checks must be executed:

1. **Static Analysis & Build**:
   Ensure the application builds correctly without any TypeScript compilation or Next.js errors:
   ```bash
   npm run build
   ```

2. **Run E2E Playwright Tests**:
   Run the settings and public download E2E test suite to verify R3 features specifically:
   ```bash
   npx playwright test e2e/settings.spec.ts -g "R3"
   ```

3. **Verify Layout Responsiveness**:
   Verify visually and programmatically (using the Playwright output or local dev server) that:
   - There are no horizontal scrollbars even with long version strings (`R3-B2`).
   - The desktop menu active state toggles seamlessly.
