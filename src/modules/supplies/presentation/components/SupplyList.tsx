"use client";

import { useEffect, useState } from "react";
import { Supply } from "@/modules/supplies/domain/supply.entity";
import { Table } from "@/shared/ui/components";

interface SupplyListProps {
    supplies: Supply[];
    loading?: boolean;
    onStatusChange?: (id: string, status: string) => void;
}

export function SupplyList({
    supplies,
    loading = false,
    onStatusChange,
}: SupplyListProps) {
    const columns = [
        { key: "id", header: "ID" },
        { key: "name", header: "Tên vật tư" },
        { key: "category", header: "Loại" },
        { key: "quantity", header: "Số lượng" },
        { key: "unit", header: "Đơn vị" },
        { key: "status", header: "Trạng thái" },
        { key: "source", header: "Nguồn" },
        { key: "destination", header: "Đích" },
    ];

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white mx-auto"></div>
            </div>
        );
    }

    if (!supplies || supplies.length === 0) {
        return (
            <div className="text-center py-20 text-gray-400">
                <p>Không có vật tư nào</p>
            </div>
        );
    }

    return (
        <Table
            columns={columns}
            data={supplies}
            striped
            hoverable
        />
    );
}
