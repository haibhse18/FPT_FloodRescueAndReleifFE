"use client";

import { Card, Input, Skeleton } from "@/shared/ui/components";
import { FiClipboard, FiMail, FiMapPin, FiPhone, FiSave, FiUser } from "react-icons/fi";

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
      <Card variant="dark-blur" padding="lg" className="mb-6">
        <div className="space-y-4 animate-pulse">
          <Skeleton className="h-8 w-1/3 mb-6 bg-white/10 rounded-lg" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/4 bg-white/10 rounded-md" />
              <Skeleton className="h-12 w-full bg-white/10 rounded-xl" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card variant="dark-blur" padding="lg" className="mb-6">
      <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
        <span className="text-2xl bg-white/10 text-[#FFD1A0] p-2 rounded-xl">
          <FiClipboard />
        </span>
        <h3 className="text-2xl font-bold text-white">Thông tin cá nhân</h3>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
          {/* Name */}
          <Input
            label={
              <span className="flex items-center gap-2">
                <FiUser className="text-base" />
                Họ và tên
              </span>
            }
            value={isEditMode ? editedProfile.name : profile.name}
            onChange={(e) =>
              onProfileChange({ ...editedProfile, name: e.target.value })
            }
            disabled={!isEditMode || isSaving}
            readOnly={!isEditMode}
            className={
              !isEditMode
                ? "bg-transparent border-0 border-b-2 border-white/15 rounded-none px-0 text-white font-bold text-base focus:ring-0"
                : "bg-[#0f2f44]/80 border-white/20 text-white focus:border-[#FF7700] rounded-xl px-4 py-3"
            }
          />

          {/* Phone */}
          <Input
            label={
              <span className="flex items-center gap-2">
                <FiPhone className="text-base" />
                Số điện thoại
              </span>
            }
            value={isEditMode ? editedProfile.phone : profile.phone}
            onChange={(e) =>
              onProfileChange({ ...editedProfile, phone: e.target.value })
            }
            disabled={!isEditMode || isSaving}
            readOnly={!isEditMode}
            className={
              !isEditMode
                ? "bg-transparent border-0 border-b-2 border-white/15 rounded-none px-0 text-white font-bold text-base focus:ring-0"
                : "bg-[#0f2f44]/80 border-white/20 text-white focus:border-[#FF7700] rounded-xl px-4 py-3"
            }
          />

          {/* Email */}
          <Input
            label={
              <span className="flex items-center gap-2">
                <FiMail className="text-base" />
                Email
              </span>
            }
            value={isEditMode ? editedProfile.email : profile.email}
            onChange={(e) =>
              onProfileChange({ ...editedProfile, email: e.target.value })
            }
            disabled={!isEditMode || isSaving}
            readOnly={!isEditMode}
            type="email"
            className={
              !isEditMode
                ? "bg-transparent border-0 border-b-2 border-white/15 rounded-none px-0 text-white font-bold text-base focus:ring-0"
                : "bg-[#0f2f44]/80 border-white/20 text-white focus:border-[#FF7700] rounded-xl px-4 py-3"
            }
          />

          {/* Address */}
          <div className="md:col-span-2">
            {isEditMode ? (
              <div className="w-full">
                <label className="flex items-center gap-2 text-sm font-bold mb-2 text-white/75">
                  <FiMapPin className="text-base" />
                  Địa chỉ
                </label>
                <textarea
                  value={editedProfile.address}
                  onChange={(e) =>
                    onProfileChange({
                      ...editedProfile,
                      address: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-[#0f2f44]/80 border border-white/20 text-white focus:border-[#FF7700] focus:ring-2 focus:ring-[#FF7700]/25 outline-none transition resize-none"
                />
              </div>
            ) : (
              <Input
                label={
                  <span className="flex items-center gap-2">
                    <FiMapPin className="text-base" />
                    Địa chỉ
                  </span>
                }
                value={profile.address}
                readOnly={true}
                disabled={true}
                className="bg-transparent border-0 border-b-2 border-white/15 rounded-none px-0 text-white font-bold text-base focus:ring-0"
              />
            )}
          </div>
        </div>

        {/* Save/Cancel Buttons */}
        {isEditMode && (
          <div className="flex gap-4 pt-6 mt-4 border-t border-white/10 justify-end">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="px-6 py-3 bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 text-white/90 font-bold rounded-full transition-all disabled:opacity-50 shadow-sm"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-8 py-3 bg-[#FF7700] hover:bg-[#e66a00] text-white font-bold rounded-full transition-all disabled:opacity-60 flex items-center gap-2 shadow-sm"
            >
              {isSaving ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <FiSave /> Lưu thay đổi
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
