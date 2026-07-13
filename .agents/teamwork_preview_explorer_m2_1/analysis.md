# Analysis Report — Milestone 2: Admin System Settings (R1)

## Summary of Findings
We have analyzed the requirements and codebase to implement the System Settings Page (`/admin/settings`). The page will manage the `Version`, `download_url`, and `force_update` fields of the App Launcher in Firestore (`settings/general`), including an automatic Google Drive link conversion on save. The sidebar navigation layout (`app/admin/layout.tsx`) requires updates to link to `/admin/settings` and fix unauthenticated login redirection to preserve the target settings path.

---

## 1. Observations

### 1.1 Sidebar Navigation and Layout (`app/admin/layout.tsx`)
- **Path**: `app/admin/layout.tsx`
- **Navigation Links**:
  - Sidebar links are situated from lines 50 to 63:
    ```tsx
    <nav className="flex flex-col gap-1">
      <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-900 transition">
        📊 Thống kê Tổng quan
      </Link>
      ...
      <Link href="/admin/users" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-900 transition">
        👥 Quản lý Người dùng
      </Link>
    </nav>
    ```
  - Mobile quick navigation links are situated from lines 76 to 89:
    ```tsx
    <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-zinc-800">
      <Link href="/admin" className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-zinc-900 rounded-lg hover:bg-zinc-800">
        📊 Thống kê
      </Link>
      ...
      <Link href="/admin/users" className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-zinc-900 rounded-lg hover:bg-zinc-800">
        👥 Người dùng
      </Link>
    </div>
    ```
- **Authentication Redirect Guard**:
  - Lines 14 to 22 implement the routing guard:
    ```tsx
    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push("/login?redirect=/admin");
        } else if (userData && userData.role !== "admin" && userData.role !== "super_admin") {
          router.push("/");
        }
      }
    }, [user, userData, loading, router]);
    ```
    *Issue*: The redirect query parameter is hardcoded to `/admin`. For `/admin/settings` to redirect unauthenticated users back to the settings page after logging in (as expected by Playwright E2E test `R1-B1`), we must dynamically encode the current path.

### 1.2 Google Drive URL Conversion Logic
- **Path**: `app/admin/products/page.tsx`
- **Code Block** (lines 71-83):
  ```tsx
  const convertGoogleDriveUrl = (url: string): string => {
    if (!url) return "";
    const trimmed = url.trim();
    const fileMatch = trimmed.match(/\/file\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
    }
    const openMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (trimmed.includes("drive.google.com/open") && openMatch && openMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`;
    }
    return trimmed;
  };
  ```
  We should reuse this exact logic for saving the settings download link.

### 1.3 Audit Logging & Styling Conventions
- **Action Logging**: We should record updating settings in Firestore `admin_logs` collection using the existing utility `logAdminAction` from `lib/adminLogger.ts`.
- **UI Styling**: Tailwind CSS defines `neonPurple` (extend colors configuration in `tailwind.config.ts`), and buttons must follow the existing modal and control styling, including a confirmation modal displaying "Xác nhận thao tác" for saving and "Hủy bỏ" for canceling.

---

## 2. Logic Chain

1. **Routing Guard Update**: By importing `usePathname` from `next/navigation` in `app/admin/layout.tsx` and dynamically push to `/login?redirect=${encodeURIComponent(pathname)}`, we satisfy test case `R1-B1` which expects redirection to `/login?redirect=%2Fadmin%2Fsettings`.
2. **Page Form Bindings**: The E2E tests target `/admin/settings` expecting a `Cấu hình Hệ thống` heading, inputs with placeholders `VD: 1.0.0` and `Nhập link Google Drive...`, a switch/checkbox for `force_update`, and action buttons `Lưu` and `Hủy`. Creating `app/admin/settings/page.tsx` with these elements will satisfy `R1-F1` and `R1-F3`.
3. **Database Integration**: Loading settings via `getDoc(doc(db, "settings", "general"))` and writing via `setDoc` with fields `version`, `download_url`, and `force_update` satisfies the Firestore document specifications (`R1-F4`).
4. **Google Drive Link Conversion**: Invoking `convertGoogleDriveUrl` on save handles `R1-F5` by converting standard/view links into direct download links before database commits.
5. **Confirmation Step**: Because the E2E test clicks a button with text "Xác nhận thao tác" after submitting the form, we must show a confirm modal matching this structure upon submit.

---

## 3. Caveats
- No other fields are added to the `settings/general` document.
- The standard user guard is already handled globally by `app/admin/layout.tsx`, but page-level checks are still safe.
- If the `settings/general` document is missing on load, states should fall back to empty defaults (`version = ""`, `download_url = ""`, `force_update = false`) to prevent page rendering crashes.

---

## 4. Conclusion & Proposed Implementation Plan

### 4.1 Changes to `app/admin/layout.tsx`

We propose the following edits:
1. Import `usePathname` from `next/navigation`.
2. Dynamic redirect query generation in the routing check `useEffect`.
3. Insertion of a sidebar nav link and mobile quick navigation link to `/admin/settings`.

#### Code Snippet Proposal:
```tsx
// app/admin/layout.tsx
// ... (imports)
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (userData && userData.role !== "admin" && userData.role !== "super_admin") {
        router.push("/");
      }
    }
  }, [user, userData, loading, router, pathname]);
  
  // ... (sidebar nav insertion right after users nav link)
  <Link href="/admin/users" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-900 transition">
    👥 Quản lý Người dùng
  </Link>
  <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-900 transition">
    ⚙️ Cài đặt Hệ thống
  </Link>

  // ... (mobile nav insertion right after users nav link)
  <Link href="/admin/users" className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-zinc-900 rounded-lg hover:bg-zinc-800">
    👥 Người dùng
  </Link>
  <Link href="/admin/settings" className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-zinc-900 rounded-lg hover:bg-zinc-800">
    ⚙️ Cài đặt
  </Link>
```

### 4.2 Creation of `app/admin/settings/page.tsx`

This new file must be created to handle settings.

#### Proposed Code Structure:
```tsx
"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { logAdminAction } from "@/lib/adminLogger";
import { Settings, ShieldAlert } from "lucide-react";

export default function AdminSettingsPage() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [version, setVersion] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [forceUpdate, setForceUpdate] = useState(false);

  // Revert memory
  const [originalData, setOriginalData] = useState({
    version: "",
    downloadUrl: "",
    forceUpdate: false,
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  const convertGoogleDriveUrl = (url: string): string => {
    if (!url) return "";
    const trimmed = url.trim();
    const fileMatch = trimmed.match(/\/file\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
    }
    const openMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (trimmed.includes("drive.google.com/open") && openMatch && openMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`;
    }
    return trimmed;
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const v = data.version || "";
          const u = data.download_url || "";
          const f = !!data.force_update;
          setVersion(v);
          setDownloadUrl(u);
          setForceUpdate(f);
          setOriginalData({ version: v, downloadUrl: u, forceUpdate: f });
        }
      } catch (err) {
        console.error("Lỗi tải cấu hình:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleCancel = () => {
    setVersion(originalData.version);
    setDownloadUrl(originalData.downloadUrl);
    setForceUpdate(originalData.forceUpdate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!version || !downloadUrl) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    setConfirmOpen(false);
    setSaving(true);
    try {
      const convertedUrl = convertGoogleDriveUrl(downloadUrl);
      const docRef = doc(db, "settings", "general");

      await setDoc(docRef, {
        version: version.trim(),
        download_url: convertedUrl,
        force_update: forceUpdate,
        updatedAt: serverTimestamp(),
      });

      await logAdminAction({
        adminUid: userData?.uid || "unknown",
        adminEmail: userData?.email || "unknown",
        action: "UPDATE_SYSTEM_SETTINGS",
        target: "general",
        details: `Cập nhật cấu hình App Launcher: Phiên bản: ${version.trim()}, Link tải: ${convertedUrl}, Bắt buộc: ${forceUpdate}`,
      });

      setDownloadUrl(convertedUrl);
      setOriginalData({
        version: version.trim(),
        downloadUrl: convertedUrl,
        forceUpdate,
      });

      alert("Lưu cấu hình hệ thống thành công!");
    } catch (error: any) {
      console.error("Lỗi khi lưu cấu hình:", error);
      alert("Có lỗi xảy ra: " + (error.message || error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-neonPurple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-neonPurple" /> Cấu hình Hệ thống
        </h1>
        <p className="text-sm text-zinc-400">Quản lý cấu hình App Launcher.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
            Phiên bản (Version) *
          </label>
          <input
            type="text"
            required
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="VD: 1.0.0"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-white focus:outline-none focus:border-neonPurple"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
            Link tải App Launcher (download_url) *
          </label>
          <input
            type="text"
            required
            value={downloadUrl}
            onChange={(e) => setDownloadUrl(e.target.value)}
            placeholder="Nhập link Google Drive..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-white focus:outline-none focus:border-neonPurple"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-950">
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-zinc-400 block">
              Bắt buộc cập nhật (force_update)
            </span>
            <span className="text-xs text-zinc-500">
              Yêu cầu cập nhật khi mở App Launcher ở phiên bản cũ.
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={forceUpdate}
            onClick={() => setForceUpdate(!forceUpdate)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              forceUpdate ? "bg-neonPurple" : "bg-zinc-700"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                forceUpdate ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 text-sm text-zinc-400 hover:text-white transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2 text-sm font-bold text-white bg-neonPurple hover:bg-neonPurple-dark rounded-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
            )}
            Lưu
          </button>
        </div>
      </form>

      {/* CONFIRMATION MODAL */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-zinc-900 border-2 border-red-500/50 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl shadow-red-500/10">
            <div className="flex items-center gap-3 text-red-500">
              <ShieldAlert className="h-8 w-8" />
              <h3 className="text-xl font-bold">Xác nhận Lưu cấu hình</h3>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              Bạn chuẩn bị cập nhật cấu hình hệ thống cho App Launcher. Thao tác này sẽ ghi vào nhật ký. Xác nhận?
            </p>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition"
              >
                Xác nhận thao tác
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 5. Verification Method

To verify the implementation independently, execute the Playwright test suite focused on this route:
```powershell
npx playwright test e2e/settings.spec.ts -g "R1:"
```
This runs specifically the five R1 functional and boundary tests:
1. `R1-F1: Page Element Rendering`
2. `R1-F2: Role-based Guard Allowed`
3. `R1-F3: Form Data Binding`
4. `R1-F4: Save Configuration Flow`
5. `R1-F5: Google Drive Link Auto-Conversion on Save`
6. `R1-B1: Unauthenticated Redirect`
7. `R1-B2: Standard User Access Guard`
8. `R1-B3: Empty Fields Validation`
9. `R1-B4: Cancel Modifications`
10. `R1-B5: Google Drive ID Extraction Edge Cases`
