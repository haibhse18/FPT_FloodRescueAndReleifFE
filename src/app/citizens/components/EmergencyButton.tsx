interface EmergencyButtonProps {
    onClick: () => void;
}

export default function EmergencyButton({ onClick }: EmergencyButtonProps) {
    return (
        <div className="flex-1 flex items-center justify-center py-8 lg:py-12">
            <button
                onClick={onClick}
                className="group relative flex flex-col items-center justify-center w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-red-600 text-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(220,38,38,0.4)]"
                aria-label="Nút cứu hộ khẩn cấp"
            >
                <div className="absolute inset-0 rounded-full border-4 border-red-300/60 scale-110 animate-pulse"></div>
                <span className="text-7xl lg:text-8xl mb-3"></span>
                <span className="text-2xl lg:text-3xl font-black tracking-tight text-center px-6 leading-none">
                    CỨU HỘ<br />KHẨN CẤP
                </span>
            </button>
        </div>
    );
}
