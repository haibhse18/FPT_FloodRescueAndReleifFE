"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
    latitude: number;
    longitude: number;
    address?: string;
}

export default function LeafletMap({ latitude, longitude, address }: LeafletMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        // Khởi tạo map
        const map = L.map(mapRef.current).setView([latitude, longitude], 15);

        const apiKey = process.env.NEXT_PUBLIC_OPENMAP_API_KEY || "KUOQz09yeIAoRN3F6LUmgxITAbvaRTvK";

        // Thêm tile layer từ OpenStreetMap (fallback) hoặc Openmap.vn
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Tạo custom icon cho marker
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="width: 30px; height: 30px; border-radius: 50%; background-color: #FF7700; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
        });

        // Thêm marker
        const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);

        // Thêm popup
        if (address) {
            marker.bindPopup(`
                <div style="padding: 8px;">
                    <p style="font-weight: bold; margin-bottom: 4px;">Vị trí của bạn</p>
                    <p style="color: #666; font-size: 12px;">${address}</p>
                    <p style="color: #999; font-size: 10px; margin-top: 4px;">
                        GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
                    </p>
                </div>
            `);
        }

        // Cleanup khi component unmount
        return () => {
            map.remove();
        };
    }, [latitude, longitude, address]);

    return (
        <div
            ref={mapRef}
            className="w-full h-full rounded-xl relative z-0"
            style={{ minHeight: '192px', height: '100%' }}
        />
    );
}
