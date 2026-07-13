import LoginClient from "@/components/LoginClient";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Đăng nhập | Ban Content AI",
  description: "Đăng nhập để sử dụng công cụ AI tự động hóa video.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}
