"use client";

import { useState } from "react";
import Modal from "@/app/components/ui/Modal";

interface QuickRescueAction {
    id: string;
    icon: string;
    label: string;
    description: string;
    color: string;
}

interface RescueRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLocation: string;
    coordinates: { lat: number; lon: number } | null;
    onSubmit: (request: any) => void;
    isSubmitting: boolean;
}

const quickRescueActions: QuickRescueAction[] = [
    {
        id: "flood",
        icon: "🌊",
        label: "Ngập lụt",
        description: "Nước dâng cao, cần di chuyển khẩn cấp",
        color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30"
    },
    {
        id: "trapped",
        icon: "🏚️",
        label: "Bị kẹt",
        description: "Bị mắc kẹt, không thể thoát ra",
        color: "from-orange-500/20 to-yellow-500/10 border-orange-500/30"
    },
    {
        id: "injury",
        icon: "🤕",
        label: "Bị thương",
        description: "Có người bị thương cần cấp cứu",
        color: "from-red-500/20 to-pink-500/10 border-red-500/30"
    },
    {
        id: "landslide",
        icon: "⛰️",
        label: "Sạt lở",
        description: "Đất đá sạt lở, nguy hiểm cao",
        color: "from-amber-500/20 to-orange-500/10 border-amber-500/30"
    }
];

export default function RescueRequestModal({
    isOpen,
    onClose,
    currentLocation,
    coordinates,
    onSubmit,
    isSubmitting,
}: RescueRequestModalProps) {
    const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(null);
    const [rescueRequest, setRescueRequest] = useState({
        dangerType: "",
        description: "",
        numberOfPeople: 1,
        urgencyLevel: "high",
    });

    const handleQuickActionSelect = (action: QuickRescueAction) => {
        setSelectedQuickAction(action.id);
        setRescueRequest({
            dangerType: action.id,
            description: action.description,
            numberOfPeople: 1,
            urgencyLevel: "high",
        });
    };

    const handleSubmit = () => {
        if (!coordinates) {
            alert("Vui lòng bật GPS để gửi yêu cầu cứu hộ!");
            return;
        }

        if (!selectedQuickAction && !rescueRequest.dangerType) {
            alert("Vui lòng chọn loại tình huống!");
            return;
        }

        const requestData = {
            ...rescueRequest,
            location: currentLocation,
            coordinates: coordinates,
            timestamp: new Date().toISOString(),
            status: "pending",
        };

        onSubmit(requestData);
    };

    const footer = selectedQuickAction && (
        <div className="flex gap-3">
            <button
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
                Hủy
            </button>
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-[2] px-6 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <span className="animate-spin">⏳</span>
                        <span>Đang gửi...</span>
                    </>
                ) : (
                    <>
                        <span className="text-xl">🚨</span>
                        <span>GỬI NGAY</span>
                    </>
                )}
            </button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Yêu cầu cứu hộ"
            icon="🚨"
            footer={footer}
        >
            <div className="space-y-4">
                {/* Quick Actions */}
                <div>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <span>⚡</span>
                        Chọn tình huống khẩn cấp
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {quickRescueActions.map((action) => (
                            <button
                                key={action.id}
                                onClick={() => handleQuickActionSelect(action)}
                                className={`relative p-4 rounded-xl border-2 transition-all ${selectedQuickAction === action.id
                                        ? `bg-gradient-to-br ${action.color} border-transparent shadow-lg scale-[1.02]`
                                        : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                                    }`}
                            >
                                <div className="text-center">
                                    <span className="text-4xl mb-2 block">{action.icon}</span>
                                    <p className="text-sm font-bold text-white mb-1">{action.label}</p>
                                    <p className="text-xs text-gray-400 line-clamp-2">{action.description}</p>
                                </div>
                                {selectedQuickAction === action.id && (
                                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Additional Details */}
                {selectedQuickAction && (
                    <div className="animate-in slide-in-from-top duration-200">
                        <label className="block text-sm font-bold text-white mb-2">
                            📝 Thêm thông tin chi tiết (không bắt buộc)
                        </label>
                        <textarea
                            value={rescueRequest.description}
                            onChange={(e) => setRescueRequest({ ...rescueRequest, description: e.target.value })}
                            placeholder="VD: Nước ngập cao 1.5m, có 2 người già cần di chuyển..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition resize-none text-sm"
                        />
                    </div>
                )}

                {/* Number of People */}
                {selectedQuickAction && (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">👥</span>
                            <div>
                                <p className="text-sm font-bold text-white">Số người cần cứu hộ</p>
                                <p className="text-xs text-gray-400">Bao gồm cả bạn</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setRescueRequest({ ...rescueRequest, numberOfPeople: Math.max(1, rescueRequest.numberOfPeople - 1) })}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition"
                            >
                                −
                            </button>
                            <span className="text-xl font-bold text-white w-10 text-center">{rescueRequest.numberOfPeople}</span>
                            <button
                                onClick={() => setRescueRequest({ ...rescueRequest, numberOfPeople: Math.min(50, rescueRequest.numberOfPeople + 1) })}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition"
                            >
                                +
                            </button>
                        </div>
                    </div>
                )}

                {/* Location Info */}
                {selectedQuickAction && (
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">📍</span>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-blue-400 mb-1">Vị trí sẽ được gửi tự động</p>
                                <p className="text-sm text-gray-300">{currentLocation}</p>
                                {coordinates && (
                                    <p className="text-xs text-gray-500 mt-1 font-mono">
                                        {coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
