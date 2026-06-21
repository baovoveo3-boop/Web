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
                    className="p-1.5 rounded-lg border border-zinc-800 hover:border-blue-500 text-zinc-400 hover:text-blue-500 transition"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-1.5 rounded-lg border border-zinc-800 hover:border-red-500 text-zinc-400 hover:text-red-500 transition"
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
