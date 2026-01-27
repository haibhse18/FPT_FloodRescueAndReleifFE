"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import API from "@/lib/services/apiClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
            message: "Đội cứu hộ A đã hoàn thành nhiệm vụ cứu hộ tại 123 Đường Nguyễn Văn Cừ.",
            timestamp: "2 giờ trước",
            isRead: false,
            actionLabel: "Xem chi tiết",
            actionLink: "/citizens/history"
        },
        {
            id: "NOTIF002",
            type: "emergency",
            title: "Cảnh báo lũ lụt nghiêm trọng",
            message: "Mực nước đang dâng cao. Hãy di chuyển đến nơi an toàn ngay lập tức!",
            timestamp: "30 phút trước",
            isRead: false,
            actionLabel: "Gửi yêu cầu cứu hộ",
            actionLink: "/citizens"
        },
        {
            id: "NOTIF003",
            type: "info",
            title: "Hướng dẫn an toàn mới",
            message: "Đã có hướng dẫn mới về cách ứng phó với lũ lụt. Xem ngay!",
            timestamp: "1 ngày trước",
            isRead: true,
            actionLabel: "Đọc hướng dẫn",
            actionLink: "/citizens/safety-guide"
        },
        {
            id: "NOTIF004",
            type: "warning",
            title: "Cập nhật trạng thái yêu cầu",
            message: "Yêu cầu cứu trợ #REQ002 đang được xử lý bởi đội cứu hộ B.",
            timestamp: "3 ngày trước",
            isRead: true
        }
    ];

    const notificationConfig = {
        success: {
            icon: "✅",
            color: "text-green-600",
            bg: "bg-green-50",
            border: "border-green-200"
        },
        warning: {
            icon: "⚠️",
            color: "text-yellow-600",
            bg: "bg-yellow-50",
            border: "border-yellow-200"
        },
        info: {
            icon: "ℹ️",
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-200"
        },
        emergency: {
            icon: "🚨",
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-200"
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, isRead: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, isRead: true }))
        );
    };

    const filteredNotifications = filter === "all"
        ? notifications
        : notifications.filter(notif => !notif.isRead);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white">Thông báo</h1>
                    <p className="text-gray-400">
                        {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : "Không có thông báo mới"}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAsRead}
                        className="bg-white/5 hover:bg-white/10 border-white/20"
                    >
                        Đánh dấu tất cả đã đọc
                    </Button>
                )}
            </div>

            {/* Filter Tabs */}
            <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                    <div className="flex gap-2">
                        <Button
                            variant={filter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter("all")}
                            className={filter === "all" ? "bg-primary hover:bg-primary/90" : "bg-white/5 hover:bg-white/10 border-white/20"}
                        >
                            Tất cả
                            <Badge variant="secondary" className="ml-2 bg-white/10">
                                {notifications.length}
                            </Badge>
                        </Button>
                        <Button
                            variant={filter === "unread" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter("unread")}
                            className={filter === "unread" ? "bg-primary hover:bg-primary/90" : "bg-white/5 hover:bg-white/10 border-white/20"}
                        >
                            Chưa đọc
                            <Badge variant="secondary" className="ml-2 bg-white/10">
                                {unreadCount}
                            </Badge>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications List */}
            <div className="space-y-3">
                {isLoading ? (
                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-12 text-center">
                            <div className="text-4xl mb-4 animate-pulse">⏳</div>
                            <p className="text-gray-400">Đang tải thông báo...</p>
                        </CardContent>
                    </Card>
                ) : filteredNotifications.length === 0 ? (
                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-12 text-center">
                            <div className="text-6xl mb-4">🔔</div>
                            <p className="text-gray-400 text-lg">Không có thông báo nào</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredNotifications.map((notif) => (
                        <Card
                            key={notif.id}
                            className={`border-white/10 transition-all hover:scale-[1.01] ${notif.isRead ? "bg-white/5" : "bg-white/10"
                                } ${!notif.isRead && "border-l-4 border-l-primary"}`}
                            onClick={() => markAsRead(notif.id)}
                        >
                            <CardHeader>
                                <div className="flex items-start gap-3">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notificationConfig[notif.type].bg} ${notificationConfig[notif.type].border} border`}>
                                        <span className="text-2xl">{notificationConfig[notif.type].icon}</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-1">
                                            <CardTitle className={`text-base ${notif.isRead ? "text-gray-300" : "text-white"}`}>
                                                {notif.title}
                                            </CardTitle>
                                            {!notif.isRead && (
                                                <Badge variant="default" className="bg-primary text-white">
                                                    Mới
                                                </Badge>
                                            )}
                                        </div>
                                        <CardDescription className="text-gray-400 text-xs">
                                            {notif.timestamp}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <p className={`text-sm ${notif.isRead ? "text-gray-400" : "text-gray-300"}`}>
                                    {notif.message}
                                </p>

                                {notif.actionLabel && notif.actionLink && (
                                    <Link href={notif.actionLink}>
                                        <Button variant="link" size="sm" className="text-primary p-0 h-auto">
                                            {notif.actionLabel} →
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
