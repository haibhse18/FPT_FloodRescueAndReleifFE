"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuth.store";

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

/**
 * AuthGuard Component - Client-side authentication protection
 * 
 * Bọc các protected pages để kiểm tra:
 * 1. User đã đăng nhập chưa
 * 2. User có quyền truy cập không (nếu có allowedRoles)
 * 
 * Nếu chưa đăng nhập → redirect về /login
 * Nếu không có quyền → redirect về trang phù hợp với role
 */
export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user, role, loading, initAuth } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            // Only run once on mount, avoid re-running on every state change
            if (hasInitialized) return;
            
            // Nếu chưa authenticated, thử init auth (refresh token)
            if (!isAuthenticated && !loading) {
                await initAuth();
            }
            setIsChecking(false);
            setHasInitialized(true);
        };

        checkAuth();
    }, []);  // Empty deps - only run once on mount

    useEffect(() => {
        // Đợi check xong
        if (isChecking || loading) return;

        // Chưa đăng nhập → redirect login
        if (!isAuthenticated) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }

        // Kiểm tra role nếu có yêu cầu
        if (allowedRoles && allowedRoles.length > 0 && role) {
            if (!allowedRoles.includes(role)) {
                // Redirect về trang mặc định theo role
                const roleRedirects: Record<string, string> = {
                    'Citizen': '/citizen',
                    'Rescue Team': '/team/missions',
                    'Rescue Coordinator': '/coordinator/dashboard',
                    'Manager': '/manager',
                    'Admin': '/admin/users',
                };
                router.replace(roleRedirects[role] || '/');
            }
        }
    }, [isChecking, loading, isAuthenticated, role, allowedRoles, router, pathname]);

    // Đang kiểm tra auth
    if (isChecking || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[var(--color-text-secondary)]">Đang kiểm tra đăng nhập...</p>
                </div>
            </div>
        );
    }

    // Chưa authenticated
    if (!isAuthenticated) {
        return null;
    }

    // Không có quyền
    if (allowedRoles && allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
        return null;
    }

    return <>{children}</>;
}
