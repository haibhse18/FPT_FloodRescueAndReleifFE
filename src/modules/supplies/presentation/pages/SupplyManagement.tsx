"use client";

import { useEffect, useState } from "react";
import { Supply, SupplyRequest } from "@/modules/supplies/domain/supply.entity";
import { supplyRepository } from "@/modules/supplies/infrastructure/supply.repository.impl";
import { GetSuppliesUseCase } from "@/modules/supplies/application/getSupplies.usecase";
import { GetSupplyRequestsUseCase } from "@/modules/supplies/application/getSupplyRequests.usecase";
import { SupplyList } from "../components/SupplyList";
import { useToast } from "@/hooks/use-toast";

const getSuppliesUseCase = new GetSuppliesUseCase(supplyRepository);
const getSupplyRequestsUseCase = new GetSupplyRequestsUseCase(supplyRepository);

export default function SupplyManagementPage() {
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [requests, setRequests] = useState<SupplyRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"supplies" | "requests">("supplies");
    const { toast } = useToast();

    // State for Excel upload
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    // Handle file change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
        import { Supply } from "@/modules/supplies/domain/supply.entity";

    // Handle upload
        import { requestsApi } from "@/modules/requests/infrastructure/requests.api";
        import type { CoordinatorRequest } from "@/modules/requests/domain/request.entity";
        if (!file) {
            toast({
                title: "Chưa chọn file",
                description: "Vui lòng chọn file Excel để import",
            });
            return;
        }
            const [requests, setRequests] = useState<CoordinatorRequest[]>([]);
        try {
            await supplyRepository.importExcel(file);
            toast({
                title: "Import thành công",
                description: "Dữ liệu đã được cập nhật vào kho vật tư",
                variant: "default",
            });
                    const response = await requestsApi.getAllRequests({
                        type: "Relief",
                        page: 1,
                        limit: 50,
                    });

                    const result = response as {
                        data?: unknown;
                    };

                    setRequests(Array.isArray(result.data) ? (result.data as CoordinatorRequest[]) : []);
        } catch (error) {
                    const message = error instanceof Error ? error.message : "Lỗi khi tải yêu cầu cứu trợ";
            toast({
                title: "Lỗi",
                description: message,
                variant: "destructive",
            });
            console.error(error);
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
                        <p className="text-gray-400">Quản lý kho vật tư và yêu cầu cứu trợ</p>
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await getSupplyRequestsUseCase.execute();
            setRequests(data);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Lỗi khi tải yêu cầu";
            toast({
                title: "Lỗi",
                description: message,
                variant: "destructive",
            });
            console.error(error);
        } finally {
            setLoading(false);
                            📋 Yêu cầu cứu trợ ({requests.length})
    };

    useEffect(() => {
        if (activeTab === "supplies") {
            fetchSupplies();
        } else {
            fetchRequests();
        }
    }, [activeTab]);

    return (
                                    <p>Chưa có yêu cầu cứu trợ nào</p>
            {/* Upload Excel UI */}
            <div className="mb-4 flex items-center gap-3">
                <input
                    type="file"
                    accept=".xlsx,.xls"
                                            key={request._id}
                    className="block text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 file:font-semibold"
                />
                <button
                    onClick={handleUpload}
                    disabled={uploading || !file}
                                                        {request.requestId || request._id}
                >
                    {uploading ? "Đang import..." : "Import Excel"}
                                                        {request.requestSupplies?.length ?? 0} mục vật tư
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Quản lý vật tư</h1>
                <p className="text-gray-400">Quản lý kho vật tư và yêu cầu cung cấp</p>
                                                        request.priority === "Critical"

                                                            : request.priority === "High"
                <button
                    onClick={() => setActiveTab("supplies")}
                    className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                        activeTab === "supplies"
                            ? "text-blue-400 border-blue-400"
                            : "text-gray-400 border-transparent hover:text-gray-300"
                    }`}
                >
                                                {(request.requestSupplies ?? []).length > 0 ? (
                                                    request.requestSupplies?.map((item, i) => (
                                                        <p key={`${request._id}-${i}`} className="text-gray-300 text-sm">
                                                            • {item.supplyName || item.supplyId}: {item.requestedQty}
                                                        </p>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-400 text-sm">Không có danh sách vật tư chi tiết</p>
                                                )}
                        activeTab === "requests"
                            ? "text-blue-400 border-blue-400"
                            : "text-gray-400 border-transparent hover:text-gray-300"
                    }`}
                >
                    📋 Yêu cầu ({requests.length})
                </button>
            </div>

            {activeTab === "supplies" && (
                <div className="bg-white/5 rounded-lg p-6">
                    <SupplyList supplies={supplies} loading={loading} />
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
                            <p>Chưa có yêu cầu nào</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <div
                                    key={request.id}
                                    className="bg-white/10 p-4 rounded-lg border border-gray-700"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-white font-medium">
                                                {request.requestId}
                                            </p>
                                            <p className="text-gray-400 text-sm">
                                                {request.items.length} mục
                                            </p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                request.priority === "critical"
                                                    ? "bg-red-600/30 text-red-300"
                                                    : request.priority === "high"
                                                    ? "bg-orange-600/30 text-orange-300"
                                                    : "bg-blue-600/30 text-blue-300"
                                            }`}
                                        >
                                            {request.priority}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {request.items.map((item, i) => (
                                            <p key={i} className="text-gray-300 text-sm">
                                                • {item.name} ({item.category}): {item.quantity} {item.unit}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
