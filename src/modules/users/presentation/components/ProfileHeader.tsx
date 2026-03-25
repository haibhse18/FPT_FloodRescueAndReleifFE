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
    <div className="bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-[#316192] border-2 border-[#316192] flex items-center justify-center">
            {isLoading ? (
              <span className="w-full h-full rounded-full bg-gray-100 animate-pulse block" />
            ) : (
              <span className="text-4xl lg:text-5xl font-black text-white">{initial}</span>
            )}
          </div>
          <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full" />
        </div>

        {/* Info */}
        <div className="flex-1 text-center lg:text-left space-y-3">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto lg:mx-0" />
              <div className="h-4 bg-gray-100 rounded-lg w-32 mx-auto lg:mx-0" />
            </div>
          ) : (
            <>
              <h3 className="text-2xl lg:text-3xl font-black text-gray-900">{name || "Người dùng"}</h3>
              <p className="text-[#316192] font-bold text-sm tracking-wide">{role}</p>
            </>
          )}

          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            {isLoading ? (
              <>
                <div className="h-8 bg-gray-100 rounded-full w-36 animate-pulse" />
                <div className="h-8 bg-gray-100 rounded-full w-48 animate-pulse" />
              </>
            ) : (
              <>
                {phone && (
                  <span className="flex items-center gap-2 text-gray-600 font-medium text-sm bg-gray-50 border border-gray-100 px-4 py-2 rounded-full shadow-sm">
                    {phone}
                  </span>
                )}
                {email && (
                  <span className="flex items-center gap-2 text-gray-600 font-medium text-sm bg-gray-50 border border-gray-100 px-4 py-2 rounded-full shadow-sm">
                    {email}
                  </span>
                )}
                <span className="flex items-center gap-2 text-emerald-700 text-xs font-bold bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full shadow-sm">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
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
              ? "bg-red-50 hover:bg-red-100 border border-red-200 text-red-600"
              : "bg-[#316192] hover:bg-[#6694C8] text-white"
              }`}
          >
            {isEditMode ? " Hủy chỉnh sửa" : " Chỉnh sửa hồ sơ"}
          </button>
        </div>
      </div>
    </div>
  );
}
