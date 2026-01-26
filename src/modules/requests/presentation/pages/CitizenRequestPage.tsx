"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import "@openmapvn/openmapvn-gl/dist/maplibre-gl.css";
import SuccessPopup from "@/shared/ui/SuccessPopup";
import API from "@/services/api";
import { MobileHeader, MobileBottomNav, DesktopHeader, DesktopSidebar } from "@/shared/components/layout";
import EmergencyButton from "../components/EmergencyButton";
import LocationInfoCard from "../components/LocationInfoCard";
import QuickActionsList from "../components/QuickActionsList";
import RescueRequestModal from "../components/RescueRequestModal";

// Dynamic import cho OpenMap để tránh SSR issues
const OpenMap = dynamic(() => import("@/modules/map/presentation/components/OpenMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
            <p className="text-gray-400">Đang tải bản đồ...</p>
        </div>
    ),
});

export default function CitizenRequestPage() {
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

    // Hàm gọi API OpenMap để lấy địa chỉ từ tọa độ
    const getAddressFromOpenMap = async (lat: number, lon: number) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            const data = await response.json();
            setCurrentLocation(data.address?.city || data.address?.town || data.display_name.split(",")[0]);
        } catch (error) {
            console.error("Error fetching address:", error);
            setCurrentLocation(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);
        }
    };

    // Xử lý submit form cứu hộ
    const handleRescueSubmit = async () => {
        if (!rescueRequest.dangerType || !coordinates) {
            alert("Vui lòng chọn loại nguy hiểm và kích hoạt định vị");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...rescueRequest,
                location: currentLocation,
                latitude: coordinates.lat,
                longitude: coordinates.lon,
                images: uploadedImages,
            };

            const response = await API.citizen.createRescueRequest(payload) as any;
            if (response.success) {
                setShowRescueModal(false);
                setShowSuccessPopup(true);
                setRescueRequest({
                    dangerType: "",
                    description: "",
                    numberOfPeople: 1,
                    urgencyLevel: "high",
                });
                setUploadedImages([]);
                // Delay reset để user thấy popup
                setTimeout(() => {
                    setShowSuccessPopup(false);
                }, 2000);
            }
        } catch (error) {
            console.error("Error submitting rescue request:", error);
            alert("Lỗi khi gửi yêu cầu cứu hộ");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hàm upload ảnh lên Cloudinary
    const handleImageUpload = async (file: File) => {
        setIsUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

            const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (data.secure_url) {
                setUploadedImages([...uploadedImages, data.secure_url]);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setIsUploadingImage(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Responsive Headers */}
            <div className="hidden md:block">
                <DesktopHeader title="Yêu cầu cứu hộ" subtitle="Gửi yêu cầu cứu hộ khẩn cấp" />
            </div>
            <div className="md:hidden">
                <MobileHeader />
            </div>

            <div className="flex-1 flex">
                {/* Desktop Sidebar */}
                <div className="hidden md:block md:w-64">
                    <DesktopSidebar />
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto md:pb-0 pb-20">
                    <div className="p-4 md:p-6 space-y-6">
                        {/* Tiêu đề trang */}
                        <div>
                            <h1 className="text-3xl font-bold">Yêu cầu cứu hộ</h1>
                            <p className="text-gray-400 mt-2">Gửi yêu cầu cứu hộ khẩn cấp, chia sẻ vị trí và ảnh</p>
                        </div>

                        {/* Bản đồ */}
                        <div>
                            <h2 className="text-xl font-semibold mb-3">Bản đồ vị trí của bạn</h2>
                            <div className="rounded-xl overflow-hidden h-96 border border-white/10">
                                {coordinates && <OpenMap latitude={coordinates.lat} longitude={coordinates.lon} />}
                            </div>
                        </div>

                        {/* Thông tin vị trí */}
                        <LocationInfoCard
                            location={currentLocation}
                            coordinates={coordinates}
                            isLoading={isLoadingLocation}
                            onRefresh={getCurrentLocation}
                        />

                        {/* Danh sách hành động nhanh */}
                        <div>
                            <h2 className="text-xl font-semibold mb-3">Hành động nhanh</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {quickRescueActions.map((action) => (
                                    <button
                                        key={action.id}
                                        onClick={() => {
                                            setSelectedQuickAction(action.id);
                                            setRescueRequest({ ...rescueRequest, dangerType: action.id });
                                        }}
                                        className={`p-4 rounded-xl border transition-all ${
                                            selectedQuickAction === action.id
                                                ? `${action.color} ring-2 ring-primary`
                                                : "bg-white/5 border-white/10 hover:bg-white/10"
                                        }`}
                                    >
                                        <div className="text-3xl mb-2">{action.icon}</div>
                                        <h3 className="font-bold text-white mb-1">{action.label}</h3>
                                        <p className="text-xs text-gray-400">{action.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Nút cứu hộ khẩn cấp */}
                        <EmergencyButton onClick={() => setShowRescueModal(true)} />

                        {/* Modal cứu hộ */}
                        {showRescueModal && (
                            <RescueRequestModal
                                isOpen={showRescueModal}
                                onClose={() => setShowRescueModal(false)}
                                currentLocation={currentLocation}
                                coordinates={coordinates}
                                onSubmit={handleRescueSubmit}
                                isSubmitting={isSubmitting}
                            />
                        )}

                        {/* Success Popup */}
                        <SuccessPopup 
                            isOpen={showSuccessPopup} 
                            onClose={() => setShowSuccessPopup(false)}
                            message="Yêu cầu cứu hộ đã gửi thành công!" 
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden">
                <MobileBottomNav />
            </div>
        </div>
    );
}
