export default function ManagerPage() {
    return (
        <div className="min-h-screen bg-secondary p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-6">📊 Manager Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Dashboard Stats */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">📈</div>
                        <h3 className="text-xl font-bold text-white mb-2">Statistics</h3>
                        <p className="text-gray-400">Thống kê tổng quan</p>
                    </div>

                    {/* Reports */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">📋</div>
                        <h3 className="text-xl font-bold text-white mb-2">Reports</h3>
                        <p className="text-gray-400">Báo cáo hệ thống</p>
                    </div>

                    {/* User Management */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">👥</div>
                        <h3 className="text-xl font-bold text-white mb-2">Users</h3>
                        <p className="text-gray-400">Quản lý người dùng</p>
                    </div>

                    {/* Performance */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">⚡</div>
                        <h3 className="text-xl font-bold text-white mb-2">Performance</h3>
                        <p className="text-gray-400">Hiệu suất hệ thống</p>
                    </div>

                    {/* Analytics */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">📉</div>
                        <h3 className="text-xl font-bold text-white mb-2">Analytics</h3>
                        <p className="text-gray-400">Phân tích dữ liệu</p>
                    </div>

                    {/* Export Data */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">💾</div>
                        <h3 className="text-xl font-bold text-white mb-2">Export</h3>
                        <p className="text-gray-400">Xuất dữ liệu</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
