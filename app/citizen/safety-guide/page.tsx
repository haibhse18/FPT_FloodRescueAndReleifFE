"use client";

import Link from "next/link";
import { useState } from "react";

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
        blue: {
            border: "border-l-4 border-blue-500",
            badge: "bg-blue-500/20 text-blue-400",
            iconBg: "bg-blue-500/10"
        },
        orange: {
            border: "border-l-4 border-orange-500",
            badge: "bg-orange-500/20 text-orange-400",
            iconBg: "bg-orange-500/10"
        },
        red: {
            border: "border-l-4 border-red-500",
            badge: "bg-red-500/20 text-red-400",
            iconBg: "bg-red-500/10"
        },
        green: {
            border: "border-l-4 border-green-500",
            badge: "bg-green-500/20 text-green-400",
            iconBg: "bg-green-500/10"
        },
        purple: {
            border: "border-l-4 border-purple-500",
            badge: "bg-purple-500/20 text-purple-400",
            iconBg: "bg-purple-500/10"
        },
        yellow: {
            border: "border-l-4 border-yellow-500",
            badge: "bg-yellow-500/20 text-yellow-400",
            iconBg: "bg-yellow-500/10"
        },
    };

    return (
        <div className="min-h-screen bg-secondary">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-secondary/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link
                        href="/citizen"
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 transition"
                    >
                        <span className="text-xl">←</span>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white">Hướng dẫn an toàn</h1>
                        <p className="text-sm text-gray-400">Kỹ năng sinh tồn khi có lũ</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto p-4 lg:p-8">
                {/* Hero Section */}
                <div className="mb-8 p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/10 border border-white/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                            <span className="text-4xl lg:text-5xl">🛡️</span>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl lg:text-3xl font-black text-white mb-3 tracking-tight">
                                An toàn là trên hết
                            </h2>
                            <p className="text-gray-200 text-base lg:text-lg leading-relaxed max-w-3xl">
                                Lũ lụt là thiên tai nguy hiểm. Hãy trang bị kiến thức và kỹ năng cần thiết để bảo vệ bản thân và gia đình.
                                Đọc kỹ các hướng dẫn dưới đây và luôn sẵn sàng ứng phó.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-white border border-white/20">
                                    ✓ 6 chủ đề quan trọng
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-white border border-white/20">
                                    ✓ Hướng dẫn chi tiết
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Safety Guide Cards */}
                <div className="space-y-4">
                    {safetyGuides.map((guide, index) => (
                        <div
                            key={index}
                            className={`group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 hover:scale-[1.01] hover:shadow-xl ${colorClasses[guide.color].border
                                } cursor-pointer overflow-hidden`}
                            onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                        >
                            <div className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-xl ${colorClasses[guide.color].iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                                        <span className="text-3xl">{guide.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg lg:text-xl font-bold text-white mb-1">
                                            {guide.title}
                                        </h3>
                                        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${colorClasses[guide.color].badge}`}>
                                            {guide.tips.length} mẹo quan trọng
                                        </span>
                                    </div>
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <span className="text-gray-400 text-xl font-light">
                                            {expandedCard === index ? "−" : "+"}
                                        </span>
                                    </div>
                                </div>

                                {expandedCard === index && (
                                    <div className="mt-5 pt-5 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <ul className="space-y-3">
                                            {guide.tips.map((tip, tipIndex) => (
                                                <li
                                                    key={tipIndex}
                                                    className="flex items-start gap-3 text-gray-300 hover:text-white transition-colors group/item"
                                                >
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                                                        {tipIndex + 1}
                                                    </span>
                                                    <span className="flex-1 leading-relaxed">{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Emergency Contact Box */}
                <div className="mt-8 p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border-2 border-red-500/40 relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl"></div>
                    <div className="flex items-start gap-4 lg:gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                            <span className="text-4xl">🚨</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl lg:text-2xl font-black text-white mb-2">
                                Trong trường hợp khẩn cấp
                            </h3>
                            <p className="text-gray-200 mb-6 leading-relaxed">
                                Nếu bạn hoặc người thân đang gặp nguy hiểm, hãy gọi ngay số cấp cứu hoặc sử dụng nút cứu hộ khẩn cấp trên trang chủ.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href="/citizen"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    <span className="text-xl">🆘</span>
                                    <span>Về trang chủ - Gọi cứu hộ</span>
                                </Link>
                                <a
                                    href="tel:115"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all border border-white/20"
                                >
                                    <span className="text-xl">📞</span>
                                    <span>Gọi tới Hotline - 0375320256</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Spacing */}
                <div className="h-8"></div>
            </main>
        </div>
    );
}
