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
  const [authReady, setAuthReady] = useState(false);

  // Step 1: Try to restore auth session on mount
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      // If already authenticated (e.g. navigating between guarded pages), skip
      if (isAuthenticated) {
        if (!cancelled) setAuthReady(true);
        return;
      }

      // Try to restore session via refresh token
      try {
        await initAuth();
      } catch {
        // initAuth already handles clearAuth internally
      }

      if (!cancelled) setAuthReady(true);
    };

    restore();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Step 2: Once auth is ready and not loading, check access
  useEffect(() => {
    if (!authReady || loading) return;

    // Not authenticated after restore attempt → redirect to login
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Check role if required
    if (allowedRoles && allowedRoles.length > 0 && role) {
      if (!allowedRoles.includes(role)) {
        const roleRedirects: Record<string, string> = {
          Citizen: "/home",
          "Rescue Team": "/missions",
          "Rescue Coordinator": "/dashboard",
          Manager: "/manager-profile",
          Admin: "/admin-profile",
        };
        router.replace(roleRedirects[role] || "/");
      }
    }
  }, [
    authReady,
    loading,
    isAuthenticated,
    role,
    allowedRoles,
    router,
    pathname,
  ]);

  // Still restoring or loading
  if (!authReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--color-text-secondary)]">
            Đang kiểm tra đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Wrong role
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    role &&
    !allowedRoles.includes(role)
  ) {
    return null;
  }

  return <>{children}</>;
}
