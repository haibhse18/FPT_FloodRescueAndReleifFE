"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/login");
    }, [router]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-secondary">
            <div className="text-center">
                <div className="animate-spin text-6xl mb-4">⏳</div>
                <p className="text-white text-lg">Đang chuyển hướng...</p>
            </div>
        </main>
    );
}
