"use client";

import { ReactNode } from "react";
import {
    MobileHeader,
    MobileBottomNav,
    DesktopHeader,
    DesktopSidebar
} from "./components/layout";

interface CitizenLayoutProps {
    children: ReactNode;
}

export default function CitizenLayout({ children }: CitizenLayoutProps) {
    const handleLocationClick = () => {
        // Scroll to map or handle location click
        console.log("Location clicked");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Mobile Header */}
            <MobileHeader onLocationClick={handleLocationClick} />

            {/* Desktop Sidebar */}
            <DesktopSidebar
                userName="Người dùng"
                userRole="Công dân"
            />

            {/* Desktop Header */}
            <DesktopHeader
                title="Trang Công Dân"
                subtitle="Hệ thống cứu hộ & cứu trợ lũ lụt"
                onLocationClick={handleLocationClick}
            />

            {/* Main Content */}
            <main className="pt-16 pb-24 lg:pt-20 lg:pb-8 lg:ml-64">
                <div className="w-full min-h-[calc(100vh-10rem)] lg:min-h-[calc(100vh-5rem)]">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav currentPath="/citizens" />
        </div>
    );
}
