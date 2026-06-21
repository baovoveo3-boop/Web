## Forensic Audit Report

**Work Product**: Admin Dashboard Milestone Implementation (`E:\Youtube\Ban Content\Web`)
**Profile**: General Project
**Verdict**: CLEAN

### Phase Results
- **Hardcoded test data detection**: PASS — Visually verified that the dashboard stats (`app/admin/page.tsx`), products listing (`app/admin/products/page.tsx`), orders/transactions listing (`app/admin/orders/page.tsx`), and users listing (`app/admin/users/page.tsx`) do not contain hardcoded credentials, test data, mock IDs, or mock prices in their render/fetching flows.
- **Genuine database queries**: PASS — All data retrieval logic utilizes genuine client Firestore SDK functions (`collection`, `getDocs`, `query`, `where`, `addDoc`, `updateDoc`, `deleteDoc`, `doc`) targeting collections: `users`, `products`, `orders`, and `transactions`.
- **Authentic Firebase Storage upload**: PASS — Verified that image uploads are processed dynamically through the standard Storage SDK (`ref`, `uploadBytes`, `getDownloadURL`) resolving the upload bucket ref and download URL in real-time.
- **No dummy/facade implementations**: PASS — Complete CRUD flows, access control guards, user promotion mechanisms, and database calculations are fully written out from scratch. No dummy or placeholder return statements exist.

### Evidence
1. **Dynamic Revenue Computation in `app/admin/page.tsx`**:
   ```typescript
   // 2. Fetch completed orders and calculate revenue
   const ordersQuery = query(collection(db, "orders"), where("status", "==", "COMPLETED"));
   const ordersSnap = await getDocs(ordersQuery);
   let orderRevenue = 0;
   ordersSnap.forEach((doc) => {
     const data = doc.data();
     orderRevenue += Number(data.totalAmount || 0);
   });

   // 3. Fetch successful transactions (deposits) and calculate revenue
   const txQuery = query(collection(db, "transactions"), where("status", "==", "SUCCESS"));
   const txSnap = await getDocs(txQuery);
   let depositRevenue = 0;
   txSnap.forEach((doc) => {
     const data = doc.data();
     depositRevenue += Number(data.amount || 0);
   });
   ```

2. **Dynamic Image Upload and Document Persistence in `app/admin/products/page.tsx`**:
   ```typescript
   // Upload image file to Storage if selected
   if (imageFile) {
     const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
     const uploadResult = await uploadBytes(storageRef, imageFile);
     finalImageUrl = await getDownloadURL(uploadResult.ref);
   }

   if (editingProduct) {
     // Update document
     const docRef = doc(db, "products", editingProduct.id);
     await updateDoc(docRef, {
       name,
       description,
       price: Number(price),
       imageUrl: finalImageUrl,
       updatedAt: serverTimestamp()
     });
   } else {
     // Create document
     await addDoc(collection(db, "products"), {
       name,
       description,
       price: Number(price),
       imageUrl: finalImageUrl,
       createdAt: serverTimestamp()
     });
   }
   ```

3. **Dynamic User Promotion in `app/admin/users/page.tsx`**:
   ```typescript
   const promoteToAdmin = async (uid: string) => {
     if (!confirm("Bạn có chắc chắn muốn cấp quyền quản trị viên Admin cho tài khoản này?")) {
       return;
     }

     try {
       setUpdatingId(uid);
       const userRef = doc(db, "users", uid);
       await updateDoc(userRef, {
         role: "admin"
       });
       fetchUsers();
     } catch (error) {
       console.error("Lỗi khi thay đổi phân quyền:", error);
       alert("Lỗi khi thực hiện phân quyền.");
     } finally {
       setUpdatingId(null);
     }
   };
   ```

4. **Dynamic Authorization Guard in `app/admin/layout.tsx`**:
   ```typescript
   useEffect(() => {
     if (!loading) {
       if (!user) {
         router.push("/login?redirect=/admin");
       } else if (userData && userData.role !== "admin") {
         router.push("/");
       }
     }
   }, [user, userData, loading, router]);
   ```
