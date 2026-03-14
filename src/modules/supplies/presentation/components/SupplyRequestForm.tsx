"use client";

import { useState } from "react";
import { CreateSupplyRequestData, SupplyItem } from "@/modules/supplies/domain/supply.entity";
import { Input } from "@/shared/ui/components/Input";

interface SupplyRequestFormProps {
    loading?: boolean;
    onSubmit?: (data: CreateSupplyRequestData) => Promise<void>;
    onCancel?: () => void;
}

export function SupplyRequestForm({
    loading = false,
    onSubmit,
    onCancel,
}: SupplyRequestFormProps) {
    const [formData, setFormData] = useState<CreateSupplyRequestData>({
        requestId: "",
        items: [
            {
                name: "",
                category: "OTHER",
                quantity: 0,
                unit: "",
            },
        ],
        priority: "medium",
    });

    const [submitting, setSubmitting] = useState(false);

    const handleAddItem = () => {
        setFormData((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    name: "",
                    category: "OTHER",
                    quantity: 0,
                    unit: "",
                },
            ],
        }));
    };

    const handleRemoveItem = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const handleItemChange = (index: number, field: keyof SupplyItem, value: any) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.requestId || formData.items.length === 0) {
            alert("Vui lòng điền đầy đủ thông tin");
            return;
        }

        setSubmitting(true);
        try {
            if (onSubmit) {
                await onSubmit(formData);
                setFormData({
                    requestId: "",
                    items: [
                        {
                            name: "",
                            category: "OTHER",
                            quantity: 0,
                            unit: "",
                        },
                    ],
                    priority: "medium",
                });
            }
        } catch (error) {
            console.error("Form submission error:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const isDisabled = loading || submitting;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-6 rounded-lg">
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                    Mã yêu cầu
                </label>
                <Input
                    type="text"
                    value={formData.requestId}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            requestId: e.target.value,
                        }))
                    }
                    placeholder="Nhập mã yêu cầu"
                    disabled={isDisabled}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                    Mức độ ưu tiên
                </label>
                <select
                    value={formData.priority}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            priority: e.target.value as any,
                        }))
                    }
                    disabled={isDisabled}
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white"
                >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                    <option value="critical">Cấp bách</option>
                </select>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-200">
                        Các mục vật tư
                    </label>
                    <button
                        type="button"
                        onClick={handleAddItem}
                        disabled={isDisabled}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg text-sm"
                    >
                        + Thêm
                    </button>
                </div>

                <div className="space-y-4">
                    {formData.items.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white/10 p-4 rounded-lg border border-gray-600 space-y-3"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">
                                        Tên
                                    </label>
                                    <Input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) =>
                                            handleItemChange(index, "name", e.target.value)
                                        }
                                        placeholder="Tên vật tư"
                                        disabled={isDisabled}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">
                                        Loại
                                    </label>
                                    <select
                                        value={item.category}
                                        onChange={(e) =>
                                            handleItemChange(index, "category", e.target.value)
                                        }
                                        disabled={isDisabled}
                                        className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white text-sm"
                                    >
                                        <option value="FOOD">Thực phẩm</option>
                                        <option value="WATER">Nước</option>
                                        <option value="MEDICAL">Y tế</option>
                                        <option value="CLOTHING">Quần áo</option>
                                        <option value="EQUIPMENT">Thiết bị</option>
                                        <option value="OTHER">Khác</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">
                                        Số lượng
                                    </label>
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            handleItemChange(index, "quantity", parseInt(e.target.value) || 0)
                                        }
                                        placeholder="0"
                                        disabled={isDisabled}
                                        min="1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">
                                        Đơn vị
                                    </label>
                                    <Input
                                        type="text"
                                        value={item.unit}
                                        onChange={(e) =>
                                            handleItemChange(index, "unit", e.target.value)
                                        }
                                        placeholder="cái, hộp, thùng..."
                                        disabled={isDisabled}
                                        required
                                    />
                                </div>
                            </div>
                            {formData.items.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    disabled={isDisabled}
                                    className="w-full px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm border border-red-600/30"
                                >
                                    Xóa
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={isDisabled}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                    {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDisabled}
                        className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Hủy
                    </button>
                )}
            </div>
        </form>
    );
}
