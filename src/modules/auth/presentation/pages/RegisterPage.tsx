"use client";

import Link from "next/link";
import { useState } from "react";
import Input from "@/shared/ui/Input";
import PasswordInput from "@/shared/components/forms/PasswordInput";
import Button from "@/shared/ui/Button";
import { useRouter } from "next/dist/client/components/navigation";
import { authApi } from "@/modules/auth/infrastructure/auth.api";
import { registerSchema } from "@/shared/schemas/validation";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
    });
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

        setLoading(true);

        try {
            // Validate input using Zod
            const validationResult = registerSchema.safeParse({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                phoneNumber: formData.phone,
            });

            if (!validationResult.success) {
                const firstError = validationResult.error.issues[0];
                setError(firstError.message);
                setLoading(false);
                return;
            }

            const response = await authApi.register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phone,
            });

            // Token is now stored in repository layer
            // Redirect to login after successful registration
            router.push("/login");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center p-4 py-8">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        FPT Flood Rescue
                    </h1>
                    <p className="text-gray-300">Hệ thống cứu trợ lũ lụt</p>
                </div>

                {/* Register Form */}
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-secondary mb-6 text-center">
                        Đăng Ký Tài Khoản
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name Input */}
                        <Input
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={handleChange}
                            label="Họ và tên"
                            placeholder="Nguyễn Văn A"
                            required
                        />

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
                        />

                        {/* Phone Input */}
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            label="Số điện thoại"
                            placeholder="0123456789"
                            required
                        />

                        {/* Password Input */}
                        <PasswordInput
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            label="Mật khẩu"
                            required
                        />

                        {/* Confirm Password Input */}
                        <PasswordInput
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            label="Xác nhận mật khẩu"
                            required
                        />

                        {/* Terms and Conditions */}
                        <div className="flex items-start">
                            <input
                                id="terms"
                                type="checkbox"
                                required
                                className="w-4 h-4 mt-1 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                                Tôi đồng ý với{" "}
                                <Link
                                    href="/terms"
                                    className="text-primary hover:text-orange-600 font-medium"
                                >
                                    Điều khoản dịch vụ
                                </Link>{" "}
                                và{" "}
                                <Link
                                    href="/privacy"
                                    className="text-primary hover:text-orange-600 font-medium"
                                >
                                    Chính sách bảo mật
                                </Link>
                            </label>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm text-center">
                                {error}
                            </p>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? "Đang đăng ký..." : "Đăng Ký"}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Hoặc</span>
                        </div>
                    </div>

                    {/* Google Login Button */}
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition duration-200 shadow-sm hover:shadow-md"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Đăng ký bằng Google
                    </button>

                    {/* Login Link */}
                    <div className="text-center mt-6">
                        <span className="text-gray-600">Đã có tài khoản? </span>
                        <Link
                            href="/login"
                            className="text-primary hover:text-orange-600 font-semibold"
                        >
                            Đăng nhập ngay
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-400 text-sm">
                    © 2026 FPT Flood Rescue and Relief
                </div>
            </div>
        </div>
    );
}
