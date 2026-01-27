"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/app/components/forms/PasswordInput";
import GoogleLoginButton from "@/app/components/forms/GoogleLoginButton";
import FormDivider from "@/app/components/forms/FormDivider";
import { useRouter } from "next/dist/client/components/navigation";

export default function LoginPage() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [error, setError] = useState("");
    //fetch api
    const API_LOGIN = "http://localhost:8080/api/auth/login";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(API_LOGIN, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phoneNumber, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Đăng nhập thất bại");
            }

            // Ví dụ lưu token
            localStorage.setItem("accessToken", data.accessToken);

            // Redirect sau login
            router.push("/citizen");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-8" style={{ background: '#133249' }}>
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block mb-4">
                        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg" style={{ background: 'linear-gradient(135deg, #ff7700 0%, #ff5500 100%)' }}>
                            🛟
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        FPT Flood Rescue
                    </h1>
                    <p className="font-medium" style={{ color: 'rgba(255, 119, 0, 0.8)' }}>Hệ thống cứu trợ lũ lụt</p>
                </div>

                {/* Form */}
                <div className="rounded-2xl shadow-2xl p-8" style={{ background: 'rgba(255, 255, 255, 0.95)', border: '2px solid rgba(255, 119, 0, 0.2)' }}>
                    <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#ff7700' }}>
                        Đăng Nhập
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber" className="text-gray-700">
                                Số điện thoại
                            </Label>
                            <Input
                                id="phoneNumber"
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="0123456789"
                                required
                            />
                        </div>

                        <PasswordInput
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            label="Mật khẩu"
                            required
                        />

                        {error && (
                            <p className="text-red-500 text-sm text-center">
                                {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
                        </Button>
                    </form>

                    <FormDivider />
                    <GoogleLoginButton />

                    <div className="text-center mt-6">
                        <span className="text-gray-600">Chưa có tài khoản? </span>
                        <Link
                            href="/register"
                            className="font-semibold transition-colors"
                            style={{ color: '#ff7700' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ff5500'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#ff7700'}
                        >
                            Đăng ký ngay
                        </Link>
                    </div>
                </div>

                <div className="text-center mt-8 text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    © 2026 FPT Flood Rescue and Relief
                </div>
            </div>
        </div>
    );
}

