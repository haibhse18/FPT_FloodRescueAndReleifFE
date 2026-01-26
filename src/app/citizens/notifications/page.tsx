"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import API from "@/lib/services/api";
import MobileHeader from "@/app/components/layout/MobileHeader";
import MobileBottomNav from "@/app/components/layout/MobileBottomNav";
import DesktopHeader from "@/app/components/layout/DesktopHeader";
import DesktopSidebar from "@/app/components/layout/DesktopSidebar";

interface Notification {
    id: string;
    type: "success" | "warning" | "info" | "emergency";
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    actionLabel?: string;
    actionLink?: string;
}

export default function NotificationsPage() {
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch notifications from API
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setIsLoading(true);
                const data = await API.citizen.getNotifications() as Notification[];
                setNotifications(data);
            } catch (error) {
                console.error("Lỗi khi tải thông báo:", error);
                // Fallback to mock data on error
                setNotifications(mockNotifications);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    // Mock data fallback
    const mockNotifications: Notification[] = [
        {
            id: "NOTIF001",
            type: "success",
            title: "Yêu cầu cứu hộ đã hoàn thành",
            message: "Yêu cầu cứu hộ #REQ001 của bạn đã được xử lý thành công bởi Đội cứu hộ A. Cảm ơn bạn đã sử dụng dịch vụ!",
            timestamp: "2 giờ trước",
            isRead: false,
            actionLabel: "Xem chi tiết",
            actionLink: "/citizens/history"
        },
        {
            id: "NOTIF002",
            type: "emergency",
            title: "Cảnh báo lũ lụt nghiêm trọng",
            message: "Khu vực Quận 5 đang có nguy cơ ngập lụt cao. Hãy di chuyển đến nơi an toàn và chuẩn bị đồ cứu sinh.",
            timestamp: "5 giờ trước",
            isRead: false,
            actionLabel: "Hướng dẫn an toàn",
            actionLink: "/citizens/safety-guide"
        },
        {
            id: "NOTIF003",
            type: "info",
            title: "Cập nhật trạng thái yêu cầu",
            message: "Yêu cầu #REQ003 của bạn đang được xử lý. Đội cứu hộ sẽ đến trong vòng 30 phút.",
            timestamp: "1 ngày trước",
            isRead: true,
            actionLabel: "Theo dõi",
            actionLink: "/citizens/history"
        },
        {
            id: "NOTIF004",
            type: "warning",
            title: "Thời tiết xấu sắp tới",
            message: "Dự báo mưa lớn trong 24 giờ tới. Hãy chuẩn bị đồ dùng cần thiết và theo dõi thông báo.",
            timestamp: "1 ngày trước",
            isRead: true
        },
        {
            id: "NOTIF005",
            type: "success",
            title: "Hệ thống đã nhận được yêu cầu",
            message: "Yêu cầu cứu trợ thực phẩm #REQ002 đã được gửi thành công. Chúng tôi sẽ xử lý trong thời gian sớm nhất.",
            timestamp: "2 ngày trước",
            isRead: true
        },
        {
            id: "NOTIF006",
            type: "info",
            title: "Mẹo an toàn mùa mưa bão",
            message: "Tìm hiểu các kỹ năng sinh tồn và cách bảo vệ bản thân trong mùa mưa lũ.",
            timestamp: "3 ngày trước",
            isRead: true,
            actionLabel: "Xem thêm",
            actionLink: "/citizens/safety-guide"
        }
    ];

    const typeConfig = {
        success: {
            icon: "✅",
            color: "text-green-500",
            bg: "bg-green-500/10",
            border: "border-green-500/30"
        },
        warning: {
            icon: "⚠️",
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/30"
        },
        info: {
            icon: "ℹ️",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/30"
        },
        emergency: {
            icon: "🚨",
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "border-red-500/30"
        }
    };

    const filteredNotifications = filter === "unread"
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, isRead: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    return (
        <div className="min-h-screen bg-secondary flex flex-col lg:flex-row">
            <DesktopSidebar userName="User Account" userRole="Citizen" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64">
                <MobileHeader onLocationClick={() => { }} />

                <DesktopHeader
                    title="Thông báo"
                    subtitle="Cập nhật mới nhất về cứu hộ và an toàn"
                />

                <main className="flex-1 overflow-y-auto pt-[73px] lg:pt-[89px] pb-24 lg:pb-0">
                    <div className="max-w-4xl mx-auto p-4 lg:p-8">
                        {/* Filter Tabs */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilter("all")}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition ${filter === "all"
                                        ? "bg-primary text-white"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                                        }`}
                                >
                                    Tất cả ({notifications.length})
                                </button>
                                <button
                                    onClick={() => setFilter("unread")}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition ${filter === "unread"
                                        ? "bg-primary text-white"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                                        }`}
                                >
                                    Chưa đọc ({unreadCount})
                                </button>
                            </div>

                            {/* Mark all as read - Mobile */}
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="lg:hidden text-xs text-primary font-bold"
                                >
                                    Đánh dấu tất cả
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="space-y-3">
                            {isLoading ? (
                                // Loading skeleton
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/10"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                                                    <div className="h-3 bg-white/10 rounded w-3/4"></div>
                                                    <div className="h-3 bg-white/10 rounded w-1/4"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">🔕</div>
                                    <p className="text-gray-400 text-lg">Không có thông báo nào</p>
                                </div>
                            ) : (
                                filteredNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => markAsRead(notification.id)}
                                        className={`relative bg-white/5 border rounded-xl p-4 transition-all duration-200 cursor-pointer ${notification.isRead
                                            ? "border-white/10 hover:bg-white/10"
                                            : "border-white/20 bg-white/10 hover:bg-white/15"
                                            }`}
                                    >
                                        {/* Unread indicator */}
                                        {!notification.isRead && (
                                            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                        )}

                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${typeConfig[notification.type].bg} border ${typeConfig[notification.type].border}`}>
                                                {typeConfig[notification.type].icon}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                {/* Title */}
                                                <h3 className={`text-base font-bold mb-1 ${notification.isRead ? "text-gray-300" : "text-white"
                                                    }`}>
                                                    {notification.title}
                                                </h3>

                                                {/* Message */}
                                                <p className={`text-sm mb-2 ${notification.isRead ? "text-gray-500" : "text-gray-400"
                                                    }`}>
                                                    {notification.message}
                                                </p>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between gap-3 mt-3">
                                                    <span className="text-xs text-gray-500">
                                                        🕐 {notification.timestamp}
                                                    </span>
                                                    {notification.actionLabel && notification.actionLink && (
                                                        <Link
                                                            href={notification.actionLink}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className={`text-xs font-bold hover:underline ${typeConfig[notification.type].color}`}
                                                        >
                                                            {notification.actionLabel} →
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </main>

                <MobileBottomNav
                    items={[
                        { icon: "🏠", label: "TRANG CHỦ", href: "/citizens" },
                        { icon: "📜", label: "LỊCH SỬ", href: "/citizens/history" },
                        { icon: "🔔", label: "THÔNG BÁO", href: "/citizens/notifications" },
                        { icon: "👤", label: "CÁ NHÂN", href: "/citizens/profile" },
                    ]}
                    currentPath="/citizens/notifications"
                />
            </div>
        </div>
    );
}
