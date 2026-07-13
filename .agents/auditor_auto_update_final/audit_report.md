## Forensic Audit Report

**Work Product**: `app/admin/products/page.tsx` and `e2e/admin.spec.ts`
**Profile**: General Project
**Verdict**: CLEAN

### Phase Results
- **Hardcoded Output Detection**: PASS — Handlers and E2E assertions interact dynamically with UI states and are verified against database updates in mock states, without hardcoded passes.
- **Facade Detection**: PASS — Fully functional Next.js client-side page code with robust React state bindings, Firebase JS SDK API interactions, image compression/upload integrations, and PapaParse integration.
- **Pre-populated Artifact Detection**: PASS — No pre-populated execution logs, bypass files, or verification artifacts exists in the workspace directories.
- **CSV Import/Export Alignment Check**: PASS — Verified the alignment of 23 columns. The field headers match value array structures perfectly. CSV Import processes custom types correctly (numbers, booleans, and JSON strings).
- **Database Operations Check**: PASS — Standard Firestore writes (`setDoc`, `updateDoc`, `deleteDoc`) map clean product configurations. Correct field mappings are applied for `category === "tool"` configs (including Google Drive download URL conversions and `force_update` flags). Non-tool products are protected from pollution.

---

### Evidence

#### 1. CSV Alignment Verification
The CSV headers and corresponding exports contain exactly 23 fields.
**Fields array:**
```typescript
const fields = [
  "Mã Sản Phẩm (ID)",
  "Tên Sản Phẩm",
  "Phân Loại",
  "Kiểu",
  "Mô Tả",
  "Giá Gốc",
  "Giá Bán",
  "Nhãn Dán",
  "Nổi Bật",
  "Link Ảnh Đại Diện",
  "Link Ảnh Slide",
  "Tính Năng (JSON)",
  "Cách Dùng (JSON)",
  "Câu Hỏi 1",
  "Trả Lời 1",
  "Câu Hỏi 2",
  "Trả Lời 2",
  "Câu Hỏi 3",
  "Trả Lời 3",
  "File thực thi (exec_file)",
  "Phiên bản (version)",
  "Đường dẫn tải xuống (download_url)",
  "Yêu cầu cập nhật (force_update)",
];
```

**Mapped Export Data Block:**
```typescript
data = products.map((p) => [
  p.id,                                                                         // 1. Mã Sản Phẩm (ID)
  p.name,                                                                       // 2. Tên Sản Phẩm
  p.category,                                                                   // 3. Phân Loại
  p.type,                                                                       // 4. Kiểu
  p.description,                                                                // 5. Mô Tả
  p.originalPrice || 0,                                                         // 6. Giá Gốc
  p.price || 0,                                                                 // 7. Giá Bán
  p.badgeText || "",                                                            // 8. Nhãn Dán
  p.isFeatured ? "TRUE" : "FALSE",                                              // 9. Nổi Bật
  p.imageUrl || "",                                                             // 10. Link Ảnh Đại Diện
  (p.gallery || []).join(", "),                                                 // 11. Link Ảnh Slide
  JSON.stringify(p.features || []),                                             // 12. Tính Năng (JSON)
  JSON.stringify(p.howToUse || []),                                             // 13. Cách Dùng (JSON)
  p.faqs?.[0]?.question || "Khóa học này học trong bao lâu?",                   // 14. Câu Hỏi 1
  p.faqs?.[0]?.answer || "Học trọn đời, bạn có thể xem lại bất kỳ lúc nào.",     // 15. Trả Lời 1
  p.faqs?.[1]?.question || "Có hỗ trợ sau khi học không?",                      // 16. Câu Hỏi 2
  p.faqs?.[1]?.answer || "Có, bạn sẽ được thêm vào group Zalo kín...",          // 17. Trả Lời 2
  p.faqs?.[2]?.question || "Hình thức thanh toán như thế nào?",                 // 18. Câu Hỏi 3
  p.faqs?.[2]?.answer || "Bạn có thể chuyển khoản ngân hàng...",                // 19. Trả Lời 3
  p.exec_file || "",                                                            // 20. File thực thi (exec_file)
  p.version || "",                                                              // 21. Phiên bản (version)
  p.download_url || "",                                                         // 22. Đường dẫn tải xuống (download_url)
  p.force_update ? "TRUE" : "FALSE",                                            // 23. Yêu cầu cập nhật (force_update)
]);
```
Both sets are 1:1 aligned.

#### 2. Google Drive URL Conversion
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
Tested with typical GDrive link styles:
- `https://drive.google.com/file/d/12345abcde/view?usp=sharing` -> converts cleanly to download link using ID `12345abcde`.
- `https://drive.google.com/open?id=12345abcde` -> converts using query ID.
- Standard urls remain unchanged.

#### 3. Genuine E2E Assertions
The Playwright test in `e2e/admin.spec.ts` verifies mock database states after action sequences:
```typescript
      // Verify data in the mocked database state (url conversion and types)
      const data = await page.evaluate(() => {
        return window.mockDbState['products'];
      });
      
      const productKeys = Object.keys(data);
      const toolProductKey = productKeys.find(key => key.includes('tool-auto-post'));
      expect(toolProductKey).toBeDefined();
      
      const savedProduct = data[toolProductKey!];
      expect(savedProduct.exec_file).toBe('autopost.exe');
      expect(savedProduct.version).toBe('1.0.5');
      expect(savedProduct.download_url).toBe('https://drive.google.com/uc?export=download&id=12345abcde');
      expect(savedProduct.force_update).toBe(true);
```
No shortcuts are taken; the test actually queries the mock database state from the page instance.
