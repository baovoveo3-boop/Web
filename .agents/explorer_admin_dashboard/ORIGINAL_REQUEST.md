## 2026-06-21T15:25:07Z
Investigate the Next.js workspace (E:\Youtube\Ban Content\Web) and design the Admin Dashboard.
Analyze AuthContext.tsx, Header.tsx, and firebase setup (lib/firebase.ts).
Identify how to:
1. Initialize and export Firebase Storage in lib/firebase.ts.
2. Implement Admin Guard in app/admin/layout.tsx to block non-admin users and handle loading states smoothly.
3. Update Header.tsx to show an "Admin Panel" link next to the "Vào Workspace" (hub) button for admin users.
4. Implement Dashboard stats: fetch total users count, query and calculate total revenue (sum of all completed purchases in 'orders' and deposit transactions in 'transactions').
5. Build the Products CRUD panel at /admin/products: list, add, edit, delete products. Implement uploading product image to Firebase Storage and saving details (name, description, price, imageUrl) to Firestore collection 'products'.
6. Build Transactions/Orders panel at /admin/orders: list all orders and top-up transactions.
7. Build Users panel at /admin/users: list all users from Firestore and provide a button to promote a user to admin (update role field in firestore).

Write a detailed analysis.md in your working directory (E:\Youtube\Ban Content\Web\.agents\explorer_admin_dashboard) detailing the files to modify, the code blocks to write, and how to verify them.
Then send a completion message to me (the orchestrator).
