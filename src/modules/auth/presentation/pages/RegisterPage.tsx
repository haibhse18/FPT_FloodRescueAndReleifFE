"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/shared/ui/components/Input";
import { Button } from "@/shared/ui/components/Button";
import { Card } from "@/shared/ui/components/Card";
import { Alert } from "@/shared/ui/components/Alert";
import { useRouter } from "next/dist/client/components/navigation";
import { RegisterUseCase } from "@/modules/auth/application/register.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";
import { registerSchema } from "@/shared/schemas/validation";
import { MapPin } from "lucide-react";
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
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* HEADER */}
            <header className="w-full bg-slate-50 flex items-center h-[72px] px-6 lg:px-10">
                <div className="flex-1 flex items-center text-blue-800 font-bold text-lg">
                    <span className="text-[#0b4d96]">FPT Flood Rescue & Relief</span>
                </div>
                <nav className="hidden md:flex flex-1 justify-center items-center gap-10 text-sm text-slate-600">
                    <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
                    <Link href="/" className="hover:text-blue-600">Hoạt động</Link>
                    <Link href="/" className="hover:text-blue-600">Ủng hộ</Link>
                    <Link href="/" className="hover:text-blue-600">Liên hệ</Link>
                </nav>
                <div className="flex-1 flex justify-end items-center gap-6">
                    <Link href="/register" className="bg-[#0b4d96] hover:bg-blue-800 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-all shadow-sm">
                        Đăng ký 
                    </Link>
                    <Link href="/login" className="hidden sm:block text-sm font-medium text-[#0b4d96] hover:text-blue-800 border-b border-transparent hover:border-blue-800">
                        Đăng nhập
                    </Link>
                </div>
            </header>

            {/* Main Content Box */}
            <main className="flex-1 flex items-center justify-center p-4 py-8">
                <div className="w-full max-w-[1050px] h-[650px] bg-white rounded-xl shadow-lg border border-slate-100 flex overflow-hidden">
                    
                    {/* Left Form Side */}
                    <div className="w-full lg:w-[45%] p-8 lg:p-12 flex flex-col justify-center">
                        <div className="mb-8">
                            <p className="text-[#0b4d96] text-[10px] font-bold tracking-[0.15em] uppercase mb-2">Tham gia cùng chúng tôi</p>
                            <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Tạo Tài Khoản</h1>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Đăng ký để cập nhật thông tin cứu trợ và tham gia các hoạt động tình nguyện nhanh nhất.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Tên đăng nhập</label>
                                    <input
                                        id="userName"
                                        name="userName"
                                        type="text"
                                        value={formData.userName}
                                        onChange={handleChange}
                                        placeholder="username123"
                                        className="w-full bg-slate-100 rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Tên hiển thị</label>
                                    <input
                                        id="displayName"
                                        name="displayName"
                                        type="text"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        placeholder="Nguyễn Văn A"
                                        className="w-full bg-slate-100 rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@fpt.edu.vn"
                                    className="w-full bg-slate-100 rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Số điện thoại</label>
                                <input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="09xx xxx xxx"
                                    className="w-full bg-slate-100 rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Mật khẩu</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-100 rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 text-sm tracking-widest transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Xác nhận</label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-100 rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 text-sm tracking-widest transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-2 pt-2">
                                <input 
                                    type="checkbox" 
                                    id="terms" 
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="mt-0.5 w-3.5 h-3.5 rounded text-[#0b4d96] focus:ring-[#0b4d96] border-slate-300"
                                />
                                <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer">
                                    Tôi đồng ý với{" "}
                                    <Link href="/terms" className="text-[#0b4d96] font-semibold hover:underline">Điều khoản dịch vụ</Link>
                                    {" "}và{" "}
                                    <Link href="/privacy" className="text-[#0b4d96] font-semibold hover:underline">Chính sách bảo mật</Link>
                                </label>
                            </div>

                            {error && (
                                <p className="text-red-500 text-xs mt-1">{error}</p>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#0b4d96] hover:bg-blue-800 text-white text-sm font-semibold py-3 rounded-lg transition-colors shadow-md"
                                >
                                    {loading ? "Đang xử lý..." : "TẠO TÀI KHOẢN"}
                                </button>
                            </div>

                            <div className="text-center pt-3">
                                <span className="text-xs text-slate-500">Bạn đã có tài khoản? </span>
                                <Link href="/login" className="text-xs font-semibold text-[#0b4d96] hover:underline">Đăng nhập ngay</Link>
                            </div>
                        </form>
                    </div>

                    {/* Right Image Side */}
                    <div className="hidden lg:block w-[55%] relative bg-[#06336e]">
                        <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://images2.thanhnien.vn/528068263637045248/2025/4/1/dsc4197-1743491750006190081890.jpg')] bg-cover bg-center"></div>
                        <div className="absolute inset-0 bg-blue-900/30"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#021d42] via-transparent to-transparent"></div>

                        {/* Bottom Text Area */}
                        <div className="absolute bottom-12 left-12 right-12 z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-8 h-[2px] bg-white"></div>
                                <span className="text-white text-[11px] font-bold tracking-[0.2em] uppercase">Sứ mệnh cộng đồng</span>
                            </div>
                            <h2 className="text-white text-[2.5rem] font-bold leading-tight mb-10">
                                "Không một ai bị bỏ lại phía sau trong thiên tai."
                            </h2>
                            <div className="flex gap-14">
                                <div>
                                    <div className="text-white text-3xl font-bold mb-1">50k+</div>
                                    <div className="text-white/80 text-[10px] font-medium uppercase tracking-widest">Hộ gia đình được hỗ trợ</div>
                                </div>
                                <div>
                                    <div className="text-white text-3xl font-bold mb-1">1.2k</div>
                                    <div className="text-white/80 text-[10px] font-medium uppercase tracking-widest">Tình nguyện viên</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full bg-transparent py-4 px-6 lg:px-10 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
                <div className="mb-4 sm:mb-0 flex items-center gap-2">
                    <span className="font-bold text-[#0b4d96] text-sm">FPT Flood Rescue & Relief</span>
                    <span className="text-slate-400">© 2024 FPT Flood Rescue & Relief. All rights reserved.</span>
                </div>
                <div className="flex gap-6">
                    <Link href="#" className="hover:text-slate-800 transition-colors">Chính sách bảo mật</Link>
                    <Link href="#" className="hover:text-slate-800 transition-colors">Điều khoản sử dụng</Link>
                    <Link href="#" className="hover:text-slate-800 transition-colors">Liên hệ cứu trợ</Link>
                </div>
            </footer>
        </div>
    );       
}
