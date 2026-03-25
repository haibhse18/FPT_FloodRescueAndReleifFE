"use client";

import Link from "next/link";
import { Card } from "@/shared/ui/components";
import { BadgeQuestionMark, BellIcon, LockKeyhole, MapPin, Settings } from "lucide-react";

interface QuickSetting {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
}

interface ProfileQuickSettingsProps {
  settings?: QuickSetting[];
}

export default function ProfileQuickSettings({
  settings = [],
}: ProfileQuickSettingsProps) {
  const defaultSettings: QuickSetting[] = [
    {
      icon: <BellIcon className="w-6 h-6" />,
      label: "Cài đặt thông báo",
      description: "Quản lý thông báo cứu hộ",
      href: "#",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      label: "Vị trí mặc định",
      description: "Cập nhật vị trí thường xuyên",
      href: "#",
    },
    {
      icon: <LockKeyhole className="w-6 h-6" />,
      label: "Bảo mật",
      description: "Đổi mật khẩu, xác thực 2 lớp",
      href: "#",
    },
    {
      icon: <BadgeQuestionMark className="w-6 h-6" />,
      label: "Trợ giúp & Hỗ trợ",
      description: "Hướng dẫn sử dụng cứu hộ",
      href: "#",
    },
  ];

  const displaySettings = settings.length > 0 ? settings : defaultSettings;

  return (
    <Card className="mb-6 bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-sm">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        Cài đặt nhanh
      </h3>

      <div className="space-y-4">
        {displaySettings.map((setting, index) => (
          <Link
            key={index}
            href={setting.href}
            className="flex items-center gap-5 p-5 rounded-2xl bg-white hover:bg-gray-50 border border-gray-100 hover:border-[#4C7AAC] transition-all duration-200 shadow-sm group"
          >
            <div className="text-3xl group-hover:scale-110 transition-transform">{setting.icon}</div>
            <div className="flex-1">
              <p className="text-gray-900 font-bold mb-1">{setting.label}</p>
              <p className="text-sm font-medium text-gray-500">{setting.description}</p>
            </div>
            <span className="text-2xl text-gray-400 group-hover:text-[#4C7AAC] font-bold transition-colors">›</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
