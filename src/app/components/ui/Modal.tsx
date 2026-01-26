"use client";

import { ReactNode } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    icon?: string;
    footer?: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, icon, footer }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-secondary border-t lg:border border-white/20 rounded-t-3xl lg:rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom lg:slide-in-from-bottom-0 duration-300">
                {/* Header */}
                <div className="flex-shrink-0 bg-secondary/98 backdrop-blur-xl border-b border-white/10 p-5 shadow-lg rounded-t-3xl lg:rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {icon && (
                                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shadow-inner">
                                    <span className="text-2xl">{icon}</span>
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-black text-white">{title}</h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                        >
                            <span className="text-xl text-gray-400">✕</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain p-5">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex-shrink-0 bg-secondary/98 backdrop-blur-xl border-t border-white/10 p-5 shadow-[0_-4px_12px_rgba(0,0,0,0.3)] rounded-b-3xl lg:rounded-b-2xl">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
