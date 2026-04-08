"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  PiSirenBold,
  PiWarehouseBold,
  PiStackBold,
  PiCaretUpBold,
  PiCaretDownBold,
  PiTargetBold,
} from "react-icons/pi";
import {
  FiFilter,
  FiX,
} from "react-icons/fi";
import goongjs, { type Map as GoongMap, type Marker, type Popup } from "@goongmaps/goong-js";
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

// ─── Types ────────────────────────────────────────────────

export interface LayerVisibility {
  requests: boolean;
  warehouses: boolean;
}

export interface GoongCoordinatorMapProps {
  requests: CoordinatorRequest[];
  warehouses?: Warehouse[];
  selectedRequestId?: string | null;
  onRequestSelect?: (id: string) => void;
  filterStatus?: string;
  filterPriority?: string;
  onFilterChange?: (status: string, priority: string) => void;
  className?: string;
}

// ─── Constants ────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ xử lý", value: "SUBMITTED" },
  { label: "Đã xác minh", value: "VERIFIED" },
  { label: "Đang xử lý", value: "IN_PROGRESS" },
  { label: "Một phần", value: "PARTIALLY_FULFILLED" },
  { label: "Đã đóng", value: "CLOSED" },
  { label: "Đã hủy", value: "CANCELLED" },
  { label: "Từ chối", value: "REJECTED" },
];

const PRIORITY_OPTIONS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Khẩn cấp", value: "Critical" },
  { label: "Cao", value: "High" },
  { label: "Bình thường", value: "Normal" },
];

const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((o) => [o.value, o.label])
);
const PRIORITY_LABEL: Record<string, string> = Object.fromEntries(
  PRIORITY_OPTIONS.map((o) => [o.value, o.label])
);

// Vietnam center default
const DEFAULT_CENTER: [number, number] = [106.6297, 10.8231]; // Ho Chi Minh City

// ─── Internal types ─────────────────────────────────────

type MarkerEntry = { marker: Marker; popup: Popup; innerEl: HTMLDivElement };

// ─── Component ────────────────────────────────────────────

export default function GoongCoordinatorMap({
  requests,
  warehouses = [],
  selectedRequestId,
  onRequestSelect,
  filterStatus: filterStatusProp = "ALL",
  filterPriority: filterPriorityProp = "ALL",
  onFilterChange,
  className = "w-full h-full",
}: GoongCoordinatorMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoongMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Marker refs keyed by request._id
  const requestMarkersRef = useRef<globalThis.Map<string, MarkerEntry>>(
    new globalThis.Map()
  );
  const warehouseMarkersRef = useRef<Marker[]>([]);
  const activePopupRef = useRef<{ id: string; popup: Popup } | null>(null);

  // Toolbar state — controlled by parent when onFilterChange is provided
  const [filterStatus, setFilterStatus] = useState<string>(filterStatusProp);
  const [filterPriority, setFilterPriority] = useState<string>(filterPriorityProp);

  // Sync controlled props → internal state
  useEffect(() => { setFilterStatus(filterStatusProp); }, [filterStatusProp]);
  useEffect(() => { setFilterPriority(filterPriorityProp); }, [filterPriorityProp]);
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    requests: true,
    warehouses: true,
  });
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  // ─── Initialize map ──────────────────────────────────────

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
      center: DEFAULT_CENTER,
      zoom: 11,
    });

    map.addControl(new goongjs.NavigationControl(), "top-right");

    map.on("load", () => {
      setMapLoaded(true);
    });

    // Close dropdowns on map click
    map.on("click", () => {
      setShowStatusDropdown(false);
      setShowPriorityDropdown(false);
      setShowLayerPanel(false);
    });

    mapRef.current = map;

    return () => {
      requestMarkersRef.current.forEach(({ marker, popup }) => {
        popup.remove();
        marker.remove();
      });
      requestMarkersRef.current.clear();
      warehouseMarkersRef.current.forEach((m) => m.remove());
      warehouseMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, []);

  // ─── Helper: get coordinates from request ────────────────

  const getRequestCoords = useCallback(
    (req: CoordinatorRequest): [number, number] | null => {
      const lng = req.location?.coordinates[0] || req.longitude;
      const lat = req.location?.coordinates[1] || req.latitude;
      if (!lat || !lng || lat === 0 || lng === 0) return null;
      return [lng, lat];
    },
    []
  );

  // ─── Update request markers ───────────────────────────────

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // Determine which requests pass the current filter
    const visibleIds = new Set(
      requests
        .filter((r) => {
          const statusOk = filterStatus === "ALL" || r.status === filterStatus;
          const priorityOk = filterPriority === "ALL" || r.priority === filterPriority;
          return statusOk && priorityOk;
        })
        .map((r) => r._id)
    );

    // Remove markers for requests no longer in data or filtered out
    const existingIds = Array.from(requestMarkersRef.current.keys()) as string[];
    existingIds.forEach((id: string) => {
      const entry = requestMarkersRef.current.get(id);
      if (!entry) return;
      const shouldShow = visibleIds.has(id) && layerVisibility.requests;
      if (!shouldShow) {
        entry.popup.remove();
        entry.marker.remove();
        requestMarkersRef.current.delete(id);
        if (activePopupRef.current?.id === id) {
          activePopupRef.current = null;
        }
      }
    });

    // Add / update markers for visible requests
    requests.forEach((req) => {
      if (!visibleIds.has(req._id) || !layerVisibility.requests) return;

      const coords = getRequestCoords(req);
      if (!coords) return;

      const existing = requestMarkersRef.current.get(req._id);
      if (existing) {
        // Update position if changed
        existing.marker.setLngLat(coords);
        return;
      }

      // Create new marker
      const priority = (req.priority as Priority) || "Normal";
      const innerEl = createRequestMarker(priority);
      innerEl.style.pointerEvents = "all";
      innerEl.style.cursor = "pointer";
      innerEl.style.transition = "transform 0.2s, box-shadow 0.2s";

      const wrapper = document.createElement("div");
      wrapper.style.pointerEvents = "none";
      wrapper.appendChild(innerEl);

      const popup = new goongjs.Popup({ offset: 25, closeButton: true }).setHTML(
        createRequestPopupHTML({
          _id: req._id,
          priority: req.priority,
          peopleCount: req.peopleCount,
          address: req.address,
          description: req.description,
          status: req.status,
        })
      );

      const marker = new goongjs.Marker({ element: wrapper, anchor: "bottom" })
        .setLngLat(coords)
        .addTo(map);

      let popupOpen = false;
      innerEl.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Close previously open popup
        if (activePopupRef.current && activePopupRef.current.id !== req._id) {
          activePopupRef.current.popup.remove();
          activePopupRef.current = null;
          popupOpen = false;
        }

        if (popupOpen) {
          popup.remove();
          popupOpen = false;
          activePopupRef.current = null;
        } else {
          popup.setLngLat(coords).addTo(map);
          popupOpen = true;
          activePopupRef.current = { id: req._id, popup };
        }

        // Notify parent
        if (onRequestSelect) {
          onRequestSelect(req._id);
        }
      });

      requestMarkersRef.current.set(req._id, { marker, popup, innerEl });
    });
  }, [requests, mapLoaded, filterStatus, filterPriority, layerVisibility.requests, getRequestCoords, onRequestSelect]);

  // ─── Update warehouse markers ─────────────────────────────

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // Remove all existing warehouse markers
    warehouseMarkersRef.current.forEach((m) => m.remove());
    warehouseMarkersRef.current = [];

    if (!layerVisibility.warehouses) return;

    warehouses.forEach((warehouse) => {
      const lng = warehouse.location?.coordinates[0];
      const lat = warehouse.location?.coordinates[1];
      if (!lat || !lng) return;

      const el = createWarehouseMarker();

      const warehouseMarker = new goongjs.Marker({ element: el, anchor: "bottom" })
        .setLngLat([lng, lat])
        .setPopup(
          new goongjs.Popup({ offset: 25 }).setHTML(
            createWarehousePopupHTML({
              _id: warehouse._id,
              name: warehouse.name,
              status: warehouse.status as string | undefined,
            })
          )
        )
        .addTo(map);

      warehouseMarkersRef.current.push(warehouseMarker);
    });
  }, [warehouses, mapLoaded, layerVisibility.warehouses]);

  // ─── Highlight selected request ──────────────────────────

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Reset all markers to normal style
    requestMarkersRef.current.forEach(({ innerEl }) => {
      innerEl.style.transform = "scale(1)";
      innerEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      innerEl.style.zIndex = "0";
    });

    if (!selectedRequestId) return;

    const entry = requestMarkersRef.current.get(selectedRequestId);
    if (!entry) return;

    // Highlight selected
    entry.innerEl.style.transform = "scale(1.4)";
    entry.innerEl.style.boxShadow = "0 0 0 4px #FF7700, 0 4px 16px rgba(255,119,0,0.5)";
    entry.innerEl.style.zIndex = "10";

    // Fly to
    const req = requests.find((r) => r._id === selectedRequestId);
    if (req) {
      const coords = getRequestCoords(req);
      if (coords) {
        mapRef.current.flyTo({
          center: coords,
          zoom: 15,
          duration: 800,
        });

        // Open popup
        if (activePopupRef.current && activePopupRef.current.id !== selectedRequestId) {
          activePopupRef.current.popup.remove();
          activePopupRef.current = null;
        }
        if (!activePopupRef.current) {
          entry.popup.setLngLat(coords).addTo(mapRef.current);
          activePopupRef.current = { id: selectedRequestId, popup: entry.popup };
        }
      }
    }
  }, [selectedRequestId, mapLoaded, requests, getRequestCoords]);

  // ─── Fit bounds on first load ─────────────────────────────

  const hasFitBounds = useRef(false);
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || hasFitBounds.current) return;
    if (requests.length === 0) return;

    const coords = requests
      .map(getRequestCoords)
      .filter((c): c is [number, number] => c !== null);

    if (coords.length === 0) return;

    const bounds = new goongjs.LngLatBounds();
    coords.forEach((c) => bounds.extend(c));
    warehouses.forEach((w) => {
      const lng = w.location?.coordinates[0];
      const lat = w.location?.coordinates[1];
      if (lat && lng) bounds.extend([lng, lat]);
    });

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    mapRef.current.fitBounds([[sw.lng, sw.lat], [ne.lng, ne.lat]], {
      padding: 60,
      maxZoom: 14,
      duration: 1000,
    });

    hasFitBounds.current = true;
  }, [mapLoaded, requests, warehouses, getRequestCoords]);

  // ─── Toggle helpers ──────────────────────────────────────

  const toggleLayer = (layer: keyof LayerVisibility) => {
    setLayerVisibility((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  // ─── Render ───────────────────────────────────────────────

  const visibleRequestCount = requests.filter((r) => {
    const statusOk = filterStatus === "ALL" || r.status === filterStatus;
    const priorityOk = filterPriority === "ALL" || r.priority === filterPriority;
    return statusOk && priorityOk && !!getRequestCoords(r);
  }).length;

  return (
    <div className={`relative ${className}`}>
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Toolbar overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {/* Row 1: Layer toggle + filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layer Panel Toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLayerPanel((v) => !v);
                setShowStatusDropdown(false);
                setShowPriorityDropdown(false);
              }}
              className="flex items-center gap-1.5 bg-[#0d2233]/90 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg hover:border-[#FF7700]/60 transition-colors"
            >
              <PiStackBold className="text-sm" />
              <span>Lớp</span>
              {showLayerPanel ? <PiCaretUpBold className="text-xs text-gray-400" /> : <PiCaretDownBold className="text-xs text-gray-400" />}
            </button>
            {showLayerPanel && (
              <div className="absolute top-full left-0 mt-1 bg-[#0d2233]/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl p-3 min-w-[160px]">
                <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Layers</p>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={layerVisibility.requests}
                    onChange={() => toggleLayer("requests")}
                    className="w-4 h-4 accent-[#FF7700]"
                  />
                  <span className="flex items-center gap-1.5 text-white text-sm"><PiSirenBold className="text-red-400" /> Requests</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layerVisibility.warehouses}
                    onChange={() => toggleLayer("warehouses")}
                    className="w-4 h-4 accent-[#FF7700]"
                  />
                  <span className="flex items-center gap-1.5 text-white text-sm"><PiWarehouseBold className="text-blue-400" /> Warehouses</span>
                </label>
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStatusDropdown((v) => !v);
                setShowPriorityDropdown(false);
                setShowLayerPanel(false);
              }}
              className={`flex items-center gap-1.5 bg-[#0d2233]/90 backdrop-blur-sm border text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg hover:border-[#FF7700]/60 transition-colors ${
                filterStatus !== "ALL" ? "border-[#FF7700]" : "border-white/20"
              }`}
            >
              <FiFilter className="text-sm" />
              <span>Trạng thái{filterStatus !== "ALL" ? `: ${STATUS_LABEL[filterStatus] ?? filterStatus}` : ""}</span>
              {showStatusDropdown ? <PiCaretUpBold className="text-xs text-gray-400" /> : <PiCaretDownBold className="text-xs text-gray-400" />}
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-[#0d2233]/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl overflow-hidden min-w-[170px]">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      const next = opt.value;
                      setFilterStatus(next);
                      setShowStatusDropdown(false);
                      onFilterChange?.(next, filterPriority);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                      filterStatus === opt.value ? "text-[#FF7700] font-bold bg-[#FF7700]/10" : "text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPriorityDropdown((v) => !v);
                setShowStatusDropdown(false);
                setShowLayerPanel(false);
              }}
              className={`flex items-center gap-1.5 bg-[#0d2233]/90 backdrop-blur-sm border text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg hover:border-[#FF7700]/60 transition-colors ${
                filterPriority !== "ALL" ? "border-[#FF7700]" : "border-white/20"
              }`}
            >
              <PiTargetBold className="text-sm" />
              <span>Ưu tiên{filterPriority !== "ALL" ? `: ${PRIORITY_LABEL[filterPriority] ?? filterPriority}` : ""}</span>
              {showPriorityDropdown ? <PiCaretUpBold className="text-xs text-gray-400" /> : <PiCaretDownBold className="text-xs text-gray-400" />}
            </button>
            {showPriorityDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-[#0d2233]/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl overflow-hidden min-w-[160px]">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      const next = opt.value;
                      setFilterPriority(next);
                      setShowPriorityDropdown(false);
                      onFilterChange?.(filterStatus, next);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                      filterPriority === opt.value ? "text-[#FF7700] font-bold bg-[#FF7700]/10" : "text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset filters */}
          {(filterStatus !== "ALL" || filterPriority !== "ALL") && (
            <button
              className="flex items-center gap-1 bg-[#FF7700]/80 backdrop-blur-sm border border-[#FF7700] text-white text-xs font-semibold px-2 py-2 rounded-lg shadow-lg hover:bg-[#FF7700] transition-colors"
              title="Xóa bộ lọc"
              onClick={() => {
                setFilterStatus("ALL");
                setFilterPriority("ALL");
                setShowStatusDropdown(false);
                setShowPriorityDropdown(false);
                onFilterChange?.("ALL", "ALL");
              }}
            >
              <FiX className="text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Stats badge bottom-left */}
      <div className="absolute bottom-6 left-3 z-10 flex gap-2">
        <div className="bg-[#0d2233]/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white font-semibold shadow-lg flex items-center gap-1.5">
          <PiSirenBold className="text-red-400" /> {visibleRequestCount} requests
        </div>
        {layerVisibility.warehouses && (
          <div className="bg-[#0d2233]/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white font-semibold shadow-lg flex items-center gap-1.5">
            <PiWarehouseBold className="text-blue-400" /> {warehouses.length} kho
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 right-12 z-10 bg-[#0d2233]/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Ưu tiên</p>
        {Object.entries(PRIORITY_COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-2 mb-1 last:mb-0">
            <span
              className="w-3 h-3 rounded-full border-2 border-white/50 flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-white text-xs">
              {key === "Critical" ? "Khẩn cấp" : key === "High" ? "Cao" : "Bình thường"}
            </span>
          </div>
        ))}
      </div>

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0d2233] rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#FF7700] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-300 text-sm">Đang tải bản đồ...</p>
          </div>
        </div>
      )}
    </div>
  );
}
