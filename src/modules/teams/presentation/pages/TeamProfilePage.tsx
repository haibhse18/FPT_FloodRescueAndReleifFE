"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, WarningCircle } from "phosphor-react";
import { GetCurrentUserUseCase } from "@/modules/auth/application/getCurrentUser.usecase";
import { LogoutUseCase } from "@/modules/auth/application/logout.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";
import { UpdateProfileUseCase } from "@/modules/users/application/updateProfile.usecase";
import { userRepository } from "@/modules/users/infrastructure/user.repository.impl";
import {
    ProfileForm,
    ProfileHeader,
    ProfileLogoutButton,
    ProfileQuickSettings,
    type CitizenProfile,
} from "@/modules/users/presentation/components";

const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);
const logoutUseCase = new LogoutUseCase(authRepository);
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);

export default function TeamProfilePage() {
    const router = useRouter();

    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [profile, setProfile] = useState<CitizenProfile>({
        name: "",
        phone: "",
        email: "",
        address: "",
        role: "",
    });
    const [editedProfile, setEditedProfile] = useState<CitizenProfile>(profile);

    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const user = await getCurrentUserUseCase.execute();
            const newProfile: CitizenProfile = {
                name: user.displayName || user.userName || "Rescue Team",
                phone: user.phoneNumber || "",
                email: user.email || "",
                address: user.address || "",
                role: user.role || "Rescue Team",
            };

            setProfile(newProfile);
            setEditedProfile(newProfile);
        } catch (err) {
            let message = "Không thể tải thông tin hồ sơ";

            if (err instanceof Error) {
                if (err.message.includes("401") || err.message.includes("đăng nhập")) {
                    message = "Phiên đăng nhập hết hạn - Vui lòng đăng nhập lại";
                } else if (
                    err.message.includes("network") ||
                    err.message.includes("ERR_NETWORK")
                ) {
                    message = "Lỗi kết nối mạng - Vui lòng thử lại";
                } else {
                    message = err.message;
                }
            }

            console.error("Lỗi khi tải hồ sơ team:", err);
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSave = async () => {
        setSaveSuccess(false);
        setIsSaving(true);
        setError(null);

        try {
            await updateProfileUseCase.execute({
                displayName: editedProfile.name,
                phone: editedProfile.phone,
                address: editedProfile.address,
            });

            setProfile(editedProfile);
            setIsEditMode(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch {
            setError("Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setIsEditMode(false);
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            await logoutUseCase.execute();
        } catch {
            // Keep redirecting even if API call fails.
        } finally {
            router.push("/login");
        }
    };

    return (
        <div className="bg-transparent min-h-[100dvh]">
            <div className="flex flex-col relative min-h-[100dvh]">
                <header className="sticky top-0 z-50 p-4 lg:p-6 border-b border-white/20 bg-gradient-to-br from-[#1a4a6b]/55 to-[#0b2233]/72 backdrop-blur-md">
                    <div className="max-w-5xl mx-auto">
                        <h1 className="text-white text-2xl lg:text-3xl font-extrabold mb-1">
                            Hồ sơ đội cứu hộ
                        </h1>
                        <p className="text-white/88 text-sm">
                            Cập nhật thông tin tài khoản và cài đặt của team
                        </p>
                    </div>
                </header>

                <main className="flex-1 pb-24 lg:pb-8 overflow-y-auto">
                    <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6">
                        {saveSuccess && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/18 border border-green-500/45">
                                <CheckCircle
                                    weight="fill"
                                    className="text-green-400 flex-shrink-0"
                                    size={20}
                                />
                                <span className="text-green-400 text-sm font-medium">
                                    Cập nhật thông tin thành công!
                                </span>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-red-500/18 border border-red-500/45">
                                <div className="flex items-center gap-3">
                                    <WarningCircle
                                        weight="fill"
                                        className="text-red-400 flex-shrink-0"
                                        size={20}
                                    />
                                    <span className="text-red-400 text-sm font-medium">
                                        {error}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setError(null);
                                        fetchProfile();
                                    }}
                                    className="flex-shrink-0 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-medium text-xs rounded-lg transition-colors duration-200"
                                >
                                    Thử lại
                                </button>
                            </div>
                        )}

                        <ProfileHeader
                            name={profile.name}
                            phone={profile.phone}
                            email={profile.email}
                            role={profile.role || "Rescue Team"}
                            isLoading={isLoading}
                            isEditMode={isEditMode}
                            onEditToggle={() => setIsEditMode(!isEditMode)}
                        />

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

                        <ProfileQuickSettings />

                        <ProfileLogoutButton
                            onLogout={handleLogout}
                            isLoading={isLoggingOut}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}
