/**
 * Report Repository Interface - Domain layer
 * Định nghĩa contract cho report operations, không phụ thuộc implementation
 */

import { Report, CreateReportData } from './report.entity';

export interface IReportRepository {
    /**
     * Tạo báo cáo mới
     */
    createReport(data: CreateReportData): Promise<Report>;

    /**
     * Lấy danh sách báo cáo
     */
    getReports(): Promise<Report[]>;

    /**
     * Lấy chi tiết báo cáo
     */
    getReportById(id: string): Promise<Report>;

    /**
     * Cập nhật báo cáo
     */
    updateReport(id: string, data: Partial<CreateReportData>): Promise<Report>;
}
