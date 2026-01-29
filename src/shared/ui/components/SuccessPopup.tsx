"use client";

import { useEffect, useState } from "react";

export interface SuccessPopupProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    icon?: string;
}

export function SuccessPopup({
    isOpen,
    onClose,
    message,
    icon = "✅"
}: SuccessPopupProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }, 3500);

            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-[200] transition-all duration-500 ${isVisible
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-full'
                }`}
        >
            <div className="bg-[var(--color-primary)]/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10 overflow-hidden w-[90vw] sm:w-96 max-w-md">
                {/* Success indicator bar */}
                <div className="h-1.5 bg-gradient-to-r from-[var(--color-success)] via-[var(--color-success-light)] to-[var(--color-success)] animate-pulse" />

                <div className="p-5">
                    <div className="flex items-start gap-3">
                        {/* Icon with animation */}
                        <div className="flex-shrink-0">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[var(--color-success)]/30 rounded-full animate-ping" />
                                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-success)] to-[var(--color-success-dark)] flex items-center justify-center shadow-lg">
                                    <span className="text-2xl">{icon}</span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                            <h3 className="text-base font-bold text-[var(--color-text-inverse)] mb-1">
                                {message}
                            </h3>
                            <p className="text-xs text-[var(--color-text-muted)]">
                                Thông báo sẽ tự đóng trong 3 giây
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Default export for backward compatibility
export default SuccessPopup;
