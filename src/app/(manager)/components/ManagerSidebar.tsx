"use client";

import { useEffect, useState } from "react";
import Sidebar, { NavItem } from "@/shared/components/layout/Sidebar";
import { GetCurrentUserUseCase } from "@/modules/auth/application/getCurrentUser.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";

const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

export default function ManagerSidebar() {
  const [user, setUser] = useState<{ name: string; role: string }>({
    name: "Manager",
    role: "Manager",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUserUseCase.execute();
        if (currentUser) {
          setUser({
            name: currentUser.displayName || currentUser.email,
            role: "Manager",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  const navItems: NavItem[] = [
    { icon: "🏠", label: "Dashboard", href: "/manager-dashboard" },
    { icon: "📦", label: "Vật tư", href: "/manager-investory-control/equipments" },
    { icon: "🚛", label: "Phương tiện", href: "/manager-investory-control/vehicles" },
    { icon: "📊", label: "Tồn kho", href: "/manager-investory-control/stock" },
    { icon: "👤", label: "Cá nhân", href: "/manager-profile" },
  ];

  return (
    <Sidebar
      navItems={navItems}
      user={user}
      title="Quản lý" 
      subtitle="Flood Rescue"
    />
  );
}
