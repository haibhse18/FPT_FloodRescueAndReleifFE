"use client";

import { useState, useEffect } from "react";
import { GetCurrentUserUseCase } from "@/modules/auth/application/getCurrentUser.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";
import { UpdateProfileUseCase } from "@/modules/users/application/updateProfile.usecase";
import { userRepository } from "@/modules/users/infrastructure/user.repository.impl";
import {
    ProfileHeader,
    ProfileStats,
    ProfileForm,
    ProfileQuickSettings,
    ProfileLogoutButton,
    type CitizenProfile,
} from "@/modules/users/presentation/components";
import { MobileHeader, MobileBottomNav, DesktopHeader, DesktopSidebar } from "@/shared/components/layout";
import { Button } from "@/shared/ui/components";

// Initialize use cases with repositories
const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);

export default function CitizenProfilePage() {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<CitizenProfile>({
        name: "Nguyễn Văn A",
        phone: "0123456789",
        email: "nguyenvana@example.com",
        address: "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM",
    });

    const [editedProfile, setEditedProfile] = useState<CitizenProfile>(profile);

    // Fetch user profile using use case
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const userData = await getCurrentUserUseCase.execute();
                
                if (!userData) {
                    throw new Error('Dữ liệu người dùng không hợp lệ');
                }

                const newProfile: CitizenProfile = {
                    name: userData.displayName || userData.userName || "Người dùng",
                    phone: userData.phoneNumber || "N/A",
                    email: userData.email || "N/A",
                    address: userData.address || "N/A",
                };
                setProfile(newProfile);
                setEditedProfile(newProfile);
            } catch (error) {
                let errorMessage = "Không tìm thấy thông tin người dùng";
                
                if (error instanceof Error) {
                    errorMessage = error.message;
                    
                    // Nếu là lỗi network, thêm gợi ý
                    if (errorMessage.includes('network') || errorMessage.includes('ERR_NETWORK')) {
                        errorMessage += " - Vui lòng kiểm tra kết nối mạng";
                    }
                    
                    // Nếu là lỗi 401, hướng user đăng nhập lại
                    if (errorMessage.includes('401') || errorMessage.includes('đăng nhập')) {
                        errorMessage = "Phiên đăng nhập hết hạn - Vui lòng đăng nhập lại";
                    }
                }
                
                console.error("Lỗi khi tải thông tin cá nhân:", error);
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await updateProfileUseCase.execute({
                displayName: editedProfile.name,
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

    const handleLogout = () => {
        // TODO: Implement logout logic
        console.log("Logout clicked");
    };

    const handleRetry = () => {
        setIsLoading(true);
        setError(null);
        const fetchProfile = async () => {
            try {
                const userData = await getCurrentUserUseCase.execute();
                
                if (!userData) {
                    throw new Error('Dữ liệu người dùng không hợp lệ');
                }

                const newProfile: CitizenProfile = {
                    name: userData.displayName || userData.userName || "Người dùng",
                    phone: userData.phoneNumber || "N/A",
                    email: userData.email || "N/A",
                    address: userData.address || "N/A",
                };
                setProfile(newProfile);
                setEditedProfile(newProfile);
            } catch (error) {
                let errorMessage = "Không tìm thấy thông tin người dùng";
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                console.error("Lỗi khi tải thông tin cá nhân:", error);
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    };

    return (
        <div className="min-h-screen bg-[#1C262B]">
            <DesktopSidebar />
            <MobileHeader />

            {/* Main Content */}
            <div className="lg:ml-64">
                <DesktopHeader
                    title="Thông tin cá nhân"
                    subtitle="Quản lý hồ sơ và cài đặt tài khoản"
                />

                <main className="pt-16 lg:pt-24 pb-20 lg:pb-8 overflow-auto min-h-screen">
                    <div className="max-w-4xl mx-auto p-4 lg:p-8">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-medium flex items-center justify-between">
                                <span>❌ {error}</span>
                                <Button
                                    onClick={handleRetry}
                                    variant="outline"
                                    className="border-red-300 text-red-700 hover:bg-red-100"
                                >
                                    Thử lại
                                </Button>
                            </div>
                        )}

                        {/* Profile Header */}
                        <ProfileHeader
                            name={profile.name}
                            phone={profile.phone}
                            email={profile.email}
                            isEditMode={isEditMode}
                            onEditToggle={() => setIsEditMode(!isEditMode)}
                        />

                        {/* Profile Statistics */}
                        <ProfileStats />

                        {/* Profile Form */}
                        <ProfileForm
                            profile={profile}
                            editedProfile={editedProfile}
                            isLoading={isLoading}
                            isEditMode={isEditMode}
                            isSaving={isSaving}
                            onProfileChange={setEditedProfile}
                            onSave={handleSave}
                            onCancel={handleCancel}
                        />

                        {/* Quick Settings */}
                        <ProfileQuickSettings />

                        {/* Logout Button */}
                        <ProfileLogoutButton onLogout={handleLogout} />
                    </div>
                </main>

                <MobileBottomNav />
            </div>
        </div>
    );
}
