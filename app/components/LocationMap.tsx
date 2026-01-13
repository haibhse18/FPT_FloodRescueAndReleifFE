"use client";

import { useEffect, useRef } from "react";
import maplibregl from "@openmapvn/openmapvn-gl";
import "@openmapvn/openmapvn-gl/dist/maplibre-gl.css";

interface LocationMapProps {
    latitude: number;
    longitude: number;
    address?: string;
}

export default function LocationMap({ latitude, longitude, address }: LocationMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const marker = useRef<maplibregl.Marker | null>(null);
    const apiKey = process.env.NEXT_PUBLIC_OPENMAP_API_KEY || "KUOQz09yeIAoRN3F6LUmgxITAbvaRTvK";

    useEffect(() => {
        if (!mapContainer.current) return;
        if (map.current) return; // Khởi tạo map chỉ một lần

        // Khởi tạo map với style của Openmap.vn (cần API key)
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: `https://maptiles.openmap.vn/styles/day-v1/style.json?apikey=${apiKey}`,
            center: [longitude, latitude], // [lng, lat]
            zoom: 15,
            maplibreLogo: true, // Hiển thị logo MapLibre
        });

        // Thêm navigation controls (zoom in/out)
        map.current.addControl(new maplibregl.NavigationControl(), "top-right");

        // Thêm marker tại vị trí hiện tại
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#FF7700';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';

        marker.current = new maplibregl.Marker({ element: el })
            .setLngLat([longitude, latitude])
            .addTo(map.current);

        // Thêm popup vào marker
        if (address) {
            const popup = new maplibregl.Popup({ offset: 25 })
                .setHTML(`
                    <div style="padding: 8px;">
                        <p style="font-weight: bold; margin-bottom: 4px;">Vị trí của bạn</p>
                        <p style="color: #666; font-size: 12px;">${address}</p>
                        <p style="color: #999; font-size: 10px; margin-top: 4px;">
                            GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
                        </p>
                    </div>
                `);
            marker.current.setPopup(popup);
        }

        // Cleanup
        return () => {
            if (marker.current) {
                marker.current.remove();
            }
            if (map.current) {
                map.current.remove();
            }
        };
    }, []); // Chỉ chạy một lần khi mount

    // Cập nhật vị trí khi latitude/longitude thay đổi
    useEffect(() => {
        if (map.current && marker.current) {
            const newCenter: [number, number] = [longitude, latitude];
            map.current.flyTo({
                center: newCenter,
                zoom: 15,
                duration: 1000
            });
            marker.current.setLngLat(newCenter);

            // Cập nhật popup nếu có
            if (address) {
                const popup = new maplibregl.Popup({ offset: 25 })
                    .setHTML(`
                        <div style="padding: 8px;">
                            <p style="font-weight: bold; margin-bottom: 4px;">Vị trí của bạn</p>
                            <p style="color: #666; font-size: 12px;">${address}</p>
                            <p style="color: #999; font-size: 10px; margin-top: 4px;">
                                GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
                            </p>
                        </div>
                    `);
                marker.current.setPopup(popup);
            }
        }
    }, [latitude, longitude, address]);

    return (
        <div
            ref={mapContainer}
            className="w-full h-full rounded-xl overflow-hidden"
            style={{ minHeight: '192px', height: '100%' }}
        />
    );
}
