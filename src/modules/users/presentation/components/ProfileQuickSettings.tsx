"use client";

import Link from "next/link";
import { Bell, MapPin, Lock, Question, GearSix } from "phosphor-react";
import type { ReactNode } from "react";

interface QuickSetting {
  icon: ReactNode;
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
      icon: <Bell weight="bold" size={24} />,
      label: "Cài đặt thông báo",
      description: "Quản lý thông báo cứu hộ",
      href: "#",
    },
    {
      icon: <MapPin weight="bold" size={24} />,
      label: "Vị trí mặc định",
      description: "Cập nhật vị trí thường xuyên",
      href: "#",
    },
    {
      icon: <Lock weight="bold" size={24} />,
      label: "Bảo mật",
      description: "Đổi mật khẩu, xác thực 2 lớp",
      href: "#",
    },
    {
      icon: <Question weight="bold" size={24} />,
      label: "Trợ giúp & Hỗ trợ",
      description: "Hướng dẫn sử dụng cứu hộ",
      href: "#",
    },
  ];

  const displaySettings = settings.length > 0 ? settings : defaultSettings;

  return (
    <div className="py-8 border-b border-white/10">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-2xl bg-white/10 text-[#FFD1A0] p-2 rounded-xl">
          <GearSix weight="bold" size={24} />
        </span>
        Cài đặt nhanh
      </h3>

      <div className="space-y-3">
        {displaySettings.map((setting, index) => (
          <Link
            key={index}
            href={setting.href}
            className="flex items-center gap-5 p-4 lg:p-5 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 hover:border-[#FF7700]/45 transition-all duration-200 group"
          >
            <div className="text-white/70 group-hover:text-[#FFD1A0] transition-colors flex-shrink-0">
              {setting.icon}
            </div>
            <div className="flex-1">
              <p className="text-white font-bold mb-1">{setting.label}</p>
              <p className="text-sm font-medium text-white/70">{setting.description}</p>
            </div>
            <span className="text-white/45 group-hover:text-[#FFD1A0] font-bold transition-colors flex-shrink-0">
              ›
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
