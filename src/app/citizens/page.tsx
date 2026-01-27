"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import "@openmapvn/openmapvn-gl/dist/maplibre-gl.css";
import SuccessPopup from "@/components/ui/success-popup";
import API from "@/lib/services/apiClient";
import {
    MobileHeader,
    MobileBottomNav,
    DesktopHeader,
    DesktopSidebar
} from "./components/layout";
// Dynamic import cho OPENMAP để tránh SSR issues
const OpenMap = dynamic(() => import("@/app/components/OpenMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ background: 'rgba(255, 119, 0, 0.1)', border: '2px solid rgba(255, 119, 0, 0.3)' }}>
            <p style={{ color: '#ff7700' }}>Đang tải bản đồ...</p>
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
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

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
                `/api/citizens/reverse-geocode?lat=${lat}&lng=${lng}`
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
            href: "/citizens/request-food",
        },
        {
            icon: "📋",
            title: "Theo dõi yêu cầu cứu hộ",
            description: "Xem trạng thái và lịch sử yêu cầu",
            color: "red",
            href: "/citizens/history",
        },
        {
            icon: "🛡️",
            title: "Hướng dẫn an toàn",
            description: "Kỹ năng sinh tồn khi có lũ",
            color: "blue",
            href: "/citizens/safety-guide",
        },
    ];

    // Hàm upload hình ảnh lên Cloudinary
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        if (uploadedImages.length + files.length > 5) {
            alert("Chỉ được tải tối đa 5 hình ảnh!");
            return;
        }

        setIsUploadingImage(true);

        try {
            const fileArray = Array.from(files);
            console.log(`Uploading ${fileArray.length} image(s)...`);

            const imageUrls = await API.cloudinary.uploadMultipleImages(fileArray);

            setUploadedImages([...uploadedImages, ...imageUrls]);
            console.log('Upload success:', imageUrls);
        } catch (error) {
            console.error("Lỗi khi upload hình ảnh:", error);
            alert(`❌ Không thể tải hình ảnh lên: ${error instanceof Error ? error.message : 'Vui lòng thử lại!'}`);
        } finally {
            setIsUploadingImage(false);
        }
    };

    // Hàm xóa hình ảnh
    const removeImage = (index: number) => {
        setUploadedImages(uploadedImages.filter((_, i) => i !== index));
    };

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
                images: uploadedImages,
                timestamp: new Date().toISOString(),
                status: "pending",
            };

            console.log("Đang gửi yêu cầu cứu hộ:", requestData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            setShowRescueModal(false);
            setSelectedQuickAction(null);
            setRescueRequest({
                dangerType: "",
                description: "",
                numberOfPeople: 1,
                urgencyLevel: "high",
            });
            setUploadedImages([]);
            setShowSuccessPopup(true);
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
        <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: '#133249' }}>
            <DesktopSidebar userName="User Account" userRole="Citizen" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <MobileHeader onLocationClick={() => document.getElementById('location-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} />

                <DesktopHeader
                    title="Trang chủ"
                    subtitle="Chào mừng đến với hệ thống cứu hộ"
                    onLocationClick={() => document.getElementById('location-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto pt-[73px] lg:pt-[89px] pb-24 lg:pb-0">
                    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6 -mt-12 lg:-mt-14">

                        {/* Hero Section - Emergency CTA */}
                        <div className="relative rounded-3xl p-6 lg:p-8 overflow-hidden shadow-lg" style={{ background: 'rgba(255, 119, 0, 0.1)', border: '2px solid rgba(255, 119, 0, 0.3)' }}>
                            {/* Decorative background pattern */}
                            <div className="absolute inset-0 opacity-[0.08]" style={{
                                backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(255 119 0) 1px, transparent 0)',
                                backgroundSize: '24px 24px'
                            }}></div>

                            <div className="relative flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                                {/* Emergency Button */}
                                <div className="shrink-0">
                                    <button
                                        onClick={() => openRescueModal()}
                                        className="group relative flex flex-col items-center justify-center w-40 h-40 lg:w-44 lg:h-44 rounded-full text-white hover:scale-105 active:scale-95 transition-all duration-300"
                                        style={{
                                            background: 'linear-gradient(135deg, #ff7700 0%, #ff5500 100%)',
                                            boxShadow: '0 8px 32px rgba(255, 119, 0, 0.4)'
                                        }}
                                        aria-label="Nút cứu hộ khẩn cấp"
                                    >
                                        <div className="absolute inset-0 rounded-full border-4 scale-110 animate-pulse" style={{ borderColor: 'rgba(255, 119, 0, 0.4)' }}></div>
                                        <span className="text-5xl lg:text-6xl mb-2 drop-shadow-lg">🚨</span>
                                        <span className="text-lg lg:text-xl font-black tracking-tight text-center px-4 drop-shadow-md">
                                            CỨU HỘ<br />KHẨN CẤP
                                        </span>
                                    </button>
                                </div>

                                {/* Hero Text */}
                                <div className="flex-1 text-center lg:text-left">
                                    <h1 className="text-2xl lg:text-3xl font-black mb-3 leading-tight" style={{ color: '#ff7700' }}>
                                        Bạn đang gặp nguy hiểm?
                                    </h1>
                                    <p className="text-sm lg:text-base leading-relaxed max-w-xl" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                        Nhấn nút bên cạnh để gửi tín hiệu cấp cứu. Vị trí GPS của bạn sẽ được gửi tự động đến đội cứu hộ gần nhất.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Grid Layout - Location & Quick Actions */}
                        <div className="grid lg:grid-cols-2 gap-6">

                            {/* Location Card */}
                            <div className="backdrop-blur-sm rounded-2xl p-6 space-y-4 shadow-md hover:shadow-xl transition-shadow duration-300" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '2px solid rgba(255, 119, 0, 0.2)' }}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#ff7700' }}>
                                        <span className="text-2xl">📍</span>
                                        Vị trí của bạn
                                    </h3>
                                    <button
                                        onClick={getCurrentLocation}
                                        disabled={isLoadingLocation}
                                        className="text-xs font-bold px-4 py-2 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                                        style={{
                                            color: '#ff7700',
                                            background: 'rgba(255, 119, 0, 0.1)',
                                            border: '1px solid rgba(255, 119, 0, 0.3)'
                                        }}
                                    >
                                        {isLoadingLocation ? "⏳" : "🔄 Cập nhật"}
                                    </button>
                                </div>

                                {/* Address Display */}
                                <div className="p-4 rounded-xl" style={{ background: 'rgba(255, 119, 0, 0.08)', border: '1px solid rgba(255, 119, 0, 0.2)' }}>
                                    <p className="text-xs uppercase font-bold mb-2 tracking-wide" style={{ color: '#ff7700' }}>
                                        Địa chỉ hiện tại
                                    </p>
                                    <p className="text-sm font-semibold leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                        {currentLocation}
                                    </p>
                                    {coordinates && (
                                        <p className="text-xs mt-2 font-mono px-2 py-1 rounded inline-block" style={{ color: 'rgba(255, 255, 255, 0.6)', background: 'rgba(255, 255, 255, 0.05)' }}>
                                            {coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)}
                                        </p>
                                    )}
                                </div>

                                {/* Map Display */}
                                <div id="location-map" className="rounded-xl overflow-hidden scroll-mt-20 shadow-inner" style={{ background: 'rgba(0, 0, 0, 0.2)', border: '2px solid rgba(255, 119, 0, 0.2)' }}>
                                    {coordinates ? (
                                        <div className="h-56 lg:h-64 w-full relative">
                                            <OpenMap
                                                latitude={coordinates.lat}
                                                longitude={coordinates.lon}
                                                address={currentLocation}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-56 lg:h-64 flex items-center justify-center" style={{ background: 'rgba(255, 119, 0, 0.05)' }}>
                                            <div className="text-center">
                                                <span className="text-5xl mb-3 block animate-bounce">📍</span>
                                                <p className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Đang lấy vị trí GPS...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions Card */}
                            <div className="backdrop-blur-sm rounded-2xl p-6 space-y-4 shadow-md hover:shadow-xl transition-shadow duration-300" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '2px solid rgba(255, 119, 0, 0.2)' }}>
                                <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#ff7700' }}>
                                    <span className="text-2xl">⚡</span>
                                    Lựa chọn nhanh
                                </h3>

                                <div className="space-y-3">
                                    {quickActions.map((action, index) => (
                                        <Link
                                            key={index}
                                            href={action.href}
                                            className="group flex items-center gap-4 rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '2px solid rgba(255, 255, 255, 0.1)'
                                            }}
                                        >
                                            <div
                                                className="flex items-center justify-center rounded-xl shrink-0 w-14 h-14 text-3xl transition-transform group-hover:scale-110 shadow-sm"
                                                style={{
                                                    background: 'rgba(255, 119, 0, 0.15)',
                                                    border: '2px solid rgba(255, 119, 0, 0.3)'
                                                }}
                                            >
                                                {action.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-bold mb-1" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                                                    {action.title}
                                                </p>
                                                <p className="text-xs leading-snug line-clamp-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                    {action.description}
                                                </p>
                                            </div>
                                            <div className="shrink-0 transition-colors" style={{ color: '#ff7700' }}>
                                                <span className="text-2xl font-bold">›</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
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
                    currentPath="/citizens"
                />
            </div>

            {/* Rescue Request Modal */}
            {showRescueModal && (
                <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-4 backdrop-blur-md animate-in fade-in duration-200" style={{ background: 'rgba(19, 50, 73, 0.85)' }}>
                    <div className="rounded-t-3xl lg:rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom lg:slide-in-from-bottom-0 duration-300" style={{ background: '#1a3a52', border: '4px solid rgba(255, 119, 0, 0.4)' }}>
                        {/* Header - Fixed */}
                        <div className="flex-shrink-0 p-5 shadow-lg rounded-t-3xl lg:rounded-t-3xl" style={{ background: 'rgba(255, 119, 0, 0.1)', borderBottom: '2px solid rgba(255, 119, 0, 0.3)' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #ff7700 0%, #ff5500 100%)' }}>
                                        <span className="text-3xl">🚨</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black" style={{ color: '#ff7700' }}>Yêu cầu cứu hộ</h2>
                                        <p className="text-xs font-medium" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Chọn tình huống và gửi ngay</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowRescueModal(false);
                                        setSelectedQuickAction(null);
                                    }}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm"
                                    style={{ background: 'rgba(255, 255, 255, 0.1)', border: '2px solid rgba(255, 119, 0, 0.3)' }}
                                >
                                    <span className="text-xl" style={{ color: '#ff7700' }}>✕</span>
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto overscroll-contain"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'rgba(255, 119, 0, 0.5) rgba(255, 119, 0, 0.1)'
                            }}
                        >

                            {/* Quick Actions */}
                            <div className="p-5 space-y-4">
                                <div>
                                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#ff7700' }}>
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
                                                className="relative p-4 rounded-xl border-2 transition-all"
                                                style={{
                                                    background: selectedQuickAction === action.id ? 'rgba(255, 119, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                                    borderColor: selectedQuickAction === action.id ? '#ff7700' : 'rgba(255, 255, 255, 0.1)',
                                                    transform: selectedQuickAction === action.id ? 'scale(1.02)' : 'scale(1)'
                                                }}
                                            >
                                                <div className="text-center">
                                                    <span className="text-4xl mb-2 block drop-shadow">{action.icon}</span>
                                                    <p className="text-sm font-bold mb-1" style={{ color: selectedQuickAction === action.id ? '#ff7700' : 'rgba(255, 255, 255, 0.9)' }}>{action.label}</p>
                                                    <p className="text-xs line-clamp-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{action.description}</p>
                                                </div>
                                                {selectedQuickAction === action.id && (
                                                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md" style={{ background: '#ff7700' }}>
                                                        <span className="text-white text-xs font-bold">✓</span>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Additional Details (Optional) */}
                                {selectedQuickAction && (
                                    <div className="animate-in slide-in-from-top duration-200">
                                        <label className="block text-sm font-bold mb-2" style={{ color: '#ff7700' }}>
                                            📝 Thêm thông tin chi tiết (không bắt buộc)
                                        </label>
                                        <textarea
                                            value={rescueRequest.description}
                                            onChange={(e) => setRescueRequest({ ...rescueRequest, description: e.target.value })}
                                            placeholder="VD: Nước ngập cao 1.5m, có 2 người già cần di chuyển..."
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl outline-none transition resize-none text-sm"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '2px solid rgba(255, 119, 0, 0.2)',
                                                color: 'rgba(255, 255, 255, 0.9)'
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Number of People */}
                                {selectedQuickAction && (
                                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255, 119, 0, 0.1)', border: '2px solid rgba(255, 119, 0, 0.3)' }}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">👥</span>
                                            <div>
                                                <p className="text-sm font-bold" style={{ color: '#ff7700' }}>Số người cần cứu hộ</p>
                                                <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Bao gồm cả bạn</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setRescueRequest({ ...rescueRequest, numberOfPeople: Math.max(1, rescueRequest.numberOfPeople - 1) })}
                                                className="w-9 h-9 rounded-full flex items-center justify-center font-bold transition shadow-sm hover:shadow"
                                                style={{ background: 'rgba(255, 119, 0, 0.2)', border: '2px solid rgba(255, 119, 0, 0.4)', color: '#ff7700' }}
                                            >
                                                −
                                            </button>
                                            <span className="text-xl font-bold w-12 text-center" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{rescueRequest.numberOfPeople}</span>
                                            <button
                                                onClick={() => setRescueRequest({ ...rescueRequest, numberOfPeople: Math.min(50, rescueRequest.numberOfPeople + 1) })}
                                                className="w-9 h-9 rounded-full flex items-center justify-center font-bold transition shadow-sm hover:shadow"
                                                style={{ background: 'rgba(255, 119, 0, 0.2)', border: '2px solid rgba(255, 119, 0, 0.4)', color: '#ff7700' }}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Image Upload */}
                                {selectedQuickAction && (
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold flex items-center gap-2" style={{ color: '#ff7700' }}>
                                            <span>📸</span>
                                            Thêm hình ảnh thực tế (không bắt buộc)
                                        </label>

                                        {/* Upload Button */}
                                        <label className="block cursor-pointer">
                                            <div className="p-4 rounded-xl border-2 border-dashed transition-all text-center shadow-sm hover:shadow-md" style={{ background: 'rgba(255, 119, 0, 0.05)', borderColor: 'rgba(255, 119, 0, 0.3)' }}>
                                                {isUploadingImage ? (
                                                    <div className="py-2">
                                                        <span className="text-3xl animate-spin inline-block">⏳</span>
                                                        <p className="text-sm mt-2 font-medium" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Đang tải lên...</p>
                                                    </div>
                                                ) : (
                                                    <div className="py-2">
                                                        <span className="text-4xl block mb-2">📤</span>
                                                        <p className="text-sm font-bold mb-1" style={{ color: '#ff7700' }}>Chọn hình ảnh</p>
                                                        <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>JPG, PNG (Tối đa 5 ảnh)</p>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                max={5}
                                                onChange={handleImageUpload}
                                                disabled={isUploadingImage || uploadedImages.length >= 5}
                                                className="hidden"
                                            />
                                        </label>

                                        {/* Preview Images */}
                                        {uploadedImages.length > 0 && (
                                            <div className="grid grid-cols-3 gap-2">
                                                {uploadedImages.map((imageUrl, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Hình ${index + 1}`}
                                                            className="w-full h-24 object-cover rounded-lg shadow-sm"
                                                            style={{ border: '2px solid rgba(255, 119, 0, 0.3)' }}
                                                        />
                                                        <button
                                                            onClick={() => removeImage(index)}
                                                            className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                            style={{ background: '#ff7700', border: '2px solid white' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {uploadedImages.length > 0 && (
                                            <p className="text-xs text-center font-medium" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                {uploadedImages.length}/5 hình ảnh
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Location Info */}
                                {selectedQuickAction && (
                                    <div className="p-4 rounded-xl" style={{ background: 'rgba(255, 119, 0, 0.1)', border: '2px solid rgba(255, 119, 0, 0.3)' }}>
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">📍</span>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold mb-1" style={{ color: '#ff7700' }}>Vị trí sẽ được gửi tự động</p>
                                                <p className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{currentLocation}</p>
                                                {coordinates && (
                                                    <p className="text-xs mt-1 font-mono px-2 py-1 rounded inline-block" style={{ color: 'rgba(255, 255, 255, 0.6)', background: 'rgba(255, 255, 255, 0.05)' }}>
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
                            <div className="flex-shrink-0 p-5" style={{ background: 'rgba(255, 119, 0, 0.05)', borderTop: '2px solid rgba(255, 119, 0, 0.3)', boxShadow: '0 -4px 12px rgba(0,0,0,0.2)' }}>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowRescueModal(false);
                                            setSelectedQuickAction(null);
                                        }}
                                        className="flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow"
                                        style={{ background: 'rgba(255, 255, 255, 0.05)', border: '2px solid rgba(255, 255, 255, 0.2)', color: 'rgba(255, 255, 255, 0.8)' }}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleRescueRequest}
                                        disabled={isSubmitting}
                                        className="flex-[2] px-6 py-4 rounded-xl text-white font-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                        style={{ background: 'linear-gradient(135deg, #ff7700 0%, #ff5500 100%)' }}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="animate-spin">⏳</span>
                                                <span>Đang gửi...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-xl drop-shadow">🚨</span>
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

            {/* Success Popup */}
            <SuccessPopup
                isOpen={showSuccessPopup}
                onClose={() => setShowSuccessPopup(false)}
                title="Gửi yêu cầu thành công!"
                message="Yêu cầu cứu hộ đã được gửi thành công! Đội cứu hộ sẽ đến ngay!"
            />
        </div>
    );
}
