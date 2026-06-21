import type { Metadata } from "next";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import CartPanel from "@/components/CartPanel";

export const metadata: Metadata = {
  title: "B.T AI LABs - Nền tảng tự động hóa AI",
  description: "Trải nghiệm sức mạnh của AI với các giải pháp tạo Content hàng loạt, R&D tự động, và các công cụ giúp X10 năng suất làm việc của bạn.",
  openGraph: {
    title: "B.T AI LABs - Nền tảng tự động hóa AI",
    description: "Giải pháp sinh Video hàng loạt bằng AI không cần Editor",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-x-hidden">
        <AuthProvider>
          <CartProvider>
            {children}
            <ScrollToTop />
            <CartPanel />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
