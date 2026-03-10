"use client";

import { useEffect, useRef } from "react";
import maplibregl from "@openmapvn/openmapvn-gl";
import "@openmapvn/openmapvn-gl/dist/maplibre-gl.css";

interface WarehouseLocation {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
}

interface OpenMapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  warehouses?: WarehouseLocation[];
}

export default function OpenMap({
  latitude,
  longitude,
  address,
  warehouses = [],
}: OpenMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const apiKey = process.env.NEXT_PUBLIC_OPENMAP_API_KEY;

  // INIT MAP
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://maptiles.openmap.vn/styles/day-v1/style.json?apikey=${apiKey}`,
      center: [105.85, 21.02],
      zoom: 5,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // UPDATE MARKERS
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();

    // MARKER KHO (custom icon)
    const addWarehouseMarker = (lng: number, lat: number, label?: string) => {
      const el = document.createElement("div");
      el.style.backgroundImage =
        "url(/icon/warehouse-storage-unit-storehouse-svgrepo-com.svg)";
      el.style.backgroundSize = "contain";
      el.style.backgroundRepeat = "no-repeat";
      el.style.width = "32px";
      el.style.height = "32px";
      el.style.cursor = "pointer";

      const marker = new maplibregl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat([lng, lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="padding:6px">
              <b>${label || "Warehouse"}</b>
              <br/>
              <small>${lat.toFixed(6)}, ${lng.toFixed(6)}</small>
            </div>
          `)
        )
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
    };

    // MARKER VỊ TRÍ USER (default marker)
    const addUserMarker = (lng: number, lat: number, label?: string) => {
      const marker = new maplibregl.Marker({
        color: "#2563eb",
      })
        .setLngLat([lng, lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="padding:6px">
              <b>${label || "Your Location"}</b>
              <br/>
              <small>${lat.toFixed(6)}, ${lng.toFixed(6)}</small>
            </div>
          `)
        )
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
    };

    // warehouses
    if (warehouses.length > 0) {
      warehouses.forEach((wh) => {
        addWarehouseMarker(wh.longitude, wh.latitude, wh.name);
      });
    }

    // vị trí user
    if (latitude && longitude) {
      addUserMarker(longitude, latitude, address || "Selected location");
    }

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, {
        padding: 100,
        maxZoom: 16,
      });
    }
  }, [latitude, longitude, warehouses]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "420px",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
}