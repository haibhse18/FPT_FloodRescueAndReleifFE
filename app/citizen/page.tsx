"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import "@openmapvn/openmapvn-gl/dist/maplibre-gl.css";
// Dynamic import cho OPENMAP để tránh SSR issues
const OpenMap = dynamic(() => import("@/app/components/OpenMap"), {
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
    const [showRescueModal, setShowRescueModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(null);
    const [rescueRequest, setRescueRequest] = useState({
        dangerType: "",
        description: "",
        numberOfPeople: 1,
        urgencyLevel: "high",
    });

    // Quick action templates
    const quickRescueActions = [
        {
            id: "flood",
            icon: "🌊",
            label: "Ngập lụt",
            description: "Nước dâng cao, cần di chuyển khẩn cấp",
            color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30"
        },
        {
            id: "trapped",
            icon: "🏚️",
            label: "Bị kẹt",
            description: "Bị mắc kẹt, không thể thoát ra",
            color: "from-orange-500/20 to-yellow-500/10 border-orange-500/30"
        },
        {
            id: "injury",
            icon: "🤕",
            label: "Bị thương",
            description: "Có người bị thương cần cấp cứu",
            color: "from-red-500/20 to-pink-500/10 border-red-500/30"
        },
        {
            id: "landslide",
            icon: "⛰️",
            label: "Sạt lở",
            description: "Đất đá sạt lở, nguy hiểm cao",
            color: "from-amber-500/20 to-orange-500/10 border-amber-500/30"
        }
    ];

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
    const getAddressFromOpenMap = async (lat: number, lng: number) => {
        try {
            const res = await fetch(
                `/api/reverse-geocode?lat=${lat}&lng=${lng}`
            );

            if (!res.ok) throw new Error("Failed");

            const data = await res.json();

            const result = data?.results?.[0];

            if (result) {
                setCurrentLocation(
                result.formatted_address || result.address
            );
            } else {
                setCurrentLocation(`Tọa độ: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            }
        } catch (err) {
            console.error(err);
            setCurrentLocation(`Tọa độ: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
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

    // Hàm xử lý gửi yêu cầu cứu hộ
    const handleRescueRequest = async () => {
        if (!coordinates) {
            alert("Vui lòng bật GPS để gửi yêu cầu cứu hộ!");
            return;
        }

        if (!selectedQuickAction && !rescueRequest.dangerType) {
            alert("Vui lòng chọn loại tình huống!");
            return;
        }

        setIsSubmitting(true);

        try {
            // TODO: Gọi API backend để lưu rescue request
            const requestData = {
                ...rescueRequest,
                location: currentLocation,
                coordinates: coordinates,
                timestamp: new Date().toISOString(),
                status: "pending",
            };

            console.log("Đang gửi yêu cầu cứu hộ:", requestData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            alert("✅ Yêu cầu cứu hộ đã được gửi thành công! Đội cứu hộ sẽ đến ngay!");
            setShowRescueModal(false);
            setRescueRequest({
                dangerType: "",
                description: "",
                numberOfPeople: 1,
                urgencyLevel: "high",
            });
        } catch (error) {
            console.error("Lỗi khi gửi yêu cầu:", error);
            alert("❌ Có lỗi xảy ra. Vui lòng thử lại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hàm mở modal với quick action
    const openRescueModal = (quickActionId?: string) => {
        if (quickActionId) {
            setSelectedQuickAction(quickActionId);
            const action = quickRescueActions.find(a => a.id === quickActionId);
            if (action) {
                setRescueRequest({
                    dangerType: quickActionId,
                    description: action.description,
                    numberOfPeople: 1,
                    urgencyLevel: "high",
                });
            }
        }
        setShowRescueModal(true);
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
                        <button
                            onClick={() => document.getElementById('location-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                            className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform"
                        >
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
                        <button
                            onClick={() => document.getElementById('location-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                            className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition hover:scale-105"
                        >
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
                                    <button
                                        onClick={() => openRescueModal()}
                                        className="group relative flex flex-col items-center justify-center w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-red-600 text-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(220,38,38,0.4)]" aria-label="Nút cứu hộ khẩn cấp"
                                    >
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
                                <div id="location-map" className="mt-4 rounded-xl overflow-hidden scroll-mt-20 bg-white/5 border border-white/10 relative z-0">
                                    {coordinates ? (
                                        <div className="h-48 w-full relative z-0">
                                            <OpenMap
                                                latitude={coordinates.lat}
                                                longitude={coordinates.lon}
                                                address={currentLocation}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-48 flex items-center justify-center">
                                            <div className="text-center">
                                                <span className="text-4xl mb-2 block">📍</span>
                                                <p className="text-gray-400 text-sm">Đang lấy vị trí GPS...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
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

            {/* Rescue Request Modal */}
            {showRescueModal && (
                <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-secondary border-t lg:border border-white/20 rounded-t-3xl lg:rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom lg:slide-in-from-bottom-0 duration-300">
                        {/* Header - Fixed */}
                        <div className="flex-shrink-0 bg-secondary/98 backdrop-blur-xl border-b border-white/10 p-5 shadow-lg rounded-t-3xl lg:rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shadow-inner">
                                        <span className="text-2xl">🚨</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white">Yêu cầu cứu hộ</h2>
                                        <p className="text-xs text-gray-400">Chọn tình huống và gửi ngay</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowRescueModal(false);
                                        setSelectedQuickAction(null);
                                    }}
                                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                                >
                                    <span className="text-xl text-gray-400">✕</span>
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto overscroll-contain"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'rgba(255, 119, 0, 0.3) transparent'
                            }}
                        >

                            {/* Quick Actions */}
                            <div className="p-5 space-y-4">
                                <div>
                                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                        <span>⚡</span>
                                        Chọn tình huống khẩn cấp
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {quickRescueActions.map((action) => (
                                            <button
                                                key={action.id}
                                                onClick={() => {
                                                    setSelectedQuickAction(action.id);
                                                    setRescueRequest({
                                                        dangerType: action.id,
                                                        description: action.description,
                                                        numberOfPeople: 1,
                                                        urgencyLevel: "high",
                                                    });
                                                }}
                                                className={`relative p-4 rounded-xl border-2 transition-all ${selectedQuickAction === action.id
                                                    ? `bg-gradient-to-br ${action.color} border-transparent shadow-lg scale-[1.02]`
                                                    : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                                                    }`}
                                            >
                                                <div className="text-center">
                                                    <span className="text-4xl mb-2 block">{action.icon}</span>
                                                    <p className="text-sm font-bold text-white mb-1">{action.label}</p>
                                                    <p className="text-xs text-gray-400 line-clamp-2">{action.description}</p>
                                                </div>
                                                {selectedQuickAction === action.id && (
                                                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                                        <span className="text-white text-xs">✓</span>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Additional Details (Optional) */}
                                {selectedQuickAction && (
                                    <div className="animate-in slide-in-from-top duration-200">
                                        <label className="block text-sm font-bold text-white mb-2">
                                            📝 Thêm thông tin chi tiết (không bắt buộc)
                                        </label>
                                        <textarea
                                            value={rescueRequest.description}
                                            onChange={(e) => setRescueRequest({ ...rescueRequest, description: e.target.value })}
                                            placeholder="VD: Nước ngập cao 1.5m, có 2 người già cần di chuyển..."
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition resize-none text-sm"
                                        />
                                    </div>
                                )}

                                {/* Number of People */}
                                {selectedQuickAction && (
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">👥</span>
                                            <div>
                                                <p className="text-sm font-bold text-white">Số người cần cứu hộ</p>
                                                <p className="text-xs text-gray-400">Bao gồm cả bạn</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setRescueRequest({ ...rescueRequest, numberOfPeople: Math.max(1, rescueRequest.numberOfPeople - 1) })}
                                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition"
                                            >
                                                −
                                            </button>
                                            <span className="text-xl font-bold text-white w-10 text-center">{rescueRequest.numberOfPeople}</span>
                                            <button
                                                onClick={() => setRescueRequest({ ...rescueRequest, numberOfPeople: Math.min(50, rescueRequest.numberOfPeople + 1) })}
                                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Location Info */}
                                {selectedQuickAction && (
                                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">📍</span>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-blue-400 mb-1">Vị trí sẽ được gửi tự động</p>
                                                <p className="text-sm text-gray-300">{currentLocation}</p>
                                                {coordinates && (
                                                    <p className="text-xs text-gray-500 mt-1 font-mono">
                                                        {coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer - Fixed */}
                        {selectedQuickAction && (
                            <div className="flex-shrink-0 bg-secondary/98 backdrop-blur-xl border-t border-white/10 p-5 shadow-[0_-4px_12px_rgba(0,0,0,0.3)] rounded-b-3xl lg:rounded-b-2xl">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowRescueModal(false);
                                            setSelectedQuickAction(null);
                                        }}
                                        className="flex-1 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleRescueRequest}
                                        disabled={isSubmitting}
                                        className="flex-[2] px-6 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="animate-spin">⏳</span>
                                                <span>Đang gửi...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-xl">🚨</span>
                                                <span>GỬI NGAY</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
