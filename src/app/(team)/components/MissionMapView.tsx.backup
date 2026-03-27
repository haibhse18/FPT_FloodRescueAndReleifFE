"use client";

import { useEffect, useRef, useState } from "react";
import type { MissionRequest } from "@/modules/missions/domain/missionRequest.entity";

interface MissionMapViewProps {
  missionRequests: MissionRequest[];
  teamLocation?: { lat: number; lng: number } | null;
  selectedRequestId?: string | null;
  onRequestClick?: (requestId: string) => void;
  className?: string;
}

export default function MissionMapView({
  missionRequests,
  teamLocation,
  selectedRequestId,
  onRequestClick,
  className = "",
}: MissionMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const teamMarkerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapLoaded) return;

    const initMap = async () => {
      try {
        // Dynamic import OpenMapVN
        const openmapvngl = await import("@openmapvn/openmapvn-gl");
        
        // @ts-ignore
        const map = new openmapvngl.Map({
          container: mapContainerRef.current!,
          style: "https://tiles.openmapvn.com/styles/basic/style.json",
          center: [105.8542, 21.0285], // Hanoi default
          zoom: 12,
        });

        map.on("load", () => {
          mapRef.current = map;
          // @ts-ignore - Store for marker creation
          window.openmapvngl = openmapvngl;
          setMapLoaded(true);
        });
      } catch (error) {
        console.error("Failed to load map:", error);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapLoaded]);

  // Update request markers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Add new markers
    missionRequests.forEach((request) => {
      const requestId = typeof request.requestId === "string" 
        ? request.requestId 
        : (request.requestId as any)?._id;
      
      const location = (request.requestId as any)?.location;
      if (!location?.coordinates || location.coordinates.length < 2) return;

      const [lng, lat] = location.coordinates;
      const priority = (request as any).prioritySnapshot || "Normal";
      const isSelected = requestId === selectedRequestId;
      const isCompleted = request.status === "CLOSED" || request.status === "FULFILLED";

      // Create marker element
      const el = document.createElement("div");
      el.className = "mission-request-marker";
      el.style.width = isSelected ? "32px" : "24px";
      el.style.height = isSelected ? "32px" : "24px";
      el.style.borderRadius = "50%";
      el.style.cursor = "pointer";
      el.style.transition = "all 0.2s";
      el.style.border = isSelected ? "3px solid white" : "2px solid rgba(255,255,255,0.8)";
      
      if (isCompleted) {
        el.style.backgroundColor = "rgba(34, 197, 94, 0.7)"; // green
        el.style.opacity = "0.6";
      } else if (priority === "Critical" || priority === "High") {
        el.style.backgroundColor = "rgba(239, 68, 68, 0.9)"; // red
      } else {
        el.style.backgroundColor = "rgba(234, 179, 8, 0.9)"; // yellow
      }

      el.addEventListener("click", () => {
        if (onRequestClick) {
          onRequestClick(requestId);
        }
      });

      // @ts-ignore
      const { Marker } = window.openmapvngl || {};
      if (Marker) {
        const marker = new Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        markersRef.current.set(requestId, marker);
      }
    });

    // Fit bounds to show all markers
    if (missionRequests.length > 0) {
      const bounds = missionRequests.reduce((acc, request) => {
        const location = (request.requestId as any)?.location;
        if (location?.coordinates && location.coordinates.length >= 2) {
          const [lng, lat] = location.coordinates;
          if (!acc) {
            // @ts-ignore
            const { LngLatBounds } = window.openmapvngl || {};
            if (LngLatBounds) {
              return new LngLatBounds([lng, lat], [lng, lat]);
            }
          } else {
            acc.extend([lng, lat]);
          }
        }
        return acc;
      }, null as any);

      if (bounds && mapRef.current) {
        mapRef.current.fitBounds(bounds, { padding: 50 });
      }
    }
  }, [mapLoaded, missionRequests, selectedRequestId, onRequestClick]);

  // Update team location marker
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !teamLocation) return;

    // Remove existing team marker
    if (teamMarkerRef.current) {
      teamMarkerRef.current.remove();
    }

    // Create team marker element
    const el = document.createElement("div");
    el.className = "team-location-marker";
    el.style.width = "28px";
    el.style.height = "28px";
    el.style.borderRadius = "50%";
    el.style.backgroundColor = "rgba(59, 130, 246, 0.9)"; // blue
    el.style.border = "3px solid white";
    el.style.boxShadow = "0 0 10px rgba(59, 130, 246, 0.5)";

    // @ts-ignore
    const { Marker } = window.openmapvngl || {};
    if (Marker) {
      const marker = new Marker({ element: el })
        .setLngLat([teamLocation.lng, teamLocation.lat])
        .addTo(mapRef.current);

      teamMarkerRef.current = marker;
    }
  }, [mapLoaded, teamLocation]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full rounded-xl overflow-hidden" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-xl">
          <div className="text-white/60 text-sm">Đang tải bản đồ...</div>
        </div>
      )}
    </div>
  );
}
