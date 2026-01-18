"use client";

import {
  CheckCircle,
  Loader2,
  AlertTriangle,
  MapPin,
} from "lucide-react";

const steps = [
  {
    title: "Đã gửi báo cáo",
    desc: "Hệ thống đã tiếp nhận thông tin của bạn",
    icon: AlertTriangle,
    status: "done",
  },
  {
    title: "Xác minh vị trí",
    desc: "Đang kiểm tra khu vực bị ảnh hưởng",
    icon: MapPin,
    status: "active",
  },
  {
    title: "Điều phối cứu hộ",
    desc: "Đội cứu hộ đang được điều động",
    icon: Loader2,
    status: "pending",
  },
  {
    title: "Hoàn tất hỗ trợ",
    desc: "Bạn đã được hỗ trợ an toàn",
    icon: CheckCircle,
    status: "pending",
  },
];

export default function StatusTimeline() {
  return (
    <div className="relative pl-6 space-y-6">
      {/* LINE DỌC */}
      <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-gray-200" />

      {steps.map((step, index) => {
        const Icon = step.icon;

        const color =
          step.status === "done"
            ? "bg-green-500"
            : step.status === "active"
            ? "bg-blue-600"
            : "bg-gray-300";

        return (
          <div key={index} className="relative flex gap-4">
            {/* ICON */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${color}`}
            >
              <Icon
                size={14}
                className={
                  step.status === "active" ? "animate-spin" : ""
                }
              />
            </div>

            {/* CARD */}
            <div className="bg-white rounded-xl p-3 shadow-sm border w-full">
              <h3 className="text-sm font-semibold">{step.title}</h3>
              <p className="text-xs text-gray-500">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
