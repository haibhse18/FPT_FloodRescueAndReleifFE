"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MobileHeader, MobileBottomNav, DesktopHeader, DesktopSidebar } from "@/shared/components/layout";
import { GetCurrentUserUseCase } from "@/modules/auth/application/getCurrentUser.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";

const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

export default function CitizenHomePage() {
    const [userName, setUserName] = useState("Người dùng");
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await getCurrentUserUseCase.execute();
                setUserName(user.displayName || "Người dùng");
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();

        // Update time every minute
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Chào buổi sáng";
        if (hour < 18) return "Chào buổi chiều";
        return "Chào buổi tối";
    };

    const quickActions = [
        {
            id: "sos",
            icon: "🆘",
            title: "Gọi cứu hộ",
            subtitle: "Khẩn cấp",
            color: "from-[#FF7700]/30 to-[#FF7700]/10",
            borderColor: "border-[#FF7700]/50",
            iconBg: "bg-[#FF7700]/30",
            href: "/citizen/request",
            isPrimary: true
        },
        {
            id: "guide",
            icon: "📖",
            title: "Hướng dẫn",
            subtitle: "An toàn",
            color: "from-[#FF7700]/20 to-[#FF9900]/10",
            borderColor: "border-[#FF7700]/30",
            iconBg: "bg-[#FF7700]/20",
            href: "/citizen/guide"
        },
        {
            id: "profile",
            icon: "👤",
            title: "Hồ sơ",
            subtitle: "Cá nhân",
            color: "from-[#FF7700]/20 to-[#FF9900]/10",
            borderColor: "border-[#FF7700]/30",
            iconBg: "bg-[#FF7700]/20",
            href: "/citizen/profile"
        },
        {
            id: "notifications",
            icon: "🔔",
            title: "Thông báo",
            subtitle: "Cập nhật",
            color: "from-[#FF7700]/20 to-[#FF9900]/10",
            borderColor: "border-[#FF7700]/30",
            iconBg: "bg-[#FF7700]/20",
            href: "/citizen/notifications"
        }
    ];

    const stats = [
        {
            icon: "📊",
            label: "Tổng yêu cầu",
            value: "4",
            color: "bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-blue-500/30",
            iconBg: "bg-blue-500/20"
        },
        {
            icon: "⏳",
            label: "Đang xử lý",
            value: "1",
            color: "bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border-yellow-500/30",
            iconBg: "bg-yellow-500/20"
        },
        {
            icon: "✅",
            label: "Hoàn thành",
            value: "3",
            color: "bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-500/30",
            iconBg: "bg-green-500/20"
        }
    ];

    const floodWarning = {
        level: "medium",
        title: "Cảnh báo mức độ trung bình",
        message: "Khu vực Quận 5 có nguy cơ ngập úng. Theo dõi thông tin và chuẩn bị phương án di chuyển nếu cần.",
        color: "from-orange-500/20 to-yellow-500/10",
        borderColor: "border-orange-500/50"
    };

    const recentRequests = [
        {
            id: "REQ001",
            type: "Cứu hộ",
            status: "completed",
            location: "123 Nguyễn Trãi, Q5",
            time: "2 giờ trước",
            statusText: "Hoàn thành",
            statusColor: "bg-green-500/20 text-green-400 border-green-500/30"
        },
        {
            id: "REQ002",
            type: "Cứu trợ",
            status: "in_progress",
            location: "456 Lê Văn Sỹ, Q3",
            time: "1 ngày trước",
            statusText: "Đang xử lý",
            statusColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        }
    ];

    return (
        <div className="min-h-screen bg-[#1C262B] flex flex-col lg:flex-row">
            <DesktopSidebar />

            <div className="flex-1 flex flex-col lg:ml-64">
                <MobileHeader />
                <DesktopHeader
                    title={`${getGreeting()}, ${userName}!`}
                    subtitle="Chúc bạn một ngày an toàn và hạnh phúc"
                />

                <main className="pt-[73px] lg:pt-[89px] pb-24 lg:pb-0 overflow-auto">
                    <div className="p-4 lg:p-8 space-y-6">
                        {/* Welcome Banner */}
                        <div className="bg-gradient-to-br from-[#FF7700]/20 via-[#FF7700]/10 to-transparent border border-[#FF7700]/30 rounded-2xl p-6 lg:p-8">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                                        {getGreeting()}, {userName}! 👋
                                    </h1>
                                    <p className="text-gray-400 text-sm lg:text-base">
                                        {currentTime.toLocaleDateString('vi-VN', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="text-4xl lg:text-6xl">🏠</div>
                            </div>
                        </div>

                        {/* Flood Warning Alert */}
                        <div className={`bg-gradient-to-br ${floodWarning.color} border ${floodWarning.borderColor} rounded-2xl p-5 lg:p-6`}>
                            <div className="flex items-start gap-4">
                                <div className="text-3xl lg:text-4xl">⚠️</div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        {floodWarning.title}
                                    </h3>
                                    <p className="text-gray-300 text-sm lg:text-base mb-3">
                                        {floodWarning.message}
                                    </p>
                                    <Link
                                        href="/citizen/guide"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF7700]/20 hover:bg-[#FF7700]/30 border border-[#FF7700]/30 rounded-xl text-[#FF7700] text-sm font-bold transition-all"
                                    >
                                        <span>Xem hướng dẫn an toàn</span>
                                        <span>→</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Grid */}
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span>⚡</span>
                                <span>Hành động nhanh</span>
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                                {quickActions.map((action) => (
                                    <Link
                                        key={action.id}
                                        href={action.href}
                                        className={`group bg-gradient-to-br ${action.color} border ${action.borderColor} rounded-2xl p-4 lg:p-6 hover:scale-105 transition-all duration-300 ${action.isPrimary ? 'lg:col-span-2 lg:row-span-1' : ''
                                            }`}
                                    >
                                        <div className={`${action.iconBg} w-12 h-12 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform`}>
                                            <span className="text-2xl lg:text-4xl">{action.icon}</span>
                                        </div>
                                        <h3 className="text-base lg:text-lg font-bold text-white mb-1">
                                            {action.title}
                                        </h3>
                                        <p className="text-xs lg:text-sm text-gray-400">{action.subtitle}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Stats Overview */}
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span>📈</span>
                                <span>Tổng quan</span>
                            </h2>
                            <div className="grid grid-cols-3 gap-3 lg:gap-4">
                                {stats.map((stat, index) => (
                                    <div
                                        key={index}
                                        className={`bg-gradient-to-br ${stat.color} border rounded-2xl p-4 lg:p-6 text-center`}
                                    >
                                        <div className={`${stat.iconBg} w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                                            <span className="text-xl lg:text-2xl">{stat.icon}</span>
                                        </div>
                                        <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
                                            {stat.value}
                                        </div>
                                        <div className="text-xs lg:text-sm text-gray-400">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Requests */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span>🕐</span>
                                    <span>Yêu cầu gần đây</span>
                                </h2>
                                <Link
                                    href="/citizen/history"
                                    className="text-[#FF7700] hover:text-[#FF8800] text-sm font-bold transition-colors"
                                >
                                    Xem tất cả →
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {recentRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-5 hover:bg-white/10 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-sm text-gray-400">
                                                        #{request.id}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${request.statusColor}`}>
                                                        {request.statusText}
                                                    </span>
                                                </div>
                                                <h3 className="text-white font-bold mb-1">{request.type}</h3>
                                                <p className="text-gray-400 text-sm flex items-center gap-1">
                                                    <span>📍</span>
                                                    <span>{request.location}</span>
                                                </p>
                                            </div>
                                            <span className="text-xs text-gray-500">{request.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Emergency Contacts */}
                        <div className="bg-gradient-to-br from-red-500/10 to-pink-500/5 border border-red-500/20 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span>📞</span>
                                <span>Liên hệ khẩn cấp</span>
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {[
                                    { label: "Cấp cứu", number: "115", icon: "💊" },
                                    { label: "Cảnh sát", number: "113", icon: "👮" },
                                    { label: "Cứu hỏa", number: "114", icon: "🔥" },
                                    { label: "Cứu nạn", number: "1900", icon: "⛑️" }
                                ].map((contact, index) => (
                                    <a
                                        key={index}
                                        href={`tel:${contact.number}`}
                                        className="bg-white/5 border border-white/10 rounded-xl p-3 lg:p-4 text-center hover:bg-white/10 hover:scale-105 transition-all"
                                    >
                                        <div className="text-2xl lg:text-3xl mb-2">{contact.icon}</div>
                                        <div className="text-white font-bold text-sm lg:text-base mb-1">
                                            {contact.number}
                                        </div>
                                        <div className="text-gray-400 text-xs">{contact.label}</div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>

                <MobileBottomNav currentPath="/citizen" />
            </div>
        </div>
    );
}
