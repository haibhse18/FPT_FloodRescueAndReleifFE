"use client";

import { useEffect, useState } from "react";
import Sidebar, { NavItem } from "@/shared/components/layout/Sidebar";
import { GetCurrentUserUseCase } from "@/modules/auth/application/getCurrentUser.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";
import {
  PiBellBold,
  PiClockCounterClockwiseBold,
  PiHouseLineBold,
} from "react-icons/pi";

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
    { icon: <PiHouseLineBold />, label: "Trang chủ", href: "/home" },
    { icon: <PiClockCounterClockwiseBold />, label: "Lịch sử", href: "/history" },
    { icon: <PiBellBold />, label: "Thông báo", href: "/notifications" }, // Có thể thêm badge logic sau
  ];

  return <Sidebar navItems={navItems} user={user} />;
}
