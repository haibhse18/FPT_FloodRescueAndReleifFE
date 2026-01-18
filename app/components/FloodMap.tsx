"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix icon bị mất khi dùng Next
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function FloodMap() {
  return (
    <div className="h-48 w-full rounded-2xl overflow-hidden">
      <MapContainer
        center={[10.7381, 106.7122]} // Quận 8
        zoom={14}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[10.7381, 106.7122]}>
          <Popup>
            📍 Vị trí báo cáo <br />
            Khu vực ngập
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
