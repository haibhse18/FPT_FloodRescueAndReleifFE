"use client";

import { useState } from "react";
import Link from "next/link";

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
    const [notifications, setNotifications] = useState<Notification[]>([
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
            actionLink: "/citizen/safety-guide"
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
            actionLink: "/citizen/safety-guide"
        }
    ]);

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
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white/5 border-r border-white/10">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-2xl font-bold text-white">Cứu hộ Lũ lụt</h1>
                    <p className="text-sm text-gray-400 mt-1">FPT Flood Rescue</p>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        <li>
                            <Link href="/citizen" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 transition">
                                <span className="text-xl">🏠</span>
                                <span>Trang chủ</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/citizen/history" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 transition">
                                <span className="text-xl">📜</span>
                                <span>Lịch sử</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/citizen/notifications" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white font-semibold">
                                <span className="text-xl">🔔</span>
                                <span>Thông báo</span>
                                {unreadCount > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        </li>
                        <li>
                            <Link href="/citizen/profile" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 transition">
                                <span className="text-xl">👤</span>
                                <span>Cá nhân</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                            U
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-white">User Account</p>
                            <p className="text-xs text-gray-400">Citizen</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-50 bg-secondary/80 backdrop-blur-md border-b border-white/10">
                    <div className="flex items-center justify-between p-4">
                        <Link href="/citizen" className="w-10 h-10 flex items-center justify-center text-white">
                            <span className="text-2xl">←</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-white">Thông báo</h2>
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="w-10 h-10"></div>
                    </div>
                </header>

                {/* Desktop Header */}
                <header className="hidden lg:flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            Thông báo
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-sm font-bold rounded-full px-3 py-1">
                                    {unreadCount} mới
                                </span>
                            )}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Cập nhật mới nhất về cứu hộ và an toàn</p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="px-4 py-2 rounded-lg bg-white/5 text-primary hover:bg-white/10 transition text-sm font-bold"
                        >
                            Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </header>

                <main className="flex-1 overflow-y-auto">
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
                            {filteredNotifications.length === 0 ? (
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

                {/* Mobile Bottom Navigation */}
                <nav className="lg:hidden sticky bottom-0 bg-secondary/90 backdrop-blur-lg border-t border-white/10 pb-6 pt-2">
                    <div className="flex justify-around items-center">
                        <Link href="/citizen" className="flex flex-col items-center gap-1 text-gray-400">
                            <span className="text-2xl">🏠</span>
                            <span className="text-[10px] font-bold">TRANG CHỦ</span>
                        </Link>
                        <Link href="/citizen/history" className="flex flex-col items-center gap-1 text-gray-400">
                            <span className="text-2xl">📜</span>
                            <span className="text-[10px] font-bold">LỊCH SỬ</span>
                        </Link>
                        <Link href="/citizen/notifications" className="flex flex-col items-center gap-1 text-primary relative">
                            <span className="text-2xl">🔔</span>
                            <span className="text-[10px] font-bold">THÔNG BÁO</span>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 right-0 bg-red-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                        <Link href="/citizen/profile" className="flex flex-col items-center gap-1 text-gray-400">
                            <span className="text-2xl">👤</span>
                            <span className="text-[10px] font-bold">CÁ NHÂN</span>
                        </Link>
                    </div>
                </nav>
            </div>
        </div>
    );
}
