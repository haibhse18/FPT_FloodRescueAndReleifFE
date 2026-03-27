"use client";

import { PencilSimple, X, Phone, EnvelopeSimple } from "phosphor-react";

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
    <div className="flex flex-col lg:flex-row items-start gap-6">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-[#0f2f44]/70 border-2 border-white/20 flex items-center justify-center">
          {isLoading ? (
            <span className="w-full h-full rounded-full bg-white/10 animate-pulse block" />
          ) : (
            <span className="text-4xl lg:text-5xl font-bold text-[#FFD1A0]">
              {initial}
            </span>
          )}
        </div>
        <span className="absolute bottom-1 right-1 w-5 h-5 bg-[#FF7700] border-4 border-[#16384f] rounded-full" />
      </div>

      {/* Info */}
      <div className="flex-1 pt-2">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-8 bg-white/10 rounded w-48" />
            <div className="h-5 bg-white/10 rounded w-32" />
          </div>
        ) : (
          <>
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-1">
              {name || "Người dùng"}
            </h3>
            <p className="text-[#FFD1A0] font-bold text-sm tracking-wide mb-6 uppercase">
              {role}
            </p>
          </>
        )}

        <div className="flex flex-wrap gap-3">
          {isLoading ? (
            <>
              <div className="h-10 bg-white/10 rounded w-40 animate-pulse" />
              <div className="h-10 bg-white/10 rounded w-56 animate-pulse" />
            </>
          ) : (
            <>
              {phone && (
                <span className="inline-flex items-center gap-2 text-white font-medium text-sm bg-[#0f2f44]/70 border border-white/20 px-4 py-2 rounded-full">
                  <Phone weight="bold" size={16} />
                  {phone}
                </span>
              )}
              {email && (
                <span className="inline-flex items-center gap-2 text-white font-medium text-sm bg-[#0f2f44]/70 border border-white/20 px-4 py-2 rounded-full">
                  <EnvelopeSimple weight="bold" size={16} />
                  {email}
                </span>
              )}
              <span className="inline-flex items-center gap-2 text-[#FFD1A0] text-xs font-bold bg-[#FF7700]/15 border border-[#FF7700]/35 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-[#FF7700] rounded-full animate-pulse" />
                Đang hoạt động
              </span>
            </>
          )}
        </div>
      </div>

      {/* Edit Button */}
      <div className="flex-shrink-0">
        <button
          onClick={onEditToggle}
          className={`px-6 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${isEditMode
            ? "bg-red-500/15 hover:bg-red-500/25 border border-red-400/35 text-red-200"
            : "bg-[#FF7700] hover:bg-orange-600 text-white"
            }`}
        >
          {isEditMode ? (
            <>
              <X weight="bold" size={18} />
              Hủy
            </>
          ) : (
            <>
              <PencilSimple weight="bold" size={18} />
              Chỉnh sửa
            </>
          )}
        </button>
      </div>
    </div>
  );
}