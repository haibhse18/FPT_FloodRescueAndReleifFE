"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/shared/ui/components/Input";
import { Button } from "@/shared/ui/components/Button";
import { Alert } from "@/shared/ui/components/Alert";
import { Shield } from "lucide-react";
import PasswordInput from "@/shared/components/forms/PasswordInput";
import GoogleLoginButton from "@/shared/components/forms/GoogleLoginButton";
import FormDivider from "@/shared/components/forms/FormDivider";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuth.store";
import { loginSchema } from "@/shared/schemas/validation";

export default function LoginPage() {
  // --- DO NOT TOUCH LOGIC ---
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
        "Admin": "/admin-dashboard",
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
  // --- END LOGIC ---

  return (
    <div className="dark min-h-screen flex items-center justify-center p-4 relative bg-black text-foreground selection:bg-red-500/30 font-sans">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=2000" 
          alt="Rescue background" 
          className="w-full h-full object-cover opacity-50 mix-blend-luminosity grayscale" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/80 to-black/60"></div>
        {/* Subtle emergency red glow */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-red-900/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 font-bold text-3xl tracking-tight transition-transform hover:scale-105 mb-4 group text-white">
             <div className="bg-red-600 p-2.5 rounded-sm shadow-[0_0_20px_rgba(220,38,38,0.5)] group-hover:shadow-[0_0_30px_rgba(220,38,38,0.7)] transition-shadow">
                <Shield className="w-7 h-7 text-white" />
             </div>
             <span>FloodRescue</span>
          </Link>
          <p className="text-zinc-400 font-light tracking-wide uppercase text-sm">
            Nền tảng Điều phối Khẩn cấp
          </p>
        </div>

        {/* Glassmorphism Login Card */}
        <div className="bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-sm p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">
              Đăng Nhập
            </h2>
            <p className="text-zinc-400 mt-2 text-sm font-light">
              Truy cập trung tâm chỉ huy cứu trợ
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label="Email"
                placeholder="example@email.com"
                required
                className="bg-black/50 border-white/10 focus:border-red-500/50 text-white placeholder:text-zinc-600 rounded-sm"
              />
            </div>

            <div className="space-y-2 text-left">
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="Mật khẩu"
                required
                // Note: assuming PasswordInput passes className down or handles it internally using standard Shadcn dark mode if inside .dark
              />
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-zinc-400 hover:text-white font-medium transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            {error && <Alert variant="error" className="bg-red-950/50 border-red-500/50 text-red-200">{error}</Alert>}

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={loading}
              disabled={loading}
              className="bg-white text-black hover:bg-gray-200 rounded-sm font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
            >
              {loading ? "Đang xử lý..." : "Truy Cập Hệ Thống"}
            </Button>
          </form>

          <div className="mt-6 mb-6">
            <FormDivider text="HOẶC ĐĂNG NHẬP VỚI" />
          </div>
          
          <div className="hover:scale-[1.02] transition-transform">
             <GoogleLoginButton />
          </div>

          <div className="text-center mt-8 pt-6 border-t border-white/10">
            <span className="text-zinc-500 text-sm">
              Lực lượng mới?{" "}
            </span>
            <Link
              href="/register"
              className="text-white hover:text-red-400 font-bold transition-colors text-sm uppercase tracking-wide"
            >
              Ghi danh ngay
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-8 space-y-3">
          <div className="flex items-center justify-center gap-6 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            <Link href="#" className="hover:text-white transition-colors">Điều khoản</Link>
            <Link href="#" className="hover:text-white transition-colors">Bảo mật</Link>
            <Link href="#" className="hover:text-white transition-colors">Trợ giúp</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
