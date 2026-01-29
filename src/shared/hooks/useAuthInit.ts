/**
 * useAuthInit Hook
 * 
 * Hook này dùng để khởi tạo auth state khi app load.
 * Theo auth-flow.md: Khi reload page, access token mất (chỉ lưu trong memory),
 * cần gọi /auth/refresh để lấy token mới từ refresh token cookie.
 * 
 * Sử dụng trong layout hoặc _app component:
 * 
 * ```tsx
 * import { useAuthInit } from '@/shared/hooks/useAuthInit';
 * 
 * export default function RootLayout({ children }) {
 *   useAuthInit();
 *   return <>{children}</>;
 * }
 * ```
 */

'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuth.store';

export function useAuthInit() {
    const initAuth = useAuthStore((state) => state.initAuth);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const loading = useAuthStore((state) => state.loading);
    const initialized = useRef(false);

    useEffect(() => {
        // Chỉ init một lần khi app load
        if (!initialized.current && !isAuthenticated && !loading) {
            initialized.current = true;
            initAuth();
        }
    }, [initAuth, isAuthenticated, loading]);

    return { loading, isAuthenticated };
}
