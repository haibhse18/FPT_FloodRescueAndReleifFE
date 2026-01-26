"use client";

import Link from "next/link";
import { useState } from "react";
import Input from "@/shared/ui/Input";
import PasswordInput from "@/shared/components/forms/PasswordInput";
import Button from "@/shared/ui/Button";
import GoogleLoginButton from "@/shared/components/forms/GoogleLoginButton";
import FormDivider from "@/shared/components/forms/FormDivider";
import { useRouter } from "next/dist/client/components/navigation";
import { authApi } from "@/modules/auth/infrastructure/auth.api";
import { loginSchema } from "@/shared/schemas/validation";

export default function LoginPage() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Validate input
            const validationResult = loginSchema.safeParse({ phoneNumber, password });
            if (!validationResult.success) {
                const firstError = validationResult.error.issues[0];
                setError(firstError.message);
                setLoading(false);
                return;
            }

            const response = await authApi.login({ phoneNumber, password });
            
            if (!response.accessToken) {
                throw new Error("Không nhận được token từ server");
            }

            // Token is now stored in repository layer
            // Redirect after successful login
            router.push("/citizen");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
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
