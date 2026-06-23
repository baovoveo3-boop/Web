"use client";

import React, { useEffect, useState, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, getDocs, setDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Package, Plus, Search, Edit2, Trash2, UploadCloud, X, ArrowDownToLine, ArrowUpFromLine, ShieldAlert, Save, ShoppingBag, Info, Download, Upload } from "lucide-react";
import Papa from "papaparse";
import imageCompression from 'browser-image-compression';
import { useAuth } from "@/context/AuthContext";
import { logAdminAction } from "@/lib/adminLogger";

interface Product {
  id: string;
  category: string;
  type: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  badgeText?: string;
  isFeatured?: boolean;
  imageUrl: string;
  gallery: string[];
  features?: { bold: string; text: string }[];
  howToUse?: string[];
  faqs?: { question: string; answer: string }[];
  createdAt?: any;
  updatedAt?: any;
}

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 0.3, // 300KB
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Lỗi nén ảnh:", error);
    return file; // fallback to original file if compression fails
  }
};

const uploadToImgBB = async (file: File) => {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) throw new Error("Chưa cấu hình NEXT_PUBLIC_IMGBB_API_KEY trong file .env.local");
  
  const formData = new FormData();
  formData.append("image", file);
  
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });
  
  const data = await response.json();
  if (data.success) {
    return data.data.url;
  } else {
    throw new Error(data.error?.message || "Lỗi upload ImgBB");
  }
};

export default function AdminProducts() {
  const { userData } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  
  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  const requestConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: () => {} });
  };

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [badgeText, setBadgeText] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [features, setFeatures] = useState<{bold: string, text: string}[]>([]);
  const [howToUse, setHowToUse] = useState<string[]>([]);
  const [faqs, setFaqs] = useState<{question: string, answer: string}[]>([]);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [galleryItems, setGalleryItems] = useState<{ id: string, type: 'existing' | 'new', url: string, file?: File }[]>([]);
  const [draggedGalleryIdx, setDraggedGalleryIdx] = useState<number | null>(null);
  
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "products"));
      const list: Product[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          category: data.category || "",
          type: data.type || "",
          name: data.name || "",
          description: data.description || "",
          price: Number(data.price || 0),
          originalPrice: Number(data.originalPrice || 0),
          badgeText: data.badgeText || "",
          isFeatured: !!data.isFeatured,
          imageUrl: data.imageUrl || "",
          gallery: data.gallery || [],
          features: data.features || [],
          howToUse: data.howToUse || [],
          faqs: data.faqs || [],
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
    setSlug("");
    setCategory("");
    setType("");
    setName("");
    setDescription("");
    setPrice(0);
    setOriginalPrice(0);
    setBadgeText("");
    setIsFeatured(false);
    setImageFile(null);
    setImagePreview("");
    setGalleryItems([]);
    setFeatures([]);
    setHowToUse([]);
    setFaqs([
      { question: "Sản phẩm này có dùng được vĩnh viễn không?", answer: "Có, bạn chỉ cần mua 1 lần và được sử dụng vĩnh viễn kèm theo các bản cập nhật miễn phí." },
      { question: "Tôi có được hỗ trợ nếu gặp lỗi không?", answer: "Có, team support luôn sẵn sàng hỗ trợ bạn 24/7 qua Zalo hoặc Nhóm riêng." },
      { question: "Cách kích hoạt và sử dụng như thế nào?", answer: "Sau khi thanh toán thành công, hệ thống sẽ tự động gửi thông tin kích hoạt và Video hướng dẫn chi tiết vào Hub của bạn." }
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setSlug(product.id);
    setCategory(product.category);
    setType(product.type);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setOriginalPrice(product.originalPrice || 0);
    setBadgeText(product.badgeText || "");
    setIsFeatured(product.isFeatured || false);
    
    setImageFile(null);
    setImagePreview(product.imageUrl);
    
    setGalleryItems(product.gallery?.map((url, idx) => ({ id: `ext-${idx}-${Date.now()}`, type: 'existing', url })) || []);
    setFeatures(product.features || []);
    setHowToUse(product.howToUse || []);
    setFaqs(product.faqs || []);
    
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newItems = files.map((file, idx) => ({
        id: `new-${Date.now()}-${idx}`,
        type: 'new' as const,
        url: URL.createObjectURL(file),
        file
      }));
      setGalleryItems((prev) => [...prev, ...newItems]);
    }
  };

  const removeGalleryItem = (index: number) => {
    setGalleryItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedGalleryIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", ""); 
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedGalleryIdx === null || draggedGalleryIdx === index) return;
    
    setGalleryItems((prev) => {
      const newItems = [...prev];
      const draggedItem = newItems[draggedGalleryIdx];
      newItems.splice(draggedGalleryIdx, 1);
      newItems.splice(index, 0, draggedItem);
      return newItems;
    });
    setDraggedGalleryIdx(index);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedGalleryIdx(null);
  };

  const generateSlug = (text: string) => {
    return text.toString().toLowerCase()
      .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
      .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
      .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
      .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
      .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
      .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
      .replace(/đ/gi, 'd')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  useEffect(() => {
    if (!editingProduct && name) {
      let baseSlug = [];
      if (category) baseSlug.push(generateSlug(category));
      if (type) baseSlug.push(generateSlug(type));
      if (name) baseSlug.push(generateSlug(name));
      setSlug(baseSlug.join('-'));
    }
  }, [name, category, type, editingProduct]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !name || !description || price <= 0) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc (Mã, Tên, Mô tả, Giá bán)!");
      return;
    }

    if (!editingProduct && !imageFile && !imagePreview) {
      alert("Vui lòng tải lên ảnh đại diện sản phẩm!");
      return;
    }

    try {
      requestConfirm(
        editingProduct ? "Cập nhật Sản phẩm" : "Thêm mới Sản phẩm",
        `Bạn chuẩn bị ${editingProduct ? "lưu lại thông tin" : "thêm mới"} sản phẩm "${name}". Hành động này sẽ được ghi vào nhật ký. Xác nhận?`,
        async () => {
          closeConfirm();
          setSubmitting(true);
          try {
            let finalSlug = slug;
            if (!editingProduct) {
              let slugExists = true;
              let counter = 1;
              while (slugExists) {
                const docSnap = await getDoc(doc(db, "products", finalSlug));
                if (docSnap.exists()) {
                  finalSlug = `${slug}-${counter}`;
                  counter++;
                } else {
                  slugExists = false;
                }
              }
            }

            let finalImageUrl = imagePreview && !imageFile ? imagePreview : "";
            
            if (imageFile) {
              const compressedMain = await compressImage(imageFile);
              finalImageUrl = await uploadToImgBB(compressedMain);
            }

            const newGalleryUrls: string[] = [];
            for (const item of galleryItems) {
              if (item.type === 'existing') {
                newGalleryUrls.push(item.url);
              } else if (item.type === 'new' && item.file) {
                const compressedGalleryItem = await compressImage(item.file);
                const url = await uploadToImgBB(compressedGalleryItem);
                newGalleryUrls.push(url);
              }
            }
            
            const finalGalleryUrls = newGalleryUrls;

            const productData = {
              category,
              type,
              name,
              description,
              price: Number(price),
              originalPrice: Number(originalPrice),
              badgeText,
              isFeatured,
              imageUrl: finalImageUrl,
              gallery: finalGalleryUrls,
              features,
              howToUse,
              faqs,
            };

            // Sanitize data to remove any undefined fields recursively (Firestore hates undefined)
            const cleanProductData = JSON.parse(JSON.stringify(productData));

            if (editingProduct) {
              const docRef = doc(db, "products", editingProduct.id);
              await updateDoc(docRef, {
                ...cleanProductData,
                updatedAt: serverTimestamp()
              });
              await logAdminAction({
                adminUid: userData?.uid || "unknown",
                adminEmail: userData?.email || "unknown",
                action: "UPDATE_PRODUCT",
                target: editingProduct.id,
                details: `Cập nhật sản phẩm: ${name} (${price}đ)`
              });
            } else {
              await setDoc(doc(db, "products", finalSlug), {
                ...cleanProductData,
                createdAt: serverTimestamp()
              });
              await logAdminAction({
                adminUid: userData?.uid || "unknown",
                adminEmail: userData?.email || "unknown",
                action: "CREATE_PRODUCT",
                target: finalSlug,
                details: `Thêm mới sản phẩm: ${name} (${price}đ)`
              });
            }

            setIsModalOpen(false);
            fetchProducts();
          } catch (error: any) {
            console.error("Lỗi khi lưu sản phẩm:", error);
            alert("Gặp lỗi trong quá trình lưu thông tin: " + (error.message || error));
          } finally {
            setSubmitting(false);
          }
        }
      );
    } catch (error) {
      console.error("Lỗi xử lý ban đầu:", error);
    }
  };

  const handleDelete = (id: string, productName: string) => {
    requestConfirm(
      "Xác nhận Xóa",
      `Bạn chuẩn bị xóa vĩnh viễn sản phẩm "${productName}". Thao tác này không thể hoàn tác và sẽ được ghi vào nhật ký. Xác nhận?`,
      async () => {
        closeConfirm();
        try {
          await deleteDoc(doc(db, "products", id));
          await logAdminAction({
            adminUid: userData?.uid || "unknown",
            adminEmail: userData?.email || "unknown",
            action: "DELETE_PRODUCT",
            target: id,
            details: `Xóa sản phẩm: ${productName}`
          });
          fetchProducts();
        } catch (error) {
          console.error("Lỗi khi xóa sản phẩm:", error);
          alert("Lỗi khi thực hiện xóa.");
        }
      }
    );
  };

  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(products.map(p => p.type).filter(Boolean)));

  const handleExportCSV = () => {
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
    ];

    let data: any[] = [];

    if (products.length === 0) {
      data = [[
        "", // ID
        "Sản phẩm mẫu (Xóa dòng này đi nếu không cần)", // Tên
        "tool", // Phân loại
        "youtube", // Kiểu
        "Mô tả sản phẩm mẫu...", // Mô tả
        "1000000", // Giá Gốc
        "500000", // Giá Bán
        "Bán Chạy", // Nhãn dán
        "TRUE", // Nổi bật
        "", // Link Ảnh
        "", // Link Slide
        "Khóa học này học trong bao lâu?", 
        "Học trọn đời, bạn có thể xem lại bất kỳ lúc nào.",
        "Có hỗ trợ sau khi học không?", 
        "Có, bạn sẽ được thêm vào group Zalo kín để giảng viên hỗ trợ trực tiếp.",
        "Hình thức thanh toán như thế nào?", 
        "Bạn có thể chuyển khoản ngân hàng hoặc thanh toán qua ví điện tử."
      ]];
    } else {
      data = products.map((p) => [
        p.id,
        p.name,
        p.category,
        p.type,
        p.description,
        p.originalPrice || 0,
        p.price || 0,
        p.badgeText || "",
        p.isFeatured ? "TRUE" : "FALSE",
        p.imageUrl || "",
        (p.gallery || []).join(", "),
        JSON.stringify(p.features || []),
        JSON.stringify(p.howToUse || []),
        p.faqs?.[0]?.question || "Khóa học này học trong bao lâu?",
        p.faqs?.[0]?.answer || "Học trọn đời, bạn có thể xem lại bất kỳ lúc nào.",
        p.faqs?.[1]?.question || "Có hỗ trợ sau khi học không?",
        p.faqs?.[1]?.answer || "Có, bạn sẽ được thêm vào group Zalo kín để giảng viên hỗ trợ trực tiếp.",
        p.faqs?.[2]?.question || "Hình thức thanh toán như thế nào?",
        p.faqs?.[2]?.answer || "Bạn có thể chuyển khoản ngân hàng hoặc thanh toán qua ví điện tử.",
      ]);
    }

    const csv = Papa.unparse({ fields, data });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "products_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as any[];
          let successCount = 0;
          for (const row of rows) {
            let id = row["Mã Sản Phẩm (ID)"]?.toString().trim();
            const name = row["Tên Sản Phẩm"] || "";
            const category = row["Phân Loại"] || "";
            const type = row["Kiểu"] || "";
            
            if (!id && !name) continue;

            if (!id) {
               let baseSlug = [];
               if (category) baseSlug.push(generateSlug(category));
               if (type) baseSlug.push(generateSlug(type));
               if (name) baseSlug.push(generateSlug(name));
               id = baseSlug.join('-');
            }

            const faqs = [];
            if (row["Câu Hỏi 1"] && row["Trả Lời 1"]) faqs.push({ question: row["Câu Hỏi 1"], answer: row["Trả Lời 1"] });
            if (row["Câu Hỏi 2"] && row["Trả Lời 2"]) faqs.push({ question: row["Câu Hỏi 2"], answer: row["Trả Lời 2"] });
            if (row["Câu Hỏi 3"] && row["Trả Lời 3"]) faqs.push({ question: row["Câu Hỏi 3"], answer: row["Trả Lời 3"] });

            let parsedFeatures = [];
            try { parsedFeatures = row["Tính Năng (JSON)"] ? JSON.parse(row["Tính Năng (JSON)"]) : []; } catch (e) {}
            
            let parsedHowToUse = [];
            try { parsedHowToUse = row["Cách Dùng (JSON)"] ? JSON.parse(row["Cách Dùng (JSON)"]) : []; } catch (e) {}

            const productData = {
              name: name,
              category: category,
              type: type,
              description: row["Mô Tả"] || "",
              originalPrice: Number(row["Giá Gốc"]) || 0,
              price: Number(row["Giá Bán"]) || 0,
              badgeText: row["Nhãn Dán"] || "",
              isFeatured: row["Nổi Bật"]?.toString().toUpperCase() === "TRUE",
              imageUrl: row["Link Ảnh Đại Diện"] || "",
              gallery: row["Link Ảnh Slide"] ? row["Link Ảnh Slide"].split(",").map((s: string) => s.trim()).filter(Boolean) : [],
              features: parsedFeatures,
              howToUse: parsedHowToUse,
              faqs: faqs,
              updatedAt: serverTimestamp()
            };

            let docRef = doc(db, "products", id);
            let docSnap = await getDoc(docRef);

            // If ID was empty and auto-generated, but it already exists -> append random string to avoid overwrite
            if (!row["Mã Sản Phẩm (ID)"]?.toString().trim() && docSnap.exists()) {
              id = `${id}-${Math.floor(Math.random() * 10000)}`;
              docRef = doc(db, "products", id);
              docSnap = await getDoc(docRef);
            }

            if (docSnap.exists()) {
              await updateDoc(docRef, productData);
            } else {
              await setDoc(docRef, { ...productData, createdAt: serverTimestamp() });
            }
            successCount++;
          }
          alert(`Nhập thành công ${successCount} sản phẩm!`);
          fetchProducts();
        } catch (error) {
          console.error("Lỗi khi import CSV:", error);
          alert("Có lỗi xảy ra khi nhập file.");
        } finally {
          setImporting(false);
          if (csvInputRef.current) csvInputRef.current.value = '';
        }
      },
      error: (error) => {
        console.error("Lỗi parse CSV:", error);
        alert("Lỗi đọc file CSV.");
        setImporting(false);
        if (csvInputRef.current) csvInputRef.current.value = '';
      }
    });
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
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
          >
            <Download className="h-4 w-4" /> Xuất CSV
          </button>
          <button
            onClick={() => csvInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition disabled:opacity-50"
          >
            <Upload className="h-4 w-4" /> {importing ? "Đang xử lý..." : "Nhập CSV"}
          </button>
          <input
            type="file"
            accept=".csv"
            ref={csvInputRef}
            onChange={handleImportCSV}
            className="hidden"
          />
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-neonPurple hover:bg-neonPurple-dark rounded-lg transition"
          >
            <Plus className="h-4 w-4" /> Thêm sản phẩm
          </button>
        </div>
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className={`rounded-xl border ${product.isFeatured ? 'border-neonPurple' : 'border-zinc-800'} bg-zinc-900/30 overflow-hidden flex flex-col justify-between relative`}>
              {product.badgeText && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10">
                  {product.badgeText}
                </div>
              )}
              <div>
                <div className="aspect-square relative bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-zinc-800">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-zinc-600 text-xs">Không có ảnh</span>
                  )}
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {product.category && <span className="bg-zinc-800/80 backdrop-blur text-[10px] px-2 py-0.5 rounded text-zinc-300 uppercase font-bold">{product.category}</span>}
                    {product.type && <span className="bg-zinc-800/80 backdrop-blur text-[10px] px-2 py-0.5 rounded text-zinc-300 uppercase font-bold">{product.type}</span>}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-white text-lg leading-tight">{product.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono line-clamp-1">ID: {product.id}</p>
                </div>
              </div>
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                <div className="flex flex-col">
                  {(product.originalPrice || 0) > 0 && (
                    <span className="text-zinc-500 text-[10px] line-through">{(product.originalPrice || 0).toLocaleString()}đ</span>
                  )}
                  <span className="text-neonGreen font-bold font-mono">{product.price.toLocaleString()}đ</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-1.5 rounded-lg border border-zinc-800 hover:border-blue-500 text-zinc-400 hover:text-blue-500 transition"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
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
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 p-4 overflow-y-auto pt-16 pb-16">
          <div className="relative w-full max-w-4xl rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">
              {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </h2>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Phân loại (Category)
                    </label>
                    <input
                      type="text"
                      list="categories-list"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="VD: tool, course..."
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-[9px] text-white focus:outline-none focus:border-neonPurple"
                    />
                    <datalist id="categories-list">
                      <option value="tool">Công Cụ</option>
                      <option value="course">Khóa Học</option>
                      <option value="combo">Combo</option>
                      <option value="free">Miễn Phí</option>
                      {uniqueCategories.filter(c => !['tool', 'course', 'combo', 'free'].includes(c)).map(c => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Kiểu (Type)
                    </label>
                    <input
                      type="text"
                      list="types-list"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      placeholder="VD: youtube, edit..."
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-[9px] text-white focus:outline-none focus:border-neonPurple"
                    />
                    <datalist id="types-list">
                      <option value="youtube">Youtube</option>
                      <option value="edit">Edit</option>
                      <option value="automation">Automation</option>
                      {uniqueTypes.filter(t => !['youtube', 'edit', 'automation'].includes(t)).map(t => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Tên sản phẩm *
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
                  <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Mã sản phẩm / Đường dẫn (Slug) *
                    <span className="text-zinc-500 lowercase font-normal flex items-center gap-1"><Info className="w-3 h-3"/> Tự động tạo</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    disabled={!!editingProduct}
                    placeholder="VD: tool-youtube-auto"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-2 text-zinc-300 font-mono focus:outline-none focus:border-neonPurple disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Mô tả sản phẩm *
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

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Giá gốc (Giá ảo)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(Number(e.target.value))}
                      placeholder="0"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-white font-mono focus:outline-none focus:border-neonPurple"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Giá bán cuối *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder="Ví dụ: 150000"
                      className="w-full rounded-lg border border-neonPurple/50 bg-zinc-950 px-4 py-2 text-neonGreen font-mono focus:outline-none focus:border-neonPurple"
                    />
                  </div>
                </div>

                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Nhãn dán (Badge)
                    </label>
                    <select
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-[9px] text-white focus:outline-none focus:border-neonPurple"
                    >
                      <option value="">(Không có nhãn)</option>
                      <option value="HOT">🔥 HOT</option>
                      <option value="BEST SELLER">👑 BEST SELLER</option>
                      <option value="MỚI">✨ MỚI</option>
                      <option value="FLASH SALE">⚡ FLASH SALE</option>
                    </select>
                  </div>
                  <div className="flex-1 flex items-center h-[42px] px-4 rounded-lg border border-zinc-800 bg-zinc-950">
                    <label className="flex items-center gap-2 cursor-pointer w-full">
                      <input 
                        type="checkbox" 
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-neonPurple focus:ring-neonPurple focus:ring-offset-zinc-950"
                      />
                      <span className="text-sm text-zinc-300 font-bold">Sản phẩm Nổi bật</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Ảnh đại diện (Thumbnail) *
                  </label>
                  <p className="text-[10px] text-zinc-500 mb-2 font-mono">Khuyên dùng ảnh vuông, tỷ lệ 1:1 (ví dụ 500x500px)</p>
                  <div className="flex gap-4 items-start">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 border border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-neonPurple transition bg-zinc-950 shrink-0"
                    >
                      <Upload className="h-6 w-6 text-zinc-500 mb-1" />
                      <span className="text-[10px] text-zinc-400">Tải ảnh lên</span>
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

                <div className="pt-4 border-t border-zinc-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Slide Ảnh chi tiết (Gallery)
                  </label>
                  <p className="text-[10px] text-zinc-500 mb-2 font-mono">Khuyên dùng ảnh ngang, tỷ lệ 16:9 (ví dụ 1920x1080px)</p>
                  
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div
                      onClick={() => galleryInputRef.current?.click()}
                      className="aspect-video border border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-neonPurple transition bg-zinc-950"
                    >
                      <Plus className="h-6 w-6 text-zinc-500 mb-1" />
                      <span className="text-[10px] text-zinc-400">Thêm ảnh</span>
                      <input
                        type="file"
                        multiple
                        ref={galleryInputRef}
                        onChange={handleGalleryChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    {galleryItems.map((item, idx) => (
                      <div 
                        key={item.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={handleDrop}
                        className={`aspect-video rounded-lg overflow-hidden border ${item.type === 'new' ? 'border-neonPurple' : 'border-zinc-800'} relative bg-zinc-950 group cursor-grab active:cursor-grabbing`}
                      >
                        <img src={item.url} alt={`Gallery ${idx}`} className="w-full h-full object-cover pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => removeGalleryItem(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {item.type === 'new' && (
                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center py-0.5">MỚI</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Features Section */}
              <div className="col-span-1 md:col-span-2 pt-6 border-t border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Tính năng nổi bật (Features)
                  </label>
                  <button
                    type="button"
                    onClick={() => setFeatures([...features, { bold: "", text: "" }])}
                    className="text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" /> Thêm tính năng
                  </button>
                </div>
                <div className="space-y-3">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={feature.bold}
                          onChange={(e) => {
                            const newFeatures = [...features];
                            newFeatures[idx].bold = e.target.value;
                            setFeatures(newFeatures);
                          }}
                          placeholder="Tiêu đề (VD: Tích hợp All-in-one:)"
                          className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-neonPurple font-bold"
                        />
                        <textarea
                          value={feature.text}
                          onChange={(e) => {
                            const newFeatures = [...features];
                            newFeatures[idx].text = e.target.value;
                            setFeatures(newFeatures);
                          }}
                          placeholder="Mô tả chi tiết..."
                          className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-neonPurple h-16 resize-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                        className="p-2 text-zinc-500 hover:text-red-500 bg-zinc-950 rounded border border-zinc-800 hover:border-red-500 transition shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {features.length === 0 && (
                    <div className="text-center py-6 text-sm text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                      Chưa có tính năng nào. Nhấn "Thêm tính năng" để bắt đầu.
                    </div>
                  )}
                </div>
              </div>

              {/* How to use Section */}
              <div className="col-span-1 md:col-span-2 pt-6 border-t border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Cách sử dụng (How to Use)
                  </label>
                  <button
                    type="button"
                    onClick={() => setHowToUse([...howToUse, ""])}
                    className="text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" /> Thêm bước
                  </button>
                </div>
                <div className="space-y-3">
                  {howToUse.map((step, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                        {idx + 1}
                      </div>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const newSteps = [...howToUse];
                          newSteps[idx] = e.target.value;
                          setHowToUse(newSteps);
                        }}
                        placeholder={`Bước ${idx + 1}...`}
                        className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-neonPurple"
                      />
                      <button
                        type="button"
                        onClick={() => setHowToUse(howToUse.filter((_, i) => i !== idx))}
                        className="p-2 text-zinc-500 hover:text-red-500 bg-zinc-950 rounded border border-zinc-800 hover:border-red-500 transition shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {howToUse.length === 0 && (
                    <div className="text-center py-6 text-sm text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                      Chưa có hướng dẫn nào. Nhấn "Thêm bước" để bắt đầu.
                    </div>
                  )}
                </div>
              </div>

              {/* Q&A Section */}
              <div className="col-span-1 md:col-span-2 pt-6 border-t border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Câu hỏi thường gặp (Q&A)
                  </label>
                  <button
                    type="button"
                    onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
                    className="text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" /> Thêm câu hỏi
                  </button>
                </div>
                <div className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => {
                            const newFaqs = [...faqs];
                            newFaqs[idx].question = e.target.value;
                            setFaqs(newFaqs);
                          }}
                          placeholder="Câu hỏi (Ví dụ: Dùng được vĩnh viễn không?)"
                          className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-neonPurple"
                        />
                        <textarea
                          value={faq.answer}
                          onChange={(e) => {
                            const newFaqs = [...faqs];
                            newFaqs[idx].answer = e.target.value;
                            setFaqs(newFaqs);
                          }}
                          placeholder="Câu trả lời..."
                          className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-neonPurple h-16 resize-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                        className="p-2 text-zinc-500 hover:text-red-500 bg-zinc-950 rounded border border-zinc-800 hover:border-red-500 transition shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {faqs.length === 0 && (
                    <div className="text-center py-6 text-sm text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                      Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 pt-6 border-t border-zinc-800 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-sm text-zinc-400 hover:text-white transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-2 text-sm font-bold text-white bg-neonPurple hover:bg-neonPurple-dark rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
                  )}
                  {editingProduct ? "Cập nhật sản phẩm" : "Lưu Sản Phẩm Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-zinc-900 border-2 border-red-500/50 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl shadow-red-500/10">
            <div className="flex items-center gap-3 text-red-500">
              <ShieldAlert className="h-8 w-8" />
              <h3 className="text-xl font-bold">{confirmModal.title}</h3>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-3 pt-4">
              <button 
                onClick={closeConfirm}
                className="flex-1 py-2.5 rounded-xl font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmModal.onConfirm}
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
