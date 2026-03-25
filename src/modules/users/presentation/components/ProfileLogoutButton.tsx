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
      className="w-full flex items-center justify-center gap-3 py-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded-full transition-all disabled:opacity-60 shadow-sm"
    >
      {isLoading ? (
        <>
          <span className="inline-block w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
          <span>Đang đăng xuất...</span>
        </>
      ) : (
        <>
          <span>Đăng xuất</span>
        </>
      )}
    </button>
  );
}
