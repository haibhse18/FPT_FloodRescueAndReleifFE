/**
 * Supply Repository Interface - Domain layer
 * Định nghĩa contract cho supply operations, không phụ thuộc implementation
 */

import { Supply, SupplyRequest, CreateSupplyRequestData } from './supply.entity';

export interface ISupplyRepository {

    importExcel(file: File): Promise<void>;
    /**
     * Lấy danh sách supplies
     */
    getSupplies(): Promise<{ data: Supply[], meta: { page: number, totalPages: number, total: number } }>;

    /**
     * Lấy danh sách supply requests
     */
    getSupplyRequests(): Promise<SupplyRequest[]>;

    /**
     * Tạo supply request mới
     */
    createSupplyRequest(data: CreateSupplyRequestData): Promise<SupplyRequest>;

    /**
     * Cập nhật trạng thái supply
     */
    updateSupplyStatus(id: string, status: string): Promise<void>;
}
