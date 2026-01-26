"use client";

import dynamic from "next/dynamic";
const OpenMap = dynamic(() => import("@/modules/map/presentation/components/OpenMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
      <p className="text-gray-400">Đang tải bản đồ...</p>
    </div>
  ),
});

interface LocationInfoCardProps {
    location: string;
    coordinates: { lat: number; lon: number } | null;
    isLoading: boolean;
    onRefresh: () => void;
}

export default function LocationInfoCard({
    location,
    coordinates,
    isLoading,
    onRefresh,
}: LocationInfoCardProps) {
    return (
        <>
            {/* Location Info */}
            <div className="mt-6 p-4 lg:p-5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl shrink-0">
                        {isLoading ? "⏳" : "📍"}
                    </span>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                            Vị trí hiện tại
                        </p>
                        <p className="text-sm lg:text-base font-medium text-white mt-1 truncate">
                            {location}
                        </p>
                        {coordinates && (
                            <p className="text-xs text-gray-500 mt-1">
                                GPS: {coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="text-xs lg:text-sm font-bold text-primary px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ml-3"
                >
                    {isLoading ? "..." : "CẬP NHẬT"}
                </button>
            </div>

            {/* Small Map Display */}
            <div id="location-map" className="mt-4 rounded-xl overflow-hidden scroll-mt-20 bg-white/5 border border-white/10 relative z-0">
                {coordinates ? (
                    <div className="h-48 w-full relative z-0">
                        <OpenMap
                            latitude={coordinates.lat}
                            longitude={coordinates.lon}
                            address={location}
                        />
                    </div>
                ) : (
                    <div className="h-48 flex items-center justify-center">
                        <div className="text-center">
                            <span className="text-4xl mb-2 block">📍</span>
                            <p className="text-gray-400 text-sm">Đang lấy vị trí GPS...</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
