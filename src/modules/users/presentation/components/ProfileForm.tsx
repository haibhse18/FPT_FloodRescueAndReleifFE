"use client";

import { Card, Input, Skeleton } from "@/shared/ui/components";
import { User, Phone, EnvelopeSimple, MapPin, FloppyDisk } from "phosphor-react";

export interface CitizenProfile {
  name: string;
  role: string;
  phone: string;
  email: string;
  address: string;
}

interface ProfileFormProps {
  profile: CitizenProfile;
  editedProfile: CitizenProfile;
  isLoading: boolean;
  isEditMode: boolean;
  isSaving: boolean;
  onProfileChange: (profile: CitizenProfile) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProfileForm({
  profile,
  editedProfile,
  isLoading,
  isEditMode,
  isSaving,
  onProfileChange,
  onSave,
  onCancel,
}: ProfileFormProps) {
  if (isLoading) {
    return (
      <div className="space-y-6 py-8 border-b border-white/10">
        <div className="space-y-4 animate-pulse">
          <Skeleton className="h-6 w-1/3 bg-white/10 rounded" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/4 bg-white/10 rounded" />
              <Skeleton className="h-12 w-full bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 border-b border-white/10">
      <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <span className="text-2xl bg-[#0f2f44]/70 border border-white/20 text-[#FFD1A0] p-2 rounded-xl">
          <MapPin weight="bold" size={24} />
        </span>
        Thông tin cá nhân
      </h3>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/90 mb-2">
              <User weight="bold" size={16} />
              Họ và tên
            </label>
            <input
              type="text"
              value={isEditMode ? editedProfile.name : profile.name}
              onChange={(e) =>
                onProfileChange({ ...editedProfile, name: e.target.value })
              }
              disabled={!isEditMode || isSaving}
              readOnly={!isEditMode}
              className={`w-full px-4 py-3 rounded-lg border transition-all ${isEditMode
                ? "bg-[#0f2f44]/70 border-white/20 text-white focus:border-[#FF7700] focus:ring-2 focus:ring-[#FF7700]/25"
                : "bg-transparent border-0 border-b-2 border-white/15 text-white cursor-default"
                } focus:outline-none`}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/90 mb-2">
              <Phone weight="bold" size={16} />
              Số điện thoại
            </label>
            <input
              type="tel"
              value={isEditMode ? editedProfile.phone : profile.phone}
              onChange={(e) =>
                onProfileChange({ ...editedProfile, phone: e.target.value })
              }
              disabled={!isEditMode || isSaving}
              readOnly={!isEditMode}
              className={`w-full px-4 py-3 rounded-lg border transition-all ${isEditMode
                ? "bg-[#0f2f44]/70 border-white/20 text-white focus:border-[#FF7700] focus:ring-2 focus:ring-[#FF7700]/25"
                : "bg-transparent border-0 border-b-2 border-white/15 text-white cursor-default"
                } focus:outline-none`}
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/90 mb-2">
              <EnvelopeSimple weight="bold" size={16} />
              Email
            </label>
            <input
              type="email"
              value={isEditMode ? editedProfile.email : profile.email}
              onChange={(e) =>
                onProfileChange({ ...editedProfile, email: e.target.value })
              }
              disabled={!isEditMode || isSaving}
              readOnly={!isEditMode}
              className={`w-full px-4 py-3 rounded-lg border transition-all ${isEditMode
                ? "bg-[#0f2f44]/70 border-white/20 text-white focus:border-[#FF7700] focus:ring-2 focus:ring-[#FF7700]/25"
                : "bg-transparent border-0 border-b-2 border-white/15 text-white cursor-default"
                } focus:outline-none`}
            />
          </div>

          {/* Role (Read-only) */}
          <div>
            <label className="text-sm font-medium text-white/90 mb-2 block">
              Vai trò
            </label>
            <input
              type="text"
              value={profile.role}
              disabled
              readOnly
              className="w-full px-4 py-3 rounded-lg border border-white/15 bg-transparent text-white/60 cursor-default"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-white/90 mb-2">
              <MapPin weight="bold" size={16} />
              Địa chỉ
            </label>
            {isEditMode ? (
              <textarea
                value={editedProfile.address}
                onChange={(e) =>
                  onProfileChange({
                    ...editedProfile,
                    address: e.target.value,
                  })
                }
                disabled={isSaving}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-white/20 bg-[#0f2f44]/70 text-white focus:border-[#FF7700] focus:ring-2 focus:ring-[#FF7700]/25 focus:outline-none transition-all resize-none"
              />
            ) : (
              <textarea
                value={profile.address}
                disabled
                readOnly
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-white/15 bg-transparent text-white cursor-default resize-none"
              />
            )}
          </div>
        </div>

        {/* Save/Cancel Buttons */}
        {isEditMode && (
          <div className="flex gap-4 pt-4 justify-end border-t border-white/10 mt-6">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="px-6 py-3 bg-[#0f2f44]/70 border border-white/20 hover:bg-[#1a3f57]/80 text-white/90 font-bold rounded-full transition-all disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-8 py-3 bg-[#FF7700] hover:bg-orange-600 text-white font-bold rounded-full transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <FloppyDisk weight="bold" size={18} />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}