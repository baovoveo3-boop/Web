import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Settings, Users, Download, Star, CheckSquare, BookOpen, Play, MessageSquare, Briefcase, Zap, Compass, CheckCircle } from 'lucide-react';

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  priceText: string;
  originalPriceText?: string;
  badge?: string;
  badgeColor?: string;
  themeClasses: {
    border: string;
    borderHover: string;
    gradientFrom: string;
    text: string;
    textHover: string;
    bgHover: string;
    textHoverWhite: boolean;
  };
  icon: any;
  actionText: string;
  rating?: string;
  faqs?: { question: string; answer: string }[];
  image?: string;
  features?: { bold: string; text: string }[];
}

const THEMES = [
  { border: "border-neonPurple/50", borderHover: "hover:border-neonPurple", gradientFrom: "from-neonPurple", text: "text-neonPurple", textHover: "group-hover:text-neonPurple", bgHover: "hover:bg-neonPurple", textHoverWhite: true },
  { border: "border-neonGreen/50", borderHover: "hover:border-neonGreen", gradientFrom: "from-neonGreen", text: "text-neonGreen", textHover: "group-hover:text-neonGreen", bgHover: "hover:bg-neonGreen", textHoverWhite: false },
  { border: "border-blue-500/50", borderHover: "hover:border-blue-500", gradientFrom: "from-blue-500", text: "text-blue-500", textHover: "group-hover:text-blue-400", bgHover: "hover:bg-blue-500", textHoverWhite: true },
  { border: "border-rose-500/50", borderHover: "hover:border-rose-500", gradientFrom: "from-rose-500", text: "text-rose-500", textHover: "group-hover:text-rose-400", bgHover: "hover:bg-rose-500", textHoverWhite: true },
  { border: "border-amber-500/50", borderHover: "hover:border-amber-500", gradientFrom: "from-amber-500", text: "text-amber-500", textHover: "group-hover:text-amber-400", bgHover: "hover:bg-amber-500", textHoverWhite: true }
];

const ICONS = [Settings, Star, Zap, Users, Download, BookOpen, Play, Briefcase];

export const useStoreProducts = () => {
  const [combos, setCombos] = useState<StoreItem[]>([]);
  const [tools, setTools] = useState<StoreItem[]>([]);
  const [courses, setCourses] = useState<StoreItem[]>([]);
  const [freeResources, setFreeResources] = useState<StoreItem[]>([]);
  const [allProducts, setAllProducts] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const allProducts: StoreItem[] = [];
        let index = 0;
        
        snap.forEach((doc) => {
          const data = doc.data();
          const theme = THEMES[index % THEMES.length];
          const icon = ICONS[index % ICONS.length];
          index++;
          
          let priceText = `${Number(data.price || 0).toLocaleString()}đ`;
          if (data.price > 0 && data.category !== 'combo') {
             priceText = `${Number(data.price || 0).toLocaleString()}đ`;
          }

          let badgeColor = "bg-neonPurple text-white";
          if (data.badgeText?.toLowerCase().includes("hot")) badgeColor = "bg-red-500 text-white";
          if (data.badgeText?.toLowerCase().includes("sale")) badgeColor = "bg-rose-500 text-white";
          if (data.badgeText?.toLowerCase().includes("mới")) badgeColor = "bg-emerald-500 text-white";

          allProducts.push({
            id: doc.id,
            name: data.name || "Sản phẩm",
            description: data.description || "",
            priceText: priceText,
            originalPriceText: data.originalPrice ? `${Number(data.originalPrice).toLocaleString()}đ` : undefined,
            badge: data.badgeText || undefined,
            badgeColor: badgeColor,
            themeClasses: theme,
            icon: icon,
            actionText: data.price > 0 ? "Mua ngay" : "Tải xuống",
            rating: "5.0",
            category: (data.category || "").toLowerCase(),
            image: data.imageUrl || data.mainImageUrl || "/software-box.jpg",
            features: Array.isArray(data.features) ? data.features.map((f: any) => ({ bold: "✓", text: typeof f === 'string' ? f : (f.text || "") })) : []
          } as any);
        });

        setAllProducts(allProducts);

        setCombos(allProducts.filter(p => (p as any).category === 'combo'));
        setTools(allProducts.filter(p => (p as any).category === 'tool' || (p as any).category === ''));
        setCourses(allProducts.filter(p => (p as any).category === 'course' || (p as any).category === 'khóa học'));
        setFreeResources(allProducts.filter(p => (p as any).category === 'free' || (p as any).category === 'miễn phí'));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { combos, tools, courses, freeResources, allProducts, loading };
};
