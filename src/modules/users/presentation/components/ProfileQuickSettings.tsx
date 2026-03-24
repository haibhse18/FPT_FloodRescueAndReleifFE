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
    <Card className="mb-6 bg-[#16384f]/70 border border-white/15 rounded-3xl p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-sm">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-2xl bg-white/10 text-[#FFD1A0] p-2 rounded-xl">⚙️</span>
        Cài đặt nhanh
      </h3>

      <div className="space-y-4">
        {displaySettings.map((setting, index) => (
          <Link
            key={index}
            href={setting.href}
            className="flex items-center gap-5 p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FF7700]/45 transition-all duration-200 shadow-sm group"
          >
            <div className="text-3xl group-hover:scale-110 transition-transform">{setting.icon}</div>
            <div className="flex-1">
              <p className="text-white font-bold mb-1">{setting.label}</p>
              <p className="text-sm font-medium text-white/65">{setting.description}</p>
            </div>
            <span className="text-2xl text-white/45 group-hover:text-[#FFD1A0] font-bold transition-colors">›</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
