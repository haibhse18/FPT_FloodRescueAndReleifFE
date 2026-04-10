"use client";

import { useEffect, useState } from "react";
import Sidebar, { NavItem } from "@/shared/components/layout/Sidebar";
import { GetCurrentUserUseCase } from "@/modules/auth/application/getCurrentUser.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";
import {
  PiCrosshairSimpleBold,
  PiHouseLineBold,
  PiSirenBold,
  PiUsersThreeBold,
} from "react-icons/pi";

const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

export default function CoordinatorSidebar() {
  const [user, setUser] = useState<{ name: string; role: string }>({
    name: "Coordinator",
    role: "Rescue Coordinator",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUserUseCase.execute();
        if (currentUser) {
          setUser({
            name: currentUser.displayName || currentUser.email,
            role: "Rescue Coordinator",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  const navItems: NavItem[] = [
    { icon: <PiHouseLineBold />, label: "Dashboard", href: "/dashboard" },
    { icon: <PiSirenBold />, label: "Yêu cầu", href: "/requests" },
    { icon: <PiCrosshairSimpleBold />, label: "Nhiệm vụ", href: "/mission-control" },
    { icon: <PiUsersThreeBold />, label: "Quản lí team", href: "/team-control" },
  ];

  return (
    <Sidebar
      navItems={navItems}
      user={user}
      title="Điều phối viên"
      subtitle="FPT Flood Rescue"
      profileHref="/coordinator/profile"
    />
  );
}
