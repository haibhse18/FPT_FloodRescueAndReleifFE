"use client";

import { useState } from "react";
import { Card } from "@/shared/ui/components/Card";
import { Avatar } from "@/shared/ui/components/Avatar";
import { Badge } from "@/shared/ui/components/Badge";
import { Button } from "@/shared/ui/components/Button";

interface ProfileHeaderProps {
  name: string;
  phone: string;
  email: string;
  isEditMode: boolean;
  onEditToggle: () => void;
}

export default function ProfileHeader({
  name,
  phone,
  email,
  isEditMode,
  onEditToggle,
}: ProfileHeaderProps) {
  return (
    <Card className="mb-6 bg-white border-gray-200 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center gap-8 p-6">
        {/* Avatar */}
        <div className="relative group cursor-pointer">
          <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
            <Avatar
              size="xl"
              src="" // Add real src if available
              fallback={name.charAt(0)}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-3xl">📷</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center lg:text-left space-y-4">
          <div>
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900">
              {name}
            </h3>
            <p className="text-gray-500 font-medium mt-1">Cư dân</p>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
              <span className="text-lg">📱</span>
              <span className="font-semibold">{phone}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
              <span className="text-lg">✉️</span>
              <span className="font-semibold">{email}</span>
            </div>
          </div>

          <div className="pt-1">
            <Badge
              variant="success"
              className="px-3 py-1 text-sm font-semibold bg-green-100 text-green-700 border-green-200"
            >
              ● Đang hoạt động
            </Badge>
          </div>
        </div>

        {/* Edit Button */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={onEditToggle}
            variant={isEditMode ? "danger" : "primary"}
            className={`min-w-[160px] py-3 text-base font-medium shadow-sm transition-all ${
              !isEditMode ? "bg-blue-600 hover:bg-blue-700 text-white" : ""
            }`}
          >
            {isEditMode ? "❌ Hủy chỉnh sửa" : "✏️ Chỉnh sửa hồ sơ"}
          </Button>
          {!isEditMode && (
            <Button
              variant="outline"
              className="min-w-[160px] border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              🔒 Đổi mật khẩu
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
