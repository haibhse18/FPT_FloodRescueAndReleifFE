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
        <header className="hidden lg:flex fixed top-0 left-64 right-0 z-50 items-center justify-between px-8 py-6 backdrop-blur-xl shadow-lg" style={{ background: '#133249', borderBottom: '2px solid rgba(255, 119, 0, 0.3)' }}>
            {/* Left Section - Title */}
            <div className="flex items-center gap-4">
                <div className="h-12 w-1 rounded-full" style={{ background: 'linear-gradient(to bottom, #ff7700, #ff5500)' }}></div>
                <div>
                    <h2 className="text-xl font-black tracking-tight" style={{ color: '#ff7700' }}>{title}</h2>
                    {subtitle && <p className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{subtitle}</p>}
                </div>
            </div>

            {/* Right Section - Only Location & Status */}
            <div className="flex items-center gap-3">
                {/* System Status Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold" style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22c55e' }}>
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
                        className="p-2.5 rounded-lg transition-all hover:scale-105 active:scale-95"
                        style={{ background: 'rgba(255, 119, 0, 0.15)', color: '#ff7700' }}
                        title="Xem vị trí trên bản đồ"
                    >
                        <span className="text-xl">📍</span>
                    </button>
                )}
            </div>
        </header>
    );
}
