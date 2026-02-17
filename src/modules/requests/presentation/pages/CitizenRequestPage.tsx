"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import "@openmapvn/openmapvn-gl/dist/maplibre-gl.css";
import SuccessPopup from "@/shared/ui/components/SuccessPopup";
import { CreateRescueRequestUseCase } from "@/modules/requests/application/createRescueRequest.usecase";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";
import EmergencyButton from "../components/EmergencyButton";
import LocationInfoCard from "../components/LocationInfoCard";
import QuickActionsList from "../components/QuickActionsList";
import RescueRequestModal from "../components/RescueRequestModal";

// Initialize use case with repository
const createRescueRequestUseCase = new CreateRescueRequestUseCase(
  requestRepository,
);

// Dynamic import cho OpenMap để tránh SSR issues
const OpenMap = dynamic(
  () => import("@/modules/map/presentation/components/OpenMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
        <p className="text-gray-400">Đang tải bản đồ...</p>
      </div>
    ),
  },
);

export default function CitizenRequestPage() {
  const [currentLocation, setCurrentLocation] = useState("Đang tải vị trí...");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showRescueModal, setShowRescueModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(
    null,
  );
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
      color: "from-[#FF7700]/20 to-[#FF7700]/10 border-[#FF7700]/30",
    },
    {
      id: "trapped",
      icon: "🏚️",
      label: "Bị kẹt",
      description: "Bị mắc kẹt, không thể thoát ra",
      color: "from-[#FF7700]/20 to-[#FF7700]/10 border-[#FF7700]/30",
    },
    {
      id: "injury",
      icon: "🤕",
      label: "Bị thương",
      description: "Có người bị thương cần cấp cứu",
      color: "from-[#FF7700]/20 to-[#FF7700]/10 border-[#FF7700]/30",
    },
    {
      id: "landslide",
      icon: "⛰️",
      label: "Sạt lở",
      description: "Đất đá sạt lở, nguy hiểm cao",
      color: "from-[#FF7700]/20 to-[#FF7700]/10 border-[#FF7700]/30",
    },
  ];

  // Lấy vị trí hiện tại khi component mount
  useEffect(() => {
    getCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        },
      );
    } else {
      setCurrentLocation("Trình duyệt không hỗ trợ GPS");
      setIsLoadingLocation(false);
    }
  };

  // Hàm gọi API OpenMap.vn để lấy địa chỉ từ tọa độ
  const getAddressFromOpenMap = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://api.openmap.vn/api/v1/reverse?lat=${lat}&lon=${lon}`,
      );
      const data = await response.json();
      const location =
        data.address?.city ||
        data.address?.district ||
        data.address?.province ||
        data.display_name ||
        `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
      setCurrentLocation(location);
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

      // Use CreateRescueRequestUseCase instead of direct API call
      await createRescueRequestUseCase.execute(payload);
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
    } catch (error) {
      console.error("Error submitting rescue request:", error);
      alert("Lỗi khi gửi yêu cầu cứu hộ");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm upload ảnh lên server (server-side upload to Cloudinary)
  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data: { success: boolean; url: string } = await response.json();
      if (data.success && data.url) {
        setUploadedImages([...uploadedImages, data.url]);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Lỗi khi tải ảnh lên. Vui lòng thử lại!");
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header Banner */}
      <header className="sticky top-0 z-50 p-6 border-b border-white/10 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent backdrop-blur-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-white text-xl lg:text-2xl font-extrabold mb-0.5">
            Gửi yêu cầu
          </h1>
          <p className="text-white/90 text-xs lg:text-sm">
            Chúng tôi sẽ hỗ trợ bạn sớm nhất có thể
          </p>
        </div>
      </header>

      <main className="pb-24 lg:pb-0 overflow-auto">
        {/* Background Pattern - Removed as it is now in layout */}

        <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
          {/* Request Type Selection */}
          <div className="space-y-4">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <span className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                1
              </span>
              Bạn cần hỗ trợ gì?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickRescueActions.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setSelectedQuickAction(type.id)}
                  className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${
                    selectedQuickAction === type.id ?
                      "bg-[#FF7700]/10 border-[#FF7700]"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="font-bold text-white mb-1">{type.label}</div>
                  <div className="text-xs text-gray-400">
                    {type.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Request Form */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <span className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                2
              </span>
              Thông tin chi tiết
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">
                  Mô tả tình huống
                </label>
                <textarea
                  value={rescueRequest.description}
                  onChange={(e) =>
                    setRescueRequest({
                      ...rescueRequest,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF7700] min-h-[120px]"
                  placeholder="Vui lòng mô tả chi tiết tình huống của bạn (số lượng người, tình trạng sức khỏe, mức nước...)"
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">
                  Số lượng người cần hỗ trợ (ước tính)
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setRescueRequest({
                        ...rescueRequest,
                        numberOfPeople: Math.max(
                          1,
                          rescueRequest.numberOfPeople - 1,
                        ),
                      })
                    }
                    className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center text-xl font-bold hover:bg-white/20"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={rescueRequest.numberOfPeople}
                    onChange={(e) =>
                      setRescueRequest({
                        ...rescueRequest,
                        numberOfPeople: Math.max(
                          1,
                          parseInt(e.target.value) || 0,
                        ),
                      })
                    }
                    className="w-20 bg-black/20 border border-white/10 rounded-lg p-2 text-center text-white font-bold"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setRescueRequest({
                        ...rescueRequest,
                        numberOfPeople: rescueRequest.numberOfPeople + 1,
                      })
                    }
                    className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center text-xl font-bold hover:bg-white/20"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">
                  Mức độ khẩn cấp
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      value: "low",
                      label: "Thấp",
                      color: "bg-blue-500",
                      icon: "ℹ️",
                    },
                    {
                      value: "medium",
                      label: "Trung bình",
                      color: "bg-yellow-500",
                      icon: "⚠️",
                    },
                    {
                      value: "high",
                      label: "Cao",
                      color: "bg-orange-500",
                      icon: "🚨",
                    },
                    {
                      value: "critical",
                      label: "Nguy kịch",
                      color: "bg-red-500",
                      icon: "🆘",
                    },
                  ].map((level) => (
                    <div
                      key={level.value}
                      onClick={() =>
                        setRescueRequest({
                          ...rescueRequest,
                          urgencyLevel: level.value,
                        })
                      }
                      className={`cursor-pointer rounded-lg p-3 border transition-all flex items-center gap-2 ${
                        rescueRequest.urgencyLevel === level.value ?
                          `${level.color}/20 border-${level.color.split("-")[1]}-500 ring-1 ring-${level.color.split("-")[1]}-500`
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span>{level.icon}</span>
                      <span
                        className={`font-bold ${
                          rescueRequest.urgencyLevel === level.value ?
                            "text-white"
                          : "text-gray-400"
                        }`}
                      >
                        {level.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">
                  Vị trí hiện tại
                </label>
                <div className="bg-black/20 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold">
                      {isLoadingLocation ?
                        "Đang lấy vị trí..."
                      : currentLocation}
                    </span>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isLoadingLocation}
                      className="text-[#FF7700] text-sm font-bold hover:underline"
                    >
                      Cập nhật
                    </button>
                  </div>
                  {coordinates && (
                    <div className="h-40 bg-slate-700 rounded-lg overflow-hidden relative">
                      <OpenMap
                        latitude={coordinates.lat}
                        longitude={coordinates.lon}
                        address={currentLocation}
                      />
                    </div>
                  )}
                  {/* {locationError && (
                          <div className="text-red-500 text-sm mt-2">{locationError}</div>
                      )} */}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {/* {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm font-bold text-center">
                  ⚠️ {error}
                </div>
              )} */}

            <button
              onClick={handleRescueSubmit}
              disabled={isSubmitting}
              className="w-full bg-[#FF7700] hover:bg-[#FF8800] text-white font-black text-xl py-4 rounded-xl shadow-lg shadow-[#FF7700]/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ?
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ĐANG GỬI...
                </>
              : <>
                  <span>🚀</span> GỬI YÊU CẦU NGAY
                </>
              }
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
