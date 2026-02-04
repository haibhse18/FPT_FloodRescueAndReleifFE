"use client";

import { Card, Input, Button, Skeleton } from "@/shared/ui/components";

export interface CitizenProfile {
  name: string;
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
      <Card className="mb-6 bg-white/5 border-white/10 p-6">
        <div className="space-y-4 animate-pulse">
          <Skeleton className="h-8 w-1/3 mb-6 bg-white/10" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/4 bg-white/10" />
              <Skeleton className="h-10 w-full bg-white/10" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-white border-gray-200 shadow-sm p-8">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
        <span className="text-2xl bg-blue-50 p-2 rounded-lg">📋</span>
        <h3 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h3>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              !isEditMode ?
                "bg-transparent border-0 border-b border-gray-200 rounded-none px-0 text-gray-900 font-bold text-lg focus:ring-0"
              : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            }
            // Add labelClassName if supported, otherwise styling relies on global Input styles or we wrap it.
            // Assuming Input component accepts className for the input element itself.
            // We desire "Label xám - Value đậm".
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
              !isEditMode ?
                "bg-transparent border-0 border-b border-gray-200 rounded-none px-0 text-gray-900 font-bold text-lg focus:ring-0"
              : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
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
              !isEditMode ?
                "bg-transparent border-0 border-b border-gray-200 rounded-none px-0 text-gray-900 font-bold text-lg focus:ring-0"
              : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            }
          />

          {/* Address - Spans full width */}
          <div className="md:col-span-2">
            {isEditMode ?
              <div className="w-full">
                <label className="block text-sm font-medium mb-2 text-gray-500">
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
                  className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition resize-none"
                />
              </div>
            : <Input
                label="📍 Địa chỉ"
                value={profile.address}
                readOnly={true}
                disabled={true}
                className="bg-transparent border-0 border-b border-gray-200 rounded-none px-0 text-gray-900 font-bold text-lg focus:ring-0"
              />
            }
          </div>
        </div>

        {/* Save/Cancel Buttons */}
        {isEditMode && (
          <div className="flex gap-4 pt-6 border-t border-gray-100 justify-end">
            <Button
              onClick={onCancel}
              variant="secondary"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 min-w-[120px]"
              disabled={isSaving}
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={onSave}
              isLoading={isSaving}
              variant="primary"
              className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
            >
              {isSaving ? "Đang lưu..." : "💾 Lưu thay đổi"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
