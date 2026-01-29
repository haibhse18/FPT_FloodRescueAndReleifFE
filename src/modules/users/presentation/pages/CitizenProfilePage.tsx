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

// Initialize use cases with repositories
const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);

export default function CitizenProfilePage() {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<CitizenProfile>({
        name: "Nguyễn Văn A",
        phone: "0123456789",
        email: "nguyenvana@example.com",
        address: "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM",
        emergencyContactName: "Nguyễn Thị B",
        emergencyContact: "0987654321",
    });

    const [editedProfile, setEditedProfile] = useState<CitizenProfile>(profile);

    // Fetch user profile using use case
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const response = await getCurrentUserUseCase.execute();
                const userData = response.user;
                const newProfile: CitizenProfile = {
                    name: userData.displayName || "Nguyễn Văn A",
                    phone: userData.phoneNumber || "0123456789",
                    email: userData.email || "nguyenvana@example.com",
                    address: userData.address || "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM",
                    emergencyContactName: "Nguyễn Thị B",
                    emergencyContact: "0987654321",
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
            await updateProfileUseCase.execute({
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

    const handleLogout = () => {
        // TODO: Implement logout logic
        console.log("Logout clicked");
    };

    return (
        <div className="min-h-screen bg-secondary">
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
