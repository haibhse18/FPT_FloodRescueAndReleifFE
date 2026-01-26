export default function CoordinatorRequestsPage() {
    return (
        <div className="min-h-screen bg-secondary p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-6">📋 Coordinator Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-xl font-bold text-white mb-2">All Requests</h3>
                        <p className="text-gray-400">Tất cả yêu cầu cứu trợ</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">🚑</div>
                        <h3 className="text-xl font-bold text-white mb-2">Assign Teams</h3>
                        <p className="text-gray-400">Phân công đội cứu hộ</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">👷</div>
                        <h3 className="text-xl font-bold text-white mb-2">Rescue Teams</h3>
                        <p className="text-gray-400">Quản lý đội cứu hộ</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">⚡</div>
                        <h3 className="text-xl font-bold text-white mb-2">Priority</h3>
                        <p className="text-gray-400">Quản lý ưu tiên</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">🗺️</div>
                        <h3 className="text-xl font-bold text-white mb-2">Map View</h3>
                        <p className="text-gray-400">Xem bản đồ</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">📊</div>
                        <h3 className="text-xl font-bold text-white mb-2">Reports</h3>
                        <p className="text-gray-400">Báo cáo điều phối</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
