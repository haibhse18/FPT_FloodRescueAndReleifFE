"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamic import cho LeafletMap để tránh SSR issues
const LeafletMap = dynamic(() => import("@/app/components/LeafletMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
            <p className="text-gray-400">Đang tải bản đồ...</p>
        </div>
    ),
});

export default function CitizenHomePage() {
    const [currentLocation, setCurrentLocation] = useState("Đang tải vị trí...");
    const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    // Lấy vị trí hiện tại khi component mount
    useEffect(() => {
        getCurrentLocation();
    }, []);

    // Hàm lấy vị trí hiện tại
    const getCurrentLocation = () => {
        setIsLoadingLocation(true);

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setCoordinates({ lat: latitude, lon: longitude });

                    // Gọi API Openmap.vn để lấy địa chỉ từ tọa độ
                    await getAddressFromOpenMap(latitude, longitude);
                    setIsLoadingLocation(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setCurrentLocation("Không thể lấy vị trí");
                    setIsLoadingLocation(false);
                }
            );
        } else {
            setCurrentLocation("Trình duyệt không hỗ trợ GPS");
            setIsLoadingLocation(false);
        }
    };

    // Hàm gọi API Openmap.vn để chuyển đổi tọa độ thành địa chỉ
    const getAddressFromOpenMap = async (lat: number, lon: number) => {
        try {
            // Gọi API route của Next.js thay vì gọi trực tiếp (tránh CORS)
            const response = await fetch(
                `/api/reverse-geocode?lat=${lat}&lng=${lon}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();

                // Xử lý dữ liệu từ API Openmap.vn
                if (data && data.address) {
                    const address = data.address;
                    // Tạo địa chỉ đầy đủ
                    const locationParts = [
                        address.ward,
                        address.district,
                        address.city || address.province
                    ].filter(Boolean);

                    setCurrentLocation(locationParts.join(", ") || "Việt Nam");
                } else {
                    setCurrentLocation(`Tọa độ: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
                }
            } else {
                // Nếu API lỗi, hiển thị tọa độ
                setCurrentLocation(`Tọa độ: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
            }
        } catch (error) {
            console.error("Error fetching address from Openmap:", error);
            setCurrentLocation(`Tọa độ: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        }
    };

    const quickActions = [
        {
            icon: "🍚",
            title: "Cứu trợ thực phẩm",
            description: "Yêu cầu cơm, nước uống khẩn cấp",
            color: "orange",
            href: "/citizen/request-food",
        },
        {
            icon: "⚠️",
            title: "Báo cáo nguy hiểm",
            description: "Sạt lở, nước dâng cao, điện hở",
            color: "red",
            href: "/citizen/report-danger",
        },
        {
            icon: "🛡️",
            title: "Hướng dẫn an toàn",
            description: "Kỹ năng sinh tồn khi có lũ",
            color: "blue",
            href: "/citizen/safety-guide",
        },
    ];

    const navItems = [
        { icon: "🏠", label: "TRANG CHỦ", active: true },
        { icon: "📜", label: "LỊCH SỬ", active: false },
        { icon: "🔔", label: "THÔNG BÁO", active: false },
        { icon: "👤", label: "CÁ NHÂN", active: false },
    ];

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
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white font-semibold">
                                <span className="text-xl">🏠</span>
                                <span>Trang chủ</span>
                            </button>
                        </li>
                        <li>
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 transition">
                                <span className="text-xl">📜</span>
                                <span>Lịch sử</span>
                            </button>
                        </li>
                        <li>
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 transition">
                                <span className="text-xl">🔔</span>
                                <span>Thông báo</span>
                            </button>
                        </li>
                        <li>
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 transition">
                                <span className="text-xl">👤</span>
                                <span>Cá nhân</span>
                            </button>
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
                        <button className="w-10 h-10 flex items-center justify-center text-white">
                            <span className="text-2xl">☰</span>
                        </button>
                        <h2 className="text-lg font-bold text-white">Cứu hộ Lũ lụt</h2>
                        <button className="w-10 h-10 flex items-center justify-center">
                            <span className="text-primary text-2xl">📍</span>
                        </button>
                    </div>
                </header>

                {/* Desktop Header */}
                <header className="hidden lg:flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Trang chủ</h2>
                        <p className="text-gray-400 text-sm mt-1">Chào mừng đến với hệ thống cứu hộ</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-500 text-sm font-bold">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            HỆ THỐNG TRỰC TUYẾN
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition">
                            <span className="text-xl">📍</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto p-4 lg:p-8">
                        {/* Status Indicator - Mobile Only */}
                        <div className="flex justify-center mb-6 lg:hidden">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold uppercase tracking-widest">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Hệ thống trực tuyến
                            </div>
                        </div>

                        {/* Desktop Grid Layout */}
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Left Column - Emergency Section */}
                            <div className="flex flex-col">
                                {/* Headline */}
                                <div className="mb-8">
                                    <h2 className="text-3xl lg:text-4xl font-bold text-white text-center lg:text-left uppercase">
                                        Cần hỗ trợ ngay?
                                    </h2>
                                    <p className="text-gray-400 text-sm lg:text-base mt-3 text-center lg:text-left">
                                        Nhấn nút bên dưới để gửi tín hiệu cấp cứu và vị trí của bạn tới đội cứu hộ.
                                    </p>
                                </div>

                                {/* Emergency Button */}
                                <div className="flex-1 flex items-center justify-center py-8 lg:py-12">
                                    <button className="group relative flex flex-col items-center justify-center w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-red-600 text-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(220,38,38,0.4)]">
                                        <div className="absolute inset-0 rounded-full border-4 border-red-300/60 scale-110 animate-pulse"></div>
                                        <span className="text-7xl lg:text-8xl mb-3">🚨</span>
                                        <span className="text-2xl lg:text-3xl font-black tracking-tight text-center px-6 leading-none">
                                            CỨU HỘ<br />KHẨN CẤP
                                        </span>
                                    </button>
                                </div>

                                {/* Location Info */}
                                <div className="mt-6 p-4 lg:p-5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-2xl shrink-0">
                                            {isLoadingLocation ? "⏳" : "📍"}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                                                Vị trí hiện tại
                                            </p>
                                            <p className="text-sm lg:text-base font-medium text-white mt-1 truncate">
                                                {currentLocation}
                                            </p>
                                            {coordinates && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    GPS: {coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={getCurrentLocation}
                                        disabled={isLoadingLocation}
                                        className="text-xs lg:text-sm font-bold text-primary px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ml-3"
                                    >
                                        {isLoadingLocation ? "..." : "CẬP NHẬT"}
                                    </button>
                                </div>

                                {/* Small Map Display - Below Location Info */}
                                {coordinates && (
                                    <div className="mt-4 h-48 rounded-xl overflow-hidden">
                                        <LeafletMap
                                            latitude={coordinates.lat}
                                            longitude={coordinates.lon}
                                            address={currentLocation}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Quick Actions */}
                            <div className="flex flex-col">
                                <h3 className="text-xl lg:text-2xl font-bold text-white mb-6">
                                    Lựa chọn nhanh
                                </h3>

                                <div className="flex flex-col gap-4">
                                    {quickActions.map((action, index) => (
                                        <Link
                                            key={index}
                                            href={action.href}
                                            className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                                        >
                                            <div
                                                className={`flex items-center justify-center rounded-xl shrink-0 w-14 h-14 text-3xl ${action.color === "orange"
                                                    ? "bg-orange-500/10"
                                                    : action.color === "red"
                                                        ? "bg-red-500/10"
                                                        : "bg-blue-500/10"
                                                    }`}
                                            >
                                                {action.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-base lg:text-lg font-bold text-white mb-1">
                                                    {action.title}
                                                </p>
                                                <p className="text-gray-400 text-sm">
                                                    {action.description}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-gray-500">
                                                <span className="text-2xl">›</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Additional Info Cards */}
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className="text-3xl mb-2">📊</div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">
                                            Yêu cầu
                                        </p>
                                        <p className="text-2xl font-bold text-white mt-1">0</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className="text-3xl mb-2">✅</div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">
                                            Hoàn thành
                                        </p>
                                        <p className="text-2xl font-bold text-white mt-1">0</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="lg:hidden sticky bottom-0 bg-secondary/90 backdrop-blur-lg border-t border-white/10 pb-6 pt-2">
                    <div className="flex justify-around items-center">
                        {navItems.map((item, index) => (
                            <button
                                key={index}
                                className={`flex flex-col items-center gap-1 ${item.active ? "text-primary" : "text-gray-400"
                                    }`}
                            >
                                <span className="text-2xl">{item.icon}</span>
                                <span className="text-[10px] font-bold">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </nav>
            </div>
        </div>
    );
}
