/**
 * Resource Repository Interface - Domain layer
 * Định nghĩa contract cho resource operations, không phụ thuộc implementation
 */

import { Resource, CreateResourceData, UpdateResourceData } from './resource.entity';

export interface IResourceRepository {
    /**
     * Lấy danh sách resources
     */
    getResources(): Promise<Resource[]>;

    /**
     * Lấy chi tiết resource
     */
    getResourceById(id: string): Promise<Resource>;

    /**
     * Tạo resource mới
     */
    createResource(data: CreateResourceData): Promise<Resource>;

    /**
     * Cập nhật resource
     */
    updateResource(id: string, data: UpdateResourceData): Promise<Resource>;

    /**
     * Xóa resource
     */
    deleteResource(id: string): Promise<void>;
}
