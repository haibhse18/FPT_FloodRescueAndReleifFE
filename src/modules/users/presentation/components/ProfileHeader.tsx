"use client";

interface ProfileHeaderProps {
  name: string;
  role: string;
  phone: string;
  email: string;
  isLoading?: boolean;
  isEditMode: boolean;
  onEditToggle: () => void;
}

export default function ProfileHeader({
  name,
  role,
  phone,
  email,
  isLoading = false,
  isEditMode,
  onEditToggle,
}: ProfileHeaderProps) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div className="bg-[#16384f]/70 border border-white/15 rounded-3xl p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-[#0f2f44] border-2 border-white/15 flex items-center justify-center">
            {isLoading ? (
              <span className="w-full h-full rounded-full bg-white/10 animate-pulse block" />
            ) : (
              <span className="text-4xl lg:text-5xl font-black text-[#FFD1A0]">{initial}</span>
            )}
          </div>
          <span className="absolute bottom-1 right-1 w-5 h-5 bg-[#FF7700] border-4 border-[#16384f] rounded-full" />
        </div>

        {/* Info */}
        <div className="flex-1 text-center lg:text-left space-y-3">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-8 bg-white/10 rounded-lg w-48 mx-auto lg:mx-0" />
              <div className="h-4 bg-white/10 rounded-lg w-32 mx-auto lg:mx-0" />
            </div>
          ) : (
            <>
              <h3 className="text-2xl lg:text-3xl font-black text-white">{name || "Người dùng"}</h3>
              <p className="text-[#FFD1A0] font-bold text-sm tracking-wide">{role}</p>
            </>
          )}

          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            {isLoading ? (
              <>
                <div className="h-8 bg-white/10 rounded-full w-36 animate-pulse" />
                <div className="h-8 bg-white/10 rounded-full w-48 animate-pulse" />
              </>
            ) : (
              <>
                {phone && (
                  <span className="flex items-center gap-2 text-white/85 font-medium text-sm bg-white/5 border border-white/10 px-4 py-2 rounded-full shadow-sm">
                    <span>📱</span>{phone}
                  </span>
                )}
                {email && (
                  <span className="flex items-center gap-2 text-white/85 font-medium text-sm bg-white/5 border border-white/10 px-4 py-2 rounded-full shadow-sm">
                    <span>✉️</span>{email}
                  </span>
                )}
                <span className="flex items-center gap-2 text-[#FFD1A0] text-xs font-bold bg-[#FF7700]/15 border border-[#FF7700]/35 px-4 py-2 rounded-full shadow-sm">
                  <span className="w-2 h-2 bg-[#FF7700] rounded-full animate-pulse" />
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
            className={`px-6 py-3 rounded-full font-bold text-sm transition-all shadow-sm ${isEditMode
                ? "bg-red-500/15 hover:bg-red-500/25 border border-red-400/35 text-red-200"
                : "bg-[#FF7700] hover:bg-[#e66a00] text-white"
              }`}
          >
            {isEditMode ? "❌ Hủy chỉnh sửa" : "✏️ Chỉnh sửa hồ sơ"}
          </button>
        </div>
      </div>
    </div>
  );
}
