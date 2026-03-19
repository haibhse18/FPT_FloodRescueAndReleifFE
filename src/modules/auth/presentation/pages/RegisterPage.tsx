"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/shared/ui/components/Input";
import { Button } from "@/shared/ui/components/Button";
import { Alert } from "@/shared/ui/components/Alert";
import { Checkbox } from "@/shared/ui/components/Checkbox";
import { Shield } from "lucide-react";
import PasswordInput from "@/shared/components/forms/PasswordInput";
import GoogleLoginButton from "@/shared/components/forms/GoogleLoginButton";
import FormDivider from "@/shared/components/forms/FormDivider";
import { useRouter } from "next/dist/client/components/navigation";
import { RegisterUseCase } from "@/modules/auth/application/register.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";
import { registerSchema } from "@/shared/schemas/validation";

// Initialize use case with repository
const registerUseCase = new RegisterUseCase(authRepository);

export default function RegisterPage() {
    // --- DO NOT TOUCH LOGIC ---
    const [formData, setFormData] = useState({
        userName: "",
        displayName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
    });
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!agreedToTerms) {
            setError("Vui lòng đồng ý với điều khoản dịch vụ");
            return;
        }

        setLoading(true);

        try {
            // Validate input using Zod
            const validationResult = registerSchema.safeParse({
                userName: formData.userName,
                displayName: formData.displayName,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                phoneNumber: formData.phoneNumber || undefined,
            });

            if (!validationResult.success) {
                const firstError = validationResult.error.issues[0];
                setError(firstError.message);
                setLoading(false);
                return;
            }

            // Use RegisterUseCase instead of direct API call
            await registerUseCase.execute({
                userName: formData.userName,
                displayName: formData.displayName,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber || undefined,
            }, formData.confirmPassword);

            // Redirect to login after successful registration
            router.push("/login");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    };
    // --- END LOGIC ---

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-12 relative bg-background text-slate-900 font-sans selection:bg-primary/20">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0 fixed">
                <img 
                  src="https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=2000" 
                  alt="Rescue background" 
                  className="w-full h-full object-cover opacity-50 mix-blend-luminosity grayscale" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-50/80 via-white/40 to-slate-50"></div>
                {/* Subtle trust glow */}
                <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
            </div>

            <div className="w-full max-w-xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Logo & Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 font-bold text-3xl tracking-tight transition-transform hover:scale-105 mb-4 group">
                        <div className="bg-primary p-2.5 rounded-sm shadow-md transition-shadow">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-primary hover:no-underline">FloodRescue</span>
                    </div>
                    <p className="text-slate-500 font-light tracking-wide uppercase text-sm">Đăng kí để tham gia cùng chúng tôi</p>
                </div>

                {/* Glassmorphism Register Card */}
                <div className="bg-white/90 backdrop-blur-xl border border-primary/10 rounded-lg p-8 shadow-xl shadow-slate-200/50">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                            Tạo Hồ Sơ Mới
                        </h2>
                        <p className="text-slate-500 mt-2 text-sm font-light">
                            Gia nhập mạng lưới cứu trợ an toàn
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 text-left">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Username Input */}
                            <Input
                                id="userName"
                                name="userName"
                                type="text"
                                value={formData.userName}
                                onChange={handleChange}
                                label="Tên đăng nhập"
                                placeholder="nguyenvana"
                                required
                                className="bg-slate-50 border-slate-200 focus:border-primary/50 text-slate-900 placeholder:text-slate-300 rounded-sm"
                            />

                            {/* Display Name Input */}
                            <Input
                                id="displayName"
                                name="displayName"
                                type="text"
                                value={formData.displayName}
                                onChange={handleChange}
                                label="Tên hiển thị"
                                placeholder="Nguyễn Văn A"
                                required
                                className="bg-slate-50 border-slate-200 focus:border-primary/50 text-slate-900 placeholder:text-slate-300 rounded-sm"
                            />
                        </div>

                        {/* Email Input */}
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            label="Email"
                            placeholder="example@email.com"
                            required
                            className="bg-slate-50 border-slate-200 focus:border-primary/50 text-slate-900 placeholder:text-slate-300 rounded-sm"
                        />

                        {/* Phone Input (Optional) */}
                        <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            label="Số điện thoại (không bắt buộc)"
                            placeholder="0123456789"
                            className="bg-slate-50 border-slate-200 focus:border-primary/50 text-slate-900 placeholder:text-slate-300 rounded-sm"
                        />

                        {/* Password fields in grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <PasswordInput
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                label="Mật khẩu"
                                required
                            />
                            <PasswordInput
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                label="Xác nhận"
                                placeholder="Nhập lại"
                                required
                            />
                        </div>

                        {/* Password requirements hint */}
                        <p className="text-xs text-zinc-500 italic mt-1 font-light">
                            * Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.
                        </p>

                        {/* Terms and Conditions */}
                        <div className="p-4 bg-blue-100/30 border border-primary/10 rounded-sm mt-2">
                            <Checkbox
                                id="terms"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="w-full"
                            >
                                <span className="text-sm text-zinc-400 leading-relaxed cursor-pointer select-none">
                                    Tôi đã đọc và cam kết tuân thủ đầy đủ{" "}
                                    <Link
                                        href="/terms"
                                        className="text-primary hover:underline font-medium underline-offset-4 decoration-primary/30"
                                    >
                                        Quy định an toàn
                                    </Link>{" "}
                                    và{" "}
                                    <Link
                                        href="/privacy"
                                        className="text-primary hover:underline font-medium underline-offset-4 decoration-primary/30"
                                    >
                                        Chính sách bảo mật
                                    </Link>
                                    {" "}của nền tảng.
                                </span>
                            </Checkbox>
                        </div>

                        {error && (
                            <Alert variant="error" className="bg-red-950/50 border-red-500/50 text-red-200">
                                {error}
                            </Alert>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={loading}
                            disabled={loading}
                            className="bg-primary text-white border-none hover:bg-primary/90 rounded-sm font-bold uppercase tracking-widest text-sm shadow-lg shadow-primary/20 transition-all duration-300 active:scale-[0.98] mt-4"
                        >
                            {loading ? "Đang xử lý hồ sơ..." : "Đăng kí"}
                        </Button>
                    </form>

                    <div className="mt-6 mb-6">
                        {/* <FormDivider text="HOẶC" /> */}
                    </div>
                    
                    <div className="hover:scale-[1.01] transition-transform">
                        <GoogleLoginButton />
                    </div>

                    {/* Login Link */}
                    <div className="text-center mt-8 pt-6 border-t border-white/10">
                        <span className="text-zinc-500 text-sm">Đã có tài khoản? </span>
                        <Link
                            href="/login"
                            className="text-primary hover:text-primary/80 font-bold transition-colors text-sm uppercase tracking-wide"
                        >
                            Đăng nhâp ngay
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 space-y-3 pb-8">
                    <div className="flex items-center justify-center gap-6 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                        <Link href="/terms" className="hover:text-primary transition-colors">Điều khoản</Link>
                        <Link href="/privacy" className="hover:text-primary transition-colors">Bảo mật</Link>
                        <Link href="/help" className="hover:text-primary transition-colors">Trợ giúp</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
