"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GetCurrentUserUseCase } from "@/modules/auth/application/getCurrentUser.usecase";
import { LogoutUseCase } from "@/modules/auth/application/logout.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";
import { UpdateProfileUseCase } from "@/modules/users/application/updateProfile.usecase";
import { userRepository } from "@/modules/users/infrastructure/user.repository.impl";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";
import {
  ProfileHeader,
  ProfileForm,
  ProfileQuickSettings,
  ProfileLogoutButton,
  type CitizenProfile,
} from "@/modules/users/presentation/components";

// Initialize use cases with repositories
const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);
const logoutUseCase = new LogoutUseCase(authRepository);
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);

interface RequestStats {
  total: number;
  completed: number;
  inProgress: number;
}

export default function CitizenProfilePage() {
  const router = useRouter();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [stats, setStats] = useState<RequestStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
  });

  const [profile, setProfile] = useState<CitizenProfile>({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [editedProfile, setEditedProfile] = useState<CitizenProfile>(profile);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch profile and request history in parallel
      const [userData, requests] = await Promise.allSettled([
        getCurrentUserUseCase.execute(),
        requestRepository.getHistory(),
      ]);

      if (userData.status === "fulfilled" && userData.value) {
        const u = userData.value;
        const newProfile: CitizenProfile = {
          name: u.displayName || u.userName || "Người dùng",
          phone: (u as any).phoneNumber || "",
          email: u.email || "",
          address: (u as any).address || "",
        };
        setProfile(newProfile);
        setEditedProfile(newProfile);
      } else {
        throw new Error("Không tải được thông tin người dùng");
      }

      if (requests.status === "fulfilled") {
        const list = requests.value as any[];
        setStats({
          total: list.length,
          completed: list.filter((r) =>
            ["Completed", "COMPLETED"].includes(r.status),
          ).length,
          inProgress: list.filter((r) =>
            ["In Progress", "IN_PROGRESS", "Accepted", "ACCEPTED"].includes(
              r.status,
            ),
          ).length,
        });
      }
    } catch (err) {
      let msg = "Không thể tải thông tin cá nhân";
      if (err instanceof Error) {
        if (
          err.message.includes("401") ||
          err.message.includes("đăng nhập")
        ) {
          msg = "Phiên đăng nhập hết hạn — Vui lòng đăng nhập lại";
        } else if (
          err.message.includes("network") ||
          err.message.includes("ERR_NETWORK")
        ) {
          msg = "Lỗi kết nối mạng — Vui lòng thử lại";
        } else {
          msg = err.message;
        }
      }
      console.error("Lỗi khi tải thông tin cá nhân:", err);
      setError(msg);
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
      // Even if API fails, clear local state and redirect
    } finally {
      router.push("/login");
    }
  };

  return (
    <div className="bg-[#133249] min-h-screen">
      <div className="flex flex-col relative">
        {/* Header */}
        <header className="sticky top-0 z-50 p-4 lg:p-6 border-b border-white/10 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent backdrop-blur-md">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-white text-xl lg:text-2xl font-extrabold mb-0.5">
              Hồ sơ cá nhân
            </h1>
            <p className="text-white/70 text-xs lg:text-sm">
              Cập nhật thông tin và cài đặt
            </p>
          </div>
        </header>

        <main className="pb-24 lg:pb-8 overflow-auto min-h-screen">
          <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-5">

            {/* Save success toast */}
            {saveSuccess && (
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 font-semibold">
                <span className="text-xl">✅</span>
                Cập nhật thông tin thành công!
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="flex items-center justify-between gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div className="flex items-center gap-3 text-red-400 font-medium">
                  <span className="text-xl">⚠️</span>
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => {
                    setError(null);
                    fetchProfile();
                  }}
                  className="flex-shrink-0 px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-bold text-sm rounded-lg transition-all"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Profile Header */}
            <ProfileHeader
              name={profile.name}
              phone={profile.phone}
              email={profile.email}
              isLoading={isLoading}
              isEditMode={isEditMode}
              onEditToggle={() => setIsEditMode(!isEditMode)}
            />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: "📊",
                  label: "Tổng yêu cầu",
                  value: stats.total,
                  accent: "border-l-blue-500",
                },
                {
                  icon: "✅",
                  label: "Hoàn thành",
                  value: stats.completed,
                  accent: "border-l-green-500",
                },
                {
                  icon: "⏳",
                  label: "Đang xử lý",
                  value: stats.inProgress,
                  accent: "border-l-[#FF7700]",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`bg-white/5 border border-white/10 border-l-4 ${s.accent} rounded-xl p-4`}
                >
                  <span className="text-2xl block mb-2">{s.icon}</span>
                  <p className="text-2xl lg:text-3xl font-black text-white mb-1">
                    {isLoading ? (
                      <span className="inline-block w-8 h-7 bg-white/10 rounded animate-pulse align-middle" />
                    ) : (
                      s.value
                    )}
                  </p>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

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

