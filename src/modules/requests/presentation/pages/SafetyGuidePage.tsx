"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";

const ACTIVE_REQUEST_STATUSES = new Set([
  "SUBMITTED",
  "VERIFIED",
  "IN_PROGRESS",
  "FULFILLED",
  "PARTIALLY_FULFILLED",
  "ACCEPTED",
]);

function normalizeStatus(status: unknown): string {
  return String(status ?? "")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();
}

export default function SafetyGuidePage() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  useEffect(() => {
    const checkActiveRequest = async () => {
      try {
        const requests = await requestRepository.getMyRequests({ page: 1, limit: 20 });
        const sorted = [...(requests || [])].sort((a: any, b: any) => {
          const aTime = new Date(a?.createdAt || 0).getTime();
          const bTime = new Date(b?.createdAt || 0).getTime();
          return bTime - aTime;
        });

        const active = sorted.find((req: any) =>
          ACTIVE_REQUEST_STATUSES.has(normalizeStatus(req?.status)),
        );

        const activeRecord = active as
          | { requestId?: string; _id?: string; id?: string }
          | undefined;
        const id = activeRecord?.requestId || activeRecord?._id || activeRecord?.id;
        setActiveRequestId(id ? String(id) : null);
      } catch {
        setActiveRequestId(null);
      }
    };

    checkActiveRequest();
  }, []);

  const safetyGuides = [
    {
      icon: "🌊",
      title: "Trước khi lũ đến",
      color: "blue",
      tips: [
        "Chuẩn bị túi cứu hộ khẩn cấp với thực phẩm, nước uống, thuốc men",
        "Sạc đầy điện thoại và thiết bị điện tử",
        "Lưu số điện thoại khẩn cấp và địa chỉ nơi trú ẩn",
        "Di chuyển đồ đạc quan trọng lên cao",
        "Tắt nguồn điện, gas nếu phải sơ tán",
      ],
    },
    {
      icon: "⚠️",
      title: "Khi nước lũ đang dâng",
      color: "orange",
      tips: [
        "Di chuyển ngay đến nơi cao hơn, không chần chừ",
        "Tránh xa các khu vực ngập sâu và dòng nước chảy xiết",
        "Không cố gắng lái xe qua vùng ngập nước",
        "Tắt toàn bộ nguồn điện trong nhà",
        "Mang theo giấy tờ tùy thân và túi cứu hộ khẩn cấp",
      ],
    },
    {
      icon: "🚫",
      title: "Những điều tuyệt đối không làm",
      color: "red",
      tips: [
        "Không đi bộ qua vùng nước chảy xiết (từ 15cm trở lên)",
        "Không chạm vào dây điện hoặc thiết bị điện khi ướt",
        "Không uống nước lũ hoặc dùng nước lũ nấu ăn",
        "Không quay lại nhà khi nước chưa rút hết",
        "Không lan truyền tin giả, gây hoang mang",
      ],
    },
    {
      icon: "🏠",
      title: "Sau khi lũ rút",
      color: "green",
      tips: [
        "Kiểm tra kỹ nhà cửa trước khi vào, tránh sập đổ",
        "Vệ sinh khử trùng nhà cửa, đồ dùng",
        "Kiểm tra hệ thống điện nước trước khi sử dụng",
        "Chỉ uống nước đóng chai hoặc đã đun sôi",
        "Thông báo ngay nếu có người bị thương hoặc ốm",
      ],
    },
    {
      icon: "📱",
      title: "Số điện thoại khẩn cấp",
      color: "purple",
      tips: [
        "Cấp cứu: 115",
        "Cảnh sát: 113",
        "Cứu hỏa: 114",
        "Trung tâm cứu nạn: 1900-1903",
        "Hãy lưu số điện thoại UBND và đội cứu hộ địa phương",
      ],
    },
    {
      icon: "🎒",
      title: "Túi cứu hộ khẩn cấp",
      color: "yellow",
      tips: [
        "Nước uống đóng chai (đủ dùng 3 ngày)",
        "Thực phẩm khô: bánh quy, mì gói, đồ hộp",
        "Thuốc men cơ bản, băng gạc, cồn sát trùng",
        "Đèn pin, pin dự phòng, sạc dự phòng",
        "Giấy tờ tùy thân, tiền mặt, chăn mỏng, quần áo khô",
      ],
    },
  ];

  const colorClasses: {
    [key: string]: { border: string; badge: string; iconBg: string };
  } = {
    blue: {
      border: "border-l-4 border-blue-500",
      badge: "bg-blue-500/20 text-blue-400",
      iconBg: "bg-blue-500/10",
    },
    orange: {
      border: "border-l-4 border-orange-500",
      badge: "bg-orange-500/20 text-orange-400",
      iconBg: "bg-orange-500/10",
    },
    red: {
      border: "border-l-4 border-red-500",
      badge: "bg-red-500/20 text-red-400",
      iconBg: "bg-red-500/10",
    },
    green: {
      border: "border-l-4 border-green-500",
      badge: "bg-green-500/20 text-green-400",
      iconBg: "bg-green-500/10",
    },
    purple: {
      border: "border-l-4 border-purple-500",
      badge: "bg-purple-500/20 text-purple-400",
      iconBg: "bg-purple-500/10",
    },
    yellow: {
      border: "border-l-4 border-yellow-500",
      badge: "bg-yellow-500/20 text-yellow-400",
      iconBg: "bg-yellow-500/10",
    },
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white uppercase tracking-tight">
          Hướng dẫn an toàn
        </h1>
        <p className="text-gray-400 font-medium">
          Kiến thức sinh tồn và phòng chống lũ lụt
        </p>
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {safetyGuides.map((guide, index) => {
          const isExpanded = expandedCard === index;
          const colorStyle = colorClasses[guide.color] || colorClasses.blue;

          return (
            <div
              key={index}
              className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/20 ${isExpanded ? "ring-2 ring-white/10" : ""}`}
            >
              <button
                onClick={() => setExpandedCard(isExpanded ? null : index)}
                className="w-full flex items-center gap-4 p-5 text-left transition-colors hover:bg-white/5"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorStyle.iconBg}`}
                >
                  {guide.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {guide.tips.length} lời khuyên
                  </p>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isExpanded ? "rotate-180 bg-white/10" : ""}`}
                >
                  <span className="text-gray-400">▼</span>
                </div>
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${isExpanded ?
                  "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
                  }`}
              >
                <div className="overflow-hidden">
                  <div className="p-5 pt-0 space-y-3">
                    <div className="h-px w-full bg-white/5 mb-4"></div>
                    {guide.tips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 text-gray-300 group"
                      >
                        <span
                          className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform ${colorStyle.badge.split(" ")[0].replace("/20", "")}`}
                        ></span>
                        <p className="text-sm leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency Support */}
      <div className="mt-8 bg-gradient-to-br from-[#FF7700]/20 to-orange-500/10 border border-[#FF7700]/30 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>💡</span>
          Cần hỗ trợ khẩn cấp?
        </h3>
        <p className="text-gray-300 mb-6">
          Nếu bạn đang gặp nguy hiểm, hãy gọi ngay số điện thoại cứu hộ hoặc sử
          dụng nút SOS trong ứng dụng.
        </p>
        <Link
          href={activeRequestId ? `/history/${activeRequestId}` : "/request"}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF7700] to-orange-600 hover:from-[#FF7700]/90 hover:to-orange-600/90 rounded-xl text-white font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <span className="text-xl">{activeRequestId ? "📄" : "🚨"}</span>
          <span>{activeRequestId ? "Xem yêu cầu đã gửi" : "Gửi yêu cầu cứu hộ ngay"}</span>
        </Link>
      </div>
    </div>
  );
}
