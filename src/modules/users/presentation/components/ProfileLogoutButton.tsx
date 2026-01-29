"use client";

import { Button } from "@/shared/ui/components";

interface ProfileLogoutButtonProps {
  onLogout?: () => void;
}

export default function ProfileLogoutButton({
  onLogout,
}: ProfileLogoutButtonProps) {
  return (
    <Button
      onClick={onLogout}
      variant="danger"
      fullWidth
      className="py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/30"
    >
      <span className="text-xl">🚪</span>
      <span>Đăng xuất</span>
    </Button>
  );
}
