# Analysis Report: Milestone 2 — Admin System Settings (R1)

## Overview
This report provides a detailed implementation plan for **R1: System Settings Page** under Milestone 2. 

The objective is to enable administrators to configure system-wide settings for the App Launcher:
- **Version** (string)
- **Download Link** (string, saved as `download_url`)
- **Force Update** (boolean)

These settings will be persisted in Firestore (collection `settings`, document `general`). The sidebar layout will be updated, and Google Drive URL automatic direct-download link conversion will be implemented.

---

## 1. Technical Analysis

### A. Firestore Schema
- **Collection**: `settings`
- **Document**: `general`
- **Fields**:
  - `version` (string): The current version of the App Launcher (e.g., `"1.0.0"`).
  - `download_url` (string): Converted direct download URL of the App Launcher.
  - `force_update` (boolean): Flag to force user updates.
  - `updatedAt` (timestamp, optional): Time of last modification.

### B. Access Control
The settings page will utilize Next.js layout guards and client-side hooks to restrict access.
- Layout-level protection already exists in `app/admin/layout.tsx`, validating `userData.role === "admin" || userData.role === "super_admin"`.
- We will replicate defense checks using the `useAuth` hook within the settings page itself:
  ```typescript
  const { user, userData, loading } = useAuth();
  ```
  Unauthenticated users redirect to `/login?redirect=/admin/settings`.
  Non-admin users redirect to `/`.

### C. Google Drive URL Conversion
We will replicate the direct download link conversion algorithm used in `app/admin/products/page.tsx` line 71:
```typescript
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
This handles standard Google Drive file links (`/file/d/...`) as well as open queries (`/open?id=...`).

### D. Audit Logging
We will log admin changes using the system audit log utility defined in `@/lib/adminLogger`:
```typescript
import { logAdminAction } from "@/lib/adminLogger";

// On save:
await logAdminAction({
  adminUid: userData.uid,
  adminEmail: userData.email || "",
  action: "CẬP NHẬT",
  target: "CẤU HÌNH HỆ THỐNG",
  details: `Cập nhật cấu hình App Launcher: Phiên bản=${version}, Link tải=${convertedUrl}, Bắt buộc cập nhật=${forceUpdate ? "Có" : "Không"}`
});
```

### E. Playwright E2E Tests Match Checks
According to `e2e/settings.spec.ts`, the new settings page must contain the following DOM elements:
- Heading element (`h1` or `h2`) containing text `"Cấu hình Hệ thống"`.
- Input field with placeholder `"VD: 1.0.0"` (Version).
- Input field with placeholder `"Nhập link Google Drive..."` (Download Link).
- Checkbox/switch for force update (`input[type="checkbox"]` or `button[role="switch"]`).
- Save button with text `"Lưu"` or `type="submit"`.
- Cancel button with text `"Hủy"`.
- Confirmation modal with confirmation button having exact text `"Xác nhận thao tác"` to commit the changes to Firestore.

---

## 2. Code Implementation Proposals

### A. Sidebar Navigation Update (`app/admin/layout.tsx`)
Add a navigation link to `/admin/settings` for both desktop and mobile screens.

#### Proposed Changes:
```diff
@@ -60,6 +60,9 @@
                 <Link href="/admin/users" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-900 transition">
                   👥 Quản lý Người dùng
                 </Link>
+                <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-900 transition">
+                  ⚙️ Cấu hình Hệ thống
+                </Link>
               </nav>
             </div>
             <div className="border-t border-zinc-800 pt-6">
@@ -86,6 +89,9 @@
             <Link href="/admin/users" className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-zinc-900 rounded-lg hover:bg-zinc-800">
               👥 Người dùng
             </Link>
+            <Link href="/admin/settings" className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-zinc-900 rounded-lg hover:bg-zinc-800">
+              ⚙️ Cấu hình
+            </Link>
           </div>
           {children}
```

---

### B. Creating Settings Page (`app/admin/settings/page.tsx`)
We propose creating the entire React component with correct inputs, cancel actions, Google Drive URL conversion, audit logs, and E2E test compliance.

#### Proposed Content:
```typescript
"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { logAdminAction } from "@/lib/adminLogger";
import { Settings, ShieldAlert, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

// Utility for converting Google Drive sharing link to a direct download link
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

export default function AdminSettings() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Input states
  const [version, setVersion] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [forceUpdate, setForceUpdate] = useState(false);

  // Keep track of database state to support revert (Cancel) functionality
  const [lastSavedData, setLastSavedData] = useState<{
    version: string;
    download_url: string;
    force_update: boolean;
  } | null>(null);

  // Confirmation Modal state
  const [showConfirm, setShowConfirm] = useState(false);

  // Guard access and fetch initial settings on mount
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/admin/settings");
        return;
      } else if (userData && userData.role !== "admin" && userData.role !== "super_admin") {
        router.push("/");
        return;
      }
      fetchSettings();
    }
  }, [user, userData, authLoading, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const docRef = doc(db, "settings", "general");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const settingsData = {
          version: data.version || "",
          download_url: data.download_url || "",
          force_update: !!data.force_update,
        };
        setVersion(settingsData.version);
        setDownloadUrl(settingsData.download_url);
        setForceUpdate(settingsData.force_update);
        setLastSavedData(settingsData);
      } else {
        // Document does not exist yet; default empty fields
        const defaults = { version: "", download_url: "", force_update: false };
        setLastSavedData(defaults);
      }
    } catch (err: any) {
      console.error("Lỗi khi tải cấu hình:", err);
      setError("Không thể tải cấu hình từ hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  const triggerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!version.trim() || !downloadUrl.trim()) return;
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const convertedUrl = convertGoogleDriveUrl(downloadUrl);
      
      const docRef = doc(db, "settings", "general");
      const updatedData = {
        version: version.trim(),
        download_url: convertedUrl.trim(),
        force_update: forceUpdate,
        updatedAt: new Date(),
      };

      await setDoc(docRef, updatedData, { merge: true });

      setDownloadUrl(convertedUrl);
      setLastSavedData({
        version: version.trim(),
        download_url: convertedUrl,
        force_update: forceUpdate,
      });

      // Write Admin Audit Log
      if (userData) {
        await logAdminAction({
          adminUid: userData.uid,
          adminEmail: userData.email || "admin@system.com",
          action: "CẬP NHẬT",
          target: "CẤU HÌNH HỆ THỐNG",
          details: `Cập nhật cấu hình App Launcher: Phiên bản=${version.trim()}, Link tải=${convertedUrl}, Bắt buộc cập nhật=${forceUpdate ? "Có" : "Không"}`,
        });
      }

      setMessage("Cấu hình hệ thống đã được cập nhật thành công!");
    } catch (err: any) {
      console.error("Lỗi khi lưu cấu hình:", err);
      setError(err.message || "Đã xảy ra lỗi khi lưu cấu hình.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (lastSavedData) {
      setVersion(lastSavedData.version);
      setDownloadUrl(lastSavedData.download_url);
      setForceUpdate(lastSavedData.force_update);
    }
    setMessage(null);
    setError(null);
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user || (userData && userData.role !== "admin" && userData.role !== "super_admin")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-purple-500" /> Cấu hình Hệ thống
        </h1>
        <p className="text-sm text-zinc-400">Thiết lập các thông số chung cho Launcher và cập nhật ứng dụng.</p>
      </div>

      {message && (
        <div className="flex items-center gap-2 p-4 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-950/50 border border-red-500/30 rounded-xl text-red-400 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={triggerSubmit} className="max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            Phiên bản App Launcher
          </label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition text-sm"
            placeholder="VD: 1.0.0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            Đường dẫn tải xuống (download_url)
          </label>
          <input
            type="text"
            value={downloadUrl}
            onChange={(e) => setDownloadUrl(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition text-sm"
            placeholder="Nhập link Google Drive..."
            required
          />
          <p className="mt-1.5 text-xs text-zinc-500">
            Hỗ trợ tự động nhận diện và chuyển đổi link chia sẻ Google Drive sang dạng tải xuống trực tiếp.
          </p>
        </div>

        <div className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            id="forceUpdate"
            checked={forceUpdate}
            onChange={(e) => setForceUpdate(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-purple-600 focus:ring-purple-500 focus:ring-offset-zinc-900 cursor-pointer"
          />
          <label htmlFor="forceUpdate" className="text-sm font-semibold text-zinc-300 select-none cursor-pointer">
            Bắt buộc cập nhật (Force Update)
          </label>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
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
            className="px-8 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving && (
              <RefreshCw className="h-4 w-4 animate-spin" />
            )}
            Lưu
          </button>
        </div>
      </form>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-zinc-900 border-2 border-purple-500/50 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl shadow-purple-500/10">
            <div className="flex items-center gap-3 text-purple-500">
              <ShieldAlert className="h-8 w-8" />
              <h3 className="text-xl font-bold">Xác nhận thay đổi</h3>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              Bạn có chắc chắn muốn lưu các thiết lập cấu hình hệ thống này không? Thay đổi này sẽ ảnh hưởng trực tiếp đến App Launcher của người dùng.
            </p>
            <div className="flex gap-3 pt-4">
              <button 
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition"
              >
                Hủy bỏ
              </button>
              <button 
                type="button"
                onClick={handleConfirmSave}
                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/30 transition"
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
