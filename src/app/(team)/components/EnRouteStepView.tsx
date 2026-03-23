"use client";

import { useState, useEffect } from "react";
import { FaMapMarkedAlt } from "react-icons/fa";
import MissionMapView from "./MissionMapView";
import type { MissionRequest } from "@/modules/missions/domain/missionRequest.entity";

interface EnRouteStepViewProps {
  missionRequests: MissionRequest[];
  onArrived: () => void;
  loading?: boolean;
}

export default function EnRouteStepView({
  missionRequests,
  onArrived,
  loading = false,
}: EnRouteStepViewProps) {
  const [teamLocation, setTeamLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get team's current location using Geolocation API
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ định vị");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setTeamLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError("Không thể lấy vị trí hiện tại");
        // Fallback to Hanoi center if geolocation fails
        setTeamLocation({ lat: 21.0285, lng: 105.8542 });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <div className="relative h-full flex flex-col">
      {/* Full-width Map */}
      <div className="flex-1 relative">
        <MissionMapView
          missionRequests={missionRequests}
          teamLocation={teamLocation}
          className="h-full"
        />

        {/* Location Error Overlay */}
        {locationError && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-mission-status-warning/90 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
            ⚠️ {locationError}
          </div>
        )}

        {/* Team Location Indicator */}
        {teamLocation && (
          <div className="absolute top-4 right-4 bg-mission-status-assigned/90 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Đang theo dõi vị trí
          </div>
        )}
      </div>

      {/* Floating Arrived Button */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <button
          onClick={onArrived}
          disabled={loading}
          className="px-10 py-5 rounded-full bg-mission-action-primary hover:bg-mission-action-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg transition-all transform hover:scale-110 disabled:transform-none shadow-2xl flex items-center gap-3"
        >
          {loading ? (
            <>
              <div className="h-6 w-6 rounded-full border-2 border-t-transparent border-white animate-spin" />
              Đang cập nhật...
            </>
          ) : (
            <>
              <FaMapMarkedAlt className="text-2xl" />
              Đã đến hiện trường
            </>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-mission-bg-secondary/80 backdrop-blur-sm border border-mission-border text-mission-text-secondary px-5 py-2 rounded-lg text-sm text-center max-w-md">
        Đang di chuyển đến hiện trường. Nhấn nút khi đã đến nơi.
      </div>
    </div>
  );
}
