"use client";

import { useEffect, useState } from "react";
import { Supply } from "@/modules/supplies/domain/supply.entity";
import { supplyRepository } from "@/modules/supplies/infrastructure/supply.repository.impl";
import { GetSuppliesUseCase } from "@/modules/supplies/application/getSupplies.usecase";
import { requestsApi } from "@/modules/requests/infrastructure/requests.api";
import type { CoordinatorRequest } from "@/modules/requests/domain/request.entity";
import { SupplyList } from "../components/SupplyList";
import { useToast } from "@/hooks/use-toast";

const getSuppliesUseCase = new GetSuppliesUseCase(supplyRepository);

export default function SupplyManagementPage() {
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [requests, setRequests] = useState<CoordinatorRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"supplies" | "requests">("supplies");
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast({
                title: "Chưa chọn file",
                description: "Vui lòng chọn file Excel để import",
            });
            return;
        }

        setUploading(true);
        try {
            await supplyRepository.importExcel(file);
            toast({
                title: "Import thành công",
                description: "Dữ liệu đã được cập nhật vào kho vật tư",
                variant: "default",
            });
            setFile(null);
            fetchSupplies();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Lỗi khi import file";
            toast({
                title: "Lỗi",
                description: message,
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const fetchSupplies = async () => {
        setLoading(true);
        try {
            const response = await getSuppliesUseCase.execute();
            setSupplies(response.data);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Lỗi khi tải vật tư";
            toast({
                title: "Lỗi",
                description: message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await requestsApi.getAllRequests({
                type: "Relief",
                page: 1,
                limit: 50,
            });

            if (response && response.data && Array.isArray(response.data)) {
                setRequests(response.data as CoordinatorRequest[]);
            } else {
                setRequests([]);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Lỗi khi tải yêu cầu cứu trợ";
            toast({
                title: "Lỗi",
                description: message,
                variant: "destructive",
            });
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "supplies") {
            fetchSupplies();
        } else {
            fetchRequests();
        }
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Quản lý vật tư</h1>
                    <p className="text-gray-400">Quản lý kho vật tư và yêu cầu cứu trợ</p>
                </div>

                {/* Excel Upload Section */}
                {activeTab === "supplies" && (
                    <div className="mb-6 bg-white/5 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                className="block text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 file:font-semibold"
                            />
                            <button
                                onClick={handleUpload}
                                disabled={uploading || !file}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                            >
                                {uploading ? "Đang import..." : "Import Excel"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-gray-700 mb-6">
                    <button
                        onClick={() => setActiveTab("supplies")}
                        className={`px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === "supplies"
                                ? "text-blue-400 border-blue-400"
                                : "text-gray-400 border-transparent hover:text-gray-300"
                            }`}
                    >
                        📦 Vật tư ({supplies.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("requests")}
                        className={`px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === "requests"
                                ? "text-blue-400 border-blue-400"
                                : "text-gray-400 border-transparent hover:text-gray-300"
                            }`}
                    >
                        📋 Yêu cầu ({requests.length})
                    </button>
                </div>

                {/* Content */}
                {activeTab === "supplies" && (
                    <div className="bg-white/5 rounded-lg p-6">
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white mx-auto"></div>
                            </div>
                        ) : (
                            <SupplyList supplies={supplies} loading={loading} />
                        )}
                    </div>
                )}

                {activeTab === "requests" && (
                    <div className="bg-white/5 rounded-lg p-6">
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white mx-auto"></div>
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">
                                <p>Chưa có yêu cầu cứu trợ nào</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {requests.map((request) => (
                                    <div
                                        key={request._id}
                                        className="bg-white/10 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-white font-medium">
                                                    {request.requestId || request._id}
                                                </p>
                                                <p className="text-gray-400 text-sm">
                                                    {request.requestSupplies?.length ?? 0} mục vật tư
                                                </p>
                                            </div>
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${request.priority === "Critical"
                                                        ? "bg-red-600/30 text-red-300"
                                                        : request.priority === "High"
                                                            ? "bg-orange-600/30 text-orange-300"
                                                            : "bg-blue-600/30 text-blue-300"
                                                    }`}
                                            >
                                                {request.priority}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {(request.requestSupplies ?? []).length > 0 ? (
                                                request.requestSupplies?.map((item, i) => (
                                                    <p key={`${request._id}-${i}`} className="text-gray-300 text-sm">
                                                        • {item.supplyName || item.supplyId}: {item.requestedQty}
                                                    </p>
                                                ))
                                            ) : (
                                                <p className="text-gray-400 text-sm">Không có danh sách vật tư chi tiết</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
