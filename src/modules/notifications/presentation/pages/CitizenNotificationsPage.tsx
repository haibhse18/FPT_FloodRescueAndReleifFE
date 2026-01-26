"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import API from "@/services/api";
import { MobileHeader, MobileBottomNav, DesktopHeader, DesktopSidebar } from "@/shared/components/layout";

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

export default function CitizenNotificationsPage() {
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setIsLoading(true);
                const data = await API.citizen.getNotifications() as Notification[];
                setNotifications(data);
            } catch (error) {
                console.error("Lỗi khi tải thông báo:", error);
                setNotifications(mockNotifications);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const mockNotifications: Notification[] = [
        {
            id: "NOTIF001",
            type: "success",
            title: "Yêu cầu cứu hộ đã hoàn thành",
            message: "Yêu cầu cứu hộ #REQ001 của bạn đã được xử lý thành công bởi Đội cứu hộ A. Cảm ơn bạn đã sử dụng dịch vụ!",
            timestamp: "2 giờ trước",
            isRead: false,
            actionLabel: "Xem chi tiết",
            actionLink: "/citizen/history"
        },
        {
            id: "NOTIF002",
            type: "emergency",
            title: "Cảnh báo lũ lụt nghiêm trọng",
            message: "Khu vực Quận 5 đang có nguy cơ ngập lụt cao. Hãy di chuyển đến nơi an toàn và chuẩn bị đồ cứu sinh.",
            timestamp: "5 giờ trước",
            isRead: false,
            actionLabel: "Hướng dẫn an toàn",
            actionLink: "/citizen/guide"
        },
        {
            id: "NOTIF003",
            type: "info",
            title: "Cập nhật trạng thái yêu cầu",
            message: "Yêu cầu #REQ003 của bạn đang được xử lý. Đội cứu hộ sẽ đến trong vòng 30 phút.",
            timestamp: "1 ngày trước",
            isRead: true,
            actionLabel: "Theo dõi",
            actionLink: "/citizen/history"
        }
    ];

    const markAsRead = async (id: string) => {
        try {
            await API.citizen.markNotificationAsRead(id);
            setNotifications(notifications.map(n => 
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await API.citizen.markAllNotificationsAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const filteredNotifications = filter === "all" 
        ? notifications 
        : notifications.filter(n => !n.isRead);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getNotificationStyle = (type: string) => {
        switch (type) {
            case "success": return { bg: "bg-green-500/10", border: "border-green-500/30", icon: "✅" };
            case "warning": return { bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: "⚠️" };
            case "emergency": return { bg: "bg-red-500/10", border: "border-red-500/30", icon: "🚨" };
            default: return { bg: "bg-blue-500/10", border: "border-blue-500/30", icon: "ℹ️" };
        }
    };

    return (
        <div className="min-h-screen bg-secondary flex flex-col lg:flex-row">
            <DesktopSidebar />
            
            <div className="flex-1 flex flex-col lg:ml-64">
                <MobileHeader />
                <DesktopHeader title="Thông báo" subtitle="Cập nhật mới nhất về cứu hộ và an toàn" />

                <main className="pt-[73px] lg:pt-[89px] pb-24 lg:pb-0 overflow-auto">
                    <div className="max-w-4xl mx-auto p-4 lg:p-8">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setFilter("all")}
                                    className={`px-4 py-2 rounded-xl font-bold transition ${
                                        filter === "all" 
                                            ? "bg-primary text-white" 
                                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                                    }`}
                                >
                                    Tất cả ({notifications.length})
                                </button>
                                <button
                                    onClick={() => setFilter("unread")}
                                    className={`px-4 py-2 rounded-xl font-bold transition relative ${
                                        filter === "unread" 
                                            ? "bg-primary text-white" 
                                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                                    }`}
                                >
                                    Chưa đọc ({unreadCount})
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                    )}
                                </button>
                            </div>

                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-primary hover:text-primary/80 font-bold"
                                >
                                    Đánh dấu tất cả đã đọc
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        {isLoading ? (
                            <div className="space-y-4 animate-pulse">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 h-32" />
                                ))}
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">📭</div>
                                <h3 className="text-xl font-bold text-white mb-2">Không có thông báo</h3>
                                <p className="text-gray-400">
                                    {filter === "unread" ? "Bạn đã đọc tất cả thông báo" : "Chưa có thông báo mới"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredNotifications.map(notification => {
                                    const style = getNotificationStyle(notification.type);
                                    return (
                                        <div
                                            key={notification.id}
                                            onClick={() => !notification.isRead && markAsRead(notification.id)}
                                            className={`${style.bg} border ${style.border} rounded-xl p-6 transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                                                !notification.isRead ? "ring-2 ring-primary/20" : ""
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="text-3xl">{style.icon}</div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h3 className="text-lg font-bold text-white">{notification.title}</h3>
                                                        {!notification.isRead && (
                                                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                                                        )}
                                                    </div>
                                                    <p className="text-gray-300 mb-3">{notification.message}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-400">{notification.timestamp}</span>
                                                        {notification.actionLabel && notification.actionLink && (
                                                            <Link
                                                                href={notification.actionLink}
                                                                className="text-sm font-bold text-primary hover:text-primary/80"
                                                            >
                                                                {notification.actionLabel} →
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>

                <MobileBottomNav />
            </div>
        </div>
    );
}
