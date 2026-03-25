"use client";

import { useEffect, useRef, useState } from "react";
import goongjs, { type Map } from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";

export interface GoongMapProps {
  center?: [number, number];
  zoom?: number;
  style?: string;
  className?: string;
  onLoad?: (map: Map) => void;
  children?: (map: Map | null) => React.ReactNode;
}

export default function GoongMap({
  center = [105.85, 21.02], // Hanoi default
  zoom = 12,
  style = "https://tiles.goong.io/assets/goong_map_web.json",
  className = "w-full h-full",
  onLoad,
  children,
}: GoongMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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
      style: style,
      center: center,
      zoom: zoom,
    });

    map.addControl(new goongjs.NavigationControl(), "top-right");

    map.on("load", () => {
      setMapLoaded(true);
      if (onLoad) {
        onLoad(map);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, []);

  // Update center and zoom when props change
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(zoom);
    }
  }, [center, zoom, mapLoaded]);

  return (
    <div className={className}>
      <div ref={mapContainer} className="w-full h-full" />
      {mapLoaded && children && children(mapRef.current)}
    </div>
  );
}
