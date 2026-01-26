"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import API from "@/lib/services/api";
import MobileHeader from "@/app/components/layout/MobileHeader";
import MobileBottomNav from "@/app/components/layout/MobileBottomNav";
import DesktopHeader from "@/app/components/layout/DesktopHeader";
import DesktopSidebar from "@/app/components/layout/DesktopSidebar";

export default function ProfilePage() {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState({
        name: "Nguyễn Văn A",
        phone: "0123456789",
        email: "nguyenvana@example.com",
        address: "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM",
        emergencyContact: "0987654321",
        emergencyContactName: "Nguyễn Thị B"
    });

    const [editedProfile, setEditedProfile] = useState(profile);

    // Fetch user profile from API
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const userData = await API.auth.getCurrentUser() as any;
                const newProfile = {
                    name: userData.fullName || "Nguyễn Văn A",
                    phone: userData.phone || "0123456789",
                    email: userData.email || "nguyenvana@example.com",
                    address: userData.address || "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM",
                    emergencyContact: userData.emergencyContact || "0987654321",
                    emergencyContactName: userData.emergencyContactName || "Nguyễn Thị B"
                };
                setProfile(newProfile);
                setEditedProfile(newProfile);
            } catch (error) {
                console.error("Lỗi khi tải thông tin cá nhân:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await API.citizen.updateProfile({
                fullName: editedProfile.name,
                phone: editedProfile.phone,
                address: editedProfile.address,
            });
            setProfile(editedProfile);
            setIsEditMode(false);
        } catch (error) {
            console.error("Lỗi khi cập nhật profile:", error);
            alert("❌ Có lỗi xảy ra khi cập nhật thông tin!");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setIsEditMode(false);
    };

    const stats = [
        { icon: "📊", label: "Tổng yêu cầu", value: "4", color: "bg-blue-500/10 border-blue-500/20" },
        { icon: "✅", label: "Hoàn thành", value: "2", color: "bg-green-500/10 border-green-500/20" },
        { icon: "⏳", label: "Đang xử lý", value: "1", color: "bg-yellow-500/10 border-yellow-500/20" }
    ];

    const quickSettings = [
        { icon: "🔔", label: "Cài đặt thông báo", description: "Quản lý thông báo đẩy", href: "#" },
        { icon: "📍", label: "Vị trí mặc định", description: "Cập nhật vị trí thường xuyên", href: "#" },
        { icon: "🔒", label: "Bảo mật", description: "Đổi mật khẩu, xác thực 2 lớp", href: "#" },
        { icon: "❓", label: "Trợ giúp & Hỗ trợ", description: "Hướng dẫn sử dụng, liên hệ", href: "#" }
    ];

    return (
        <div className="min-h-screen bg-secondary flex flex-col lg:flex-row">
            <DesktopSidebar userName={profile.name} userRole="Citizen" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64">
                <MobileHeader onLocationClick={() => { }} />

                <DesktopHeader
                    title="Thông tin cá nhân"
                    subtitle="Quản lý hồ sơ và cài đặt tài khoản"
                />

                <main className="pt-[73px] lg:pt-[89px] pb-24 lg:pb-0">
                    <div className="max-w-4xl mx-auto p-4 lg:p-8">
                    {/* Profile Header Card */}
                    <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl p-6 mb-6">
                        <div className="flex flex-col lg:flex-row items-center gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white text-4xl lg:text-5xl font-bold shadow-xl">
                                    {profile.name.charAt(0)}
                                </div>
                                <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:scale-110 transition-transform">
                                    <span className="text-lg">📷</span>
                                </button>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center lg:text-left">
                                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">{profile.name}</h3>
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <span>📱</span>
                                        <span>{profile.phone}</span>
                                    </div>
                                    <span className="hidden lg:inline">•</span>
                                    <div className="flex items-center gap-1">
                                        <span>✉️</span>
                                        <span>{profile.email}</span>
                                    </div>
                                </div>
                                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-500 text-sm font-bold">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Đang hoạt động
                                </div>
                            </div>

                            {/* Edit Button */}
                            <button
                                onClick={() => setIsEditMode(!isEditMode)}
                                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                                {isEditMode ? "❌ Hủy" : "✏️ Chỉnh sửa"}
                            </button>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-6">
                        {stats.map((stat, index) => (
                            <div key={index} className={`p-4 rounded-xl border ${stat.color}`}>
                                <div className="text-3xl mb-2">{stat.icon}</div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Profile Information */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                        {isLoading ? (
                            // Loading skeleton
                            <div className="space-y-4 animate-pulse">
                                <div className="h-6 bg-white/10 rounded w-1/3 mb-6"></div>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i}>
                                        <div className="h-3 bg-white/10 rounded w-1/4 mb-2"></div>
                                        <div className="h-10 bg-white/10 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <span>📋</span>
                                    Thông tin chi tiết
                                </h3>

                                <div className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">
                                            👤 Họ và tên
                                        </label>
                                        {isEditMode ? (
                                            <input
                                                type="text"
                                                value={editedProfile.name}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                            />
                                        ) : (
                                            <p className="text-white px-4 py-3 bg-white/5 rounded-xl">{profile.name}</p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">
                                            📱 Số điện thoại
                                        </label>
                                        {isEditMode ? (
                                            <input
                                                type="tel"
                                                value={editedProfile.phone}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                            />
                                        ) : (
                                            <p className="text-white px-4 py-3 bg-white/5 rounded-xl">{profile.phone}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">
                                            ✉️ Email
                                        </label>
                                        {isEditMode ? (
                                            <input
                                                type="email"
                                                value={editedProfile.email}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                            />
                                        ) : (
                                            <p className="text-white px-4 py-3 bg-white/5 rounded-xl">{profile.email}</p>
                                        )}
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">
                                            📍 Địa chỉ
                                        </label>
                                        {isEditMode ? (
                                            <textarea
                                                value={editedProfile.address}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                                                rows={2}
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition resize-none"
                                            />
                                        ) : (
                                            <p className="text-white px-4 py-3 bg-white/5 rounded-xl">{profile.address}</p>
                                        )}
                                    </div>

                                    {/* Emergency Contact */}
                                    <div className="pt-4 border-t border-white/10">
                                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <span>🚨</span>
                                            Liên hệ khẩn cấp
                                        </h4>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-400 mb-2">
                                                    👤 Tên người liên hệ
                                                </label>
                                                {isEditMode ? (
                                                    <input
                                                        type="text"
                                                        value={editedProfile.emergencyContactName}
                                                        onChange={(e) => setEditedProfile({ ...editedProfile, emergencyContactName: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                                    />
                                                ) : (
                                                    <p className="text-white px-4 py-3 bg-white/5 rounded-xl">{profile.emergencyContactName}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-400 mb-2">
                                                    📱 Số điện thoại khẩn cấp
                                                </label>
                                                {isEditMode ? (
                                                    <input
                                                        type="tel"
                                                        value={editedProfile.emergencyContact}
                                                        onChange={(e) => setEditedProfile({ ...editedProfile, emergencyContact: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                                    />
                                                ) : (
                                                    <p className="text-white px-4 py-3 bg-white/5 rounded-xl">{profile.emergencyContact}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save/Cancel Buttons */}
                                    {isEditMode && (
                                        <div className="flex gap-3 pt-4">
                                            <button
                                                onClick={handleCancel}
                                                className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all duration-200"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white font-bold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSaving ? "⏳ Đang lưu..." : "💾 Lưu thay đổi"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Quick Settings */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span>⚙️</span>
                            Cài đặt nhanh
                        </h3>

                        <div className="space-y-3">
                            {quickSettings.map((setting, index) => (
                                <Link
                                    key={index}
                                    href={setting.href}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
                                >
                                    <div className="text-3xl">{setting.icon}</div>
                                    <div className="flex-1">
                                        <p className="text-white font-bold">{setting.label}</p>
                                        <p className="text-sm text-gray-400">{setting.description}</p>
                                    </div>
                                    <span className="text-2xl text-gray-500">›</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button className="w-full px-6 py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold transition-all duration-200 border border-red-500/20 hover:border-red-500/30 flex items-center justify-center gap-2">
                        <span className="text-xl">🚪</span>
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </main>

            <MobileBottomNav
                items={[
                    { icon: "🏠", label: "TRANG CHỦ", href: "/citizens" },
                    { icon: "📜", label: "LỊCH SỬ", href: "/citizens/history" },
                    { icon: "🔔", label: "THÔNG BÁO", href: "/citizens/notifications" },
                    { icon: "👤", label: "CÁ NHÂN", href: "/citizens/profile" },
                ]}
                currentPath="/citizens/profile"
            />
        </div>
        </div >
    );
}
