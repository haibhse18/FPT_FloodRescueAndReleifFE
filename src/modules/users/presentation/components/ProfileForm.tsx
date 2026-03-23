"use client";

import { Card, Input, Skeleton } from "@/shared/ui/components";

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
      <Card className="mb-6 bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-sm">
        <div className="space-y-4 animate-pulse">
          <Skeleton className="h-8 w-1/3 mb-6 bg-gray-200 rounded-lg" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/4 bg-gray-100 rounded-md" />
              <Skeleton className="h-12 w-full bg-gray-50 rounded-xl" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
        <span className="text-2xl bg-gray-50 text-gray-700 p-2 rounded-xl">📋</span>
        <h3 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h3>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-900">
          {/* Name */}
          <Input
            label="👤 Họ và tên"
            value={isEditMode ? editedProfile.name : profile.name}
            onChange={(e) =>
              onProfileChange({ ...editedProfile, name: e.target.value })
            }
            disabled={!isEditMode || isSaving}
            readOnly={!isEditMode}
            className={
              !isEditMode
                ? "bg-transparent border-0 border-b-2 border-gray-100 rounded-none px-0 text-gray-900 font-bold text-base focus:ring-0"
                : "bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500 rounded-xl px-4 py-3"
            }
          />

          {/* Phone */}
          <Input
            label="📱 Số điện thoại"
            value={isEditMode ? editedProfile.phone : profile.phone}
            onChange={(e) =>
              onProfileChange({ ...editedProfile, phone: e.target.value })
            }
            disabled={!isEditMode || isSaving}
            readOnly={!isEditMode}
            className={
              !isEditMode
                ? "bg-transparent border-0 border-b-2 border-gray-100 rounded-none px-0 text-gray-900 font-bold text-base focus:ring-0"
                : "bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500 rounded-xl px-4 py-3"
            }
          />

          {/* Email */}
          <Input
            label="✉️ Email"
            value={isEditMode ? editedProfile.email : profile.email}
            onChange={(e) =>
              onProfileChange({ ...editedProfile, email: e.target.value })
            }
            disabled={!isEditMode || isSaving}
            readOnly={!isEditMode}
            type="email"
            className={
              !isEditMode
                ? "bg-transparent border-0 border-b-2 border-gray-100 rounded-none px-0 text-gray-900 font-bold text-base focus:ring-0"
                : "bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500 rounded-xl px-4 py-3"
            }
          />

          {/* Address */}
          <div className="md:col-span-2">
            {isEditMode ? (
              <div className="w-full">
                <label className="block text-sm font-bold mb-2 text-gray-600">
                  📍 Địa chỉ
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
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition resize-none"
                />
              </div>
            ) : (
              <Input
                label="📍 Địa chỉ"
                value={profile.address}
                readOnly={true}
                disabled={true}
                className="bg-transparent border-0 border-b-2 border-gray-100 rounded-none px-0 text-gray-900 font-bold text-base focus:ring-0"
              />
            )}
          </div>
        </div>

        {/* Save/Cancel Buttons */}
        {isEditMode && (
          <div className="flex gap-4 pt-6 mt-4 border-t border-gray-100 justify-end">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold rounded-full transition-all disabled:opacity-50 shadow-sm"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-full transition-all disabled:opacity-60 flex items-center gap-2 shadow-sm"
            >
              {isSaving ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "💾 Lưu thay đổi"
              )}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
