export default function AdminPage() {
    return (
        <div className="min-h-screen bg-secondary p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-6">🔧 Admin Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* User Management */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">👥</div>
                        <h3 className="text-xl font-bold text-white mb-2">User Management</h3>
                        <p className="text-gray-400">Quản lý người dùng hệ thống</p>
                    </div>

                    {/* System Config */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">⚙️</div>
                        <h3 className="text-xl font-bold text-white mb-2">System Config</h3>
                        <p className="text-gray-400">Cấu hình hệ thống</p>
                    </div>

                    {/* System Logs */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">📋</div>
                        <h3 className="text-xl font-bold text-white mb-2">System Logs</h3>
                        <p className="text-gray-400">Nhật ký hệ thống</p>
                    </div>

                    {/* Backup */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">💾</div>
                        <h3 className="text-xl font-bold text-white mb-2">Backup</h3>
                        <p className="text-gray-400">Sao lưu dữ liệu</p>
                    </div>

                    {/* Permissions */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">🔐</div>
                        <h3 className="text-xl font-bold text-white mb-2">Permissions</h3>
                        <p className="text-gray-400">Quản lý phân quyền</p>
                    </div>

                    {/* Settings */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                        <div className="text-4xl mb-4">🛠️</div>
                        <h3 className="text-xl font-bold text-white mb-2">Settings</h3>
                        <p className="text-gray-400">Cài đặt chung</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
