"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/shared/ui/components/Input";
import { Button } from "@/shared/ui/components/Button";
import { Card } from "@/shared/ui/components/Card";
import { Alert } from "@/shared/ui/components/Alert";
import PasswordInput from "@/shared/components/forms/PasswordInput";
import GoogleLoginButton from "@/shared/components/forms/GoogleLoginButton";
import FormDivider from "@/shared/components/forms/FormDivider";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuth.store";
import { loginSchema } from "@/shared/schemas/validation";

export default function LoginPage() {
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
                'Citizen': '/citizen',
                'Rescue Team': '/team/missions',
                'Rescue Coordinator': '/coordinator/requests',
                'Manager': '/manager',
                'Admin': '/admin/users',
            };

            const redirectPath = currentUser?.role ? redirectMap[currentUser.role] : '/';
            router.push(redirectPath);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-dark)] to-[var(--color-teal-dark)] flex items-center justify-center p-4 py-8">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--color-accent)]/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--color-teal-light)]/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo & Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--color-accent)] mb-6 shadow-lg">
                        <svg className="w-10 h-10 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-inverse)] mb-2">
                        FPT Flood Rescue
                    </h1>
                    <p className="text-[var(--color-teal-light)] text-lg">Hệ thống cứu trợ lũ lụt</p>
                </div>

                {/* Login Card */}
                <Card variant="default" padding="lg" className="shadow-2xl backdrop-blur-sm">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-primary)]">
                            Chào mừng trở lại
                        </h2>
                        <p className="text-[var(--color-text-muted)] mt-2">
                            Đăng nhập để tiếp tục
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            label="Email"
                            placeholder="example@email.com"
                            required
                        />

                        <div>
                            <PasswordInput
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                label="Mật khẩu"
                                required
                            />
                            <div className="text-right mt-2">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-dark)] font-medium transition-colors"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>
                        </div>

                        {error && (
                            <Alert variant="error">
                                {error}
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            size="lg"
                            isLoading={loading}
                            disabled={loading}
                        >
                            {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
                        </Button>
                    </form>

                    <FormDivider text="hoặc tiếp tục với" />
                    <GoogleLoginButton />

                    <div className="text-center mt-8 pt-6 border-t border-[var(--color-border)]">
                        <span className="text-[var(--color-text-secondary)]">Chưa có tài khoản? </span>
                        <Link
                            href="/register"
                            className="text-[var(--color-accent)] hover:text-[var(--color-accent-dark)] font-semibold transition-colors"
                        >
                            Đăng ký ngay
                        </Link>
                    </div>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8 space-y-2">
                    <div className="flex items-center justify-center gap-4 text-[var(--color-teal-light)] text-sm">
                        <Link href="/terms" className="hover:text-[var(--color-text-inverse)] transition-colors">
                            Điều khoản
                        </Link>
                        <span>•</span>
                        <Link href="/privacy" className="hover:text-[var(--color-text-inverse)] transition-colors">
                            Bảo mật
                        </Link>
                        <span>•</span>
                        <Link href="/help" className="hover:text-[var(--color-text-inverse)] transition-colors">
                            Trợ giúp
                        </Link>
                    </div>
                    <p className="text-[var(--color-teal-light)]/70 text-sm">
                        © 2026 FPT Flood Rescue and Relief
                    </p>
                </div>
            </div>
        </div>
    );
}
