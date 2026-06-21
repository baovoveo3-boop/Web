import LoginClient from "@/components/LoginClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | Ban Content AI",
  description: "Đăng nhập để sử dụng công cụ AI tự động hóa video.",
};

export default function LoginPage() {
  return <LoginClient />;
}
