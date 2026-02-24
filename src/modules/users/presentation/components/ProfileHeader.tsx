"use client";

interface ProfileHeaderProps {
  name: string;
  phone: string;
  email: string;
  isLoading?: boolean;
  isEditMode: boolean;
  onEditToggle: () => void;
}

export default function ProfileHeader({
  name,
  phone,
  email,
  isLoading = false,
  isEditMode,
  onEditToggle,
}: ProfileHeaderProps) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 lg:p-8">
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-[#FF7700]/20 border-2 border-[#FF7700]/40 flex items-center justify-center">
            {isLoading ? (
              <span className="w-full h-full rounded-full bg-white/10 animate-pulse block" />
            ) : (
              <span className="text-4xl lg:text-5xl font-black text-[#FF7700]">{initial}</span>
            )}
          </div>
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 border-2 border-[#133249] rounded-full" />
        </div>

        {/* Info */}
        <div className="flex-1 text-center lg:text-left space-y-3">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-8 bg-white/10 rounded w-48 mx-auto lg:mx-0" />
              <div className="h-4 bg-white/10 rounded w-32 mx-auto lg:mx-0" />
            </div>
          ) : (
            <>
              <h3 className="text-2xl lg:text-3xl font-black text-white">{name || "Người dùng"}</h3>
              <p className="text-[#FF7700] font-semibold text-sm">Cư dân</p>
            </>
          )}

          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            {isLoading ? (
              <>
                <div className="h-8 bg-white/10 rounded-lg w-36 animate-pulse" />
                <div className="h-8 bg-white/10 rounded-lg w-48 animate-pulse" />
              </>
            ) : (
              <>
                {phone && (
                  <span className="flex items-center gap-2 text-gray-300 text-sm bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                    <span>📱</span>{phone}
                  </span>
                )}
                {email && (
                  <span className="flex items-center gap-2 text-gray-300 text-sm bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                    <span>✉️</span>{email}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-lg">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Đang hoạt động
                </span>
              </>
            )}
          </div>
        </div>

        {/* Edit Button */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onEditToggle}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${isEditMode
                ? "bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400"
                : "bg-[#FF7700] hover:bg-[#FF8800] text-white shadow-lg shadow-[#FF7700]/20"
              }`}
          >
            {isEditMode ? "❌ Hủy chỉnh sửa" : "✏️ Chỉnh sửa hồ sơ"}
          </button>
        </div>
      </div>
    </div>
  );
}
