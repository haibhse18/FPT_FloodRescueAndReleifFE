"use client";

import { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import goongjs, { type Map, type Marker, type Popup } from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import { FaMapMarkerAlt } from "react-icons/fa";
import {
  createWarehouseMarker,
  createWarehousePopupHTML,
  createRequestMarker as createCoordinatorRequestMarker,
  createRequestPopupHTML,
  getNearestWarehouses,
  PRIORITY_COLORS,
  type Priority,
} from "../../utils/goongMapHelpers";
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
  const watchIdRef = useRef<number | null>(null);
  const [internalTeamLocation, setInternalTeamLocation] = useState<{ lat: number; lng: number } | null>(null);
  const hasInitialTeamFocus = useRef(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const hasInitialFit = useRef(false);

  // Determine feature flags based on step
  const showWarehouses = step === "assigned";
  const showTeamLocation = true;
  const enableTracking = step === "enroute";
  const readOnly = step === "completed";

  const toValidLngLat = (lngCandidate: unknown, latCandidate: unknown): [number, number] | null => {
    const lng = Number(lngCandidate);
    const lat = Number(latCandidate);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) return null;
    return [lng, lat];
  };

  const resolveRequestLngLat = (request: MissionRequest): [number, number] | null => {
    const populatedRequest = typeof request.requestId === "object" ? (request.requestId as any) : null;
    const candidates = [
      populatedRequest?.location?.coordinates,
      (request as any)?.requestDetails?.location?.coordinates,
      (request as any)?.locationSnapshot?.coordinates,
      (request as any)?.location?.coordinates,
    ];

    for (const coords of candidates) {
      if (Array.isArray(coords) && coords.length >= 2) {
        const direct = toValidLngLat(coords[0], coords[1]);
        if (direct) return direct;

        // Fallback for incorrectly stored [lat, lng] pairs in old data.
        const swapped = toValidLngLat(coords[1], coords[0]);
        if (swapped) return swapped;
      }
    }

    return null;
  };

  const resolveWarehouseLngLat = (warehouse: Warehouse): [number, number] | null => {
    const coords = warehouse?.location?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return null;

    const direct = toValidLngLat(coords[0], coords[1]);
    if (direct) return direct;

    // Fallback for incorrectly stored [lat, lng] pairs in old data.
    return toValidLngLat(coords[1], coords[0]);
  };

  const bindHoverPopup = (element: HTMLElement, popup: Popup) => {
    element.addEventListener("mouseenter", () => {
      if (mapRef.current) {
        popup.addTo(mapRef.current);
      }
    });
    element.addEventListener("mouseleave", () => {
      popup.remove();
    });
  };

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
      attributionControl: false,
    });

    map.addControl(new goongjs.NavigationControl(), "top-right");

    map.on("load", () => {
      mapRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      if (teamMarkerRef.current) {
        teamMarkerRef.current.remove();
        teamMarkerRef.current = null;
      }

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const map = mapRef.current;
    const onResize = () => map.resize();

    onResize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [mapLoaded, step]);

  // Fallback geolocation source when parent does not pass teamLocation.
  useEffect(() => {
    if (!showTeamLocation || teamLocation || !navigator.geolocation) return;
    if (watchIdRef.current !== null) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setInternalTeamLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        // Keep null on failure - map still works with request/warehouse markers.
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [showTeamLocation, teamLocation]);

  // Create team location marker
  const createTeamLocationMarker = (): HTMLDivElement => {
    const el = document.createElement("div");
    el.style.width = "36px";
    el.style.height = "36px";
    el.style.cursor = "default";
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.filter = "drop-shadow(0 3px 6px rgba(0,0,0,0.35))";
    el.style.zIndex = "40";

    el.innerHTML = renderToStaticMarkup(
      <FaMapMarkerAlt size={34} color="#2563EB" style={{ stroke: "#FFFFFF", strokeWidth: 1.2 }} />,
    );

    // Pulse effect for tracking mode
    if (enableTracking) {
      el.style.animation = "pulse 2s infinite";
    }

    return el;
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

    // Add warehouse markers (Step 1 only) - prioritize nearest to request area.
    if (showWarehouses && warehouses.length > 0) {
      const requestCoords = missionRequests
        .map((request) => resolveRequestLngLat(request))
        .filter((coord): coord is [number, number] => !!coord);

      let warehouseSource = warehouses;
      if (requestCoords.length > 0) {
        const centroidLng =
          requestCoords.reduce((sum, coord) => sum + coord[0], 0) / requestCoords.length;
        const centroidLat =
          requestCoords.reduce((sum, coord) => sum + coord[1], 0) / requestCoords.length;

        warehouseSource = getNearestWarehouses(warehouses, centroidLat, centroidLng, 8);
      }

      warehouseSource.forEach((warehouse) => {
        const lngLat = resolveWarehouseLngLat(warehouse);
        if (!lngLat) return;

        const [lng, lat] = lngLat;

        const markerElement = createWarehouseMarker();
        markerElement.style.zIndex = "10";

        const marker = new goongjs.Marker({
          element: markerElement,
          anchor: "bottom",
        })
          .setLngLat([lng, lat])
          .addTo(map);

          const warehousePopup = new goongjs.Popup({
            offset: 20,
            closeButton: false,
            closeOnClick: false,
          }).setHTML(
            createWarehousePopupHTML({
              _id: warehouse._id,
              name: warehouse.name,
              status: warehouse.status,
            }),
          );
          bindHoverPopup(markerElement, warehousePopup);

        markersRef.current.push(marker);
        bounds.extend([lng, lat]);
        hasMarkers = true;
      });
    }

    const unresolvedRequests: string[] = [];

    // Add request markers after warehouses so they stay on top.
    missionRequests.forEach((request) => {
      const requestId = typeof request.requestId === "string"
        ? request.requestId
        : (request.requestId as any)?._id || request._id;
      const populatedRequest = typeof request.requestId === "object" ? (request.requestId as any) : null;

      const lngLat = resolveRequestLngLat(request);
      if (!lngLat) {
        unresolvedRequests.push(requestId || request._id || "unknown");
        return;
      }

      const [lng, lat] = lngLat;
      const isSelected = !!selectedRequestId && requestId === selectedRequestId;

      const priority =
        ((populatedRequest?.priority || (request as any)?.prioritySnapshot || "Normal") as Priority) ||
        "Normal";

      const markerElement = createCoordinatorRequestMarker(priority);
      markerElement.style.zIndex = isSelected ? "30" : "20";
      markerElement.style.cursor = readOnly ? "default" : "pointer";
      if (isSelected) {
        markerElement.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.9)";
        markerElement.style.transform = "scale(1.15)";
      }

      const marker = new goongjs.Marker({
        element: markerElement,
        anchor: "bottom",
      })
        .setLngLat([lng, lat])
        .addTo(map);

      const requestPopup = new goongjs.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false,
      }).setHTML(
        createRequestPopupHTML({
          _id: requestId || request._id,
          priority,
          peopleCount: Number(populatedRequest?.peopleCount || (request as any)?.requestPeopleSnapshot || 0),
          description: populatedRequest?.description,
          status: request.status,
        }),
      );
      bindHoverPopup(markerElement, requestPopup);

      // Click handler (not for read-only)
      if (!readOnly && onRequestClick) {
        markerElement.addEventListener("click", () => {
          if (requestId) {
            onRequestClick(requestId);
          }
        });
      }

      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
      hasMarkers = true;
    });

    if (unresolvedRequests.length > 0) {
      console.warn("[GoongTeamMissionMap] Missing coordinates for mission requests:", unresolvedRequests);
    }

    const effectiveTeamLocation = teamLocation || internalTeamLocation;
    if (step === "assigned" && effectiveTeamLocation) {
      const teamLngLat = toValidLngLat(effectiveTeamLocation.lng, effectiveTeamLocation.lat);
      if (teamLngLat) {
        bounds.extend(teamLngLat);
        hasMarkers = true;
      }
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
  }, [mapLoaded, missionRequests, warehouses, selectedRequestId, step, showWarehouses, readOnly, onRequestClick, teamLocation, internalTeamLocation]);

  // Update team location marker
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !showTeamLocation) return;

    const map = mapRef.current;
    const effectiveTeamLocation = teamLocation || internalTeamLocation;
    if (!effectiveTeamLocation) return;

    // Remove existing team marker
    if (teamMarkerRef.current) {
      teamMarkerRef.current.remove();
    }

    const markerElement = createTeamLocationMarker();

    const marker = new goongjs.Marker({
      element: markerElement,
      anchor: "bottom",
    })
      .setLngLat([effectiveTeamLocation.lng, effectiveTeamLocation.lat])
      .addTo(map);

    const teamPopup = new goongjs.Popup({
      offset: 20,
      closeButton: false,
      closeOnClick: false,
    }).setHTML(`
      <div style="padding:6px 8px; font-size:12px;">
        <strong>📍 Vị trí hiện tại của team</strong>
      </div>
    `);
    bindHoverPopup(markerElement, teamPopup);

    teamMarkerRef.current = marker;

    // Auto-center on team location for first lock, then keep following in en-route.
    if (!hasInitialTeamFocus.current) {
      map.flyTo({
        center: [effectiveTeamLocation.lng, effectiveTeamLocation.lat],
        zoom: 14,
        duration: 800,
      });
      hasInitialTeamFocus.current = true;
      return;
    }

    if (enableTracking) {
      map.flyTo({
        center: [effectiveTeamLocation.lng, effectiveTeamLocation.lat],
        zoom: 14,
        duration: 700,
      });
    }
  }, [mapLoaded, showTeamLocation, teamLocation, internalTeamLocation, enableTracking]);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden" />

      {mapLoaded && (
        <div className="pointer-events-none absolute top-3 left-3 z-50 rounded-lg bg-black/45 backdrop-blur-sm px-3 py-2 text-[11px] text-white/95 border border-white/20">
          <div className="font-semibold mb-1">Bản đồ nhiệm vụ</div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: PRIORITY_COLORS.Critical }} />
            <span>Request khẩn cấp</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: PRIORITY_COLORS.High }} />
            <span>Request ưu tiên cao</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: PRIORITY_COLORS.Normal }} />
            <span>Request bình thường</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3"
              style={{
                backgroundImage: "url(/icon/warehouse-storage-unit-storehouse-svgrepo-com.svg)",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
              }}
            />
            <span>Warehouse</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-blue-400 leading-none">
              <FaMapMarkerAlt size={13} />
            </div>
            <span>Vị trí hiện tại của team</span>
          </div>
        </div>
      )}

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-xl">
          <div className="text-white/60 text-sm">Đang tải bản đồ...</div>
        </div>
      )}

      <style jsx global>{`
        .goongjs-ctrl-bottom-left,
        .goongjs-ctrl-bottom-right,
        .goongjs-ctrl-logo,
        .goongjs-ctrl-attrib,
        .mapboxgl-ctrl-logo,
        .mapboxgl-ctrl-attrib,
        .maplibregl-ctrl-logo,
        .maplibregl-ctrl-attrib {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
}
