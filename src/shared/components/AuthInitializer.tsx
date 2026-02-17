"use client";

import { useAuthInit } from "@/shared/hooks/useAuthInit";

/**
 * AuthInitializer Component
 *
 * Component này được sử dụng để khởi tạo auth state (refresh token)
 * ngay khi ứng dụng được load, trước khi render bất kỳ nội dung nào khác.
 *
 * Nó không render giao diện (return null), chỉ thực thi logic side-effect.
 */
export default function AuthInitializer() {
  useAuthInit();
  return null;
}
