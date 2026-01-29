"use client";

import Link from "next/link";
import { Card } from "@/shared/ui/components";

interface QuickSetting {
  icon: string;
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
      icon: "🔔",
      label: "Cài đặt thông báo",
      description: "Quản lý thông báo cứu hộ",
      href: "#",
    },
    {
      icon: "📍",
      label: "Vị trí mặc định",
      description: "Cập nhật vị trí thường xuyên",
      href: "#",
    },
    {
      icon: "🔒",
      label: "Bảo mật",
      description: "Đổi mật khẩu, xác thực 2 lớp",
      href: "#",
    },
    {
      icon: "❓",
      label: "Trợ giúp & Hỗ trợ",
      description: "Hướng dẫn sử dụng cứu hộ",
      href: "#",
    },
  ];

  const displaySettings = settings.length > 0 ? settings : defaultSettings;

  return (
    <Card className="mb-6 bg-white/5 border-white/10 p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>⚙️</span>
        Cài đặt nhanh
      </h3>

      <div className="space-y-3">
        {displaySettings.map((setting, index) => (
          <Link
            key={index}
            href={setting.href}
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <div className="text-3xl">{setting.icon}</div>
            <div className="flex-1">
              <p className="text-white font-bold">{setting.label}</p>
              <p className="text-sm text-gray-400">{setting.description}</p>
            </div>
            <span className="text-2xl text-gray-500">›</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
