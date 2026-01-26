"use client";

import { useEffect, useState } from "react";

interface SuccessPopupProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    icon?: string;
}

export default function SuccessPopup({
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
            <div className="bg-secondary/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10 overflow-hidden w-[90vw] sm:w-96 max-w-md">
                {/* Success indicator bar */}
                <div className="h-1.5 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 animate-pulse" />

                <div className="p-5">
                    <div className="flex items-start gap-3">
                        {/* Icon với animation */}
                        <div className="flex-shrink-0">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-500/30 rounded-full animate-ping" />
                                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                    <span className="text-2xl">{icon}</span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                            <h3 className="text-base font-bold text-white mb-1">
                                Gửi yêu cầu thành công!
                            </h3>
                            <p className="text-xs text-gray-300 leading-relaxed">
                                {message}
                            </p>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(onClose, 300);
                            }}
                            className="flex-shrink-0 w-7 h-7 rounded-full hover:bg-white/10 active:bg-white/20 flex items-center justify-center transition-colors duration-200"
                            aria-label="Đóng"
                        >
                            <span className="text-gray-400 hover:text-white text-lg leading-none">×</span>
                        </button>
                    </div>

                    {/* Progress bar tự động đóng */}
                    <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                            style={{
                                width: '100%',
                                animation: 'shrinkWidth 3.5s linear forwards'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}