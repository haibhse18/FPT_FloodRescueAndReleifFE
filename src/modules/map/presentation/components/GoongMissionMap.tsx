"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import goongjs, { type Map, type Marker, type Popup } from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import {
  createRequestMarker,
  createWarehouseMarker,
  createRequestPopupHTML,
  createWarehousePopupHTML,
  PRIORITY_COLORS,
  type Priority,
} from "../../utils/goongMapHelpers";
import type { CoordinatorRequest } from "@/modules/requests/domain/request.entity";
import type { Warehouse } from "@/modules/warehouse/domain/warehouse.entity";

export interface GoongMissionMapProps {
  requests: CoordinatorRequest[];
  warehouses?: Warehouse[];
  onRequestClick?: (request: CoordinatorRequest) => void;
  className?: string;
  height?: string;
}

export default function GoongMissionMap({
  requests,
  warehouses = [],
  onRequestClick,
  className = "w-full",
  height = "500px",
}: GoongMissionMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<Priority | "ALL">("ALL");
  const hasInitialFit = useRef(false);

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
      center: [105.85, 21.02], // Default Hanoi
      zoom: 12,
    });

    map.addControl(new goongjs.NavigationControl(), "top-right");

    map.on("load", () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, []);

  // Update markers when requests or warehouses change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = new goongjs.LngLatBounds();
    let hasMarkers = false;

    // Filter requests by priority
    const filteredRequests =
      selectedPriority === "ALL"
        ? requests
        : requests.filter((r) => r.priority === selectedPriority);

    // Add request markers
    filteredRequests.forEach((request) => {
      const lat = request.location?.coordinates[1] || request.latitude;
      const lng = request.location?.coordinates[0] || request.longitude;

      if (!lat || !lng) return;

      const priority = (request.priority as Priority) || "Normal";
      const markerElement = createRequestMarker(priority);

      const marker = new goongjs.Marker({
        element: markerElement,
        anchor: "bottom",
      })
        .setLngLat([lng, lat])
        .setPopup(
          new goongjs.Popup({ offset: 25 }).setHTML(
            createRequestPopupHTML({
              _id: request._id,
              priority: request.priority,
              peopleCount: request.peopleCount,
              address: request.address,
              description: request.description,
              status: request.status,
            })
          )
        )
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
      hasMarkers = true;
    });

    // Add warehouse markers
    warehouses.forEach((warehouse) => {
      const lng = warehouse.location.coordinates[0];
      const lat = warehouse.location.coordinates[1];

      const markerElement = createWarehouseMarker();

      const marker = new goongjs.Marker({
        element: markerElement,
        anchor: "bottom",
      })
        .setLngLat([lng, lat])
        .setPopup(
          new goongjs.Popup({ offset: 25 }).setHTML(
            createWarehousePopupHTML({
              _id: warehouse._id,
              name: warehouse.name,
              status: warehouse.status,
            })
          )
        )
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
      hasMarkers = true;
    });

    // Fit bounds to show all markers (only on initial load or filter change)
    if (hasMarkers && !bounds.isEmpty() && !hasInitialFit.current) {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      map.fitBounds([[sw.lng, sw.lat], [ne.lng, ne.lat]], {
        padding: 100,
        maxZoom: 16,
        duration: 1000,
      });
      hasInitialFit.current = true;
    }
  }, [requests, warehouses, mapLoaded, selectedPriority, onRequestClick]);

  // Reset fit when filter changes
  useEffect(() => {
    hasInitialFit.current = false;
  }, [selectedPriority]);

  return (
    <div className={className}>
      {/* Filter Controls */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedPriority("ALL")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedPriority === "ALL"
              ? "bg-white text-gray-900"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          Tất cả ({requests.length})
        </button>
        <button
          onClick={() => setSelectedPriority("Critical")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedPriority === "Critical"
              ? "text-white"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
          style={
            selectedPriority === "Critical"
              ? { backgroundColor: PRIORITY_COLORS.Critical }
              : {}
          }
        >
          🔴 Khẩn cấp ({requests.filter((r) => r.priority === "Critical").length})
        </button>
        <button
          onClick={() => setSelectedPriority("High")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedPriority === "High"
              ? "text-white"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
          style={
            selectedPriority === "High"
              ? { backgroundColor: PRIORITY_COLORS.High }
              : {}
          }
        >
          🟠 Cao ({requests.filter((r) => r.priority === "High").length})
        </button>
        <button
          onClick={() => setSelectedPriority("Normal")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedPriority === "Normal"
              ? "text-white"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
          style={
            selectedPriority === "Normal"
              ? { backgroundColor: PRIORITY_COLORS.Normal }
              : {}
          }
        >
          🔵 Bình thường ({requests.filter((r) => r.priority === "Normal").length})
        </button>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainer}
        className="w-full rounded-xl overflow-hidden border-2 border-white/20 shadow-lg"
        style={{ height }}
      />

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border-2 border-white"
            style={{ backgroundColor: PRIORITY_COLORS.Critical }}
          />
          <span>Khẩn cấp</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border-2 border-white"
            style={{ backgroundColor: PRIORITY_COLORS.High }}
          />
          <span>Cao</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border-2 border-white"
            style={{ backgroundColor: PRIORITY_COLORS.Normal }}
          />
          <span>Bình thường</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4"
            style={{
              backgroundImage:
                "url(/icon/warehouse-storage-unit-storehouse-svgrepo-com.svg)",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
            }}
          />
          <span>Kho</span>
        </div>
      </div>
    </div>
  );
}
