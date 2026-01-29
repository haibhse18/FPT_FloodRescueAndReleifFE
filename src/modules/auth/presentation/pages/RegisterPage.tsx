"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/shared/ui/components/Input";
import { Button } from "@/shared/ui/components/Button";
import { Card } from "@/shared/ui/components/Card";
import { Alert } from "@/shared/ui/components/Alert";
import { Checkbox } from "@/shared/ui/components/Checkbox";
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
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
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

            // Use RegisterUseCase instead of direct API call
            await registerUseCase.execute({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phone,
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
        <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-dark)] to-[var(--color-teal-dark)] flex items-center justify-center p-4 py-8">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-[var(--color-accent)]/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-[var(--color-teal-light)]/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo & Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-accent)] mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-inverse)] mb-1">
                        FPT Flood Rescue
                    </h1>
                    <p className="text-[var(--color-teal-light)]">Hệ thống cứu trợ lũ lụt</p>
                </div>

                {/* Register Card */}
                <Card variant="default" padding="lg" className="shadow-2xl backdrop-blur-sm">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-[var(--color-primary)]">
                            Tạo tài khoản mới
                        </h2>
                        <p className="text-[var(--color-text-muted)] mt-1 text-sm">
                            Đăng ký để tham gia hệ thống cứu trợ
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
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

                        {/* Password fields in grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <p className="text-xs text-[var(--color-text-muted)] -mt-2">
                            Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
                        </p>

                        {/* Terms and Conditions */}
                        <div className="flex items-start gap-3 p-3 bg-[var(--color-surface)] rounded-lg">
                            <Checkbox
                                id="terms"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                            />
                            <label htmlFor="terms" className="text-sm text-[var(--color-text-secondary)] leading-relaxed cursor-pointer">
                                Tôi đồng ý với{" "}
                                <Link
                                    href="/terms"
                                    className="text-[var(--color-accent)] hover:text-[var(--color-accent-dark)] font-medium"
                                >
                                    Điều khoản dịch vụ
                                </Link>{" "}
                                và{" "}
                                <Link
                                    href="/privacy"
                                    className="text-[var(--color-accent)] hover:text-[var(--color-accent-dark)] font-medium"
                                >
                                    Chính sách bảo mật
                                </Link>
                            </label>
                        </div>

                        {error && (
                            <Alert variant="error">
                                {error}
                            </Alert>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            size="lg"
                            isLoading={loading}
                            disabled={loading}
                        >
                            {loading ? "Đang đăng ký..." : "Tạo Tài Khoản"}
                        </Button>
                    </form>

                    <FormDivider text="hoặc đăng ký với" />
                    <GoogleLoginButton />

                    {/* Login Link */}
                    <div className="text-center mt-6 pt-6 border-t border-[var(--color-border)]">
                        <span className="text-[var(--color-text-secondary)]">Đã có tài khoản? </span>
                        <Link
                            href="/login"
                            className="text-[var(--color-accent)] hover:text-[var(--color-accent-dark)] font-semibold transition-colors"
                        >
                            Đăng nhập ngay
                        </Link>
                    </div>
                </Card>

                {/* Footer */}
                <div className="text-center mt-6 space-y-2">
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
