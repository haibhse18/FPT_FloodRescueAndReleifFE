"use client";

import { useEffect, useState } from "react";
import Sidebar, { NavItem } from "@/shared/components/layout/Sidebar";
import { GetCurrentUserUseCase } from "@/modules/auth/application/getCurrentUser.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";
import {
  PiChartBarBold,
  PiHouseLineBold,
  PiPackageBold,
  PiTruckBold,
} from "react-icons/pi";

const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

export default function ManagerSidebar() {
    const [user, setUser] = useState<{
    name: string;
    role: string;
    avatar?: string;
  }>({
    name: "Quản lý",
    role: "Manager",
    avatar: undefined,
  });
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUserUseCase.execute();
        if (currentUser) {
          setUser({
            name: currentUser.displayName || currentUser.userName || "Quản lý",
            role: "Manager",
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
    { icon: <PiHouseLineBold />, label: "Tổng quan", href: "/manager-dashboard" },
    { icon: <PiPackageBold />, label: "Vật tư", href: "/manager-investory-control/equipments" },
    { icon: <PiTruckBold />, label: "Phương tiện", href: "/manager-investory-control/vehicles" },
    { icon: <PiChartBarBold />, label: "Tồn kho", href: "/manager-investory-control/stock" },
  ];

  return (
    <Sidebar
      navItems={navItems}
      user={user}
    />
  );
}
