import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log("Seeding to project:", firebaseConfig.projectId);
  try {
    const docRef1 = doc(db, "products", "huong-dan-ban-content-automation");
    await setDoc(docRef1, {
      name: "Hướng dẫn Ban Content Automation",
      category: "free",
      type: "automation",
      description: "Video hướng dẫn toàn tập từ cách tải, cài đặt đến sử dụng các luồng tự động băm, tải và ráp video hàng loạt với BTAI Labs Automation.",
      price: 0,
      originalPrice: 0,
      badgeText: "HOT",
      isFeatured: true,
      imageUrl: "/images/product/ban-content-pro.png",
      gallery: [],
      features: [
        { bold: "Khởi chạy qua App Hub:", text: "Quản lý và cập nhật tập trung tất cả các tool của BTAI Labs chỉ với 1 lần đăng nhập." },
        { bold: "Cấu hình linh hoạt:", text: "Hỗ trợ tích hợp đa dạng API từ Pexels, Pixabay, và xoay vòng nhiều API Google Gemini." },
        { bold: "Xử lý hàng loạt:", text: "Tải video Top N tự động, băm video theo giây, xuất file mp3 và đổi tên ảnh hàng loạt theo Scene." },
        { bold: "Chuỗi 1 - Chuẩn bị tài nguyên:", text: "Tự động tải, băm video, phân tích kịch bản và tạo AI prompt song song." },
        { bold: "Chuỗi 2 - Lắp ráp thông minh:", text: "Lắp ráp video và âm thanh khớp hoàn hảo với từng scene, tích hợp lách bản quyền (lật và zoom)." }
      ],
      howToUse: [
        "Tải và cài đặt BTAI App Hub từ mục Download trên website, đăng nhập bằng tài khoản Google.",
        "Mở App Hub, tải xuống tool Ban Content Automation đã được kích hoạt.",
        "Vào mục Cài đặt trong tool: thiết lập API (Pexels, Pixabay, Gemini) và cấu hình Prompt tạo ảnh.",
        "Tạo dự án mới, quản lý theo cấu trúc Thư mục Kênh -> Bài đăng.",
        "Chạy Chuỗi Tự Động 1: Chọn kịch bản và file link video. Tool sẽ tự tải, băm nhỏ video, đồng thời phân tích kịch bản và tách câu bằng Gemini.",
        "Tạo ảnh AI hàng loạt từ danh sách Prompt đã phân tích (có thể dùng tool Google Flow miễn phí của BTAI).",
        "Chạy Chuỗi Tự Động 2: Tool tiến hành xuất âm thanh, lắp ráp hình ảnh/clip băm khớp với lời thoại và xuất video hoàn chỉnh.",
        "Đưa video vào CapCut chèn Sub, tinh chỉnh thay thế các cảnh băm chưa ưng ý bằng ảnh AI để hoàn thiện."
      ],
      faqs: [],
      resourceType: "video",
      resourceUrl: "https://drive.google.com/file/d/1xT6W4LXiHmHsKOmtsSUGisuKDBlLLFrM/preview",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("Seeded huong-dan-ban-content-automation");

    const docRef2 = doc(db, "products", "tool-tao-anh-google-flow");
    await setDoc(docRef2, {
      name: "Tool Tạo Ảnh Tự Động (Google Flow)",
      category: "free",
      type: "tool",
      description: "Công cụ tự động tạo ảnh hàng loạt bằng công nghệ từ Google Flow, chuyên biệt để tạo ảnh nền cho các Scene List trong quy trình làm video Bán Content.",
      price: 0,
      originalPrice: 0,
      badgeText: "TẶNG KÈM",
      isFeatured: true,
      imageUrl: "/images/product/auto-image.jpg",
      gallery: [],
      features: [
        { bold: "Tạo ảnh siêu tốc:", text: "Chỉ cần dán tập lệnh Prompt vào là tool tự tạo ra hàng loạt ảnh chất lượng cao." },
        { bold: "Tối ưu hóa Scene:", text: "Được BTAI Labs cấu hình sẵn để kết quả ảnh phù hợp nhất với phong cách video." },
        { bold: "Miễn phí 100%:", text: "Tận dụng sức mạnh trí tuệ nhân tạo từ hạ tầng của Google hoàn toàn không mất phí." }
      ],
      howToUse: [
        "Sau khi dùng Tool Automation để tách kịch bản, mở file chứa các Prompt Ảnh AI đã tạo.",
        "Bấm nút 'Truy cập Công cụ miễn phí' bên dưới để mở giao diện Tool Google Flow.",
        "Dán toàn bộ các câu lệnh Prompt vào ô nhập liệu của công cụ.",
        "Tool sẽ tự động chạy và xuất ra bộ sưu tập ảnh theo đúng kịch bản.",
        "Lưu toàn bộ ảnh về máy tính, sau đó sử dụng tính năng Đổi tên ảnh hàng loạt trên Tool Automation để đồng bộ số thứ tự Scene.",
        "Đưa vào CapCut thay thế các video băm bị lỗi để hoàn thiện video cuối cùng."
      ],
      faqs: [],
      resourceType: "external_link",
      resourceUrl: "https://labs.google/fx/tools/flow/project/199016b9-0467-417e-9c3f-c26e212c64fe/tool/0747ffcb-9c91-4ee0-b08d-b9bcc9e00873",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("Seeded tool-tao-anh-google-flow");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

seed();

