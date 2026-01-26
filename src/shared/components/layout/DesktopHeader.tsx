"use client";

interface DesktopHeaderProps {
    title: string;
    subtitle?: string;
    onLocationClick?: () => void;
}

export default function DesktopHeader({
    title,
    subtitle,
    onLocationClick
}: DesktopHeaderProps) {
    return (
        <header className="hidden lg:flex fixed top-0 left-64 right-0 z-50 items-center justify-between px-8 py-4 bg-gradient-to-r from-secondary via-secondary to-secondary/95 backdrop-blur-xl border-b border-white/10 shadow-lg">
            {/* Left Section - Title */}
            <div className="flex items-center gap-4">
                <div className="h-10 w-1 bg-gradient-to-b from-primary to-orange-600 rounded-full"></div>
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
                    {subtitle && <p className="text-gray-400 text-xs mt-0.5 font-medium">{subtitle}</p>}
                </div>
            </div>

            {/* Right Section - Only Location & Status */}
            <div className="flex items-center gap-3">
                {/* System Status Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    TRỰC TUYẾN
                </div>

                {/* Location Button */}
                {onLocationClick && (
                    <button
                        onClick={onLocationClick}
                        className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-105 active:scale-95"
                        title="Xem vị trí trên bản đồ"
                    >
                        <span className="text-xl">📍</span>
                    </button>
                )}
            </div>
        </header>
    );
}
