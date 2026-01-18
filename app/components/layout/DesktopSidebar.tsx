export default function DesktopSidebar() {
    return (
        <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white/5 border-r border-white/10">
            <div className="p-6 border-b border-white/10">
                <h1 className="text-2xl font-bold text-white">Cứu hộ Lũ lụt</h1>
                <p className="text-sm text-gray-400 mt-1">FPT Flood Rescue</p>
            </div>

            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    <li>
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white font-semibold">
                            <span className="text-xl">🏠</span>
                            <span>Trang chủ</span>
                        </button>
                    </li>
                    <li>
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 transition">
                            <span className="text-xl">📜</span>
                            <span>Lịch sử</span>
                        </button>
                    </li>
                    <li>
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 transition">
                            <span className="text-xl">🔔</span>
                            <span>Thông báo</span>
                        </button>
                    </li>
                    <li>
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 transition">
                            <span className="text-xl">👤</span>
                            <span>Cá nhân</span>
                        </button>
                    </li>
                </ul>
            </nav>

            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        U
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-white">User Account</p>
                        <p className="text-xs text-gray-400">Citizen</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
