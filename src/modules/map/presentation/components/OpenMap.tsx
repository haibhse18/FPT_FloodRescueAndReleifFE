"use client";

import { useEffect, useRef } from "react";
import maplibregl from "@openmapvn/openmapvn-gl";



interface OpenMapProps {
  warehouses?: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  }[];
  citizenLatitude?: number;
  citizenLongitude?: number;
  citizenAddress?: string;
}

export default function OpenMap({
  warehouses = [],
  citizenLatitude,
  citizenLongitude,
  citizenAddress,
}: OpenMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);


  // ============================
  // INIT MAP (chỉ 1 lần)
  // ============================
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = new maplibregl.Map({
      container: mapRef.current,
      style: `https://maptiles.openmap.vn/styles/day-v1/style.json/?apikey=${process.env.NEXT_PUBLIC_OPENMAP_API_KEY}`,
      center: [citizenLongitude || warehouses[0]?.longitude , citizenLatitude || warehouses[0]?.latitude], 
      zoom: 16,
    });

    // 👤 Citizen marker
    if (
      citizenLatitude !== undefined &&
      citizenLongitude !== undefined
    ) {
      const citizenMarker = new maplibregl.Marker({
        color: "#ff3535",
      })
        .setLngLat([citizenLongitude, citizenLatitude])
        .setPopup(
          new maplibregl.Popup().setHTML(
            `<div style="color:#111;font-size:14px;font-weight:500">
              ${citizenAddress || "Vị trí của bạn"}
            </div>`
          )
        )
        .addTo(mapInstance.current);

      
    }

    // 🏬 Warehouse markers
    warehouses.forEach((wh) => {
  if (
    typeof wh.latitude !== "number" ||
    typeof wh.longitude !== "number"
  ) return;

  const marker = new maplibregl.Marker({
    color: "#2196f3",
  })
    .setLngLat([wh.longitude, wh.latitude])
    .setPopup(
      new maplibregl.Popup().setHTML(
        `<div style="color:#111;font-size:14px;font-weight:500">
          ${wh.name || "Nhà kho"}
        </div>`
      )
    )
    .addTo(mapInstance.current!);

});
    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };

  }, [warehouses, citizenLatitude, citizenLongitude, citizenAddress]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-xl overflow-hidden bg-white"
    />
  );
}