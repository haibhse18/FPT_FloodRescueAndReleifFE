interface MobileHeaderProps {
    onMenuClick?: () => void;
    onLocationClick?: () => void;
}

export default function MobileHeader({ onMenuClick, onLocationClick }: MobileHeaderProps) {
    return (
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ background: '#133249', borderBottom: '2px solid rgba(255, 119, 0, 0.3)' }}>
            <div className="flex items-center justify-between p-4">
                <button
                    onClick={onMenuClick}
                    className="w-10 h-10 flex items-center justify-center text-white"
                >
                    <span className="text-2xl">☰</span>
                </button>
                <h2 className="text-lg font-bold" style={{ color: '#ff7700' }}>Cứu hộ Lũ lụt</h2>
                <button
                    onClick={onLocationClick}
                    className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform"
                >
                    <span className="text-2xl" style={{ color: '#ff7700' }}>📍</span>
                </button>
            </div>
        </header>
    );
}
