"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function FloodMap() {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        // fallback Quận 8
        setPosition([10.7381, 106.7122]);
      }
    );
  }, []);

  if (!position) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-500">
        Đang xác định vị trí...
      </div>
    );
  }

  return (
    <div className="h-48 w-full rounded-2xl overflow-hidden">
      <MapContainer center={position} zoom={15} className="h-full w-full">
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position}>
          <Popup>
            📍 <b>Vị trí của bạn</b>
            <br />
            Hệ thống sẽ dùng vị trí này để hỗ trợ
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
