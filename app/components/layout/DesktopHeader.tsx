interface DesktopHeaderProps {
    title: string;
    subtitle?: string;
    onLocationClick?: () => void;
}

export default function DesktopHeader({ title, subtitle, onLocationClick }: DesktopHeaderProps) {
    return (
        <header className="hidden lg:flex items-center justify-between p-6 border-b border-white/10">
            <div>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-500 text-sm font-bold">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    HỆ THỐNG TRỰC TUYẾN
                </div>
                <button
                    onClick={onLocationClick}
                    className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition hover:scale-105"
                >
                    <span className="text-xl">📍</span>
                </button>
            </div>
        </header>
    );
}
