"use client";

import { useEffect, useState } from "react";
import Sidebar, { NavItem } from "@/shared/components/layout/Sidebar";
import { GetCurrentUserUseCase } from "@/modules/auth/application/getCurrentUser.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";
import {
  PiChartLineUpBold,
  PiGearSixBold,
  PiHouseLineBold,
  PiUsersThreeBold,
} from "react-icons/pi";

const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

export default function AdminSidebar() {
    const [user, setUser] = useState<{
    name: string;
    role: string;
    avatar?: string;
  }>({
    name: "Quản lý",
    role: "Admin",
    avatar: undefined,
  });
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUserUseCase.execute();
        if (currentUser) {
          setUser({
            name: currentUser.displayName || currentUser.userName || "Quản lý",
            role: "Admin",
            avatar: currentUser.avatar || undefined,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  const navItems: NavItem[] = [
    { icon: <PiHouseLineBold />, label: "Dashboard", href: "/admin-dashboard" },
    { icon: <PiUsersThreeBold />, label: "Người dùng", href: "/admin-users" },
    { icon: <PiGearSixBold />, label: "Hệ thống", href: "/admin-system" },
    { icon: <PiChartLineUpBold />, label: "Theo dõi", href: "/admin-monitoring" },
  ];

  return (
    <Sidebar
      navItems={navItems}
      user={user}
    />
  );
}
