"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import "@openmapvn/openmapvn-gl/dist/maplibre-gl.css";
import { CreateRescueRequestUseCase } from "@/modules/requests/application/createRescueRequest.usecase";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";
import { useToast } from "@/hooks/use-toast";

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

const MAX_PEOPLE = 100;
const MIN_DESCRIPTION = 10;
const MAX_DESCRIPTION = 500;

export default function CitizenRequestPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [currentLocation, setCurrentLocation] = useState("Đang tải vị trí...");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(
    null,
  );
  const [rescueRequest, setRescueRequest] = useState({
    dangerType: "",
    description: "",
    numberOfPeople: 1,
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadImageError, setUploadImageError] = useState<string | null>(null);

  // Quick action templates
  const quickRescueActions = [
    {
      id: "flood",
      icon: "🌊",
      label: "Ngập lụt",
      description: "Nước dâng cao, cần di chuyển khẩn cấp",
    },
    {
      id: "trapped",
      icon: "🏚️",
      label: "Bị kẹt",
      description: "Bị mắc kẹt, không thể thoát ra",
    },
    {
      id: "injury",
      icon: "🤕",
      label: "Bị thương",
      description: "Có người bị thương cần cấp cứu",
    },
    {
      id: "landslide",
      icon: "⛰️",
      label: "Sạt lở",
      description: "Đất đá sạt lở, nguy hiểm cao",
    },
    {
      id: "other",
      icon: "❓",
      label: "Khác",
      description: "Tình huống khẩn cấp khác",
    },
  ];

  // Mô tả mặc định tự động điền khi chọn loại nguy hiểm (≥10 chars cho backend)
  const defaultDescriptionMap: Record<string, string> = {
    flood: "Khu vực bị ngập lụt, nước dâng cao, cần hỗ trợ di chuyển khẩn cấp.",
    trapped: "Bị mắc kẹt tại vị trí hiện tại, không thể tự thoát ra ngoài.",
    injury: "Có người bị thương tại hiện trường, cần hỗ trợ y tế khẩn cấp.",
    landslide: "Khu vực xảy ra sạt lở đất đá, nguy hiểm cao, cần cứu hộ.",
    other: "Tình huống khẩn cấp cần hỗ trợ, vui lòng liên hệ sớm nhất.",
  };

  // Đọc type từ URL query param và pre-select
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "rescue") {
      setSelectedQuickAction("flood");
      setRescueRequest((prev) => ({
        ...prev,
        dangerType: "flood",
        description: prev.description || defaultDescriptionMap["flood"],
      }));
    } else if (typeParam === "report") {
      setSelectedQuickAction("landslide");
      setRescueRequest((prev) => ({
        ...prev,
        dangerType: "landslide",
        description: prev.description || defaultDescriptionMap["landslide"],
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Lấy vị trí hiện tại khi component mount
  useEffect(() => {
    getCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hàm lấy vị trí hiện tại
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);

    if (!("geolocation" in navigator)) {
      setCurrentLocation("Trình duyệt không hỗ trợ GPS");
      setIsLoadingLocation(false);
      toast({
        variant: "destructive",
        title: "Không hỗ trợ GPS",
        description:
          "Trình duyệt của bạn không hỗ trợ định vị. Vui lòng dùng trình duyệt hiện đại hơn.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lon: longitude });
        await getAddressFromOpenMap(latitude, longitude);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setCoordinates(null);
        setIsLoadingLocation(false);

        let description =
          "Không thể lấy vị trí GPS. Vui lòng bật GPS và cấp quyền cho trình duyệt, sau đó nhấn Cập nhật.";
        if (error.code === error.PERMISSION_DENIED) {
          description =
            "Bạn đã từ chối quyền truy cập vị trí. Vui lòng cấp quyền GPS trong cài đặt trình duyệt và nhấn Cập nhật.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          description =
            "Không nhận được tín hiệu GPS. Vui lòng kiểm tra thiết bị và thử lại.";
        } else if (error.code === error.TIMEOUT) {
          description = "Lấy vị trí GPS quá thời gian. Vui lòng thử lại.";
        }

        setCurrentLocation("Không thể lấy vị trí");
        toast({
          variant: "destructive",
          title: "Lỗi định vị GPS",
          description,
        });
      },
    );
  };

  // Hàm gọi API OpenMap.vn để lấy địa chỉ từ tọa độ (proxy qua Next.js để tránh CORS)
  const getAddressFromOpenMap = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `/api/reverse-geocode?lat=${lat}&lon=${lon}`,
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const location =
        data.address?.road ||
        data.address?.suburb ||
        data.address?.city_district ||
        data.address?.city ||
        data.address?.county ||
        data.address?.state ||
        data.display_name ||
        `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      setCurrentLocation(location);
    } catch (error) {
      console.warn(
        "Address lookup failed, falling back to coordinates:",
        error,
      );
      setCurrentLocation(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    }
  };

  // Xử lý submit form cứu hộ
  const handleRescueSubmit = async () => {
    // Validate: loại nguy hiểm (bắt buộc)
    if (!rescueRequest.dangerType) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng chọn loại nguy hiểm trước khi gửi yêu cầu.",
      });
      return;
    }

    // Validate: GPS (bắt buộc)
    if (!coordinates) {
      toast({
        variant: "destructive",
        title: "Chưa có vị trí GPS",
        description:
          "Không thể gửi yêu cầu khi chưa xác định được vị trí. Vui lòng bật GPS và nhấn Cập nhật.",
      });
      return;
    }

    // Validate: mô tả — bắt buộc, tối thiểu 10 ký tự, tối đa 500 ký tự (backend yêu cầu)
    if (!rescueRequest.description.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu mô tả",
        description: "Vui lòng mô tả tình huống trước khi gửi yêu cầu.",
      });
      return;
    }

    if (rescueRequest.description.trim().length < MIN_DESCRIPTION) {
      toast({
        variant: "destructive",
        title: "Mô tả quá ngắn",
        description: `Mô tả tình huống phải có ít nhất ${MIN_DESCRIPTION} ký tự.`,
      });
      return;
    }

    if (rescueRequest.description.length > MAX_DESCRIPTION) {
      toast({
        variant: "destructive",
        title: "Mô tả quá dài",
        description: `Mô tả tình huống không được vượt quá ${MAX_DESCRIPTION} ký tự (hiện tại: ${rescueRequest.description.length}).`,
      });
      return;
    }

    // Validate: số người — tối đa 100
    if (rescueRequest.numberOfPeople > MAX_PEOPLE) {
      toast({
        variant: "destructive",
        title: "Số người không hợp lệ",
        description: `Số người cần hỗ trợ không được vượt quá ${MAX_PEOPLE} người.`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Backend enum: Flood | Trapped | Injured | Landslide | Other
      const incidentTypeMap: Record<string, string> = {
        flood: "Flood",
        trapped: "Trapped",
        injury: "Injured",
        landslide: "Landslide",
        other: "Other",
      };
      const payload: Record<string, unknown> = {
        type: "Rescue",
        incidentType:
          incidentTypeMap[rescueRequest.dangerType] ?? rescueRequest.dangerType,
        description: rescueRequest.description.trim(),
        peopleCount: rescueRequest.numberOfPeople,
        location: {
          type: "Point",
          coordinates: [coordinates.lon, coordinates.lat] as [number, number],
        },
      };

      // imageUrls: chỉ gửi khi có ảnh, không gửi mảng rỗng (backend validate min 1)
      if (uploadedImages.length > 0) {
        payload.imageUrls = uploadedImages;
      }

      await createRescueRequestUseCase.execute(payload as any);
      toast({
        title: "Yêu cầu đã được gửi! 🎉",
        description: "Đội cứu hộ sẽ liên hệ với bạn sớm nhất có thể.",
      });
      setRescueRequest({
        dangerType: "",
        description: "",
        numberOfPeople: 1,
      });
      setUploadedImages([]);
      setSelectedQuickAction(null);
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: { message?: string | string[]; error?: string };
          status?: number;
        };
        message?: string;
      };
      const msgField = err?.response?.data?.message;
      const rawMsg: string =
        (Array.isArray(msgField) ? msgField.join(", ") : msgField) ||
        err?.response?.data?.error ||
        err?.message ||
        "Lỗi khi gửi yêu cầu cứu hộ";

      console.error(
        "Error submitting rescue request:",
        `HTTP ${err?.response?.status}`,
        JSON.stringify(err?.response?.data ?? {}),
        err?.message,
      );

      let displayMsg = rawMsg;
      if (
        /already has an? active request/i.test(rawMsg) ||
        /active.*request/i.test(rawMsg)
      ) {
        displayMsg =
          "Bạn đang có một yêu cầu cứu hộ đang xử lý. Vui lòng chờ yêu cầu hiện tại hoàn thành.";
      } else if (/validation failed/i.test(rawMsg) || /valid/i.test(rawMsg)) {
        displayMsg = `Dữ liệu không hợp lệ: ${rawMsg}. Vui lòng kiểm tra thông tin và thử lại.`;
      } else if (/unauthorized/i.test(rawMsg) || /401/.test(rawMsg)) {
        displayMsg = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      }

      toast({
        variant: "destructive",
        title: "Gửi yêu cầu thất bại",
        description: displayMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm upload ảnh lên server (server-side upload to Cloudinary)
  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    setUploadImageError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      let data: { success: boolean; url?: string; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Lỗi server (${response.status}) — vui lòng thử lại`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Lỗi HTTP ${response.status}`);
      }

      if (data.url) {
        setUploadedImages((prev) => [...prev, data.url!]);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Error uploading image:", msg);
      setUploadImageError(msg);
      setTimeout(() => setUploadImageError(null), 5000);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const descLen = rescueRequest.description.length;
  const descOverLimit = descLen > MAX_DESCRIPTION;

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
        <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
          {/* Request Type Selection */}
          <div className="space-y-4">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <span className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                1
              </span>
              Bạn cần hỗ trợ gì?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {quickRescueActions.map((type) => (
                <div
                  key={type.id}
                  onClick={() => {
                    setSelectedQuickAction(type.id);
                    setRescueRequest((prev) => ({
                      ...prev,
                      dangerType: type.id,
                      description:
                        defaultDescriptionMap[type.id] || prev.description,
                    }));
                  }}
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
              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-400 text-sm font-bold">
                    Mô tả tình huống{" "}
                    <span className="text-red-400 font-normal">*</span>
                  </label>
                  <span
                    className={`text-xs font-mono ${
                      descOverLimit ? "text-red-400 font-bold" : "text-gray-500"
                    }`}
                  >
                    {descLen}/{MAX_DESCRIPTION}
                  </span>
                </div>
                <textarea
                  value={rescueRequest.description}
                  onChange={(e) =>
                    setRescueRequest({
                      ...rescueRequest,
                      description: e.target.value,
                    })
                  }
                  className={`w-full bg-black/20 border rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none min-h-[120px] transition-colors ${
                    descOverLimit ?
                      "border-red-500 focus:border-red-400"
                    : "border-white/10 focus:border-[#FF7700]"
                  }`}
                  placeholder="Mô tả chi tiết tình huống (số lượng người, tình trạng sức khỏe, mức nước...)"
                />
                {descOverLimit && (
                  <p className="text-red-400 text-xs mt-1">
                    Mô tả vượt quá {MAX_DESCRIPTION} ký tự.
                  </p>
                )}
              </div>

              {/* Number of People */}
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">
                  Số lượng người cần hỗ trợ (ước tính, tối đa {MAX_PEOPLE})
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
                    min={1}
                    max={MAX_PEOPLE}
                    value={rescueRequest.numberOfPeople}
                    onChange={(e) =>
                      setRescueRequest({
                        ...rescueRequest,
                        numberOfPeople: Math.min(
                          MAX_PEOPLE,
                          Math.max(1, parseInt(e.target.value) || 1),
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
                        numberOfPeople: Math.min(
                          MAX_PEOPLE,
                          rescueRequest.numberOfPeople + 1,
                        ),
                      })
                    }
                    className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center text-xl font-bold hover:bg-white/20"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Location */}
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
                      className="text-[#FF7700] text-sm font-bold hover:underline disabled:opacity-50"
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
                  {!coordinates && !isLoadingLocation && (
                    <p className="text-red-400 text-xs mt-1">
                      ⚠️ Chưa xác định được vị trí — nhấn Cập nhật để thử lại.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="bg-black/20 border border-white/10 rounded-xl p-4 space-y-3">
              <label className="block text-gray-400 text-sm font-bold">
                📸 Hình ảnh hiện trường{" "}
                <span className="text-gray-500 font-normal">(tùy chọn)</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center gap-2 w-full py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  isUploadingImage ?
                    "border-[#FF7700]/40 bg-[#FF7700]/5 cursor-not-allowed"
                  : "border-white/20 hover:border-[#FF7700]/50 bg-white/5 hover:bg-white/10"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={isUploadingImage}
                  onChange={(e) => {
                    Array.from(e.target.files || []).forEach(handleImageUpload);
                    e.target.value = "";
                  }}
                />
                {isUploadingImage ?
                  <>
                    <div className="w-6 h-6 border-2 border-[#FF7700] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[#FF7700] text-sm font-bold">
                      Đang tải ảnh lên...
                    </span>
                  </>
                : <>
                    <span className="text-3xl">📷</span>
                    <span className="text-gray-300 text-sm font-bold">
                      Nhấn để chọn ảnh
                    </span>
                    <span className="text-gray-500 text-xs">
                      Hỗ trợ JPG, PNG, HEIC · Tối đa 10MB mỗi ảnh
                    </span>
                  </>
                }
              </label>

              {/* Inline error message */}
              {uploadImageError && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                  <span className="text-base shrink-0">⚠️</span>
                  <span>{uploadImageError}</span>
                </div>
              )}

              {uploadedImages.length > 0 && (
                <div>
                  <p className="text-gray-400 text-xs font-bold mb-2">
                    ĐÃ TẢI LÊN ({uploadedImages.length} ảnh)
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedImages.map((url, i) => (
                      <div
                        key={url}
                        className="relative aspect-square rounded-lg overflow-hidden group border border-white/10"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Ảnh hiện trường ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button
                          type="button"
                          onClick={() =>
                            setUploadedImages((prev) =>
                              prev.filter((_, j) => j !== i),
                            )
                          }
                          className="absolute top-1 right-1 w-6 h-6 bg-red-600 rounded-full hidden group-hover:flex items-center justify-center text-white text-xs font-bold shadow-lg"
                        >
                          ✕
                        </button>
                        
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleRescueSubmit}
              disabled={isSubmitting || descOverLimit}
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
