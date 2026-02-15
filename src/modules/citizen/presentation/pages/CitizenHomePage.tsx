"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import "@openmapvn/openmapvn-gl/dist/maplibre-gl.css";
import { MobileHeader, MobileBottomNav, DesktopHeader, DesktopSidebar } from "@/shared/components/layout";
import { GetCurrentUserUseCase } from "@/modules/auth/application/getCurrentUser.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";

// Dynamic import cho OpenMap để tránh SSR issues
const OpenMap = dynamic(() => import("@/modules/map/presentation/components/OpenMap"), {
    ssr: false,
    loading: () => <div className="w-full h-48 bg-slate-300 rounded-lg animate-pulse flex items-center justify-center text-slate-500">Đang tải bản đồ...</div>
});

const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

// Emergency contacts configuration
const EMERGENCY_CONTACTS = [
    { label: "Cấp cứu", number: "115", icon: "💊", ariaLabel: "Gọi cấp cứu 115" },
    { label: "Cảnh sát", number: "113", icon: "👮", ariaLabel: "Gọi cảnh sát 113" },
    { label: "Cứu hỏa", number: "114", icon: "🔥", ariaLabel: "Gọi cứu hỏa 114" },
    { label: "Cứu nạn", number: "1900", icon: "⛑️", ariaLabel: "Gọi cứu nạn 1900" }
] as const;

export default function CitizenHomePage() {
    const [userName, setUserName] = useState("Người dùng");
    const [isLoading, setIsLoading] = useState(true);
    const [currentLocation, setCurrentLocation] = useState("Đang tải vị trí...");
    const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

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
        fetchLocation();
    }, []);

    const fetchLocation = async () => {
        setIsLoadingLocation(true);
        setLocationError(null);

        if (!("geolocation" in navigator)) {
            setLocationError("Trình duyệt không hỗ trợ định vị");
            setCurrentLocation("Không khả dụng");
            setIsLoadingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setCoordinates({ lat: latitude, lon: longitude });
                
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);

                    // Sử dụng OpenMap.vn API cho reverse geocoding
                    const response = await fetch(
                        `https://api.openmap.vn/api/v1/reverse?lat=${latitude}&lon=${longitude}`,
                        { signal: controller.signal }
                    );
                    clearTimeout(timeoutId);

                    const data = await response.json();
                    // OpenMap.vn trả về address trong data.address
                    const location = data.address?.city || data.address?.district || data.address?.province || data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                    setCurrentLocation(location);
                } catch (error) {
                    if (error instanceof Error && error.name === 'AbortError') {
                        setLocationError("Lấy địa chỉ hết thời gian chờ");
                    }
                    setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                } finally {
                    setIsLoadingLocation(false);
                }
            },
            (error) => {
                setIsLoadingLocation(false);
                setLocationError(error.message || "Không thể truy cập vị trí");
                setCurrentLocation("Không khả dụng");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const quickActions = [
        {
            id: "rescue",
            icon: "🚑",
            title: "Yêu cầu cứu trợ",
            subtitle: "Thực phẩm, thuốc men",
            href: "/citizen/request",
            color: "bg-[#FF7700] hover:bg-[#FF8820]"
        },
        {
            id: "danger",
            icon: "⚠️",
            title: "Báo cáo nguy hiểm",
            subtitle: "Sạt lở, nước dâng",
            href: "/citizen/request",
            color: "bg-[#FF7700] hover:bg-[#FF8820]"
        },
        {
            id: "guide",
            icon: "📖",
            title: "Hướng dẫn an toàn",
            subtitle: "Kỹ năng sinh tồn",
            href: "/citizen/guide",
            color: "bg-[#FF7700] hover:bg-[#FF8820]"
        }
    ];

    return (
        <div className="min-h-screen bg-[#133249] flex flex-col lg:flex-row">
            <DesktopSidebar />

            <div className="flex-1 flex flex-col lg:ml-64">
                {/* Fixed Header Banner */}
                <header className="sticky top-0 z-50 p-6 border-b border-white/10 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent backdrop-blur-md">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-white text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight uppercase">
                                Cứu hộ Lũ lụt
                            </h1>
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                <span className="text-xs font-semibold text-white">Hệ thống trực tuyến</span>
                            </div>
                        </div>
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
                            <div className="relative flex items-center justify-center" role="group" aria-label="Nút cứu hộ khẩn cấp">
                                {/* Ripple layers */}
                                <div className="absolute w-64 h-64 lg:w-80 lg:h-80 rounded-full border border-red-500/30 animate-ping-slow" aria-hidden="true"></div>
                                <div 
                                    className="absolute w-52 h-52 lg:w-64 lg:h-64 rounded-full border border-red-500/50 animate-ping" 
                                    style={{ animationDuration: "3s", animationDelay: "1s" }}
                                    aria-hidden="true"
                                ></div>
                                
                                <Link
                                    href="/citizen/request"
                                    className="sos-pulse relative w-48 h-48 lg:w-56 lg:h-56 rounded-full bg-[#FF3535] border-4 border-white shadow-[0_0_40px_rgba(255,53,53,0.7)] flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform z-20 group cursor-pointer hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-500/50"
                                    aria-label="Gửi yêu cầu cứu hộ khẩn cấp"
                                >
                                    <span className="text-2xl lg:text-3xl font-black tracking-wider text-white">CỨU HỘ</span>
                                    <span className="text-base lg:text-lg font-bold tracking-widest text-white">KHẨN CẤP</span>
                                </Link>
                            </div>
                        </div>

                        {/* Quick Options Section */}
                        <section className="space-y-4" aria-labelledby="quick-actions-heading">
                            <h3 id="quick-actions-heading" className="text-white font-bold text-xl lg:text-2xl px-2">
                                Lựa chọn nhanh
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {quickActions.map((action) => (
                                    <Link
                                        key={action.id}
                                        href={action.href}
                                        className={`${action.color} rounded-xl p-5 flex items-center gap-4 shadow-lg transition-all cursor-pointer group hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#FF7700]/50`}
                                        aria-label={`${action.title}: ${action.subtitle}`}
                                    >
                                        <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center text-3xl group-hover:bg-white/30 transition-colors" aria-hidden="true">
                                            {action.icon}
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className="text-white font-bold text-lg leading-tight">{action.title}</span>
                                            <span className="text-white/80 text-sm">{action.subtitle}</span>
                                        </div>
                                        <span className="text-white/50 text-2xl group-hover:text-white/70 transition-colors" aria-hidden="true">›</span>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Location Bar with Mini Map */}
                        <div className="bg-slate-200 rounded-xl p-5 shadow-lg border-l-4 border-[#FF7700]">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <span className="text-xl" aria-hidden="true">📍</span>
                                    <span className="text-sm font-bold uppercase tracking-wide">Vị trí hiện tại</span>
                                </div>
                                <button 
                                    onClick={fetchLocation}
                                    disabled={isLoadingLocation}
                                    className="text-[#FF3535] text-sm font-bold uppercase hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-opacity focus:outline-none focus:ring-2 focus:ring-[#FF7700]/50 rounded px-2 py-1"
                                    aria-label="Cập nhật vị trí hiện tại"
                                >
                                    {isLoadingLocation ? "Đang tải..." : "Cập nhật"}
                                </button>
                            </div>
                            {locationError && (
                                <div className="text-xs text-red-600 mb-2 flex items-center gap-1">
                                    <span>⚠️</span>
                                    <span>{locationError}</span>
                                </div>
                            )}
                            <p className="text-slate-800 text-lg font-bold mb-2">
                                {isLoadingLocation ? (
                                    <span className="inline-flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></span>
                                        Đang tải...
                                    </span>
                                ) : currentLocation}
                            </p>
                            {coordinates && (
                                <div className="text-xs text-slate-500 font-mono mb-3">
                                    Lat: {coordinates.lat.toFixed(4)} • Long: {coordinates.lon.toFixed(4)}
                                </div>
                            )}
                            
                            {/* Mini Map */}
                            {coordinates && (
                                <div className="mt-4 h-64 rounded-lg overflow-hidden border-2 border-slate-300 shadow-inner">
                                    <OpenMap 
                                        latitude={coordinates.lat} 
                                        longitude={coordinates.lon}
                                        address={currentLocation}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Emergency Contacts */}
                        <section className="bg-white/5 border border-white/10 rounded-xl p-6" aria-labelledby="emergency-contacts-heading">
                            <h2 id="emergency-contacts-heading" className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                                <span aria-hidden="true">📞</span>
                                <span>Liên hệ khẩn cấp</span>
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {EMERGENCY_CONTACTS.map((contact) => (
                                    <a
                                        key={contact.number}
                                        href={`tel:${contact.number}`}
                                        className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-[#FF7700]/50"
                                        aria-label={contact.ariaLabel}
                                    >
                                        <div className="text-3xl mb-2" aria-hidden="true">{contact.icon}</div>
                                        <div className="text-white font-bold text-lg mb-1">{contact.number}</div>
                                        <div className="text-gray-400 text-xs">{contact.label}</div>
                                    </a>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>

                <MobileBottomNav currentPath="/citizen" />
            </div>
        </div>
    );
}
