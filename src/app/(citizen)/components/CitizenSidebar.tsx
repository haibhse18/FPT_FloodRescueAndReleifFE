"use client";

import { useEffect, useState } from "react";
import Sidebar, { NavItem } from "@/shared/components/layout/Sidebar";
import { GetCurrentUserUseCase } from "@/modules/auth/application/getCurrentUser.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";

const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

export default function CitizenSidebar() {
  const [user, setUser] = useState<{
    name: string;
    role: string;
    avatar?: string;
  }>({
    name: "Người dùng",
    role: "Citizen",
    avatar: undefined,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUserUseCase.execute();
        setUser({
          name: userData.displayName || userData.userName || "Người dùng",
          role: "Citizen", // Hoặc userData.role nếu muốn dynamic
          avatar: userData.avatar,
        });
      } catch (error) {
        console.error("Error fetching user for sidebar:", error);
      }
    };

    fetchUser();
  }, []);

  const navItems: NavItem[] = [
    { icon: "🏠", label: "Trang chủ", href: "/home" },
    { icon: "📜", label: "Lịch sử", href: "/history" },
    { icon: "🔔", label: "Thông báo", href: "/notifications" }, // Có thể thêm badge logic sau
    { icon: "👤", label: "Cá nhân", href: "/profile" },
  ];

  return <Sidebar navItems={navItems} user={user} />;
}
