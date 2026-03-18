"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "@openmapvn/openmapvn-gl/dist/maplibre-gl.css";
import type { RescueTeam } from "../../domain/mission.entity";

// Dynamic import cho OpenMap để tránh SSR issues
const OpenMap = dynamic(
  () => import("@/modules/map/presentation/components/OpenMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 bg-slate-300 rounded-lg animate-pulse flex items-center justify-center text-slate-500">
        Đang tải bản đồ...
      </div>
    ),
  },
);

interface AddTeamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (teamIds: string[], note?: string) => Promise<void>;
  teams: RescueTeam[];
  loading?: boolean;
}

export default function AddTeamsModal({
  isOpen,
  onClose,
  onAdd,
  teams,
  loading = false,
}: AddTeamsModalProps) {
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Location states for minimap
  const [currentLocation, setCurrentLocation] = useState("Đang tải vị trí...");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSelectedTeams(new Set());
      setNote("");
      fetchLocation();
    }
  }, [isOpen]);

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
          // Proxy qua Next.js để tránh CORS (Nominatim)
          const response = await fetch(
            `/api/reverse-geocode?lat=${latitude}&lon=${longitude}`,
          );
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();
          // Nominatim field order: road > suburb > city_district > city > county > state
          const location =
            data.address?.road ||
            data.address?.suburb ||
            data.address?.city_district ||
            data.address?.city ||
            data.address?.county ||
            data.address?.state ||
            data.display_name ||
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setCurrentLocation(location);
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (selectedTeams.size === 0) return;
    setSubmitting(true);
    try {
      await onAdd(Array.from(selectedTeams), note || undefined);
      onClose();
    } catch (error) {
      console.error("Failed to add teams:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTeam = (id: string) => {
    const newSet = new Set(selectedTeams);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedTeams(newSet);
  };

  const availableTeams = teams.filter(
    (t) =>
      t.status === "AVAILABLE" ||
      t.status === "Available" ||
      t.status === "available",
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a3a52] border border-white/10 rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-1">👥 Thêm Đội Cứu Hộ/Cứu Trợ</h2>
        <p className="text-gray-400 text-sm mb-4">
          Chọn các đội sẽ tham gia vào nhiệm vụ này
        </p>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Team Selection */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Danh sách Đội Khả dụng (AVAILABLE) *
              </label>

              <div className="max-h-60 overflow-y-auto space-y-2 bg-white/5 p-3 rounded-lg border border-white/10">
                {availableTeams.length === 0 ? (
                  <p className="text-yellow-400 text-sm text-center py-4">
                    ⚠️ Không có đội nào khả dụng
                  </p>
                ) : (
                  availableTeams.map((team) => (
                    <label 
                      key={team._id} 
                      className="flex items-start gap-3 p-2 hover:bg-white/5 rounded cursor-pointer"
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedTeams.has(team._id)}
                        onChange={() => toggleTeam(team._id)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-white font-medium text-sm">
                          {team.name}
                        </div>
                        <div className="text-gray-400 text-xs mt-1">
                          Trạng thái: <span className="text-green-400">{team.status}</span>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Location Bar with Mini Map */}
            {selectedTeams.size > 0 && (
              <div className="bg-slate-200 rounded-xl p-4 shadow-lg border-l-4 border-[#FF7700]">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="text-lg" aria-hidden="true">
                      📍
                    </span>
                    <span className="text-sm font-bold uppercase tracking-wide">
                      Vị trí hiện tại
                    </span>
                  </div>
                  <button
                    onClick={fetchLocation}
                    disabled={isLoadingLocation}
                    className="text-[#FF3535] text-xs font-bold uppercase hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-opacity focus:outline-none focus:ring-2 focus:ring-[#FF7700]/50 rounded px-2 py-1"
                    aria-label="Cập nhật vị trí"
                  >
                    {isLoadingLocation ? "..." : "↻"}
                  </button>
                </div>
                {locationError && (
                  <div className="text-xs text-red-600 mb-2 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{locationError}</span>
                  </div>
                )}
                <p className="text-slate-800 text-sm font-bold mb-2">
                  {isLoadingLocation ?
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></span>
                      Đang tải...
                    </span>
                    : currentLocation}
                </p>
                {coordinates && (
                  <div className="text-xs text-slate-500 font-mono mb-3">
                    Lat: {coordinates.lat.toFixed(4)} • Long:{" "}
                    {coordinates.lon.toFixed(4)}
                  </div>
                )}

                {/* Mini Map */}
                {coordinates && (
                  <div className="mt-3 h-48 rounded-lg overflow-hidden border-2 border-slate-300 shadow-inner">
                    <OpenMap
                      latitude={coordinates.lat}
                      longitude={coordinates.lon}
                      address={currentLocation}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Note */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Ghi chú (Tùy chọn)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Cần mang theo xuồng máy"
                rows={2}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedTeams.size === 0 || submitting}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {submitting ? "Đang thêm..." : `✅ Thêm ${selectedTeams.size} đội`}
          </button>
        </div>
      </div>
    </div>
  );
}
