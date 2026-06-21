export interface ComboData {
  gallery?: string[];
  id: string;
  name: string;
  titlePrefix: string;
  titleHighlight: string;
  tag: string;
  description: string;
  price: string;
  originalPriceText?: string;
  image: string;
  glow: string;
  theme: string;
  features: { bold: string; text: string }[];
  includes: string[];
  faq: { question: string; answer: string }[];
}

export const COMBOS_DATA: ComboData[] = [
  {
    id: "combo-khoi-nghiep",
    name: "Combo Khởi Nghiệp",
    titlePrefix: "Combo",
    titleHighlight: "Khởi Nghiệp",
    tag: "📦 GÓI CƠ BẢN",
    description: "Giải pháp trọn gói dành cho người mới bắt đầu làm YouTube Automation. Cung cấp đầy đủ công cụ cơ bản để tự động hóa quy trình sản xuất nội dung.",
    price: "990,000đ",
    originalPriceText: "1,500,000đ",
    image: "/circuit-bg.jpg",
    gallery: ["/circuit-bg.jpg", "/software-box.jpg", "/software-box-2.jpg"],
    glow: "bg-neonPurple/20",
    theme: "from-neonPurple to-pink-500",
    features: [
      { bold: "Tiết kiệm 30%:", text: "Rẻ hơn so với việc mua lẻ từng công cụ." },
      { bold: "Dễ dàng sử dụng:", text: "Các công cụ được tinh chỉnh sẵn cho người mới." },
      { bold: "Hỗ trợ cộng đồng:", text: "Tham gia nhóm kín hỗ trợ kỹ thuật." }
    ],
    includes: [
      "Ban Content VIP (1 Tháng)",
      "Tool Seeding Pro (1 Tháng)",
      "Proxy Dân cư (1 Tháng)"
    ],
    faq: [
      { question: "Tôi có được hỗ trợ cài đặt không?", answer: "Có, bạn sẽ được cấp quyền truy cập vào kho video hướng dẫn chi tiết từng bước." },
      { question: "Combo này có tự động gia hạn không?", answer: "Không, chúng tôi không tự động trừ tiền. Bạn cần gia hạn thủ công khi hết hạn." }
    ]
  },
  {
    id: "combo-scale-up",
    name: "Combo Scale-up",
    titlePrefix: "Combo",
    titleHighlight: "Scale-up",
    tag: "🚀 GÓI NÂNG CAO",
    description: "Bộ công cụ sức mạnh dành cho các cá nhân hoặc team nhỏ muốn nhân bản hàng loạt kênh để tăng trưởng bứt phá.",
    price: "3,990,000đ",
    originalPriceText: "5,000,000đ",
    image: "/software-box.jpg",
    gallery: ["/software-box.jpg", "/software-box.jpg", "/software-box-2.jpg"],
    glow: "bg-blue-500/20",
    theme: "from-blue-500 to-cyan-400",
    features: [
      { bold: "Nhân bản quy mô:", text: "Tự động hóa luồng render video số lượng lớn." },
      { bold: "Đồng bộ n8n:", text: "Quy trình được tối ưu chạy tự động hóa trên server." },
      { bold: "Hỗ trợ ưu tiên:", text: "Support 1:1 qua Telegram." }
    ],
    includes: [
      "Ban Content Ultimate (1 Năm)",
      "Healing Bird Tool (1 Năm)",
      "Tài khoản n8n Pro (1 Năm)",
      "Hỗ trợ 1:1 Support"
    ],
    faq: [
      { question: "Gói này phù hợp với ai?", answer: "Phù hợp với những người đã có kiến thức nền tảng và muốn tự động hóa hoàn toàn quy trình làm việc." },
      { question: "Tôi có thể nâng cấp từ gói Khởi Nghiệp lên không?", answer: "Có, bạn chỉ cần thanh toán số tiền chênh lệch." }
    ]
  },
  {
    id: "combo-all-in-one",
    name: "Combo All-in-One",
    titlePrefix: "Combo",
    titleHighlight: "All-in-One",
    tag: "💎 GÓI DOANH NGHIỆP",
    description: "Giải pháp toàn diện nhất cho Doanh nghiệp MMO. Sở hữu toàn bộ tinh hoa công nghệ của B.T AI Labs với mức giá trọn đời.",
    price: "9,990,000đ",
    originalPriceText: "15,000,000đ",
    image: "/software-box-2.jpg",
    gallery: ["/software-box-2.jpg", "/software-box.jpg", "/software-box-2.jpg"],
    glow: "bg-orange-500/20",
    theme: "from-orange-500 to-yellow-500",
    features: [
      { bold: "Sở hữu vĩnh viễn:", text: "Thanh toán 1 lần, dùng trọn đời mọi công cụ." },
      { bold: "Cập nhật miễn phí:", text: "Nhận tất cả các bản update tính năng mới nhất trong tương lai." },
      { bold: "Setup Server riêng:", text: "Được đội ngũ kỹ thuật cài đặt hệ thống render farm nội bộ." }
    ],
    includes: [
      "Toàn bộ Tools của hệ thống",
      "Toàn bộ Khóa học",
      "Cập nhật trọn đời",
      "Setup Server riêng biệt"
    ],
    faq: [
      { question: "Gói trọn đời có giới hạn gì không?", answer: "Không giới hạn số lượng thiết bị cá nhân sử dụng, tuy nhiên nghiêm cấm hành vi chia sẻ tài khoản cho người khác." },
      { question: "Server riêng biệt là như thế nào?", answer: "Chúng tôi sẽ remote cài đặt toàn bộ mã nguồn tool lên Server cấu hình cao của riêng bạn, giúp bạn bảo mật 100% dữ liệu." }
    ]
  }
];
