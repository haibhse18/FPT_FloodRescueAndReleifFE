"use client";

import { useState } from "react";
import { Modal } from "@/shared/ui/components/Modal";
import {
  PiUserBold,
  PiPhoneBold,
  PiSirenBold,
  PiMapPinBold,
  PiUsersBold,
  PiWarningBold,
  PiNotePencilBold
} from "react-icons/pi";
import { FiPackage } from "react-icons/fi";
import {
  RequestType,
  IncidentType,
  PriorityLevel,
  CreateOnBehalfInput
} from "../../domain/request.entity";

interface CreateOnBehalfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOnBehalfInput) => Promise<void>;
  isSubmitting: boolean;
}

const INCIDENT_TYPES: IncidentType[] = ["Flood", "Trapped", "Injured", "Landslide", "Other"];
const PRIORITY_LEVELS: PriorityLevel[] = ["Normal", "High", "Critical"];

export default function CreateOnBehalfModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateOnBehalfModalProps) {
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
      coordinates: [105.7801, 21.0285], // Default Hanoii coordinates
    },
  });

  const [lat, setLat] = useState<string>("21.0285");
  const [lng, setLng] = useState<string>("105.7801");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "lat") setLat(value);
    if (name === "lng") setLng(value);

    const latitude = parseFloat(name === "lat" ? value : lat);
    const longitude = parseFloat(name === "lng" ? value : lng);

    if (!isNaN(latitude) && !isNaN(longitude)) {
      setFormData((prev) => ({
        ...prev,
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.userName && formData.phoneNumber && formData.description && formData.location) {
      // Luôn gửi type="Rescue" cho mọi request
      const payload = {
        ...formData,
        type: "Rescue" as const,
      };
      await onSubmit(payload as CreateOnBehalfInput);
    } else {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo yêu cầu Citizen"
      icon="🆘"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-1 text-white">
        {/* User Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
              <PiUserBold className="text-[#FF7700]" /> Họ và tên citizen
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Nhập tên người cần cứu trợ"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[#FF7700] outline-none transition"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
              <PiPhoneBold className="text-[#FF7700]" /> Số điện thoại
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Nhập số điện thoại liên lạc"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[#FF7700] outline-none transition"
              required
            />
          </div>
        </div>

        {/* Type & Priority Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
              <PiSirenBold className="text-[#FF7700]" /> Loại yêu cầu
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-[#1a2b3c] border border-white/10 rounded-xl px-4 py-3 focus:border-[#FF7700] outline-none transition"
            >
              <option value="Rescue">Cứu hộ (Rescue)</option>
              <option value="Relief">Cứu trợ (Relief)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
              <PiWarningBold className="text-[#FF7700]" /> Tình huống
            </label>
            <select
              name="incidentType"
              value={formData.incidentType}
              onChange={handleChange}
              className="w-full bg-[#1a2b3c] border border-white/10 rounded-xl px-4 py-3 focus:border-[#FF7700] outline-none transition"
            >
              {INCIDENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
              <PiWarningBold className="text-[#FF7700]" /> Mức độ ưu tiên
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full bg-[#1a2b3c] border border-white/10 rounded-xl px-4 py-3 focus:border-[#FF7700] outline-none transition"
            >
              {PRIORITY_LEVELS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
            <PiMapPinBold className="text-[#FF7700]" /> Tọa độ (Lat/Lng)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="lat"
              value={lat}
              onChange={handleCoordinateChange}
              placeholder="Vĩ độ (Latitude)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[#FF7700] outline-none transition"
            />
            <input
              type="text"
              name="lng"
              value={lng}
              onChange={handleCoordinateChange}
              placeholder="Kinh độ (Longitude)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[#FF7700] outline-none transition"
            />
          </div>
          <p className="text-[10px] text-gray-500 italic">* Mặc định tọa độ trung tâm Hà Nội nếu không nhập.</p>
        </div>

        {/* People Count & Description */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2 md:col-span-1">
            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
              <PiUsersBold className="text-[#FF7700]" /> Số người
            </label>
            <input
              type="number"
              name="peopleCount"
              value={formData.peopleCount}
              onChange={handleChange}
              min={1}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[#FF7700] outline-none transition"
            />
          </div>
          <div className="space-y-2 md:col-span-3">
            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
              <PiNotePencilBold className="text-[#FF7700]" /> Mô tả chi tiết
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="Mô tả tình hình cụ thể..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[#FF7700] outline-none transition"
              required
            />
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] px-6 py-3 rounded-xl bg-[#FF7700] hover:bg-[#FF8820] text-white font-black transition disabled:opacity-50"
          >
            {isSubmitting ? "Đang tạo..." : "Xác nhận tạo yêu cầu"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
