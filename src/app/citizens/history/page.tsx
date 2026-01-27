"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import API from "@/lib/services/apiClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RescueHistory {
    id: string;
    type: string;
    icon: string;
    status: "completed" | "pending" | "cancelled";
    date: string;
    time: string;
    location: string;
    description: string;
    numberOfPeople: number;
    responder?: string;
}

export default function HistoryPage() {
    const [filter, setFilter] = useState<"all" | "completed" | "pending" | "cancelled">("all");
    const [historyData, setHistoryData] = useState<RescueHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch history from API
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setIsLoading(true);
                const data = await API.citizen.getHistory() as RescueHistory[];
                setHistoryData(data);
            } catch (error) {
                console.error("Lỗi khi tải lịch sử:", error);
                setHistoryData(mockHistoryData);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Mock data
    const mockHistoryData: RescueHistory[] = [
        {
            id: "REQ001",
            type: "Cứu hộ khẩn cấp",
            icon: "🚨",
            status: "completed",
            date: "15/01/2025",
            time: "14:30",
            location: "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM",
            description: "Ngập lụt nghiêm trọng, nước cao 1.5m",
            numberOfPeople: 3,
            responder: "Đội cứu hộ A"
        },
        {
            id: "REQ002",
            type: "Yêu cầu cứu trợ",
            icon: "📦",
            status: "pending",
            date: "20/01/2025",
            time: "09:15",
            location: "45 Đường Lê Văn Sỹ, Quận 3, TP.HCM",
            description: "Cần thực phẩm và nước uống khẩn cấp",
            numberOfPeople: 5,
        },
        {
            id: "REQ003",
            type: "Báo cáo nguy hiểm",
            icon: "⚠️",
            status: "cancelled",
            date: "10/01/2025",
            time: "16:45",
            location: "789 Đường Võ Văn Tần, Quận 1, TP.HCM",
            description: "Đã tự giải quyết được",
            numberOfPeople: 2,
        }
    ];

    const statusConfig = {
        completed: {
            label: "Hoàn thành",
            variant: "default" as const,
            color: "text-green-600",
            bg: "bg-green-50"
        },
        pending: {
            label: "Đang xử lý",
            variant: "secondary" as const,
            color: "text-yellow-600",
            bg: "bg-yellow-50"
        },
        cancelled: {
            label: "Đã hủy",
            variant: "outline" as const,
            color: "text-gray-600",
            bg: "bg-gray-50"
        }
    };

    const filterTabs = [
        { id: "all" as const, label: "Tất cả", icon: "📋" },
        { id: "completed" as const, label: "Hoàn thành", icon: "✅" },
        { id: "pending" as const, label: "Đang xử lý", icon: "⏳" },
        { id: "cancelled" as const, label: "Đã hủy", icon: "❌" }
    ];

    const filteredData = filter === "all"
        ? historyData
        : historyData.filter(item => item.status === filter);

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">Lịch sử yêu cầu</h1>
                <p className="text-gray-400">Xem lại các yêu cầu cứu hộ và cứu trợ của bạn</p>
            </div>

            {/* Filter Tabs */}
            <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                        {filterTabs.map((tab) => (
                            <Button
                                key={tab.id}
                                variant={filter === tab.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter(tab.id)}
                                className={filter === tab.id ? "bg-primary hover:bg-primary/90" : "bg-white/5 hover:bg-white/10 border-white/20"}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                                <Badge variant="secondary" className="ml-2 bg-white/10">
                                    {tab.id === "all"
                                        ? historyData.length
                                        : historyData.filter(item => item.status === tab.id).length
                                    }
                                </Badge>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* History List */}
            <div className="space-y-4">
                {isLoading ? (
                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-12 text-center">
                            <div className="text-4xl mb-4 animate-pulse">⏳</div>
                            <p className="text-gray-400">Đang tải lịch sử...</p>
                        </CardContent>
                    </Card>
                ) : filteredData.length === 0 ? (
                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-12 text-center">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-gray-400 text-lg">Chưa có lịch sử nào</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredData.map((item) => (
                        <Card key={item.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                            <CardHeader>
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-3xl">
                                        {item.icon}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <CardTitle className="text-lg text-white">{item.type}</CardTitle>
                                            <Badge
                                                variant={statusConfig[item.status].variant}
                                                className={`${statusConfig[item.status].bg} ${statusConfig[item.status].color}`}
                                            >
                                                {statusConfig[item.status].label}
                                            </Badge>
                                        </div>

                                        <CardDescription className="text-gray-400 flex items-center gap-2 text-xs">
                                            <span>🆔 {item.id}</span>
                                            <span>•</span>
                                            <span>📅 {item.date}</span>
                                            <span>•</span>
                                            <span>🕐 {item.time}</span>
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-2 text-sm text-gray-300">
                                    <span className="text-base">📍</span>
                                    <span className="flex-1">{item.location}</span>
                                </div>

                                <p className="text-sm text-gray-400">{item.description}</p>

                                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <span>👥</span>
                                            <span>{item.numberOfPeople} người</span>
                                        </div>
                                        {item.responder && (
                                            <div className="flex items-center gap-1">
                                                <span>🚑</span>
                                                <span>{item.responder}</span>
                                            </div>
                                        )}
                                    </div>
                                    <Button variant="link" size="sm" className="text-primary">
                                        Chi tiết →
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
