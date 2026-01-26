export default function RescueTeamPage() {
    return (
        <div className="min-h-screen bg-secondary p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-6">🚑 Rescue Team Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Assigned Requests */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-xl font-bold text-white mb-2">Assigned Requests</h3>
                        <p className="text-gray-400">Yêu cầu được phân công</p>
                    </div>

                    {/* Update Location */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">📍</div>
                        <h3 className="text-xl font-bold text-white mb-2">Location</h3>
                        <p className="text-gray-400">Cập nhật vị trí</p>
                    </div>

                    {/* Report Progress */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">📊</div>
                        <h3 className="text-xl font-bold text-white mb-2">Progress</h3>
                        <p className="text-gray-400">Báo cáo tiến độ</p>
                    </div>

                    {/* Map Navigation */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">🗺️</div>
                        <h3 className="text-xl font-bold text-white mb-2">Navigation</h3>
                        <p className="text-gray-400">Chỉ đường</p>
                    </div>

                    {/* Team Members */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">👥</div>
                        <h3 className="text-xl font-bold text-white mb-2">Team Members</h3>
                        <p className="text-gray-400">Thành viên đội</p>
                    </div>

                    {/* Equipment */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">🛠️</div>
                        <h3 className="text-xl font-bold text-white mb-2">Equipment</h3>
                        <p className="text-gray-400">Trang thiết bị</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
