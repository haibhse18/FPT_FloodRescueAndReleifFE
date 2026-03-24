"use client";

interface ProfileLogoutButtonProps {
  onLogout?: () => void;
  isLoading?: boolean;
}

export default function ProfileLogoutButton({
  onLogout,
  isLoading = false,
}: ProfileLogoutButtonProps) {
  return (
    <button
      onClick={onLogout}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/15 hover:bg-red-500/25 border border-red-400/35 text-red-200 font-bold rounded-full transition-all disabled:opacity-60 shadow-sm"
    >
      {isLoading ? (
        <>
          <span className="inline-block w-5 h-5 border-2 border-red-200/30 border-t-red-200 rounded-full animate-spin" />
          <span>Đang đăng xuất...</span>
        </>
      ) : (
        <>
          <span className="text-xl">🚪</span>
          <span>Đăng xuất</span>
        </>
      )}
    </button>
  );
}
