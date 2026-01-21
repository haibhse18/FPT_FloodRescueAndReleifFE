"use client";

import Link from "next/link";
import { useState } from "react";
import Input from "@/app/components/ui/Input";
import PasswordInput from "@/app/components/forms/PasswordInput";
import Button from "@/app/components/ui/Button";
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
        <div className="min-h-screen bg-secondary flex items-center justify-center p-4 py-8">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        FPT Flood Rescue
                    </h1>
                    <p className="text-gray-300">Hệ thống cứu trợ lũ lụt</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-secondary mb-6 text-center">
                        Đăng Nhập
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            className="text-black text-sm"
                            id="phoneNumber"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            label="Phone Number"
                            placeholder="0123456789"
                            required
                        />

                        <PasswordInput
                            className="text-black text-sm" 
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
                            variant="primary"
                            fullWidth
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
                            className="text-primary hover:text-orange-600 font-semibold"
                        >
                            Đăng ký ngay
                        </Link>
                    </div>
                </div>

                <div className="text-center mt-8 text-gray-400 text-sm">
                    © 2026 FPT Flood Rescue and Relief
                </div>
            </div>
        </div>
    );
}

