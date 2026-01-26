"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import "@openmapvn/openmapvn-gl/dist/maplibre-gl.css";
import SuccessPopup from "@/app/components/ui/SuccessPopup";
import API from "@/lib/services/api";
import MobileHeader from "@/app/components/layout/MobileHeader";
import MobileBottomNav from "@/app/components/layout/MobileBottomNav";
import DesktopHeader from "@/app/components/layout/DesktopHeader";
import DesktopSidebar from "@/app/components/layout/DesktopSidebar";
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
        <div className="min-h-screen bg-secondary flex flex-col lg:flex-row">
            <DesktopSidebar userName="User Account" userRole="Citizen" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64">
                <MobileHeader onLocationClick={() => document.getElementById('location-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} />

                <DesktopHeader
                    title="Trang chủ"
                    subtitle="Chào mừng đến với hệ thống cứu hộ"
                    onLocationClick={() => document.getElementById('location-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto pt-[73px] lg:pt-[89px] pb-24 lg:pb-0">
                    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">

                        {/* Hero Section - Emergency CTA */}
                        <div className="bg-gradient-to-br from-red-600/20 to-red-800/10 border border-red-500/30 rounded-2xl p-6 lg:p-8">
                            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                                {/* Emergency Button */}
                                <div className="shrink-0">
                                    <button
                                        onClick={() => openRescueModal()}
                                        className="group relative flex flex-col items-center justify-center w-44 h-44 lg:w-48 lg:h-48 rounded-full bg-red-600 text-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(220,38,38,0.4)]"
                                        aria-label="Nút cứu hộ khẩn cấp"
                                    >
                                        <div className="absolute inset-0 rounded-full border-4 border-red-300/60 scale-110 animate-pulse"></div>
                                        <span className="text-6xl lg:text-7xl mb-2">🚨</span>
                                        <span className="text-xl lg:text-2xl font-black tracking-tight text-center px-4">
                                            CỨU HỘ<br />KHẨN CẤP
                                        </span>
                                    </button>
                                </div>

                                {/* Hero Text */}
                                <div className="flex-1 text-center lg:text-left">
                                    <h1 className="text-3xl lg:text-4xl font-black text-white mb-3 leading-tight">
                                        Bạn đang gặp nguy hiểm?
                                    </h1>
                                    <p className="text-gray-300 text-sm lg:text-base leading-relaxed">
                                        Nhấn nút bên cạnh để gửi tín hiệu cấp cứu. Vị trí GPS của bạn sẽ được gửi tự động đến đội cứu hộ gần nhất.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Grid Layout - Location & Quick Actions */}
                        <div className="grid lg:grid-cols-2 gap-6">

                            {/* Location Card */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <span>📍</span>
                                        Vị trí của bạn
                                    </h3>
                                    <button
                                        onClick={getCurrentLocation}
                                        disabled={isLoadingLocation}
                                        className="text-xs font-bold text-primary px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoadingLocation ? "⏳" : "🔄 Cập nhật"}
                                    </button>
                                </div>

                                {/* Address Display */}
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1.5">
                                        Địa chỉ hiện tại
                                    </p>
                                    <p className="text-sm text-white font-medium leading-relaxed">
                                        {currentLocation}
                                    </p>
                                    {coordinates && (
                                        <p className="text-xs text-gray-500 mt-2 font-mono">
                                            {coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)}
                                        </p>
                                    )}
                                </div>

                                {/* Map Display */}
                                <div id="location-map" className="rounded-xl overflow-hidden bg-white/5 border border-white/10 scroll-mt-20">
                                    {coordinates ? (
                                        <div className="h-56 lg:h-64 w-full relative">
                                            <OpenMap
                                                latitude={coordinates.lat}
                                                longitude={coordinates.lon}
                                                address={currentLocation}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-56 lg:h-64 flex items-center justify-center">
                                            <div className="text-center">
                                                <span className="text-4xl mb-2 block">📍</span>
                                                <p className="text-gray-400 text-sm">Đang lấy vị trí GPS...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions Card */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span>⚡</span>
                                    Lựa chọn nhanh
                                </h3>

                                <div className="space-y-3">
                                    {quickActions.map((action, index) => (
                                        <Link
                                            key={index}
                                            href={action.href}
                                            className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-200 hover:scale-[1.02]"
                                        >
                                            <div
                                                className={`flex items-center justify-center rounded-xl shrink-0 w-12 h-12 text-2xl transition-transform group-hover:scale-110 ${action.color === "orange"
                                                    ? "bg-orange-500/20 text-orange-400"
                                                    : action.color === "red"
                                                        ? "bg-red-500/20 text-red-400"
                                                        : "bg-blue-500/20 text-blue-400"
                                                    }`}
                                            >
                                                {action.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-bold text-white mb-1">
                                                    {action.title}
                                                </p>
                                                <p className="text-gray-400 text-xs leading-snug line-clamp-2">
                                                    {action.description}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-gray-500 group-hover:text-primary transition-colors">
                                                <span className="text-2xl">›</span>
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

                                {/* Image Upload */}
                                {selectedQuickAction && (
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-white flex items-center gap-2">
                                            <span>📸</span>
                                            Thêm hình ảnh thực tế (không bắt buộc)
                                        </label>

                                        {/* Upload Button */}
                                        <label className="block cursor-pointer">
                                            <div className="p-4 rounded-xl bg-white/5 border-2 border-dashed border-white/20 hover:border-primary/50 hover:bg-white/10 transition-all text-center">
                                                {isUploadingImage ? (
                                                    <div className="py-2">
                                                        <span className="text-2xl animate-spin inline-block">⏳</span>
                                                        <p className="text-sm text-gray-400 mt-2">Đang tải lên...</p>
                                                    </div>
                                                ) : (
                                                    <div className="py-2">
                                                        <span className="text-3xl block mb-2">📤</span>
                                                        <p className="text-sm font-bold text-white mb-1">Chọn hình ảnh</p>
                                                        <p className="text-xs text-gray-400">JPG, PNG (Tối đa 5 ảnh)</p>
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
                                                            className="w-full h-24 object-cover rounded-lg border border-white/10"
                                                        />
                                                        <button
                                                            onClick={() => removeImage(index)}
                                                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {uploadedImages.length > 0 && (
                                            <p className="text-xs text-gray-400 text-center">
                                                {uploadedImages.length}/5 hình ảnh
                                            </p>
                                        )}
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

            {/* Success Popup */}
            <SuccessPopup
                isOpen={showSuccessPopup}
                onClose={() => setShowSuccessPopup(false)}
                message="Yêu cầu cứu hộ đã được gửi thành công! Đội cứu hộ sẽ đến ngay!"
                icon="🚨"
            />
        </div>
    );
}
