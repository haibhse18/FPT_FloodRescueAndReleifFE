"use client";

import Link from "next/link";
import { useState } from "react";
import Input from "@/app/components/ui/Input";
import PasswordInput from "@/app/components/forms/PasswordInput";
import Button from "@/app/components/ui/Button";
import GoogleLoginButton from "@/app/components/forms/GoogleLoginButton";
import FormDivider from "@/app/components/forms/FormDivider";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement login logic
        console.log("Login:", { email, password });
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

                {/* Login Form */}
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-secondary mb-6 text-center">
                        Đăng Nhập
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            label="Email"
                            placeholder="example@email.com"
                            required
                        />

                        {/* Password Input */}
                        <PasswordInput
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            label="Mật khẩu"
                            required
                        />

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="ml-2 text-gray-600">Ghi nhớ đăng nhập</span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-primary hover:text-orange-600 font-medium"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" variant="primary" fullWidth>
                            Đăng Nhập
                        </Button>
                    </form>

                    {/* Divider */}
                    <FormDivider />

                    {/* Google Login Button */}
                    <GoogleLoginButton />

                    {/* Register Link */}
                    <div className="text-center mt-6">
                        <span className="text-gray-600">Chưa có tài khoản? </span>
                        <Link
                            href="/register"
                            className="text-primary hover:text-orange-600 font-semibold"
                        >
                            Đăng ký ngay
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
