export interface Feature {
  bold: string;
  text: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ToolData {
  gallery?: string[];
  id: string; // slug
  name: string;
  tag: string;
  titlePrefix: string;
  titleHighlight: string;
  description: string;
  price: string;
  originalPriceText?: string;
  image: string;
  features: Feature[];
  theme: string;
  glow: string;
  howToUse: string[];
  faq: FAQItem[];
}

export const TOOLS: ToolData[] = [
  {
    id: "ban-content",
    name: "Ban Content",
    tag: "🚀 SẢN PHẨM 1",
    titlePrefix: "Ban Content",
    titleHighlight: "Automation",
    description: "Giải pháp hô biến Kịch bản Text hoặc File Excel thành Video hoàn chỉnh chỉ với 1 click. Không cần lộ mặt, không cần phần mềm dựng phim phức tạp!",
    price: "499,000đ",
    image: "/software-box.jpg",
    gallery: ["/software-box.jpg", "/software-box.jpg", "/software-box-2.jpg"],
    features: [
      { bold: "Tích hợp All-in-one:", text: "Sinh ảnh AI, nhân bản giọng đọc (TTS) và ghép phụ đề tự động theo từng cảnh." },
      { bold: "Giao diện trực quan:", text: "Quản lý dự án ngay trên GUI hiện đại, dễ dàng theo dõi tiến độ Render." },
      { bold: "Tối ưu năng suất:", text: "Xây dựng hàng loạt kênh tin tức, kể chuyện, review không tốn chi phí Editor." }
    ],
    theme: "from-neonPurple to-neonGreen",
    glow: "bg-neonPurple/20",
    howToUse: [
      "Chuẩn bị kịch bản text hoặc file Excel chứa danh sách các phân cảnh.",
      "Cấu hình giọng đọc, nhân vật ảo AI hoặc hình ảnh minh họa trên bảng điều khiển.",
      "Click nút 'Bắt đầu Render' và theo dõi tiến trình sinh video tự động từ server cloud."
    ],
    faq: [
      { question: "Tôi có thể sử dụng giọng đọc của riêng mình không?", answer: "Có, hệ thống hỗ trợ tải lên file âm thanh giọng đọc của bạn hoặc nhân bản giọng nói trực tiếp." },
      { question: "Thời gian render trung bình cho một video là bao lâu?", answer: "Thông thường mất khoảng 2-5 phút cho một video có độ dài từ 1 đến 3 phút tùy thuộc số lượng cảnh." },
      { question: "Video kết xuất ra có thể đăng lên các nền tảng nào?", answer: "Hệ thống xuất video chuẩn 16:9 hoặc 9:16 tương thích tốt với YouTube, TikTok, Facebook Reels." }
    ]
  },
  {
    id: "healing-bird",
    name: "Healing Bird",
    tag: "🌿 SẢN PHẨM 2",
    titlePrefix: "Healing Bird",
    titleHighlight: "Tool",
    description: "Hệ thống R&D và Render Kênh Chữa Lành. Tự động quét đối thủ và mix hàng trăm Assets để xuất xưởng những luồng video Healing dài hàng giờ.",
    price: "599,000đ",
    image: "/software-box-2.jpg",
    gallery: ["/software-box-2.jpg", "/software-box.jpg", "/software-box-2.jpg"],
    features: [
      { bold: "R&D Tự Động:", text: "Quét dữ liệu các video chim chóc, thiên nhiên Top 1 thị trường để học hỏi cấu trúc." },
      { bold: "Mix Assets Thông Minh:", text: "Tự động trộn các tệp hình ảnh, âm thanh (Audio Input) và hiệu ứng (SFX) thành Sequence hoàn chỉnh." },
      { bold: "Sinh Tiền Thụ Động:", text: "Xuất video thời lượng dài cực mượt, đáp ứng tiêu chuẩn khắt khe của ngách Relaxation." }
    ],
    theme: "from-emerald-400 to-cyan-400",
    glow: "bg-emerald-400/20",
    howToUse: [
      "Tìm kiếm các kênh healing đối thủ có traffic lớn và quét các từ khóa, cấu trúc nội dung phổ biến.",
      "Chọn thư mục chứa assets âm thanh tiếng chim hót, tiếng mưa rơi, nhạc thiền và hình ảnh thiên nhiên.",
      "Đặt lịch render và chọn định dạng video đầu ra chất lượng cao để tải lên kênh YouTube relaxation."
    ],
    faq: [
      { question: "Tool quét dữ liệu từ các nền tảng nào?", answer: "Hiện tại hệ thống hỗ trợ quét dữ liệu công khai trên YouTube và TikTok để đề xuất xu hướng." },
      { question: "Chất lượng âm thanh audio output có chuẩn studio không?", answer: "Có, tool tích hợp bộ lọc tần số và giảm nhiễu giúp âm thanh trong trẻo, chân thực." },
      { question: "Tool có giới hạn số lượng video render mỗi ngày không?", answer: "Không giới hạn số lượng video render, tuy nhiên thời gian render sẽ phụ thuộc vào tài nguyên phần cứng hoặc gói đăng ký cloud." }
    ]
  }

  ,
  {
    id: "ban-content-standard",
    name: "Ban Content Standard",
    tag: "🛠️ TOOL CƠ BẢN",
    titlePrefix: "Ban Content",
    titleHighlight: "Standard",
    description: "Tool cơ bản giúp rà soát từ khóa bị cấm trên nền tảng. Hỗ trợ quét 3 lần/ngày.",
    price: "99,000đ/tháng",
    image: "/software-box.jpg",
    gallery: ["/software-box.jpg", "/software-box.jpg", "/software-box-2.jpg"],
    features: [
      { bold: "Quét từ khóa:", text: "Tự động phát hiện các từ khóa vi phạm tiêu chuẩn cộng đồng." },
      { bold: "Cảnh báo sớm:", text: "Giúp tránh bị đánh gậy bản quyền hoặc bóp tương tác." }
    ],
    theme: "from-neonPurple to-purple-500",
    glow: "bg-neonPurple/20",
    howToUse: ["Cài đặt Extension", "Bật tool khi duyệt web", "Xem báo cáo"],
    faq: [{ question: "Có an toàn không?", answer: "Hoàn toàn an toàn, không yêu cầu đăng nhập." }]
  },
  {
    id: "image-gen-ai",
    name: "Image Gen AI",
    tag: "🎨 TOOL ĐỒ HỌA",
    titlePrefix: "Image Gen",
    titleHighlight: "AI",
    description: "Ghép nối FFmpeg, Whisper alignment và tự động sinh ảnh qua ImageFX.",
    price: "315,000đ/tháng",
    image: "/software-box-2.jpg",
    gallery: ["/software-box-2.jpg", "/software-box.jpg", "/software-box-2.jpg"],
    features: [
      { bold: "Sinh ảnh hàng loạt:", text: "Tạo hàng trăm bức ảnh từ prompt một cách tự động." },
      { bold: "Tích hợp kịch bản:", text: "Đồng bộ ảnh và giọng đọc tự động." }
    ],
    theme: "from-neonGreen to-emerald-500",
    glow: "bg-neonGreen/20",
    howToUse: ["Nhập prompt", "Chọn số lượng ảnh", "Bấm Generate"],
    faq: [{ question: "Có giới hạn số ảnh không?", answer: "Bạn có thể sinh lên đến 1000 ảnh mỗi ngày." }]
  },
  {
    id: "fish-audio-voice",
    name: "Fish Audio Voice Clone",
    tag: "🎤 TOOL ÂM THANH",
    titlePrefix: "Fish Audio",
    titleHighlight: "Voice Clone",
    description: "Nhân bản giọng nói chuyên nghiệp không giới hạn ký tự bằng Fish Audio API.",
    price: "450,000đ/tháng",
    image: "/software-box.jpg",
    gallery: ["/software-box.jpg", "/software-box.jpg", "/software-box-2.jpg"],
    features: [
      { bold: "Nhân bản 1:1:", text: "Giọng đọc AI giống hệt giọng thật 99%." },
      { bold: "Không giới hạn ký tự:", text: "Render tệp audio dài hàng tiếng đồng hồ." }
    ],
    theme: "from-blue-500 to-cyan-500",
    glow: "bg-blue-500/20",
    howToUse: ["Upload file ghi âm mẫu", "Nhập text cần đọc", "Xuất file mp3"],
    faq: [{ question: "Bao lâu thì clone xong?", answer: "Chỉ mất 5 phút upload audio mẫu là clone thành công." }]
  },
  {
    id: "auto-post-tiktok",
    name: "Auto Post TikTok",
    tag: "📱 TOOL TIKTOK",
    titlePrefix: "Auto Post",
    titleHighlight: "TikTok",
    description: "Tự động lên lịch và đăng video hàng loạt lên TikTok qua API chính thức.",
    price: "200,000đ/tháng",
    image: "/software-box-2.jpg",
    gallery: ["/software-box-2.jpg", "/software-box.jpg", "/software-box-2.jpg"],
    features: [
      { bold: "Lên lịch thông minh:", text: "Tự động gợi ý khung giờ vàng để đăng." },
      { bold: "Quản lý đa kênh:", text: "Đăng cùng lúc lên 10+ tài khoản TikTok." }
    ],
    theme: "from-pink-500 to-rose-500",
    glow: "bg-pink-500/20",
    howToUse: ["Kết nối tài khoản TikTok", "Tải video lên", "Set lịch đăng"],
    faq: [{ question: "Có bị shadowban không?", answer: "Tool dùng API chính thức của TikTok nên 100% an toàn." }]
  },
  {
    id: "seeding-pro",
    name: "Seeding Pro Tool",
    tag: "🔥 TOOL TƯƠNG TÁC",
    titlePrefix: "Seeding Pro",
    titleHighlight: "Tool",
    description: "Quản lý hàng trăm tài khoản clone để buff like, share, comment an toàn.",
    price: "500,000đ/tháng",
    image: "/software-box.jpg",
    gallery: ["/software-box.jpg", "/software-box.jpg", "/software-box-2.jpg"],
    features: [
      { bold: "Buff tương tác siêu tốc:", text: "Lên nghìn like chỉ trong vài phút." },
      { bold: "Kịch bản Comment:", text: "Cài đặt comment có ngữ cảnh thật như người dùng." }
    ],
    theme: "from-amber-500 to-yellow-500",
    glow: "bg-amber-500/20",
    howToUse: ["Thêm acc clone", "Thiết lập kịch bản", "Chạy chiến dịch"],
    faq: [{ question: "Acc clone có dễ chết không?", answer: "Tool có cơ chế fake device và xoay IP nên tỉ lệ sống rất cao." }]
  },
  {
    id: "proxy-manager",
    name: "Proxy Manager",
    tag: "🌐 TOOL MẠNG",
    titlePrefix: "Proxy",
    titleHighlight: "Manager",
    description: "Công cụ quản lý, xoay proxy và fake IP chuyên sâu cho giới MMO.",
    price: "150,000đ/tháng",
    image: "/software-box-2.jpg",
    gallery: ["/software-box-2.jpg", "/software-box.jpg", "/software-box-2.jpg"],
    features: [
      { bold: "Xoay IP tự động:", text: "Chuyển IP mỗi 5 phút hoặc sau mỗi tác vụ." },
      { bold: "Hỗ trợ đa luồng:", text: "Dùng hàng nghìn proxy cùng lúc không bị crash." }
    ],
    theme: "from-cyan-500 to-blue-500",
    glow: "bg-cyan-500/20",
    howToUse: ["Nhập list proxy", "Gán vào cấu hình tool khác", "Chạy"],
    faq: [{ question: "Có hỗ trợ IPv6 không?", answer: "Có, cả IPv4 và IPv6." }]
  }
];
