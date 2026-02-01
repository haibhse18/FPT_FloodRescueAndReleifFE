"use client";

import Link from "next/link";
import { useState } from "react";
import Input from "@/shared/ui/Input";
import PasswordInput from "@/shared/components/forms/PasswordInput";
import Button from "@/shared/ui/Button";
import GoogleLoginButton from "@/shared/components/forms/GoogleLoginButton";
import FormDivider from "@/shared/components/forms/FormDivider";
import { useRouter } from "next/dist/client/components/navigation";
import { LoginUseCase } from "@/modules/auth/application/login.usecase";
import { GetCurrentUserUseCase } from "@/modules/auth/application/getCurrentUser.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";

// Initialize use cases with repository
const loginUseCase = new LoginUseCase(authRepository);
const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Basic validation
            if (!email || !password) {
                setError("Vui lòng nhập email và mật khẩu");
                setLoading(false);
                return;
            }

            // Use LoginUseCase instead of direct API call
            const response = await loginUseCase.execute({ email, password });

            if (!response.accessToken) {
                throw new Error("Không nhận được token từ server");
            }

            // Token is stored in repository layer
            // Get user info to determine redirect based on role
            try {
                const userData = await getCurrentUserUseCase.execute();

                // Redirect based on user role
                switch (userData.role) {
                    case 'coordinator':
                        router.push("/coordinator/dashboard");
                        break;
                    case 'rescue_team':
                        router.push("/team/missions");
                        break;
                    case 'manager':
                        router.push("/manager");
                        break;
                    case 'admin':
                        router.push("/admin");
                        break;
                    case 'citizen':
                    default:
                        router.push("/request");
                        break;
                }
            } catch (userError) {
                // If can't get user info, default to citizen request page
                console.error("Lỗi khi lấy thông tin user:", userError);
                router.push("/request");
            }
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
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            label="Email"
                            placeholder="example@email.com"
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
