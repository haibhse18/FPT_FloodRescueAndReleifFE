interface MobileHeaderProps {
    onMenuClick?: () => void;
    onLocationClick?: () => void;
}

export default function MobileHeader({ onMenuClick, onLocationClick }: MobileHeaderProps) {
    return (
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--color-primary)]/80 backdrop-blur-md border-b border-white/10">
            <div className="flex items-center justify-between p-4">
                <button
                    onClick={onMenuClick}
                    className="w-10 h-10 flex items-center justify-center text-[var(--color-text-inverse)]"
                >
                    <span className="text-2xl">☰</span>
                </button>
                <h2 className="text-lg font-bold text-[var(--color-text-inverse)]">Cứu hộ Lũ lụt</h2>
                <button
                    onClick={onLocationClick}
                    className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform"
                >
                    <span className="text-[var(--color-accent)] text-2xl">📍</span>
                </button>
            </div>
        </header>
    );
}
