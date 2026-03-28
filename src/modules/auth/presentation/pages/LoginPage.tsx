"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/shared/ui/components/Input";
import { Button } from "@/shared/ui/components/Button";
import PasswordInput from "@/shared/components/forms/PasswordInput";
import GoogleLoginButton from "@/shared/components/forms/GoogleLoginButton";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuth.store";
import { loginSchema } from "@/shared/schemas/validation";
import { Footer } from "@/shared/ui/components/Footer";


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
    <div className="min-h-screen bg-[#f0f7ff] flex flex-col font-sans selection:bg-[#51A9FF]/20">
      {/* HEADER */}
      <header className="w-full bg-white/80 backdrop-blur-md flex items-center h-[80px] px-6 lg:px-10 border-b border-slate-200/50 sticky top-0 z-50">
        <div className="flex-1 flex items-center">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <img 
              src="/images/project-logo.png" 
              alt="FPT Rescue & Relief Logo" 
              className="h-10 w-auto object-contain"
            />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-tighter text-[#133249] uppercase italic">FPT Rescue & Relief</span>
              <span className="text-[10px] font-bold text-[#51A9FF] tracking-[0.2em] uppercase">Emergency Response</span>
            </div>
          </Link>
        </div>
        
        <nav className="hidden lg:flex flex-1 justify-center items-center gap-8 text-sm text-slate-600 font-bold uppercase tracking-widest">
          <Link href="/" className="hover:text-[#133249] transition-colors">Trang chủ</Link>
          <Link href="/#hoat-dong" className="hover:text-[#133249] transition-colors">Hoạt động</Link>
          <Link href="/" className="hover:text-[#133249] transition-colors">Liên hệ</Link>
        </nav>

        <div className="flex-1 flex justify-end items-center gap-4">
          <Link href="/login" className="hidden sm:block text-xs font-black text-[#133249] uppercase tracking-widest hover:text-[#51A9FF] transition-colors">
            Đăng nhập
          </Link>
          <Button variant="primary" size="sm" href="/register" className="font-black !bg-[#51A9FF] !text-white hover:!bg-[#3a8ee6] shadow-[0_4px_15px_rgba(81,169,255,0.4)] rounded-xl px-7 py-2.5 text-[10px] uppercase tracking-widest border-none transition-all hover:scale-105">
            Đăng ký
          </Button>
        </div>
      </header>

      {/* Main Content Box */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 py-16 relative overflow-hidden bg-[#f0f7ff]">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full pointer-events-none opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#51A9FF] rounded-full blur-[100px]"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-[#133249] rounded-full blur-[100px]"></div>
        </div>

        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-[0_30px_70px_rgba(0,0,0,0.06)] border border-white/50 p-12 max-w-[500px] w-full relative z-10">
          {/* Header Card */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black text-white bg-red-500 mb-6 shadow-md uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-white mr-2 animate-pulse"></span>
              Cổng Điều Phối Khẩn Cấp
            </div>
            <h1 className="text-3xl font-black text-[#133249] mb-3 tracking-tighter">Chào mừng trở lại.</h1>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[300px] mx-auto">
              Đăng nhập để duy trì kết nối và điều phối các nguồn lực cứu trợ.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] font-black text-[#133249] uppercase tracking-[0.2em] ml-1">Địa chỉ email</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@fpt.com"
                required
                className="rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all h-12"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label htmlFor="password" className="block text-[10px] font-black text-[#133249] uppercase tracking-[0.2em]">Mật khẩu</label>
                <Link href="/forgot-password" title="Quên mật khẩu?" className="text-[10px] font-black text-[#51A9FF] hover:text-[#133249] uppercase tracking-widest transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                label=""
                className="rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all h-12"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                <p className="text-red-600 text-[13px] font-bold">{error}</p>
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={loading}
                disabled={loading}
                className="rounded-2xl py-6 font-black uppercase tracking-[0.2em] !bg-[#51A9FF] hover:!bg-[#3a8ee6] !text-white shadow-[0_10px_25px_rgba(81,169,255,0.4)] border-none transition-all hover:scale-[1.02]"
              >
                {loading ? "Đang xác thực..." : "Đăng nhập ngay"}
              </Button>
            </div>
          </form>

          {/* Social Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-slate-100"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hoặc tiếp tục với</span>
            <div className="h-[1px] flex-1 bg-slate-100"></div>
          </div>
          
          <GoogleLoginButton className="rounded-2xl border-slate-100 hover:bg-slate-50 transition-all font-bold text-slate-700" />

          {/* Footer Card */}
          <div className="mt-10 text-center text-[13px] font-medium text-slate-500">
            Bạn chưa có tài khoản?{" "}
            <Link href="/register" className="font-black text-[#51A9FF] hover:text-[#133249] transition-colors underline underline-offset-4">
              Tạo tài khoản mới
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer variant="light" className="bg-white border-t border-slate-100" />
    </div>
  );
}
