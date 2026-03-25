import type { Map, LngLatBounds } from "@goongmaps/goong-js";

export const PRIORITY_COLORS = {
  Critical: "#FF0000",
  High: "#FF7700",
  Normal: "#2563EB",
} as const;

export const PRIORITY_LABELS = {
  Critical: "🔴 KHẨN CẤP",
  High: "🟠 CAO",
  Normal: "🔵 BÌNH THƯỜNG",
} as const;

export type Priority = keyof typeof PRIORITY_COLORS;

/**
 * Create a custom marker element for requests with priority-based colors
 */
export function createRequestMarker(priority: Priority = "Normal"): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "request-marker";
  el.style.width = "30px";
  el.style.height = "30px";
  el.style.borderRadius = "50%";
  el.style.backgroundColor = PRIORITY_COLORS[priority];
  el.style.border = "3px solid white";
  el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
  el.style.cursor = "pointer";

  return el;
}

/**
 * Create a custom marker element for warehouses
 */
export function createWarehouseMarker(): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "warehouse-marker";
  el.style.width = "40px";
  el.style.height = "40px";
  el.style.backgroundImage =
    "url(/icon/warehouse-storage-unit-storehouse-svgrepo-com.svg)";
  el.style.backgroundSize = "contain";
  el.style.backgroundRepeat = "no-repeat";
  el.style.cursor = "pointer";

  return el;
}

/**
 * Calculate distance between two coordinates in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/**
 * Create a popup HTML for request marker
 */
export function createRequestPopupHTML(request: {
  _id: string;
  priority?: string;
  peopleCount?: number;
  address?: string;
  description?: string;
  status?: string;
}): string {
  const priorityLabel = PRIORITY_LABELS[request.priority as Priority] || request.priority;
  
  return `
    <div style="padding: 8px; min-width: 200px;">
      <div style="margin-bottom: 6px;">
        <span style="font-weight: bold; color: ${PRIORITY_COLORS[request.priority as Priority] || "#666"};">
          ${priorityLabel}
        </span>
      </div>
      ${request.peopleCount ? `<p style="margin: 4px 0;"><strong>👥 Số người:</strong> ${request.peopleCount}</p>` : ""}
      ${request.address ? `<p style="margin: 4px 0; font-size: 12px; color: #666;">📍 ${request.address}</p>` : ""}
      ${request.description ? `<p style="margin: 4px 0; font-size: 12px; color: #444; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${request.description}</p>` : ""}
      ${request.status ? `<p style="margin: 4px 0; font-size: 11px;"><span style="background: #e0e0e0; padding: 2px 6px; border-radius: 4px;">${request.status}</span></p>` : ""}
      <p style="margin-top: 8px; font-size: 11px; color: #999;">ID: ${request._id.slice(0, 8)}...</p>
    </div>
  `;
}

/**
 * Create a popup HTML for warehouse marker
 */
export function createWarehousePopupHTML(warehouse: {
  _id: string;
  name: string;
  status?: string;
  distance?: number;
}): string {
  return `
    <div style="padding: 8px; min-width: 180px;">
      <div style="margin-bottom: 6px;">
        <strong style="font-size: 14px;">🏭 ${warehouse.name}</strong>
      </div>
      ${warehouse.status ? `<p style="margin: 4px 0; font-size: 12px;">Trạng thái: <span style="color: ${warehouse.status === "FULL" ? "#f59e0b" : warehouse.status === "EMPTY" ? "#ef4444" : "#10b981"};">${warehouse.status}</span></p>` : ""}
      ${warehouse.distance !== undefined ? `<p style="margin: 4px 0; font-size: 12px;">📏 Khoảng cách: <strong>${formatDistance(warehouse.distance)}</strong></p>` : ""}
      <p style="margin-top: 8px; font-size: 11px; color: #999;">ID: ${warehouse._id.slice(0, 8)}...</p>
    </div>
  `;
}

/**
 * Fit map bounds to show all markers
 */
export function fitBoundsToMarkers(
  map: Map,
  coordinates: [number, number][],
  options?: {
    padding?: number;
    maxZoom?: number;
  }
): void {
  if (coordinates.length === 0) return;

  // Note: LngLatBounds will be created in the component using the map
  // This is a helper that returns the coordinates to fit
}

/**
 * Get nearest warehouses to a location
 */
export function getNearestWarehouses<T extends { location: { coordinates: [number, number] } }>(
  warehouses: T[],
  targetLat: number,
  targetLng: number,
  limit: number = 5
): (T & { distance: number })[] {
  return warehouses
    .map((warehouse) => ({
      ...warehouse,
      distance: calculateDistance(
        targetLat,
        targetLng,
        warehouse.location.coordinates[1],
        warehouse.location.coordinates[0]
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}
