"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  PiUserBold, 
  PiPhoneBold, 
  PiSirenBold, 
  PiMapPinBold, 
  PiUsersBold, 
  PiWarningBold,
  PiNotePencilBold,
  PiArrowLeftBold,
  PiCrosshairBold,
  PiMapTrifoldBold,
  PiMagnifyingGlassBold
} from "react-icons/pi";
import { FiPackage, FiCheck } from "react-icons/fi";
import { toast } from "sonner";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";
import { CreateOnBehalfUseCase } from "../../application/createOnBehalf.usecase";
import { CreateOnBehalfInput, IncidentType, PriorityLevel } from "../../domain/request.entity";

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

const INCIDENT_TYPES: IncidentType[] = ["Flood", "Trapped", "Injured", "Landslide", "Other"];
const PRIORITY_LEVELS: PriorityLevel[] = ["Normal", "High", "Critical"];

const createOnBehalfUseCase = new CreateOnBehalfUseCase(requestRepository);

export default function CoordinatorCreateRequestPage() {
  const router = useRouter();
  const reverseGeoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formData, setFormData] = useState<Partial<CreateOnBehalfInput>>({
    type: "Rescue",
    incidentType: "Flood",
    priority: "Normal",
    peopleCount: 1,
    description: "",
    userName: "",
    phoneNumber: "",
    location: {
      type: "Point",
      coordinates: [105.7801, 21.0285], // Default Hanoii
    },
  });

  const [currentAddress, setCurrentAddress] = useState("Vui lòng chọn vị trí trên bản đồ");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationSource, setLocationSource] = useState<"gps" | "manual">("manual");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === "peopleCount" ? Number.parseInt(value) || 0 : value 
    }));
  };

  const handleManualLocationSelect = (lat: number, lon: number) => {
    setLocationSource("manual");
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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationSource("gps");
        setFormData((prev) => ({
          ...prev,
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        }));
        getAddressFromCoords(latitude, longitude);
        toast.success("Đã lấy vị trí GPS thành công");
      },
      (error) => {
        toast.error("Không thể lấy vị trí GPS. Vui lòng cấp quyền.");
        console.error(error);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userName || !formData.phoneNumber || !formData.description) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      // Explicitly construct payload to avoid extra fields
      const payload: CreateOnBehalfInput = {
        type: (formData.type as any) || "Rescue",
        incidentType: (formData.incidentType as any) || "Flood",
        priority: (formData.priority as any) || "Normal",
        peopleCount: Number(formData.peopleCount) || 1,
        description: formData.description || "",
        userName: formData.userName || "",
        phoneNumber: formData.phoneNumber || "",
        location: {
          type: "Point",
          coordinates: formData.location?.coordinates || [105.7801, 21.0285]
        }
      };

      await createOnBehalfUseCase.execute(payload);
      toast.success("Tạo yêu cầu hộ thành công!");
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
            Tạo yêu cầu hộ Citizen
          </h1>
          <div className="w-[120px]"></div> {/* Spacer */}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full p-4 lg:p-6 gap-6">
        
        {/* Left Section: Form (40%) */}
        <section className="w-full lg:w-[450px] flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">
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

            {/* Request Type & Priority */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <h2 className="text-[#FF7700] text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <PiSirenBold className="text-lg" /> Chi tiết yêu cầu
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Loại yêu cầu</label>
                  <div className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-[#FF7700] text-sm font-black uppercase">
                    🆘 Cứu hộ (Rescue)
                  </div>
                </div>
                <div className="space-y-1 invisible">
                  {/* Space filler or extra field if needed */}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Tình huống</label>
                  <select 
                    name="incidentType"
                    value={formData.incidentType}
                    onChange={handleChange}
                    className="w-full bg-[#1a2b3c] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF7700]"
                  >
                    {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Số người</label>
                  <div className="relative">
                    <PiUsersBold className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="number" 
                      name="peopleCount"
                      value={formData.peopleCount}
                      onChange={handleChange}
                      min={1}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-[#FF7700]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Mức độ ưu tiên</label>
                  <select 
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full bg-[#1a2b3c] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF7700]"
                  >
                    {PRIORITY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
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
        <section className="flex-1 flex flex-col bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative">
          
          {/* Map Header */}
          <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center bg-[#0d1e2c]/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex flex-col">
              <h3 className="text-white text-sm font-black uppercase">Bản đồ vị trí</h3>
              <p className="text-gray-400 text-[10px]">Nhấn trên bản đồ để chọn đúng vị trí của citizen</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={getCurrentLocation}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FF7700]/20 text-[#FF7700] hover:bg-[#FF7700]/30 transition text-xs font-bold border border-[#FF7700]/30"
              >
                <PiCrosshairBold className="text-sm" /> Lấy vị trí GPS
              </button>
              <button 
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 transition text-xs font-bold border border-white/10"
              >
                <PiMapTrifoldBold className="text-sm" /> Chọn thủ công
              </button>
            </div>
          </div>

          <OpenMap 
            latitude={formData.location?.coordinates[1]}
            longitude={formData.location?.coordinates[0]}
            onLocationSelect={handleManualLocationSelect}
            isSelectionMode={true}
            address={currentAddress}
          />

          {/* Map Footer Bar (Address Area) */}
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#0d1e2c]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF7700]/10 flex items-center justify-center text-[#FF7700] text-xl border border-[#FF7700]/20 flex-shrink-0">
              <PiMapPinBold />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{currentAddress}</p>
              <p className="text-gray-500 text-[10px] font-mono mt-0.5">
                {formData.location?.coordinates[1].toFixed(6)}, {formData.location?.coordinates[0].toFixed(6)}
              </p>
            </div>
            <button className="p-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition border border-white/10">
              <PiMagnifyingGlassBold className="text-lg" />
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
