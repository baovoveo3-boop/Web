export interface CourseData {
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
  syllabus: { chapter: string; title: string; lessons: string[] }[];
  faq: { question: string; answer: string }[];
}

export const COURSES_DATA: CourseData[] = [
  {
    id: "course-youtube-automation",
    name: "Master YouTube Automation",
    titlePrefix: "Master",
    titleHighlight: "YouTube Automation",
    tag: "📚 KHÓA HỌC CHUYÊN SÂU",
    description: "Khóa học từ A-Z hướng dẫn bạn cách xây dựng cỗ máy in tiền trên YouTube bằng AI mà không cần lộ mặt hay tự viết kịch bản.",
    price: "1,990,000đ",
    originalPriceText: "3,000,000đ",
    image: "/software-box.jpg",
    gallery: ["/software-box.jpg", "/software-box.jpg", "/software-box-2.jpg"],
    glow: "bg-red-500/20",
    theme: "from-red-500 to-orange-500",
    features: [
      { bold: "Quy trình chuẩn hóa:", text: "Học cách tìm ngách, viết prompt và dựng video tự động." },
      { bold: "Thực chiến 100%:", text: "Thực hành ngay trên các kênh thực tế đang bật kiếm tiền." },
      { bold: "Tặng kèm File Mẫu:", text: "Sở hữu kho kịch bản và Prompt Notion độc quyền." }
    ],
    syllabus: [
      { 
        chapter: "Chương 1", 
        title: "Tư duy và Tìm ngách", 
        lessons: ["Mindset đúng về YouTube Automation", "Cách tìm ngách (Niche) dễ lên xu hướng", "Phân tích đối thủ bằng Tool"] 
      },
      { 
        chapter: "Chương 2", 
        title: "Sản xuất nội dung bằng AI", 
        lessons: ["Viết kịch bản tự động với ChatGPT", "Tạo giọng đọc AI chân thực", "Ghép nối âm thanh và hình ảnh"] 
      },
      { 
        chapter: "Chương 3", 
        title: "Tối ưu hóa và Thuật toán", 
        lessons: ["SEO tiêu đề và Thumbnail", "Hiểu về thuật toán đề xuất", "Cách duy trì tỷ lệ giữ chân người xem"] 
      }
    ],
    faq: [
      { question: "Tôi không rành máy tính có học được không?", answer: "Khóa học được thiết kế theo hình thức 'Cầm tay chỉ việc', chỉ cần bạn biết thao tác máy tính cơ bản là có thể làm được." },
      { question: "Học xong có được hỗ trợ không?", answer: "Có, bạn được add vào Group Zalo hỗ trợ giải đáp thắc mắc trọn đời." }
    ]
  },
  {
    id: "course-tiktok-affiliate",
    name: "TikTok Affiliate Pro",
    titlePrefix: "TikTok",
    titleHighlight: "Affiliate Pro",
    tag: "📚 KHÓA HỌC THỰC CHIẾN",
    description: "Khóa học chuyên sâu về thuật toán TikTok và cách xây dựng kênh Review, Re-up kết hợp kiếm tiền Affiliate hiệu quả.",
    price: "1,490,000đ",
    originalPriceText: "2,000,000đ",
    image: "/software-box-2.jpg",
    gallery: ["/software-box-2.jpg", "/software-box.jpg", "/software-box-2.jpg"],
    glow: "bg-pink-500/20",
    theme: "from-pink-500 to-purple-500",
    features: [
      { bold: "Tuyệt chiêu Re-up:", text: "Lách bản quyền 100% bằng công nghệ Render mới nhất." },
      { bold: "Chọn sản phẩm Win:", text: "Cách tìm các mặt hàng có hoa hồng cao dễ chuyển đổi." },
      { bold: "Tối ưu Livestream:", text: "Cách set up Auto Livestream kiếm tiền thụ động." }
    ],
    syllabus: [
      { 
        chapter: "Chương 1", 
        title: "Tổng quan TikTok Affiliate", 
        lessons: ["Cơ chế tính hoa hồng TikTok Shop", "Luật chơi và các lỗi cần tránh"] 
      },
      { 
        chapter: "Chương 2", 
        title: "Xây kênh và Nội dung", 
        lessons: ["Cách tải video gốc không logo", "Công thức edit video chống quét bản quyền", "Kịch bản review sản phẩm chốt sale"] 
      },
      { 
        chapter: "Chương 3", 
        title: "Bùng nổ doanh số", 
        lessons: ["Chạy Ads cơ bản để cắn đề xuất", "Quy trình Livestream tự động hóa"] 
      }
    ],
    faq: [
      { question: "Bao lâu thì ra đơn hàng đầu tiên?", answer: "Nếu áp dụng đúng công thức và duy trì đăng video đều đặn, thông thường từ 1-2 tuần kênh sẽ có những đơn hàng đầu tiên." },
      { question: "Cần bao nhiêu vốn để bắt đầu?", answer: "Bạn có thể bắt đầu với 0 đồng chi phí nhập hàng, chỉ cần một chiếc điện thoại hoặc máy tính." }
    ]
  }
];
