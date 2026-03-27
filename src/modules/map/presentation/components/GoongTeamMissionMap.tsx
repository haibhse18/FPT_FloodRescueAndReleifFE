"use client";

import { useEffect, useRef, useState } from "react";
import goongjs, { type Map, type Marker } from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import { createWarehouseMarker } from "../../utils/goongMapHelpers";
import type { MissionRequest } from "@/modules/missions/domain/missionRequest.entity";
import type { Warehouse } from "@/modules/warehouse/domain/warehouse.entity";

type StepType = "assigned" | "enroute" | "inprogress" | "completed";

export interface GoongTeamMissionMapProps {
  missionRequests: MissionRequest[];
  warehouses?: Warehouse[];
  teamLocation?: { lat: number; lng: number } | null;
  selectedRequestId?: string | null;
  onRequestClick?: (requestId: string) => void;
  step: StepType;
  className?: string;
  height?: string;
}

// Priority colors
const PRIORITY_COLORS = {
  Critical: "#FF0000", // Red
  High: "#FF7700",     // Orange
  Normal: "#FFD700",   // Yellow
} as const;

// Completion status colors (Step 4)
const STATUS_COLORS = {
  completed: "#22C55E", // Green
  partial: "#FFD700",   // Yellow
  failed: "#FF0000",    // Red
} as const;

export default function GoongTeamMissionMap({
  missionRequests,
  warehouses = [],
  teamLocation,
  selectedRequestId,
  onRequestClick,
  step,
  className = "w-full",
  height = "100%",
}: GoongTeamMissionMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const teamMarkerRef = useRef<Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const hasInitialFit = useRef(false);

  // Determine feature flags based on step
  const showWarehouses = step === "assigned";
  const showTeamLocation = step === "enroute" || step === "inprogress";
  const enableTracking = step === "enroute";
  const readOnly = step === "completed";

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOONGMAP_API_KEY;
    if (!apiKey) {
      console.error("Goong Map API key not found");
      return;
    }

    goongjs.accessToken = apiKey;

    const map = new goongjs.Map({
      container: mapContainer.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: [105.8542, 21.0285],
      zoom: 12,
    });

    map.on("load", () => {
      mapRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Create request marker based on step
  const createRequestMarker = (
    request: MissionRequest,
    isSelected: boolean
  ): HTMLDivElement => {
    const el = document.createElement("div");
    el.style.width = isSelected ? "36px" : "30px";
    el.style.height = isSelected ? "36px" : "30px";
    el.style.cursor = readOnly ? "default" : "pointer";
    el.style.position = "relative";

    const inner = document.createElement("div");
    inner.style.width = "100%";
    inner.style.height = "100%";
    inner.style.borderRadius = "50%";
    inner.style.border = isSelected ? "3px solid white" : "2px solid white";
    inner.style.transition = "transform 0.2s";
    inner.style.position = "absolute";
    inner.style.top = "0";
    inner.style.left = "0";

    // Determine color based on step
    if (step === "completed") {
      // Step 4: Completion status colors
      const status = getCompletionStatus(request);
      inner.style.backgroundColor = STATUS_COLORS[status];
    } else if (step === "inprogress") {
      // Step 3: Gray for completed, priority colors for pending
      const isCompleted = isRequestCompleted(request);
      if (isCompleted) {
        inner.style.backgroundColor = "#6B7280"; // Gray
      } else {
        const priority = (request as any).prioritySnapshot || "Normal";
        inner.style.backgroundColor = PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.Normal;
      }
    } else {
      // Step 1, 2: Priority colors
      const priority = (request as any).prioritySnapshot || "Normal";
      inner.style.backgroundColor = PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.Normal;
    }

    // Selected glowing effect
    if (isSelected) {
      el.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.8)";
    }

    el.appendChild(inner);

    // Hover effect (scale 1.1)
    if (!readOnly) {
      el.addEventListener("mouseenter", () => {
        inner.style.transform = "scale(1.1)";
      });

      el.addEventListener("mouseleave", () => {
        inner.style.transform = "scale(1)";
      });
    }

    return el;
  };

  // Create team location marker
  const createTeamLocationMarker = (): HTMLDivElement => {
    const el = document.createElement("div");
    el.style.width = "32px";
    el.style.height = "32px";
    el.style.borderRadius = "50%";
    el.style.backgroundColor = "#3B82F6"; // Blue
    el.style.border = "3px solid white";
    el.style.cursor = "default";
    el.style.boxShadow = "0 0 10px rgba(59, 130, 246, 0.5)";

    // Pulse effect for tracking mode
    if (enableTracking) {
      el.style.animation = "pulse 2s infinite";
    }

    return el;
  };

  // Helper: Check if request is completed
  const isRequestCompleted = (request: MissionRequest): boolean => {
    return request.status === "CLOSED" || request.status === "FULFILLED";
  };

  // Helper: Get completion status for Step 4
  const getCompletionStatus = (request: MissionRequest): "completed" | "partial" | "failed" => {
    if (request.status !== "CLOSED" && request.status !== "FULFILLED") {
      return "failed";
    }

    const peopleNeeded = (request as any).peopleNeeded || 0;
    const peopleRescued = (request as any).peopleRescued || 0;

    if (peopleRescued >= peopleNeeded && peopleNeeded > 0) {
      return "completed";
    } else if (peopleRescued > 0) {
      return "partial";
    }

    return "failed";
  };

  // Update request markers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = new goongjs.LngLatBounds();
    let hasMarkers = false;

    // Add request markers
    missionRequests.forEach((request) => {
      const requestId = typeof request.requestId === "string"
        ? request.requestId
        : (request.requestId as any)?._id;

      const location = (request.requestId as any)?.location;
      if (!location?.coordinates || location.coordinates.length < 2) return;

      const [lng, lat] = location.coordinates;
      const isSelected = requestId === selectedRequestId;

      const markerElement = createRequestMarker(request, isSelected);

      const marker = new goongjs.Marker({
        element: markerElement,
        anchor: "bottom",
      })
        .setLngLat([lng, lat])
        .addTo(map);

      // Click handler (not for read-only)
      if (!readOnly && onRequestClick) {
        markerElement.addEventListener("click", () => {
          onRequestClick(requestId);
        });
      }

      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
      hasMarkers = true;
    });

    // Add warehouse markers (Step 1 only)
    if (showWarehouses && warehouses.length > 0) {
      warehouses.forEach((warehouse) => {
        const lng = warehouse.location.coordinates[0];
        const lat = warehouse.location.coordinates[1];

        const markerElement = createWarehouseMarker();

        const marker = new goongjs.Marker({
          element: markerElement,
          anchor: "bottom",
        })
          .setLngLat([lng, lat])
          .addTo(map);

        markersRef.current.push(marker);
        bounds.extend([lng, lat]);
        hasMarkers = true;
      });
    }

    // Auto fit bounds (Step 1 only, first time)
    if (step === "assigned" && hasMarkers && !bounds.isEmpty() && !hasInitialFit.current) {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      map.fitBounds(
        [
          [sw.lng, sw.lat],
          [ne.lng, ne.lat],
        ],
        {
          padding: 80,
          maxZoom: 15,
          duration: 1000,
        }
      );
      hasInitialFit.current = true;
    }
  }, [mapLoaded, missionRequests, warehouses, selectedRequestId, step, showWarehouses, readOnly, onRequestClick]);

  // Update team location marker
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !showTeamLocation || !teamLocation) return;

    const map = mapRef.current;

    // Remove existing team marker
    if (teamMarkerRef.current) {
      teamMarkerRef.current.remove();
    }

    const markerElement = createTeamLocationMarker();

    const marker = new goongjs.Marker({
      element: markerElement,
      anchor: "bottom",
    })
      .setLngLat([teamLocation.lng, teamLocation.lat])
      .addTo(map);

    teamMarkerRef.current = marker;

    // Auto-center on team location (Step 2 only)
    if (enableTracking) {
      map.flyTo({
        center: [teamLocation.lng, teamLocation.lat],
        zoom: 14,
        duration: 1000,
      });
    }
  }, [mapLoaded, showTeamLocation, teamLocation, enableTracking]);

  return (
    <div className={className} style={{ height }}>
      <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-xl">
          <div className="text-white/60 text-sm">Đang tải bản đồ...</div>
        </div>
      )}
    </div>
  );
}
