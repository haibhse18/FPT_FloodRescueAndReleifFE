"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/shared/ui/components/Input";
import { Button } from "@/shared/ui/components/Button";
import { Card } from "@/shared/ui/components/Card";
import { Alert } from "@/shared/ui/components/Alert";
import PasswordInput from "@/shared/components/forms/PasswordInput";
import GoogleLoginButton from "@/shared/components/forms/GoogleLoginButton";
import FormDivider from "@/shared/components/forms/FormDivider";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuth.store";
import { loginSchema } from "@/shared/schemas/validation";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login, loading, user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Validate input
      const validationResult = loginSchema.safeParse({ email, password });
      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        setError(firstError.message);
        return;
      }

      // Use auth store login method
      const success = await login({ email, password });

      if (!success) {
        setError("Đăng nhập thất bại");
        return;
      }

      // Get fresh user data from store after login
      const currentUser = useAuthStore.getState().user;

      // Redirect based on user role
      const redirectMap: Record<string, string> = {
        Citizen: "/home",
        "Rescue Team": "/missions",
        "Rescue Coordinator": "/dashboard",
        "Manager": "/manager-dashboard",
        Admin: "/admin-dashboard",
      };

      const redirectPath =
        currentUser?.role ? redirectMap[currentUser.role] : "/";
      router.push(redirectPath);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (/timeout/i.test(msg) || /ECONNABORTED/i.test(msg)) {
        setError("Máy chủ đang khởi động lại, vui lòng đợi 30–60 giây rồi thử lại");
      } else {
        setError(msg || "Đăng nhập thất bại");
      }
    }
  };

 return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* HEADER */}
            <header className="w-full bg-slate-50 flex items-center h-[72px] px-6 lg:px-10 border-b border-slate-200/50">
                <div className="flex-1 flex items-center text-[#0b4d96] font-bold text-xl tracking-tight">
                    FPT Flood Rescue & Relief
                </div>
                <nav className="hidden md:flex flex-1 justify-center items-center gap-8 text-sm text-slate-600 font-medium">
                    <Link href="/" className="hover:text-slate-900 transition-colors">Trang chủ</Link>
                    <Link href="/" className="hover:text-slate-900 transition-colors">Hoạt động</Link>
                    <Link href="/" className="hover:text-slate-900 transition-colors">Ủng hộ</Link>
                    <Link href="/" className="hover:text-slate-900 transition-colors">Liên hệ</Link>
                </nav>
                <div className="flex-1 flex justify-end items-center gap-6">
                    <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Đăng nhập
                    </Link>
                    <Link href="/register" className="bg-[#0b4d96] hover:bg-blue-800 text-white px-5 py-2 rounded-md text-sm font-medium transition-all shadow-sm">
                        Đăng ký
                    </Link>
                </div>
            </header>

            {/* Main Content Box */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 py-12">
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-8 max-w-[440px] w-full relative mb-6">
                    {/* Header Card */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-[2px] bg-[#0b4d96]"></div>
                            <p className="text-[#0b4d96] text-[10px] font-bold tracking-widest uppercase">Hệ thống cứu hộ fpt</p>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Chào mừng trở lại.</h1>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Đăng nhập để tiếp tục các hoạt động cứu trợ và điều phối khẩn cấp.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-[11px] font-bold text-slate-700 uppercase tracking-widest">Địa chỉ email</label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="example@fpt.com"
                              required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label htmlFor="password" className="block text-[11px] font-bold text-slate-700 uppercase tracking-widest">Mật khẩu</label>
                                <Link href="/forgot-password" className="text-[11px] font-bold text-[#0b4d96] hover:text-blue-800 uppercase tracking-widest">
                                    Quên mật khẩu?
                                </Link>
                            </div>
                            <PasswordInput
                              id="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              required
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}

                        <div className="pt-4">
                            <Button
                              type="submit"
                              variant="primary"
                              fullWidth
                              size="lg"
                              isLoading={loading}
                              disabled={loading}
                            >
                              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </Button>
                        </div>
                    </form>

                    {/* Footer Card */}
                    <div className="mt-8 text-center text-sm text-slate-600">
                        Bạn chưa có tài khoản?{" "}
                        <Link href="/register" className="font-bold text-[#0b4d96] hover:text-blue-800 transition-colors">Tạo tài khoản mới</Link>
                    </div>
                </div>

                {/* Technical Support Alert */}
                <div className="max-w-[440px] w-full bg-[#f1f5f9] rounded-xl p-5 flex gap-4">
                    <div className="flex-shrink-0 pt-0.5">
                        <svg className="w-5 h-5 text-[#0b4d96]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L1 21h22L12 2zm1 16h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-[11px] font-bold text-[#0b4d96] uppercase tracking-widest mb-1.5">Hỗ trợ kỹ thuật</h3>
                        <p className="text-xs text-slate-500 leading-relaxed pr-2">
                            Nếu bạn gặp sự cố khi truy cập hệ thống trong khu vực bị ảnh hưởng bởi lũ lụt, vui lòng gọi hotline 1900 xxxx.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full bg-transparent py-6 px-6 lg:px-10 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 border-t border-slate-200 mt-auto">
                <div className="mb-4 md:mb-0 flex items-center gap-2">
                    <span className="font-bold text-[#0b4d96] text-sm md:mr-2">FPT Flood Rescue & Relief</span>
                    <span className="text-slate-400">© 2024 FPT Flood Rescue & Relief. All rights reserved.</span>
                </div>
                <div className="flex gap-6 sm:gap-8">
                    <Link href="#" className="hover:text-slate-900 transition-colors">Chính sách bảo mật</Link>
                    <Link href="#" className="hover:text-slate-900 transition-colors">Điều khoản sử dụng</Link>
                    <Link href="#" className="hover:text-slate-900 transition-colors">Liên hệ cứu trợ</Link>
                </div>
            </footer>
        </div>
    );
}
