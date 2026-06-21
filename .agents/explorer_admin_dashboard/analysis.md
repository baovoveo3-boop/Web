# Admin Dashboard Design & Implementation Analysis

This analysis document outlines the architecture, routing, database schemas, layout guards, UI/UX structure, and exact code changes required to build the Admin Dashboard for the B.T AI LABs platform.

---

## 1. Directory Structure of Proposed Admin Modules

All admin dashboard features will be built within the Next.js App Router workspace at `/app/admin`. The structure complies with layout constraints:

```
app/
└── admin/
    ├── layout.tsx         # Admin Guard layout wrapping all admin child routes
    ├── page.tsx           # Dashboard Statistics index page
    ├── products/
    │   └── page.tsx       # Products CRUD panel (add, edit, list, delete)
    ├── orders/
    │   └── page.tsx       # Transactions/Orders panel (orders & top-ups)
    └── users/
        └── page.tsx       # Users panel (listing & promoting user roles)
```

---

## 2. Part-by-Part Specifications

### Part 2.1: Firebase Storage Initialization & Export (`lib/firebase.ts`)
*   **Goal**: Initialize and export `storage` using the standard Firebase JS Client SDK, so it can be imported inside client-side components to handle image uploads.
*   **File to modify**: `lib/firebase.ts`
*   **Proposed Code Change**:
    ```typescript
    // Add Firebase Storage import
    import { getStorage } from "firebase/storage";
    
    // ... config and initialization remain the same ...
    
    // Khởi tạo các dịch vụ cơ bản
    const db = getFirestore(app);
    const auth = getAuth(app);
    const storage = getStorage(app); // Initialized storage
    
    export { app, db, auth, storage }; // Export storage
    ```

### Part 2.2: Admin Guard Layout (`app/admin/layout.tsx`)
*   **Goal**: Authenticate and authorize admin users (`role === "admin"`). Block unauthorized access with loading indicator states and seamless client-side routing redirects.
*   **File to create**: `app/admin/layout.tsx`
*   **Proposed Code**:
    ```typescript
    "use client";

    import React, { useEffect } from "react";
    import { useAuth } from "@/context/AuthContext";
    import { useRouter } from "next/navigation";
    import Link from "next/link";
    import Header from "@/components/Header";
    import Footer from "@/components/Footer";

    export default function AdminLayout({ children }: { children: React.ReactNode }) {
      const { user, userData, loading } = useAuth();
      const router = useRouter();

      useEffect(() => {
        if (!loading) {
          if (!user) {
            router.push("/login?redirect=/admin");
          } else if (userData && userData.role !== "admin") {
            router.push("/hub");
          }
        }
      }, [user, userData, loading, router]);

      // Loading state wrapper
      if (loading) {
        return (
          <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
            <div className="text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-neonPurple mx-auto"></div>
              <p className="mt-4 text-zinc-400">Đang tải cấu hình quản trị...</p>
            </div>
          </div>
        );
      }

      // Not logged in or not admin - return blank during redirection
      if (!user || (userData && userData.role !== "admin")) {
        return null;
      }

      return (
        <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
          <Header />
          <div className="flex flex-1 max-w-7xl w-full mx-auto p-4 md:px-8 gap-6">
            {/* Sidebar Navigation */}
            <aside className="w-64 hidden md:block shrink-0 border-r border-zinc-800 pr-6 py-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Hệ Thống Admin</h2>
                  <nav className="flex flex-col gap-1">
                    <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-900 transition">
                      📊 Thống kê Tổng quan
                    </Link>
                    <Link href="/admin/products" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-900 transition">
                      📦 Quản lý Sản phẩm
                    </Link>
                    <Link href="/admin/orders" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-900 transition">
                      💳 Giao dịch & Đơn hàng
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-900 transition">
                      👥 Quản lý Người dùng
                    </Link>
                  </nav>
                </div>
                <div className="border-t border-zinc-800 pt-6">
                  <Link href="/hub" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neonPurple rounded-lg hover:bg-zinc-900 transition">
                    ⚡ Quay về Hub
                  </Link>
                </div>
              </div>
            </aside>

            {/* Content Body */}
            <main className="flex-1 py-6">
              {/* Mobile quick navigation navigation bar */}
              <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-zinc-800">
                <Link href="/admin" className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-zinc-900 rounded-lg hover:bg-zinc-800">
                  📊 Thống kê
                </Link>
                <Link href="/admin/products" className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-zinc-900 rounded-lg hover:bg-zinc-800">
                  📦 Sản phẩm
                </Link>
                <Link href="/admin/orders" className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-zinc-900 rounded-lg hover:bg-zinc-800">
                  💳 Giao dịch
                </Link>
                <Link href="/admin/users" className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-zinc-900 rounded-lg hover:bg-zinc-800">
                  👥 Người dùng
                </Link>
              </div>
              {children}
            </main>
          </div>
          <Footer />
        </div>
      );
    }
    ```

### Part 2.3: Admin Link in Header Navigation (`components/Header.tsx`)
*   **Goal**: Display an "Admin Panel" link next to the main purple CTA button "Vào Workspace" (hub) if `userData?.role === "admin"`.
*   **File to modify**: `components/Header.tsx`
*   **Proposed Code Changes**:
    *   *Desktop Section (around line 117)*:
        ```tsx
        // Before:
        {user ? (
          <div className="flex items-center gap-4 ml-2">
            <Link href="/hub" className="text-sm font-bold text-white bg-gradient-to-r from-neonPurple to-neonPurple-dark px-4 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition flex items-center gap-2">
        
        // After:
        {user ? (
          <div className="flex items-center gap-4 ml-2">
            {userData?.role === "admin" && (
              <Link href="/admin" className="text-sm font-semibold text-zinc-300 hover:text-white transition mr-1">
                Admin Panel
              </Link>
            )}
            <Link href="/hub" className="text-sm font-bold text-white bg-gradient-to-r from-neonPurple to-neonPurple-dark px-4 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition flex items-center gap-2">
        ```
    *   *Mobile Menu Section (around line 173)*:
        ```tsx
        // Before:
        {user ? (
          <>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-zinc-300 font-medium">Chào, {userData?.displayName || user.email?.split('@')[0]}</span>
              <span className="text-neonPurple text-sm font-bold">{userData?.walletBalance?.toLocaleString()}đ</span>
            </div>
            <Link href="/hub" className="text-sm font-bold text-center text-white bg-neonPurple py-2 rounded-lg">Vào Workspace</Link>
        
        // After:
        {user ? (
          <>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-zinc-300 font-medium">Chào, {userData?.displayName || user.email?.split('@')[0]}</span>
              <span className="text-neonPurple text-sm font-bold">{userData?.walletBalance?.toLocaleString()}đ</span>
            </div>
            {userData?.role === "admin" && (
              <Link href="/admin" className="text-sm font-bold text-center text-zinc-350 hover:text-white py-2 border border-zinc-850 rounded-lg" onClick={() => setIsOpen(false)}>
                Admin Panel
              </Link>
            )}
            <Link href="/hub" className="text-sm font-bold text-center text-white bg-neonPurple py-2 rounded-lg" onClick={() => setIsOpen(false)}>Vào Workspace</Link>
        ```

### Part 2.4: Admin Dashboard Stats (`app/admin/page.tsx`)
*   **Goal**: Count registered users in Firestore and calculate total revenue (summing `totalAmount` in `orders` where `status === "COMPLETED"`, plus `amount` in `transactions` where `status === "SUCCESS"`).
*   **File to create**: `app/admin/page.tsx`
*   **Proposed Code**:
    ```typescript
    "use client";

    import React, { useEffect, useState } from "react";
    import { db } from "@/lib/firebase";
    import { collection, getDocs, query, where } from "firebase/firestore";
    import { Users, CreditCard, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";

    interface Stats {
      totalUsers: number;
      totalRevenue: number;
      orderRevenue: number;
      depositRevenue: number;
      totalOrdersCount: number;
      totalTransactionsCount: number;
    }

    export default function AdminDashboard() {
      const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalRevenue: 0,
        orderRevenue: 0,
        depositRevenue: 0,
        totalOrdersCount: 0,
        totalTransactionsCount: 0
      });
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        async function fetchStats() {
          try {
            setLoading(true);
            
            // 1. Fetch total users count
            const usersSnap = await getDocs(collection(db, "users"));
            const totalUsers = usersSnap.size;

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

            setStats({
              totalUsers,
              totalRevenue: orderRevenue + depositRevenue,
              orderRevenue,
              depositRevenue,
              totalOrdersCount: ordersSnap.size,
              totalTransactionsCount: txSnap.size
            });
          } catch (error) {
            console.error("Lỗi khi tải thông số thống kê:", error);
          } finally {
            setLoading(false);
          }
        }

        fetchStats();
      }, []);

      if (loading) {
        return (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-neonPurple"></div>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Tổng quan Thống kê</h1>
            <p className="text-sm text-zinc-400">Xem và phân tích hoạt động nạp rút & mua bán trên hệ thống B.T AI LABs.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400 font-mono">TỔNG DOANH THU</span>
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-white">
                  {stats.totalRevenue.toLocaleString()}đ
                </h3>
                <p className="mt-1 text-xs text-zinc-400">Từ ví & đơn hàng trực tiếp</p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400 font-mono">NGƯỜI DÙNG</span>
                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-white">{stats.totalUsers}</h3>
                <p className="mt-1 text-xs text-zinc-400">Tài khoản đã đăng ký</p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400 font-mono">ĐƠN MUA</span>
                <div className="rounded-lg bg-neonPurple/10 p-2 text-neonPurple">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-white">
                  {stats.orderRevenue.toLocaleString()}đ
                </h3>
                <p className="mt-1 text-xs text-zinc-400">{stats.totalOrdersCount} đơn COMPLETED</p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400 font-mono font-sans uppercase">Ví nạp</span>
                <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-white">
                  {stats.depositRevenue.toLocaleString()}đ
                </h3>
                <p className="mt-1 text-xs text-zinc-400">{stats.totalTransactionsCount} giao dịch nạp SUCCESS</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-neonGreen" /> Bảng điều khiển Quản trị
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a href="/admin/products" className="block p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-neonPurple transition text-sm">
                <div className="font-bold text-white mb-1">Quản lý Sản phẩm</div>
                <p className="text-xs text-zinc-400">Thêm mới, chỉnh sửa thông tin, xóa các gói dịch vụ bán hàng.</p>
              </a>
              <a href="/admin/orders" className="block p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-neonPurple transition text-sm">
                <div className="font-bold text-white mb-1">Giao dịch & Đơn hàng</div>
                <p className="text-xs text-zinc-400">Thống kê chi tiết, kiểm soát doanh số và giao dịch nạp tiền.</p>
              </a>
              <a href="/admin/users" className="block p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-neonPurple transition text-sm">
                <div className="font-bold text-white mb-1">Quản lý Thành viên</div>
                <p className="text-xs text-zinc-400">Danh sách thành viên, nâng cấp quyền Admin hệ thống.</p>
              </a>
            </div>
          </div>
        </div>
      );
    }
    ```

### Part 2.5: Products CRUD Panel (`app/admin/products/page.tsx`)
*   **Goal**: Full create, read, update, delete functionality for documents in the `products` collection. Supports image upload to Firebase Storage under `products/` and saves name, description, price (as a number), and image URL.
*   **File to create**: `app/admin/products/page.tsx`
*   **Proposed Code**:
    ```typescript
    "use client";

    import React, { useEffect, useState, useRef } from "react";
    import { db, storage } from "@/lib/firebase";
    import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
    import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
    import { Plus, Edit2, Trash2, X, Upload, ShoppingBag } from "lucide-react";

    interface Product {
      id: string;
      name: string;
      description: string;
      price: number;
      imageUrl: string;
      createdAt?: any;
    }

    export default function AdminProducts() {
      const [products, setProducts] = useState<Product[]>([]);
      const [loading, setLoading] = useState(true);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingProduct, setEditingProduct] = useState<Product | null>(null);

      // Form states
      const [name, setName] = useState("");
      const [description, setDescription] = useState("");
      const [price, setPrice] = useState(0);
      const [imageFile, setImageFile] = useState<File | null>(null);
      const [imagePreview, setImagePreview] = useState("");
      const [submitting, setSubmitting] = useState(false);

      const fileInputRef = useRef<HTMLInputElement>(null);

      const fetchProducts = async () => {
        try {
          setLoading(true);
          const snap = await getDocs(collection(db, "products"));
          const list: Product[] = [];
          snap.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              name: data.name || "",
              description: data.description || "",
              price: Number(data.price || 0),
              imageUrl: data.imageUrl || "",
              createdAt: data.createdAt
            });
          });
          setProducts(list);
        } catch (error) {
          console.error("Lỗi khi tải danh sách sản phẩm:", error);
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        fetchProducts();
      }, []);

      const openAddModal = () => {
        setEditingProduct(null);
        setName("");
        setDescription("");
        setPrice(0);
        setImageFile(null);
        setImagePreview("");
        setIsModalOpen(true);
      };

      const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setImageFile(null);
        setImagePreview(product.imageUrl);
        setIsModalOpen(true);
      };

      const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
        }
      };

      const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description || price <= 0) {
          alert("Vui lòng điền đầy đủ thông tin sản phẩm!");
          return;
        }

        if (!editingProduct && !imageFile) {
          alert("Vui lòng tải lên hình ảnh sản phẩm!");
          return;
        }

        try {
          setSubmitting(true);
          let finalImageUrl = editingProduct?.imageUrl || "";

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

          setIsModalOpen(false);
          fetchProducts();
        } catch (error) {
          console.error("Lỗi khi lưu sản phẩm:", error);
          alert("Gặp lỗi trong quá trình lưu thông tin.");
        } finally {
          setSubmitting(false);
        }
      };

      const handleDelete = async (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
          try {
            await deleteDoc(doc(db, "products", id));
            fetchProducts();
          } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            alert("Lỗi khi thực hiện xóa.");
          }
        }
      };

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-neonPurple" /> Quản lý Sản phẩm
              </h1>
              <p className="text-sm text-zinc-400">Thêm, sửa, hoặc xóa các gói dịch vụ bán hàng trong Firestore.</p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-neonPurple hover:bg-neonPurple-dark rounded-lg transition"
            >
              <Plus className="h-4 w-4" /> Thêm sản phẩm
            </button>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-neonPurple"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500">
              Không tìm thấy sản phẩm nào. Nhấp thêm sản phẩm mới để khởi tạo.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div key={product.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="aspect-video relative bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-zinc-800">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-zinc-600 text-xs">Không có ảnh</span>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-white text-lg">{product.name}</h3>
                      <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">{product.description}</p>
                    </div>
                  </div>
                  <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                    <span className="text-neonGreen font-bold font-mono">{product.price.toLocaleString()}đ</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-1.5 rounded-lg border border-zinc-850 hover:border-blue-500 text-zinc-400 hover:text-blue-500 transition"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 rounded-lg border border-zinc-850 hover:border-red-500 text-zinc-400 hover:text-red-500 transition"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
              <div className="relative w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-4 top-4 text-zinc-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold text-white mb-4">
                  {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h2>

                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Tên sản phẩm
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập tên sản phẩm..."
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-white focus:outline-none focus:border-neonPurple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Mô tả sản phẩm
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Chi tiết sản phẩm..."
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-white focus:outline-none focus:border-neonPurple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Giá bán (VNĐ)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder="Ví dụ: 150000"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-white font-mono focus:outline-none focus:border-neonPurple"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Ảnh đại diện
                    </label>
                    <div className="flex gap-4 items-center">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 border border-dashed border-zinc-800 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-neonPurple transition bg-zinc-950"
                      >
                        <Upload className="h-6 w-6 text-zinc-500 mb-2" />
                        <span className="text-xs text-zinc-400">Nhấp để tải file</span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                      {imagePreview && (
                        <div className="w-24 h-24 rounded-lg overflow-hidden border border-zinc-800 relative bg-zinc-950 shrink-0">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 text-sm font-bold text-white bg-neonPurple hover:bg-neonPurple-dark rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting && (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
                      )}
                      Lưu lại
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    }
    ```

### Part 2.6: Transactions/Orders Panel (`app/admin/orders/page.tsx`)
*   **Goal**: Read and list completed purchases from `'orders'` and top-up payments from `'transactions'`. Displays list records in an elegant tab switcher interface.
*   **File to create**: `app/admin/orders/page.tsx`
*   **Proposed Code**:
    ```typescript
    "use client";

    import React, { useEffect, useState } from "react";
    import { db } from "@/lib/firebase";
    import { collection, getDocs } from "firebase/firestore";
    import { CreditCard, ShoppingBag, ArrowUpRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";

    interface Order {
      id: string;
      userId: string;
      items: Array<{ id: string; name: string; price: string }>;
      totalAmount: number;
      status: string;
      createdAt: string;
    }

    interface Transaction {
      id: string;
      orderCode: number;
      userId: string;
      userEmail: string;
      amount: number;
      description: string;
      status: string;
      createdAt: string;
    }

    export default function AdminOrdersAndTransactions() {
      const [orders, setOrders] = useState<Order[]>([]);
      const [transactions, setTransactions] = useState<Transaction[]>([]);
      const [loading, setLoading] = useState(true);
      const [activeTab, setActiveTab] = useState<"orders" | "transactions">("orders");

      const fetchData = async () => {
        try {
          setLoading(true);

          // 1. Fetch orders from Firestore
          const ordersSnap = await getDocs(collection(db, "orders"));
          const ordersList: Order[] = [];
          ordersSnap.forEach((doc) => {
            const data = doc.data();
            ordersList.push({
              id: doc.id,
              userId: data.userId || "",
              items: data.items || [],
              totalAmount: Number(data.totalAmount || 0),
              status: data.status || "COMPLETED",
              createdAt: data.createdAt || ""
            });
          });
          // Sort in memory to avoid index requirements
          ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(ordersList);

          // 2. Fetch transactions from Firestore
          const txsSnap = await getDocs(collection(db, "transactions"));
          const txsList: Transaction[] = [];
          txsSnap.forEach((doc) => {
            const data = doc.data();
            txsList.push({
              id: doc.id,
              orderCode: Number(data.orderCode || 0),
              userId: data.userId || "",
              userEmail: data.userEmail || "",
              amount: Number(data.amount || 0),
              description: data.description || "",
              status: data.status || "PENDING",
              createdAt: data.createdAt || ""
            });
          });
          txsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setTransactions(txsList);
        } catch (error) {
          console.error("Lỗi khi tải danh sách giao dịch:", error);
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        fetchData();
      }, []);

      const getStatusBadge = (status: string) => {
        switch (status.toUpperCase()) {
          case "SUCCESS":
          case "COMPLETED":
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-3 w-3" /> Thành công
              </span>
            );
          case "PENDING":
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500">
                <Clock className="h-3 w-3" /> Đang chờ
              </span>
            );
          default:
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500">
                <AlertCircle className="h-3 w-3" /> Thất bại
              </span>
            );
        }
      };

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-neonPurple" /> Lịch sử Giao dịch
              </h1>
              <p className="text-sm text-zinc-400">Xem và lọc tất cả các đơn mua hàng và nạp tiền thành công.</p>
            </div>
          </div>

          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
                activeTab === "orders"
                  ? "border-neonPurple text-neonPurple"
                  : "border-transparent text-zinc-400 hover:text-white"
              }`}
            >
              <ShoppingBag className="h-4 w-4" /> Đơn hàng ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
                activeTab === "transactions"
                  ? "border-neonPurple text-neonPurple"
                  : "border-transparent text-zinc-400 hover:text-white"
              }`}
            >
              <ArrowUpRight className="h-4 w-4" /> Giao dịch nạp tiền ({transactions.length})
            </button>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-neonPurple"></div>
            </div>
          ) : activeTab === "orders" ? (
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <th className="p-4">Thời gian</th>
                    <th className="p-4">Mã đơn</th>
                    <th className="p-4">User ID</th>
                    <th className="p-4">Sản phẩm</th>
                    <th className="p-4">Tổng tiền</th>
                    <th className="p-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-sm">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">
                        Chưa có đơn hàng nào được thực hiện.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-900/20">
                        <td className="p-4 text-zinc-400 font-mono">
                          {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </td>
                        <td className="p-4 font-mono text-zinc-300 text-xs" title={order.id}>
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="p-4 font-mono text-zinc-400 text-xs" title={order.userId}>
                          {order.userId.slice(0, 8)}...
                        </td>
                        <td className="p-4">
                          <div className="max-w-xs space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="text-zinc-200">
                                • {item.name} <span className="text-zinc-500 font-mono text-xs">({item.price})</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-neonGreen font-mono">
                          {order.totalAmount.toLocaleString()}đ
                        </td>
                        <td className="p-4">{getStatusBadge(order.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <th className="p-4">Thời gian</th>
                    <th className="p-4">Mã giao dịch</th>
                    <th className="p-4">Email khách hàng</th>
                    <th className="p-4">Nội dung</th>
                    <th className="p-4">Số tiền</th>
                    <th className="p-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-sm">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">
                        Chưa có giao dịch nạp tiền nào được thực hiện.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-zinc-900/20">
                        <td className="p-4 text-zinc-400 font-mono">
                          {new Date(tx.createdAt).toLocaleString("vi-VN")}
                        </td>
                        <td className="p-4 font-mono text-zinc-300">
                          {tx.orderCode}
                        </td>
                        <td className="p-4 text-zinc-300 max-w-[150px] truncate" title={tx.userEmail}>
                          {tx.userEmail || "—"}
                        </td>
                        <td className="p-4 text-zinc-400">{tx.description}</td>
                        <td className="p-4 font-bold text-neonGreen font-mono">
                          +{tx.amount.toLocaleString()}đ
                        </td>
                        <td className="p-4">{getStatusBadge(tx.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }
    ```

### Part 2.7: Users Panel (`app/admin/users/page.tsx`)
*   **Goal**: List registered users in the system and allow administrators to upgrade user status to `"admin"`.
*   **File to create**: `app/admin/users/page.tsx`
*   **Proposed Code**:
    ```typescript
    "use client";

    import React, { useEffect, useState } from "react";
    import { db } from "@/lib/firebase";
    import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
    import { Users, Shield, ArrowUpCircle, Check } from "lucide-react";

    interface UserRecord {
      uid: string;
      email: string | null;
      displayName: string | null;
      walletBalance: number;
      currentTier: string;
      role: "user" | "admin";
      createdAt?: any;
    }

    export default function AdminUsers() {
      const [users, setUsers] = useState<UserRecord[]>([]);
      const [loading, setLoading] = useState(true);
      const [updatingId, setUpdatingId] = useState<string | null>(null);

      const fetchUsers = async () => {
        try {
          setLoading(true);
          const snap = await getDocs(collection(db, "users"));
          const list: UserRecord[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              uid: docSnap.id,
              email: data.email || "",
              displayName: data.displayName || "",
              walletBalance: Number(data.walletBalance || 0),
              currentTier: data.currentTier || "free",
              role: data.role || "user",
              createdAt: data.createdAt
            });
          });
          // Sort in memory: Admins first, then users alphabetically by display name
          list.sort((a, b) => {
            if (a.role === "admin" && b.role !== "admin") return -1;
            if (a.role !== "admin" && b.role === "admin") return 1;
            return (a.displayName || "").localeCompare(b.displayName || "");
          });
          setUsers(list);
        } catch (error) {
          console.error("Lỗi khi tải danh sách người dùng:", error);
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        fetchUsers();
      }, []);

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

      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-neonPurple" /> Quản lý Người dùng
            </h1>
            <p className="text-sm text-zinc-400">Danh sách thành viên đăng ký trên hệ thống và các thao tác phân quyền quản trị.</p>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-neonPurple"></div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <th className="p-4">Thành viên</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phân quyền</th>
                    <th className="p-4">Số dư ví</th>
                    <th className="p-4">Gói tài khoản</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-sm">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">
                        Chưa có tài khoản nào được tạo lập.
                      </td>
                    </tr>
                  ) : (
                    users.map((userRecord) => (
                      <tr key={userRecord.uid} className="hover:bg-zinc-900/20">
                        <td className="p-4 font-bold text-white">
                          {userRecord.displayName || "Thành viên"}
                        </td>
                        <td className="p-4 text-zinc-300 font-mono text-xs">
                          {userRecord.email || "—"}
                        </td>
                        <td className="p-4">
                          {userRecord.role === "admin" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              <Shield className="h-3 w-3" /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400">
                              Thành viên
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-neonGreen font-mono">
                          {userRecord.walletBalance.toLocaleString()}đ
                        </td>
                        <td className="p-4 capitalize font-mono text-zinc-300">
                          {userRecord.currentTier}
                        </td>
                        <td className="p-4 text-center">
                          {userRecord.role === "admin" ? (
                            <span className="inline-flex items-center gap-1 text-xs text-purple-400 font-medium bg-purple-500/5 px-2 py-1 rounded">
                              <Check className="h-3.5 w-3.5" /> Đã là Admin
                            </span>
                          ) : (
                            <button
                              onClick={() => promoteToAdmin(userRecord.uid)}
                              disabled={updatingId === userRecord.uid}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-zinc-900 border border-zinc-800 rounded-lg hover:border-neonPurple hover:bg-zinc-800 transition disabled:opacity-50"
                            >
                              {updatingId === userRecord.uid ? (
                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-t-transparent border-white"></span>
                              ) : (
                                <ArrowUpCircle className="h-3.5 w-3.5 text-neonPurple" />
                              )}
                              Cấp quyền Admin
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }
    ```

---

## 3. Independent Verification Protocol

To verify the components:

1.  **Firebase Storage Integration Check**:
    *   Initialize storage and run a build using `npm run build` or `npx next lint` to confirm no compilation errors occur due to missing imports.

2.  **Navigation and Guard Verification**:
    *   Log in as a standard user (`role: "user"`). Navigate to `/admin`. Verify the layout redirects the user back to `/hub`.
    *   Log in as an admin user (`role: "admin"`). Verify that `/admin` is fully accessible and that the sidebar and mobile header links are displayed correctly.
    *   Verify that the "Admin Panel" link is visible in `Header.tsx` only for admin users.

3.  **CRUD Functionality Verification**:
    *   Add a test product via `/admin/products`. Select a test image and save. Verify that the image is successfully uploaded to Firebase Storage and that a new document containing the correct `imageUrl`, `name`, `description`, and `price` (as a number) is generated in the Firestore `products` collection.
    *   Edit the product: change the price and description, and verify the changes save correctly.
    *   Delete the product: verify the document is removed from the Firestore collection.

4.  **Transaction / Order Sync Verification**:
    *   Generate a test purchase. Verify that it appears in `/admin/orders` under the "Đơn hàng" tab with the status `COMPLETED`.
    *   Generate a test deposit transaction in the database. Verify that it appears under the "Nạp tiền" tab.

5.  **Role Promotion Verification**:
    *   Select a standard user in `/admin/users` and click the "Cấp quyền Admin" button. Confirm the alert popup. Verify that the database document is updated with `role: "admin"`, that the UI list updates without page reloads, and that the button becomes disabled.
