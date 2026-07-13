const fs = require('fs');

const path = 'E:/Youtube/Ban Content/Web/app/free/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Chunk 1
content = content.replace(
  'import { ArrowLeft, PlayCircle, ExternalLink, Download, CheckCircle, ChevronRight, Check } from "lucide-react";\nimport CircuitAnimation from "@/components/CircuitAnimation";',
  'import { ArrowLeft, PlayCircle, ExternalLink, Download, CheckCircle, ChevronRight, Check, Lock } from "lucide-react";\nimport CircuitAnimation from "@/components/CircuitAnimation";\nimport { useAuth } from "@/context/AuthContext";'
);

// Chunk 2
content = content.replace(
  'const [loading, setLoading] = useState(true);\n\n  useEffect(() => {',
  'const [loading, setLoading] = useState(true);\n  const { user } = useAuth();\n\n  useEffect(() => {'
);

// Chunk 3
content = content.replace(
  `          {hasVideoUrl ? (
            <div className="relative w-full aspect-video bg-black border-b border-zinc-800">
              {resource.resourceUrl.toLowerCase().endsWith('.mp4') || resource.resourceUrl.includes('firebasestorage.googleapis.com') ? (
                <video 
                  src={resource.resourceUrl} 
                  controls 
                  className="w-full h-full"
                >
                  Trình duyệt của bạn không hỗ trợ thẻ video.
                </video>
              ) : (
                <iframe 
                  src={getEmbedUrl(resource.resourceUrl)} 
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>`,
  `          {hasVideoUrl ? (
            <div className="relative w-full aspect-video bg-black border-b border-zinc-800">
              {!user ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 bg-opacity-90 z-20">
                  <Lock className="w-16 h-16 text-neonGreen mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2 text-center px-4">Đăng nhập để xem video</h3>
                  <p className="text-zinc-400 mb-6 text-center max-w-md px-4">Tạo tài khoản miễn phí trong 2 giây để mở khóa toàn bộ tài nguyên hướng dẫn này.</p>
                  <Link href={\`/login?redirect=/free/\${id}\`} className="px-8 py-3 bg-neonGreen text-zinc-950 font-bold rounded-xl hover:scale-105 transition shadow-[0_0_20px_rgba(34,197,94,0.3)]">Đăng nhập / Đăng ký</Link>
                </div>
              ) : resource.resourceUrl.toLowerCase().endsWith('.mp4') || resource.resourceUrl.includes('firebasestorage.googleapis.com') ? (
                <video 
                  src={resource.resourceUrl} 
                  controls 
                  className="w-full h-full"
                >
                  Trình duyệt của bạn không hỗ trợ thẻ video.
                </video>
              ) : (
                <iframe 
                  src={getEmbedUrl(resource.resourceUrl)} 
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>`
);

// Chunk 4
content = content.replace(
  `            {/* CTA BUTTON CHO DẠNG LINK TOOL HOẶC RESOURCE TẢI XUỐNG */}
            {isExternalLink && resource.resourceUrl && (
              <div className="mb-12">
                <a 
                  href={resource.resourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 w-full md:w-auto bg-gradient-to-r from-neonGreen to-emerald-500 hover:from-emerald-500 hover:to-neonGreen text-zinc-950 font-bold text-lg px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_50px_rgba(34,197,94,0.5)] transition-all transform hover:scale-105"
                >
                  Truy cập Công cụ miễn phí <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            )}`,
  `            {/* CTA BUTTON CHO DẠNG LINK TOOL HOẶC RESOURCE TẢI XUỐNG */}
            {isExternalLink && resource.resourceUrl && (
              <div className="mb-12">
                {!user ? (
                  <div className="p-8 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex flex-col items-center text-center backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-neonGreen/10 to-emerald-500/10 opacity-50 pointer-events-none"></div>
                    <Lock className="w-12 h-12 text-neonGreen mb-4 relative z-10" />
                    <h4 className="text-xl font-bold text-white mb-2 relative z-10">Đăng nhập để mở khóa</h4>
                    <p className="text-zinc-400 mb-6 relative z-10">Bạn cần có tài khoản để truy cập công cụ này.</p>
                    <Link href={\`/login?redirect=/free/\${id}\`} className="px-8 py-3 bg-neonGreen text-zinc-950 font-bold rounded-xl hover:scale-105 transition shadow-[0_0_20px_rgba(34,197,94,0.3)] relative z-10">Đăng nhập / Đăng ký</Link>
                  </div>
                ) : (
                  <a 
                    href={resource.resourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 w-full md:w-auto bg-gradient-to-r from-neonGreen to-emerald-500 hover:from-emerald-500 hover:to-neonGreen text-zinc-950 font-bold text-lg px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_50px_rgba(34,197,94,0.5)] transition-all transform hover:scale-105"
                  >
                    Truy cập Công cụ miễn phí <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}`
);

// Chunk 5
content = content.replace(
  `            {/* DOWNLOAD URL (NẾU CÓ) CHO TOOL OFFLINE HOẶC EBOOK */}
            {resource.download_url && (
              <div className="mt-12 p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col items-center text-center">
                <Download className="w-12 h-12 text-zinc-500 mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Tài nguyên kèm theo</h4>
                <p className="text-zinc-400 mb-6">Tải xuống các file thực hành, template hoặc ứng dụng đính kèm.</p>
                <a 
                  href={resource.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Tải xuống ngay
                </a>
              </div>
            )}`,
  `            {/* DOWNLOAD URL (NẾU CÓ) CHO TOOL OFFLINE HOẶC EBOOK */}
            {resource.download_url && (
              <div className="mt-12 p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col items-center text-center relative overflow-hidden">
                {!user && (
                   <div className="absolute inset-0 backdrop-blur-md bg-zinc-950/80 z-10 flex flex-col items-center justify-center">
                     <Lock className="w-10 h-10 text-neonGreen mb-3" />
                     <p className="text-zinc-300 font-medium mb-4">Đăng nhập để hiển thị file tải xuống</p>
                     <Link href={\`/login?redirect=/free/\${id}\`} className="px-6 py-2 bg-neonGreen text-zinc-950 font-bold rounded-lg hover:scale-105 transition">Đăng nhập / Đăng ký</Link>
                   </div>
                )}
                <Download className="w-12 h-12 text-zinc-500 mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Tài nguyên kèm theo</h4>
                <p className="text-zinc-400 mb-6">Tải xuống các file thực hành, template hoặc ứng dụng đính kèm.</p>
                <a 
                  href={resource.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Tải xuống ngay
                </a>
              </div>
            )}`
);

fs.writeFileSync(path, content);
console.log('Done replacing content!');
