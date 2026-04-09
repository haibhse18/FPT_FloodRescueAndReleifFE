"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  PiUserBold,
  PiPhoneBold,
  PiSirenBold,
  PiMapPinBold,
  PiNotePencilBold,
  PiArrowLeftBold,
  PiMagnifyingGlassBold
} from "react-icons/pi";
import { toast } from "sonner";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";
import { CreateOnBehalfUseCase } from "../../application/createOnBehalf.usecase";
import { CreateOnBehalfInput, IncidentType } from "../../domain/request.entity";

// Map component using OpenMapvn/MapLibre (consistency with screenshot)
const OpenMap = dynamic(
  () => import("@/modules/map/presentation/components/OpenMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#FF7700] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Đang tải bản đồ...</p>
        </div>
      </div>
    ),
  }
);

const INCIDENT_OPTIONS: Array<{ value: IncidentType; label: string }> = [
  { value: "Flood", label: "Ngập lụt" },
  { value: "Trapped", label: "Mắc kẹt" },
  { value: "Landslide", label: "Sạt lở" },
  { value: "Other", label: "Khác" },
];

const INCIDENT_DESCRIPTION_TEMPLATES: Record<IncidentType, string> = {
  Flood:
    "Khu vực đang ngập sâu, nước dâng nhanh, người dân khó di chuyển và cần hỗ trợ tiếp cận an toàn.",
  Trapped:
    "Người dân đang mắc kẹt tại vị trí hiện tại, không thể tự thoát ra và cần đội cứu hộ tiếp cận khẩn cấp.",
  Landslide:
    "Khu vực có nguy cơ sạt lở hoặc đã xảy ra sạt lở, đường đi bị cản trở và cần hỗ trợ sơ tán an toàn.",
  Injured:
    "Có người bị thương cần được sơ cứu hoặc hỗ trợ y tế ban đầu, vui lòng ưu tiên tiếp cận an toàn.",
  Other:
    "Tình huống khẩn cấp khác cần hỗ trợ cứu hộ. Vui lòng bổ sung chi tiết cụ thể để điều phối nhanh hơn.",
};

const createOnBehalfUseCase = new CreateOnBehalfUseCase(requestRepository);
const MIN_PEOPLE_COUNT = 1;
const MAX_PEOPLE_COUNT = 20;

const clampPeopleCount = (value: number) =>
  Math.min(MAX_PEOPLE_COUNT, Math.max(MIN_PEOPLE_COUNT, value));

const isValidPhoneNumber = (phone: string) => {
  const normalized = phone.replace(/[\s.-]/g, "");
  return /^(\+84|0)\d{9,10}$/.test(normalized);
};

export default function CoordinatorCreateRequestPage() {
  const router = useRouter();
  const reverseGeoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const incidentDropdownRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState<Partial<CreateOnBehalfInput>>({
    type: "Rescue",
    incidentType: "Flood",
    peopleCount: 1,
    description: "",
    userName: "",
    phoneNumber: "",
    location: {
      type: "Point",
      coordinates: [105.7801, 21.0285], // Default Hanoii
    },
  });

  const [currentAddress, setCurrentAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIncidentDropdownOpen, setIsIncidentDropdownOpen] = useState(false);
  const [addressQuery, setAddressQuery] = useState("");
  const [isAddressSearching, setIsAddressSearching] = useState(false);

  const hasRequiredIdentity =
    (formData.userName || "").trim().length > 0 &&
    (formData.phoneNumber || "").trim().length > 0;

  const selectedIncidentLabel =
    INCIDENT_OPTIONS.find((option) => option.value === formData.incidentType)?.label || "Chọn tình huống";

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!incidentDropdownRef.current) {
        return;
      }
      if (!incidentDropdownRef.current.contains(event.target as Node)) {
        setIsIncidentDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "peopleCount" ? Number.parseInt(value) || 0 : value
    }));
  };

  const handlePeopleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (rawValue === "") {
      setFormData((prev) => ({ ...prev, peopleCount: MIN_PEOPLE_COUNT }));
      return;
    }

    const parsedValue = Number.parseInt(rawValue, 10);
    setFormData((prev) => ({
      ...prev,
      peopleCount: Number.isNaN(parsedValue) ? MIN_PEOPLE_COUNT : clampPeopleCount(parsedValue),
    }));
  };

  const increasePeopleCount = () => {
    setFormData((prev) => ({
      ...prev,
      peopleCount: clampPeopleCount((prev.peopleCount ?? MIN_PEOPLE_COUNT) + 1),
    }));
  };

  const decreasePeopleCount = () => {
    setFormData((prev) => ({
      ...prev,
      peopleCount: clampPeopleCount((prev.peopleCount ?? MIN_PEOPLE_COUNT) - 1),
    }));
  };

  const handleManualLocationSelect = (lat: number, lon: number) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        type: "Point",
        coordinates: [lon, lat],
      },
    }));

    if (reverseGeoTimerRef.current) clearTimeout(reverseGeoTimerRef.current);
    reverseGeoTimerRef.current = setTimeout(() => {
      void getAddressFromCoords(lat, lon);
    }, 500);
  };

  const getAddressFromCoords = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
      const data = await response.json();
      const address = data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      setCurrentAddress(address);
    } catch (error) {
      console.warn("Reverse geocode failed", error);
      setCurrentAddress(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
    }
  };

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    const query = addressQuery.trim();
    if (!query) {
      toast.error("Vui lòng nhập địa chỉ");
      return;
    }

    try {
      setIsAddressSearching(true);

      let result: any = null;
      const response = await fetch(`/api/goong/geocode?address=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (response.ok && Array.isArray(data?.results) && data.results.length > 0) {
        result = data.results[0];
      } else {
        const fallbackResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        const fallbackData = await fallbackResponse.json();
        if (!fallbackResponse.ok || !Array.isArray(fallbackData) || fallbackData.length === 0) {
          throw new Error("Không tìm thấy địa chỉ");
        }

        result = {
          formatted_address: fallbackData[0]?.display_name,
          geometry: {
            location: {
              lat: Number(fallbackData[0]?.lat),
              lng: Number(fallbackData[0]?.lon),
            },
          },
        };
      }

      const lat = Number(result?.geometry?.location?.lat);
      const lon = Number(result?.geometry?.location?.lng);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        throw new Error("Không tìm thấy tọa độ hợp lệ");
      }

      setFormData((prev) => ({
        ...prev,
        location: {
          type: "Point",
          coordinates: [lon, lat],
        },
      }));

      setCurrentAddress(result?.formatted_address || query);
    } catch {
      toast.error("Không tìm thấy địa chỉ. Vui lòng thử lại.");
    } finally {
      setIsAddressSearching(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userName = (formData.userName || "").trim();
    const phoneNumber = (formData.phoneNumber || "").trim();
    const description = (formData.description || "").trim();

    if (!userName) {
      toast.error("Vui lòng nhập họ và tên");
      return;
    }

    if (!phoneNumber) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }

    if (!description) {
      toast.error("Vui lòng nhập mô tả chi tiết");
      return;
    }

    try {
      // Explicitly construct payload to avoid extra fields
      const payload: CreateOnBehalfInput = {
        type: (formData.type as any) || "Rescue",
        incidentType: (formData.incidentType as any) || "Flood",
        priority: "Normal",
        peopleCount: clampPeopleCount(Number(formData.peopleCount) || MIN_PEOPLE_COUNT),
        description,
        userName,
        phoneNumber,
        location: {
          type: "Point",
          coordinates: formData.location?.coordinates || [105.7801, 21.0285]
        }
      };

      await createOnBehalfUseCase.execute(payload);
      toast.success("Tạo yêu cầu thành công!");
      router.push("/requests");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Lỗi khi tạo yêu cầu";
      toast.error(errorMsg);
      console.error("Create on behalf error:", err.response?.data || err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#133249]">
      {/* Header */}
      <header className="flex-shrink-0 z-30 px-6 py-4 border-b border-white/10 bg-[#0d1e2c]/80 backdrop-blur-md">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition font-bold"
          >
            <PiArrowLeftBold /> Quay lại
          </button>
          <h1 className="text-white text-2xl font-black uppercase tracking-widest">
            Tạo yêu cầu
          </h1>
          <div className="w-[120px]"></div> {/* Spacer */}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full p-4 lg:p-6 gap-6">

        {/* Left Section: Form */}
        <section className="w-full lg:w-[360px] xl:w-[420px] flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Citizen Identity */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <h2 className="text-[#FF7700] text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <PiUserBold className="text-lg" /> Thông tin Citizen
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-2 mb-1 block">Họ và tên</label>
                  <div className="relative">
                    <PiUserBold className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleChange}
                      placeholder="Nhập tên người cần cứu trợ"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-[#FF7700] outline-none transition"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Số điện thoại</label>
                  <div className="relative">
                    <PiPhoneBold className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Số điện thoại liên lạc"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-[#FF7700] outline-none transition"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Request Type */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <h2 className="text-[#FF7700] text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <PiSirenBold className="text-lg" /> Chi tiết yêu cầu
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Tình huống</label>
                  <div ref={incidentDropdownRef} className="relative">
                    <button
                      type="button"
                      disabled={!hasRequiredIdentity}
                      onClick={() => setIsIncidentDropdownOpen((prev) => !prev)}
                      className={`w-full text-left bg-[#0f2233] border border-[#FF7700]/60 px-4 py-3 text-[#dbeafe] text-sm font-semibold outline-none transition ${isIncidentDropdownOpen
                          ? "rounded-t-xl rounded-b-none border-b-transparent"
                          : "rounded-xl hover:border-[#FF7700]"
                        } ${!hasRequiredIdentity ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {selectedIncidentLabel}
                    </button>

                    {isIncidentDropdownOpen && hasRequiredIdentity && (
                      <div className="absolute left-0 right-0 top-full -mt-px z-20 bg-[#0f2233] border border-[#FF7700]/60 border-t-[#FF7700]/40 rounded-b-xl overflow-hidden shadow-2xl">
                        {INCIDENT_OPTIONS.map((option) => {
                          const isActive = formData.incidentType === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  incidentType: option.value,
                                  description:
                                    INCIDENT_DESCRIPTION_TEMPLATES[option.value] || prev.description,
                                }));
                                setIsIncidentDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition ${isActive
                                  ? "bg-[#1a3b54] text-[#7dd3fc] font-semibold"
                                  : "text-[#dbeafe] hover:bg-[#17354c]"
                                }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Số người</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={decreasePeopleCount}
                      disabled={!hasRequiredIdentity || (formData.peopleCount ?? MIN_PEOPLE_COUNT) <= MIN_PEOPLE_COUNT}
                      className="w-10 h-10 rounded-xl border border-white/15 bg-white/5 text-white text-xl font-bold hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      aria-label="Giảm số người"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      name="peopleCount"
                      value={formData.peopleCount ?? MIN_PEOPLE_COUNT}
                      onChange={handlePeopleCountChange}
                      min={MIN_PEOPLE_COUNT}
                      max={MAX_PEOPLE_COUNT}
                      step={1}
                      inputMode="numeric"
                      disabled={!hasRequiredIdentity}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-white outline-none focus:border-[#FF7700] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={increasePeopleCount}
                      disabled={!hasRequiredIdentity || (formData.peopleCount ?? MIN_PEOPLE_COUNT) >= MAX_PEOPLE_COUNT}
                      className="w-10 h-10 rounded-xl border border-white/15 bg-white/5 text-white text-xl font-bold hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      aria-label="Tăng số người"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Mô tả chi tiết</label>
                <div className="relative">
                  <PiNotePencilBold className="absolute left-4 top-4 text-gray-400" />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    disabled={!hasRequiredIdentity}
                    placeholder="Mô tả cụ thể tình hình của người dân..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-[#FF7700] transition"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-[#FF7700] hover:bg-[#FF8820] text-white font-black text-lg uppercase tracking-widest transition-all shadow-lg shadow-[#FF7700]/20 disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận tạo yêu cầu"}
            </button>
          </form>
        </section>

        {/* Right Section: Map (Fills remaining) */}
        <section className="flex-1 min-w-0 flex flex-col bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative">

          <OpenMap
            latitude={formData.location?.coordinates[1]}
            longitude={formData.location?.coordinates[0]}
            onLocationSelect={hasRequiredIdentity ? handleManualLocationSelect : undefined}
            isSelectionMode={true}
            address={currentAddress}
          />

          {!hasRequiredIdentity && (
            <div className="absolute inset-0 z-10 bg-[#0d1e2c]/45 backdrop-blur-[1px] flex items-center justify-center px-6 text-center pointer-events-auto">
              <p className="text-white/90 text-sm font-semibold max-w-sm">
                Vui lòng nhập đầy đủ Họ và tên, Số điện thoại trước khi chọn vị trí và nhập thông tin yêu cầu.
              </p>
            </div>
          )}

          {/* Map Footer Bar (Address Area) */}
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#0d1e2c]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF7700]/10 flex items-center justify-center text-[#FF7700] text-xl border border-[#FF7700]/20 flex-shrink-0">
              <PiMapPinBold />
            </div>
            <form onSubmit={handleSearchAddress} className="flex-1 min-w-0">
              <label className="text-[10px] font-bold text-gray-300 uppercase ml-1 mb-1 block">
                Nhập địa chỉ để định vị
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                  disabled={!hasRequiredIdentity}
                  placeholder="Ví dụ: 123 Lê Lợi, Quận 1, TP.HCM"
                  className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-400 outline-none focus:border-[#FF7700]"
                />
                <button
                  type="submit"
                  disabled={!hasRequiredIdentity || isAddressSearching}
                  className="p-2.5 rounded-xl bg-[#FF7700] hover:bg-[#FF8820] text-white transition disabled:opacity-60"
                  aria-label="Tìm địa chỉ"
                >
                  <PiMagnifyingGlassBold className="text-lg" />
                </button>
              </div>
              {currentAddress ? (
                <>
                  <p className="text-white text-xs font-semibold truncate mt-1.5">{currentAddress}</p>
                  <p className="text-gray-500 text-[10px] font-mono mt-0.5">
                    {formData.location?.coordinates[1].toFixed(6)}, {formData.location?.coordinates[0].toFixed(6)}
                  </p>
                </>
              ) : null}
            </form>
          </div>
        </section>

      </main>
    </div>
  );
}
