"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/shared/ui/components/Input";
import { Button } from "@/shared/ui/components/Button";
import { useRouter } from "next/dist/client/components/navigation";
import { RegisterUseCase } from "@/modules/auth/application/register.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";
import { registerSchema } from "@/shared/schemas/validation";
import { Footer } from "@/shared/ui/components/Footer";

// Initialize use case with repository
const registerUseCase = new RegisterUseCase(authRepository);

export default function RegisterPage() {
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
            <main className="flex-1 flex items-center justify-center p-4 py-8 relative overflow-hidden bg-[#f0f7ff]">
                {/* Decorative elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full pointer-events-none opacity-20">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-[#51A9FF] rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#133249] rounded-full blur-[120px]"></div>
                </div>

                <div className="w-full max-w-[1100px] min-h-[700px] bg-white/70 backdrop-blur-2xl rounded-[3.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.08)] border border-white/50 flex overflow-hidden relative z-10">
                    
                    {/* Left Form Side */}
                    <div className="w-full lg:w-[48%] p-8 lg:p-14 flex flex-col justify-center">
                        <div className="mb-10 text-left">
                            <div className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black text-white bg-[#51A9FF] mb-6 shadow-md uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-white mr-2"></span>
                                Tham gia Đội Phản Ứng Nhanh
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-black text-[#133249] mb-4 tracking-tighter">Tạo Tài Khoản.</h1>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[400px]">
                                Đăng ký để cùng chúng tôi xây dựng mạng lưới cứu hộ thông minh và hiệu quả hơn.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-[#133249] uppercase tracking-[0.15em] ml-1">Tên đăng nhập</label>
                                    <Input
                                        id="userName"
                                        name="userName"
                                        type="text"
                                        value={formData.userName}
                                        onChange={handleChange}
                                        placeholder="username123"
                                        required
                                        className="rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white h-11"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-[#133249] uppercase tracking-[0.15em] ml-1">Tên hiển thị</label>
                                    <Input
                                        id="displayName"
                                        name="displayName"
                                        type="text"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        placeholder="Nguyễn Văn A"
                                        required
                                        className="rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white h-11"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-[#133249] uppercase tracking-[0.15em] ml-1">Email</label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="example@fpt.edu.vn"
                                        required
                                        className="rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white h-11"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-[#133249] uppercase tracking-[0.15em] ml-1">Số điện thoại</label>
                                    <Input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="09xx xxx xxx"
                                        className="rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white h-11"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-[#133249] uppercase tracking-[0.15em] ml-1">Mật khẩu</label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white h-11 tracking-widest"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-[#133249] uppercase tracking-[0.15em] ml-1">Xác nhận</label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white h-11 tracking-widest"
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-3 pt-2">
                                <div className="relative flex items-center h-5">
                                    <input 
                                        type="checkbox" 
                                        id="terms" 
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="w-4 h-4 rounded-md text-[#51A9FF] focus:ring-[#51A9FF] border-slate-300 transition-colors"
                                    />
                                </div>
                                <label htmlFor="terms" className="text-[11px] font-medium text-slate-500 leading-normal cursor-pointer">
                                    Tôi đồng ý với{" "}
                                    <Link href="/terms" className="text-[#51A9FF] font-black hover:text-[#133249] transition-colors mb-1">Điều khoản dịch vụ</Link>
                                    {" "}và{" "}
                                    <Link href="/privacy" className="text-[#51A9FF] font-black hover:text-[#133249] transition-colors">Chính sách bảo mật</Link>
                                </label>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                                    <p className="text-red-600 text-[12px] font-bold">{error}</p>
                                </div>
                            )}

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    fullWidth
                                    size="lg"
                                    className="rounded-2xl py-6 font-black uppercase tracking-[0.2em] !bg-[#51A9FF] hover:!bg-[#3a8ee6] !text-white shadow-[0_10px_25px_rgba(81,169,255,0.4)] border-none transition-all hover:scale-[1.02]"
                                >
                                    {loading ? "Đang xử lý..." : "TẠO TÀI KHOẢN"}
                                </Button>
                            </div>

                            <div className="text-center pt-4">
                                <span className="text-[13px] font-medium text-slate-500">Bạn đã có tài khoản? </span>
                                <Link href="/login" className="text-[13px] font-black text-[#51A9FF] hover:text-[#133249] transition-colors underline underline-offset-4">
                                    Đăng nhập ngay
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* Right Image Side */}
                    <div className="hidden lg:block w-[52%] relative bg-[#133249] p-16 flex flex-col justify-end overflow-hidden">
                        <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://images2.thanhnien.vn/528068263637045248/2025/4/1/dsc4197-1743491750006190081890.jpg')] bg-cover bg-center transition-transform duration-[10000ms] hover:scale-110"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#133249] via-[#133249]/40 to-transparent"></div>

                        {/* Bottom Text Area */}
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-[3px] bg-[#51A9FF]"></div>
                                <span className="text-white text-[10px] font-black tracking-[0.3em] uppercase">Sứ mệnh cộng đồng</span>
                            </div>
                            <h2 className="text-white text-[3rem] font-black leading-[1.1] mb-12 tracking-tighter italic">
                                "Không một ai bị bỏ lại phía sau."
                            </h2>
                            <div className="grid grid-cols-2 gap-10">
                                <div className="group">
                                    <div className="text-[#51A9FF] text-4xl font-black mb-1 group-hover:scale-110 transition-transform origin-left">50k+</div>
                                    <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Hộ dân được bảo vệ</div>
                                </div>
                                <div className="group">
                                    <div className="text-[#51A9FF] text-4xl font-black mb-1 group-hover:scale-110 transition-transform origin-left">1.2k</div>
                                    <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Tình nguyện viên trực chiến</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer variant="light" className="bg-white border-t border-slate-100" />
        </div>
    );       
}
