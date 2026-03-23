"use client";

import { useEffect, useState } from "react";
import Sidebar, { NavItem } from "@/shared/components/layout/Sidebar";
import { GetCurrentUserUseCase } from "@/modules/auth/application/getCurrentUser.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";
import {
  PiChartLineUpBold,
  PiMapTrifoldBold,
  PiUsersThreeBold,
} from "react-icons/pi";

const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

export const TEAM_NAV_ITEMS: NavItem[] = [
  { icon: <PiMapTrifoldBold />, label: "Missions", href: "/missions" },
  { icon: <PiUsersThreeBold />, label: "Đội của tôi", href: "/my-team" },
  { icon: <PiChartLineUpBold />, label: "Reports", href: "/report" },
];

export const TEAM_MOBILE_NAV_ITEMS = TEAM_NAV_ITEMS.map((item) => ({
  icon: item.icon,
  label: item.label,
  href: item.href,
}));

export default function TeamSidebar() {
  const [user, setUser] = useState<{ name: string; role: string }>({
    name: "Rescue Team",
    role: "Rescue Team",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUserUseCase.execute();
        if (currentUser) {
          setUser({
            name:
              currentUser.displayName ||
              currentUser.userName ||
              currentUser.email ||
              "Rescue Team",
            role: "Rescue Team",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <Sidebar
      navItems={TEAM_NAV_ITEMS}
      user={user}
      title="Rescue Team"
      subtitle="FPT Flood Rescue"
    />
  );
}
