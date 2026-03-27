"use client";

import { Card } from "@/shared/ui/components";

interface ProfileStatsProps {
  stats?: Array<{
    icon: string;
    label: string;
    value: string;
    color: string;
  }>;
}

export default function ProfileStats({ stats = [] }: ProfileStatsProps) {
  const defaultStats = [
    {
      icon: "📊",
      label: "Tổng yêu cầu",
      value: "0",
      color: "border-l-4 border-blue-500 bg-white hover:bg-gray-50",
      textColor: "text-blue-700",
    },
    {
      icon: "✅",
      label: "Hoàn thành",
      value: "0",
      color: "border-l-4 border-green-500 bg-white hover:bg-gray-50",
      textColor: "text-green-700",
    },
    {
      icon: "⏳",
      label: "Đang xử lý",
      value: "0",
      color: "border-l-4 border-orange-500 bg-white hover:bg-gray-50",
      textColor: "text-orange-700",
    },
  ];

  const displayStats = stats.length > 0 ? stats : defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {displayStats.map((stat, index) => (
        <Card
          key={index}
          className={`p-6 shadow-sm cursor-pointer transition-all hover:shadow-md ${stat.color}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-gray-50">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            {/* Optional: Add trend indicator or extra icon here */}
          </div>
          <div>
            <p className="text-4xl font-bold text-gray-900 mb-1">
              {stat.value}
            </p>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              {stat.label}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
