const fs = require('fs');
let code = fs.readFileSync('E:/Youtube/Ban Content/Web/data/tools.ts', 'utf8');

const additionalTools = `
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
`;

// remove the closing bracket of the array and append the new items
code = code.replace(/];[\s]*$/, additionalTools);

fs.writeFileSync('E:/Youtube/Ban Content/Web/data/tools.ts', code);
console.log('Appended tools');
