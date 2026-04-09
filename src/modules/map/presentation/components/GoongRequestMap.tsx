"use client";

import { useEffect, useRef, useState } from "react";
import goongjs, { type Map, type Marker } from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import {
  createRequestMarker,
  createWarehouseMarker,
  createRequestPopupHTML,
  createWarehousePopupHTML,
  getNearestWarehouses,
  type Priority,
} from "../../utils/goongMapHelpers";
import type { CoordinatorRequest } from "@/modules/requests/domain/request.entity";
import type { Warehouse } from "@/modules/warehouse/domain/warehouse.entity";
import SearchBox from "./SearchBox";

export interface GoongRequestMapProps {
  request: CoordinatorRequest;
  warehouses?: Warehouse[];
  onLocationUpdate?: (lat: number, lng: number, address: string) => void;
  className?: string;
  height?: string;
  allowLocationUpdate?: boolean;
  showSearchBox?: boolean;
}

export default function GoongRequestMap({
  request,
  warehouses = [],
  onLocationUpdate,
  className = "w-full",
  height = "400px",
  allowLocationUpdate = false,
  showSearchBox = false,
}: GoongRequestMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const requestMarkerRef = useRef<Marker | null>(null);
  const warehouseMarkersRef = useRef<Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const hasInitialFit = useRef(false);

  const requestLat = request.location?.coordinates[1] || request.latitude || 0;
  const requestLng = request.location?.coordinates[0] || request.longitude || 0;

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
      center: [requestLng, requestLat],
      zoom: 14,
    });

    map.addControl(new goongjs.NavigationControl(), "top-right");

    map.on("load", () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      if (requestMarkerRef.current) {
        requestMarkerRef.current.remove();
      }
      warehouseMarkersRef.current.forEach((m) => m.remove());
      warehouseMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, []);

  // Update markers when request or warehouses change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const map = mapRef.current;

    // Remove existing markers
    if (requestMarkerRef.current) {
      requestMarkerRef.current.remove();
    }
    warehouseMarkersRef.current.forEach((m) => m.remove());
    warehouseMarkersRef.current = [];

    // Add request marker
    const priority = (request.priority as Priority) || "Normal";
    const innerElement = createRequestMarker(priority);

    // Wrap in a container - Goong JS manages the wrapper's position.
    // pointer-events: none on wrapper prevents Goong canvas from receiving
    // click events (which triggers _update() re-layout on all markers).
    // pointer-events: all on innerElement allows clicks to be captured.
    const markerWrapper = document.createElement("div");
    markerWrapper.style.pointerEvents = "none";
    innerElement.style.pointerEvents = "all";
    innerElement.style.cursor = "pointer";
    markerWrapper.appendChild(innerElement);

    // Create popup completely independent from marker to prevent marker re-layout
    const popup = new goongjs.Popup({ offset: 25, closeButton: true }).setHTML(
      createRequestPopupHTML({
        _id: request._id,
        priority: request.priority,
        peopleCount: request.peopleCount,
        address: request.address,
        description: request.description,
        status: request.status,
      })
    );

    const marker = new goongjs.Marker({
      element: markerWrapper,
      anchor: "bottom",
      draggable: allowLocationUpdate,
    })
      .setLngLat([requestLng, requestLat])
      .addTo(map);

    // Manage popup independently - do NOT use setPopup/togglePopup
    // to avoid Goong JS triggering _update() on all markers
    let popupOpen = false;
    innerElement.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (popupOpen) {
        popup.remove();
        popupOpen = false;
      } else {
        popup.setLngLat([requestLng, requestLat]).addTo(map);
        popupOpen = true;
      }
    });

    // Handle drag events if location update is allowed
    if (allowLocationUpdate) {
      innerElement.addEventListener("mousedown", () => {
        setIsDragging(true);
      });

      innerElement.addEventListener("mouseup", () => {
        setTimeout(() => {
          setIsDragging(false);
          const lngLat = marker.getLngLat();
          if (onLocationUpdate) {
            // Reverse geocode to get address
            fetch(`/api/goong/reverse-geocode?lat=${lngLat.lat}&lng=${lngLat.lng}`)
              .then((res) => res.json())
              .then((data) => {
                const address =
                  data.results?.[0]?.formatted_address ||
                  `${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`;
                onLocationUpdate(lngLat.lat, lngLat.lng, address);
              })
              .catch((err) => {
                console.error("Reverse geocode error:", err);
                onLocationUpdate(
                  lngLat.lat,
                  lngLat.lng,
                  `${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`
                );
              });
          }
        }, 100);
      });
    }

    requestMarkerRef.current = marker;

    // Add nearest warehouse markers
    const nearestWarehouses = getNearestWarehouses(
      warehouses,
      requestLat,
      requestLng,
      5
    );

    const bounds = new goongjs.LngLatBounds();
    bounds.extend([requestLng, requestLat]);

    nearestWarehouses.forEach((warehouse) => {
      const lng = warehouse.location.coordinates[0];
      const lat = warehouse.location.coordinates[1];

      const markerElement = createWarehouseMarker();

      const warehouseMarker = new goongjs.Marker({
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
              distance: warehouse.distance,
            })
          )
        )
        .addTo(map);

      warehouseMarkersRef.current.push(warehouseMarker);
      bounds.extend([lng, lat]);
    });

    // Fit bounds to show request and warehouses (only on initial load)
    if (!bounds.isEmpty() && !hasInitialFit.current) {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      map.fitBounds([[sw.lng, sw.lat], [ne.lng, ne.lat]], {
        padding: 80,
        maxZoom: 15,
        duration: 1000,
      });
      hasInitialFit.current = true;
    }
  }, [request, warehouses, mapLoaded, requestLat, requestLng, allowLocationUpdate, onLocationUpdate]);

  const handleSearchSelect = (place: {
    lat: number;
    lng: number;
    address: string;
  }) => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    map.flyTo({
      center: [place.lng, place.lat],
      zoom: 15,
      duration: 1500,
    });

    if (allowLocationUpdate && requestMarkerRef.current) {
      requestMarkerRef.current.setLngLat([place.lng, place.lat]);
      if (onLocationUpdate) {
        onLocationUpdate(place.lat, place.lng, place.address);
      }
    }
  };

  return (
    <div className={className}>
      {/* Search Box - only shown when showSearchBox is explicitly enabled */}
      {showSearchBox && (
        <div className="mb-4">
          <SearchBox
            onPlaceSelect={handleSearchSelect}
            placeholder="Tìm kiếm và cập nhật vị trí..."
          />
          <p className="text-xs text-gray-400 mt-2">
            💡 Bạn có thể kéo thả marker hoặc tìm kiếm để cập nhật vị trí
          </p>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapContainer}
        className={`w-full rounded-xl overflow-hidden border-2 border-white/20 shadow-lg ${
          isDragging ? "cursor-grabbing" : ""
        }`}
        style={{ height }}
      />

      {/* Info */}
      <div className="mt-3 text-sm text-gray-300">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-4 h-4 rounded-full border-2 border-white"
            style={{
              backgroundColor:
                request.priority === "Critical"
                  ? "#FF0000"
                  : request.priority === "High"
                  ? "#FF7700"
                  : "#2563EB",
            }}
          />
          <span>Vị trí yêu cầu</span>
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
          <span>Kho gần nhất (tối đa 5)</span>
        </div>
      </div>
    </div>
  );
}
