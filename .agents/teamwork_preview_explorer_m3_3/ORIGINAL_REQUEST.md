## 2026-06-26T02:36:56Z
You are an Explorer agent for Milestone 3: Product Form Upgrade (R2).
Your working directory is: E:\Youtube\Ban Content\Web\.agents\teamwork_preview_explorer_m3_3
Your task is to analyze how to implement R2: Product Form Upgrade in `app/admin/products/page.tsx`:
- In "How to Use" (howToUse) and "Features" (features) list UI, add Up ("↑") and Down ("↓") arrow buttons next to each list item to reorder items.
- Ensure boundary controls: disable Up button for the first item and Down button for the last item (or if the list has size 1, disable both).
- Ensure reordering swaps item indices reactively without losing input characters.
- When creating a new product (Thêm sản phẩm mới), retrieve `Download Link` from settings (`settings/general`) and prefill Step 1 of `howToUse` with the message: `Cài đặt App Launcher để tải và quản lý các tool. Link tải: [LINK]`. Ensure that if the document settings/general is missing/empty, it handles it gracefully.

Analyze the codebase and propose a concrete implementation plan. Do not edit any files. Write your analysis report to E:\Youtube\Ban Content\Web\.agents\teamwork_preview_explorer_m3_3\analysis.md. Send a message to your parent when done.
