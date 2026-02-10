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
    const [currentLocation, setCurrentLocation] = useState("Đang tải vị trí...");
    const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

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

        // Get current location
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setCoordinates({ lat: latitude, lon: longitude });
                    
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                        );
                        const data = await response.json();
                        const location = data.address?.city || data.address?.town || data.display_name.split(",")[0];
                        setCurrentLocation(location);
                    } catch (error) {
                        setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    }
                },
                () => {
                    setCurrentLocation("Không thể lấy vị trí");
                }
            );
        }
    }, []);

    const quickActions = [
        {
            id: "rescue",
            icon: "🚑",
            title: "Yêu cầu cứu trợ",
            subtitle: "Thực phẩm, thuốc men",
            href: "/citizen/request",
            color: "bg-[#8F8D87] hover:bg-[#9e9c96]"
        },
        {
            id: "danger",
            icon: "⚠️",
            title: "Báo cáo nguy hiểm",
            subtitle: "Sạt lở, nước dâng",
            href: "/citizen/request",
            color: "bg-[#8F8D87] hover:bg-[#9e9c96]"
        },
        {
            id: "guide",
            icon: "📖",
            title: "Hướng dẫn an toàn",
            subtitle: "Kỹ năng sinh tồn",
            href: "/citizen/guide",
            color: "bg-[#8F8D87] hover:bg-[#9e9c96]"
        }
    ];

    return (
        <div className="min-h-screen bg-[#133249] flex flex-col lg:flex-row">
            <DesktopSidebar />

            <div className="flex-1 flex flex-col lg:ml-64">
                {/* Fixed Header Banner */}
                <header className="sticky top-0 z-50 p-6 border-b border-white/10 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent backdrop-blur-md">
                    <div className="max-w-7xl mx-auto flex justify-between items-start">
                        <div className="flex flex-col gap-3">
                            <h1 className="text-white text-3xl lg:text-4xl font-extrabold tracking-tight leading-none uppercase">
                                Cứu hộ<br/>Lũ lụt
                            </h1>
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full w-fit">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                <span className="text-sm font-semibold text-white">Hệ thống trực tuyến</span>
                            </div>
                        </div>
                        <span className="text-5xl">🌊</span>
                    </div>
                </header>

                <main className="pb-24 lg:pb-0 overflow-auto">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                         style={{backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px"}}></div>

                    <div className="relative p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
                        {/* Hero SOS Section */}
                        <div className="flex flex-col items-center justify-center py-8 lg:py-12">
                            <div className="text-center mb-8">
                                <p className="text-[#FF7700] font-bold text-2xl lg:text-3xl mb-2">CẦN HỖ TRỢ NGAY?</p>
                                <p className="text-slate-300 text-base lg:text-lg">
                                    Bấm nút bên dưới để gửi tín hiệu cấp cứu và vị trí của bạn
                                </p>
                            </div>

                            {/* SOS Button with Ripple Effect */}
                            <div className="relative flex items-center justify-center">
                                {/* Ripple layers */}
                                <div className="absolute w-64 h-64 lg:w-80 lg:h-80 rounded-full border border-red-500/30 animate-ping-slow"></div>
                                <div className="absolute w-52 h-52 lg:w-64 lg:h-64 rounded-full border border-red-500/50 animate-ping" style={{animationDuration: "3s", animationDelay: "1s"}}></div>
                                
                                <Link
                                    href="/citizen/request"
                                    className="sos-pulse relative w-48 h-48 lg:w-56 lg:h-56 rounded-full bg-[#FF3535] border-4 border-white shadow-[0_0_40px_rgba(255,53,53,0.7)] flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform z-20 group cursor-pointer hover:bg-red-600"
                                >
                                    <span className="text-6xl lg:text-7xl mb-2">📶</span>
                                    <span className="text-2xl lg:text-3xl font-black tracking-wider text-white">CỨU HỘ</span>
                                    <span className="text-base lg:text-lg font-bold tracking-widest text-white">KHẨN CẤP</span>
                                </Link>
                            </div>
                        </div>

                        {/* Quick Options Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-white font-bold text-xl lg:text-2xl">Lựa chọn nhanh</h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {quickActions.map((action) => (
                                    <Link
                                        key={action.id}
                                        href={action.href}
                                        className={`${action.color} rounded-xl p-5 flex items-center gap-4 shadow-lg transition-all cursor-pointer group`}
                                    >
                                        <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center text-3xl group-hover:bg-white/30 transition-colors">
                                            {action.icon}
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className="text-white font-bold text-lg leading-tight">{action.title}</span>
                                            <span className="text-white/80 text-sm">{action.subtitle}</span>
                                        </div>
                                        <span className="text-white/50 text-2xl">›</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Location Bar */}
                        <div className="bg-slate-200 rounded-xl p-5 shadow-lg border-l-4 border-[#FF7700]">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <span className="text-xl">📍</span>
                                    <span className="text-sm font-bold uppercase tracking-wide">Vị trí hiện tại</span>
                                </div>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="text-[#FF3535] text-sm font-bold uppercase hover:underline"
                                >
                                    Cập nhật
                                </button>
                            </div>
                            <p className="text-slate-800 text-lg font-bold mb-2">{currentLocation}</p>
                            {coordinates && (
                                <div className="text-xs text-slate-500 font-mono">
                                    Lat: {coordinates.lat.toFixed(4)} • Long: {coordinates.lon.toFixed(4)}
                                </div>
                            )}
                        </div>

                        {/* Emergency Contacts */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
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
                                        className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 hover:scale-105 transition-all"
                                    >
                                        <div className="text-3xl mb-2">{contact.icon}</div>
                                        <div className="text-white font-bold text-lg mb-1">{contact.number}</div>
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
