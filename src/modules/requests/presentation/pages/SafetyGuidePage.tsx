"use client";

import Link from "next/link";
import { useState } from "react";
import { MobileHeader, MobileBottomNav, DesktopHeader, DesktopSidebar } from "@/shared/components/layout";

export default function SafetyGuidePage() {
    const [expandedCard, setExpandedCard] = useState<number | null>(null);

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

    const colorClasses: { [key: string]: { border: string; badge: string; iconBg: string } } = {
        blue: { border: "border-l-4 border-blue-500", badge: "bg-blue-500/20 text-blue-400", iconBg: "bg-blue-500/10" },
        orange: { border: "border-l-4 border-orange-500", badge: "bg-orange-500/20 text-orange-400", iconBg: "bg-orange-500/10" },
        red: { border: "border-l-4 border-red-500", badge: "bg-red-500/20 text-red-400", iconBg: "bg-red-500/10" },
        green: { border: "border-l-4 border-green-500", badge: "bg-green-500/20 text-green-400", iconBg: "bg-green-500/10" },
        purple: { border: "border-l-4 border-purple-500", badge: "bg-purple-500/20 text-purple-400", iconBg: "bg-purple-500/10" },
        yellow: { border: "border-l-4 border-yellow-500", badge: "bg-yellow-500/20 text-yellow-400", iconBg: "bg-yellow-500/10" },
    };

    return (
        <div className="min-h-screen bg-[#1C262B] flex flex-col lg:flex-row">
            <DesktopSidebar />

            <div className="flex-1 flex flex-col lg:ml-64">
                <MobileHeader />
                <DesktopHeader title="Hướng dẫn an toàn" subtitle="Kỹ năng sinh tồn trong lũ lụt" />

                <main className="pt-[73px] lg:pt-[89px] pb-24 lg:pb-0 overflow-auto">
                    <div className="max-w-4xl mx-auto p-4 lg:p-8">
                        <div className="bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/30 rounded-2xl p-6 mb-6">
                            <div className="flex items-start gap-4">
                                <div className="text-5xl">⚠️</div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Thông tin quan trọng</h2>
                                    <p className="text-gray-300">
                                        Hãy đọc kỹ các hướng dẫn dưới đây để biết cách bảo vệ bản thân và gia đình trong mùa mưa lũ.
                                        Lưu số điện thoại khẩn cấp và chuẩn bị túi cứu hộ sẵn sàng.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {safetyGuides.map((guide, index) => {
                                const isExpanded = expandedCard === index;
                                const colors = colorClasses[guide.color];

                                return (
                                    <div
                                        key={index}
                                        className={`bg-white/5 border border-white/10 ${colors.border} rounded-xl overflow-hidden transition-all duration-300 ${
                                            isExpanded ? "ring-2 ring-white/20" : ""
                                        }`}
                                    >
                                        <button
                                            onClick={() => setExpandedCard(isExpanded ? null : index)}
                                            className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 ${colors.iconBg} rounded-xl flex items-center justify-center text-3xl`}>
                                                    {guide.icon}
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="text-xl font-bold text-white">{guide.title}</h3>
                                                    <p className={`text-sm ${colors.badge.split(" ")[1]} mt-1`}>
                                                        {guide.tips.length} mẹo quan trọng
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`text-2xl transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                                                ⌄
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="px-6 pb-6">
                                                <div className="space-y-3 pl-[72px]">
                                                    {guide.tips.map((tip, tipIndex) => (
                                                        <div key={tipIndex} className="flex items-start gap-3">
                                                            <div className={`w-6 h-6 ${colors.badge} rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5`}>
                                                                {tipIndex + 1}
                                                            </div>
                                                            <p className="text-gray-300 flex-1">{tip}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 bg-gradient-to-br from-primary/20 to-orange-500/10 border border-primary/30 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span>💡</span>
                                Cần hỗ trợ khẩn cấp?
                            </h3>
                            <p className="text-gray-300 mb-4">
                                Nếu bạn đang gặp nguy hiểm, hãy gọi ngay số điện thoại cứu hộ hoặc sử dụng nút SOS trong ứng dụng.
                            </p>
                            <Link
                                href="/citizen/request"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 rounded-xl text-white font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <span>🚨</span>
                                Gửi yêu cầu cứu hộ ngay
                            </Link>
                        </div>
                    </div>
                </main>

                <MobileBottomNav />
            </div>
        </div>
    );
}
