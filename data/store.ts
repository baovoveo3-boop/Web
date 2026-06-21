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
}

export const COMBOS: StoreItem[] = [
  {
    id: "combo-khoi-nghiep",
    name: "Combo Khởi Nghiệp",
    description: "Bao gồm Ban Content VIP, Tool Seeding Pro và Proxy 1 tháng. Dành cho người mới bắt đầu.",
    priceText: "990,000đ/tháng",
    originalPriceText: "1,500,000đ",
    badge: "-30%",
    badgeColor: "bg-red-500 text-white",
    themeClasses: { border: "border-neonPurple/50", borderHover: "hover:border-neonPurple", gradientFrom: "from-neonPurple", text: "text-neonPurple", textHover: "group-hover:text-neonPurple", bgHover: "hover:bg-neonPurple", textHoverWhite: true },
    icon: Settings,
    actionText: "Mua ngay"
  },
  {
    id: "combo-scale-up",
    name: "Combo Scale-up",
    description: "Bao gồm 3 tool Automation cao cấp, tài khoản n8n Pro 1 năm và Support 1:1.",
    priceText: "3,990,000đ/năm",
    originalPriceText: "5,000,000đ",
    themeClasses: { border: "border-blue-500/50", borderHover: "hover:border-blue-500", gradientFrom: "from-blue-500", text: "text-blue-500", textHover: "group-hover:text-blue-400", bgHover: "hover:bg-blue-500", textHoverWhite: true },
    icon: Users,
    actionText: "Mua ngay"
  },
  {
    id: "combo-all-in-one",
    name: "Combo All-in-One",
    description: "Sở hữu toàn bộ Tool, Khóa học và quyền truy cập sớm mọi tính năng BETA của B.T AI LABs.",
    priceText: "Liên hệ/nhận báo giá",
    badge: "MỚI",
    badgeColor: "bg-neonGreen text-zinc-950",
    themeClasses: { border: "border-neonGreen/50", borderHover: "hover:border-neonGreen", gradientFrom: "from-neonGreen", text: "text-neonGreen", textHover: "group-hover:text-neonGreen", bgHover: "hover:bg-neonGreen", textHoverWhite: false },
    icon: Download,
    actionText: "Tư vấn"
  }
];

export const TOOLS: StoreItem[] = [
  {
    id: "ban-content-standard",
    name: "Ban Content Standard",
    description: "Tool cơ bản giúp rà soát từ khóa bị cấm trên nền tảng. Hỗ trợ quét 3 lần/ngày.",
    priceText: "99,000đ/tháng",
    originalPriceText: "150,000đ",
    rating: "5.0",
    themeClasses: { border: "border-neonPurple/50", borderHover: "hover:border-neonPurple", gradientFrom: "from-neonPurple", text: "text-neonPurple", textHover: "group-hover:text-neonPurple", bgHover: "hover:bg-neonPurple", textHoverWhite: true },
    icon: Star,
    actionText: "Thêm vào giỏ"
  },
  {
    id: "image-gen-ai",
    name: "Image Gen AI (FFmpeg)",
    description: "Ghép nối FFmpeg, Whisper alignment và tự động sinh ảnh qua ImageFX.",
    priceText: "315,000đ/tháng",
    originalPriceText: "450,000đ",
    badge: "BEST SELLER",
    badgeColor: "bg-neonGreen text-zinc-950",
    themeClasses: { border: "border-neonGreen/50", borderHover: "hover:border-neonGreen", gradientFrom: "from-neonGreen", text: "text-neonGreen", textHover: "group-hover:text-neonGreen", bgHover: "hover:bg-neonGreen", textHoverWhite: false },
    icon: Star,
    actionText: "Thêm vào giỏ"
  },
  {
    id: "fish-audio-voice",
    name: "Fish Audio Voice Clone",
    description: "Nhân bản giọng nói chuyên nghiệp không giới hạn ký tự bằng Fish Audio API.",
    priceText: "450,000đ/tháng",
    originalPriceText: "600,000đ",
    themeClasses: { border: "border-blue-500/50", borderHover: "hover:border-blue-500", gradientFrom: "from-blue-500", text: "text-blue-500", textHover: "group-hover:text-blue-400", bgHover: "hover:bg-blue-500", textHoverWhite: true },
    icon: Star,
    actionText: "Thêm vào giỏ"
  },
  {
    id: "auto-post-tiktok",
    name: "Auto Post TikTok",
    description: "Tự động lên lịch và đăng video hàng loạt lên TikTok qua API chính thức.",
    priceText: "200,000đ/tháng",
    originalPriceText: "300,000đ",
    themeClasses: { border: "border-pink-500/50", borderHover: "hover:border-pink-500", gradientFrom: "from-pink-500", text: "text-pink-500", textHover: "group-hover:text-pink-400", bgHover: "hover:bg-pink-500", textHoverWhite: true },
    icon: Star,
    actionText: "Thêm vào giỏ"
  },
  {
    id: "seeding-pro",
    name: "Seeding Pro Tool",
    description: "Quản lý hàng trăm tài khoản clone để buff like, share, comment an toàn.",
    priceText: "500,000đ/tháng",
    originalPriceText: "800,000đ",
    themeClasses: { border: "border-amber-500/50", borderHover: "hover:border-amber-500", gradientFrom: "from-amber-500", text: "text-amber-500", textHover: "group-hover:text-amber-400", bgHover: "hover:bg-amber-500", textHoverWhite: true },
    icon: Star,
    actionText: "Thêm vào giỏ"
  },
  {
    id: "proxy-manager",
    name: "Proxy Manager",
    description: "Công cụ quản lý, xoay proxy và fake IP chuyên sâu cho giới MMO.",
    priceText: "150,000đ/tháng",
    themeClasses: { border: "border-cyan-500/50", borderHover: "hover:border-cyan-500", gradientFrom: "from-cyan-500", text: "text-cyan-500", textHover: "group-hover:text-cyan-400", bgHover: "hover:bg-cyan-500", textHoverWhite: true },
    icon: Star,
    actionText: "Thêm vào giỏ"
  }
];

export const COURSES: StoreItem[] = [
  {
    id: "master-n8n",
    name: "Master n8n Automation",
    description: "Học cách tự động hóa mọi quy trình trên n8n từ cơ bản đến nâng cao. Tặng kèm 50 workflows mẫu.",
    priceText: "2,000,000đ/trọn đời",
    badge: "HOT",
    badgeColor: "bg-blue-500 text-white",
    themeClasses: { border: "border-blue-500/50", borderHover: "hover:border-blue-500", gradientFrom: "from-blue-600", text: "text-blue-500", textHover: "group-hover:text-blue-400", bgHover: "hover:bg-blue-500", textHoverWhite: true },
    icon: BookOpen,
    actionText: "Đăng ký"
  },
  {
    id: "tu-duy-mmo",
    name: "Tư Duy MMO Đỉnh Cao",
    description: "Khóa học chia sẻ mindset kiếm tiền từ YouTube, TikTok và các nền tảng social khác với AI.",
    priceText: "990,000đ/trọn đời",
    originalPriceText: "1,500,000đ",
    badge: "MỚI",
    badgeColor: "bg-purple-500 text-white",
    themeClasses: { border: "border-purple-500/50", borderHover: "hover:border-purple-500", gradientFrom: "from-purple-500", text: "text-purple-500", textHover: "group-hover:text-purple-400", bgHover: "hover:bg-purple-500", textHoverWhite: true },
    icon: Play,
    actionText: "Đăng ký"
  },
  {
    id: "design-canva",
    name: "Thiết Kế Cơ Bản với Canva",
    description: "Nắm vững cách tự thiết kế thumbnail, ảnh bìa kênh chuẩn SEO cực nhanh gọn mà không cần học Photoshop.",
    priceText: "Miễn phí/VIP",
    themeClasses: { border: "border-pink-500/50", borderHover: "hover:border-pink-500", gradientFrom: "from-pink-500", text: "text-pink-500", textHover: "group-hover:text-pink-400", bgHover: "hover:bg-pink-500", textHoverWhite: true },
    icon: CheckSquare,
    actionText: "Học ngay"
  }
];

export const FREE_RESOURCES: StoreItem[] = [
  {
    id: "loc-tuong-tac",
    name: "Tool Lọc Tương Tác FB",
    description: "Công cụ Extension dọn dẹp bạn bè không tương tác siêu nhẹ và an toàn.",
    priceText: "Miễn phí",
    badge: "FREE",
    badgeColor: "bg-rose-500 text-white",
    themeClasses: { border: "border-rose-500/50", borderHover: "hover:border-rose-500", gradientFrom: "from-rose-500", text: "text-rose-500", textHover: "group-hover:text-rose-400", bgHover: "hover:bg-rose-500", textHoverWhite: true },
    icon: Download,
    actionText: "Tải xuống"
  },
  {
    id: "ebook-tiktok",
    name: "E-book: Bí Mật Thuật Toán TikTok",
    description: "Tổng hợp kiến thức xây kênh TikTok ngàn views từ các chuyên gia hàng đầu.",
    priceText: "Miễn phí",
    badge: "FREE",
    badgeColor: "bg-rose-500 text-white",
    themeClasses: { border: "border-blue-500/50", borderHover: "hover:border-blue-500", gradientFrom: "from-blue-500", text: "text-blue-500", textHover: "group-hover:text-blue-400", bgHover: "hover:bg-blue-500", textHoverWhite: true },
    icon: BookOpen,
    actionText: "Tải xuống"
  },
  {
    id: "prompt-chatgpt",
    name: "Bộ Prompt ChatGPT Pro",
    description: "Danh sách 500+ Prompt tối ưu để viết kịch bản, làm SEO và sáng tạo nội dung.",
    priceText: "Miễn phí",
    badge: "FREE",
    badgeColor: "bg-emerald-500 text-white",
    themeClasses: { border: "border-emerald-500/50", borderHover: "hover:border-emerald-500", gradientFrom: "from-emerald-400", text: "text-emerald-500", textHover: "group-hover:text-emerald-400", bgHover: "hover:bg-emerald-500", textHoverWhite: true },
    icon: MessageSquare,
    actionText: "Tải xuống"
  }
];
