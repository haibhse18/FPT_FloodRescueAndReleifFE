"use client";

import { useEffect, useRef } from "react";
import maplibregl from "@openmapvn/openmapvn-gl";

interface OpenMapProps {
  latitude: number;
  longitude: number;
  address?: string;
}

export default function OpenMap({
  latitude,
  longitude,
  address,
}: OpenMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = new maplibregl.Map({
      container: mapRef.current,
      style: `https://maptiles.openmap.vn/styles/day-v1/style.json/?apikey=${process.env.NEXT_PUBLIC_OPENMAP_API_KEY}`,
      center: [longitude, latitude],
      zoom: 16,
    });

    const marker = new maplibregl.Marker({ color: "#ff5722" })
      .setLngLat([longitude, latitude])
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setHTML(
          `<div style="color:#111;font-size:14px;font-weight:500">
            ${address || "Vị trí hiện tại"}
          </div>`
        )
      )
      .addTo(mapInstance.current);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [latitude, longitude, address]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-xl overflow-hidden bg-white"
    />
  );
}
