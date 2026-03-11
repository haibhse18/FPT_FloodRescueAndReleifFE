"use client";

import { useEffect, useState } from "react";
import Sidebar, { NavItem } from "@/shared/components/layout/Sidebar";
import { GetCurrentUserUseCase } from "@/modules/auth/application/getCurrentUser.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";

const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

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
            name: currentUser.displayName || currentUser.email,
            role: "Rescue Team",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  const navItems: NavItem[] = [
    { icon: "📋", label: "Nhiệm vụ", href: "/missions" },
    { icon: "👥", label: "Đội của tôi", href: "/my-team" },
    { icon: "👤", label: "Cá nhân", href: "/profile" },
  ];

  return (
    <Sidebar
      navItems={navItems}
      user={user}
      title="Đội cứu hộ"
      subtitle="FPT Flood Rescue"
    />
  );
}
