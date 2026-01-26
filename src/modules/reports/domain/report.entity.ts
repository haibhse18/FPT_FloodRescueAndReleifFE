/**
 * Report Entity - Domain layer
 * Định nghĩa cấu trúc dữ liệu Report, không phụ thuộc framework
 */

export type ReportType = 'mission' | 'daily' | 'incident' | 'summary';

export type ReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface Report {
    id: string;
    type: ReportType;
    title: string;
    content: string;
    missionId?: string;
    teamId?: string;
    authorId: string;
    status: ReportStatus;
    attachments?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateReportData {
    type: ReportType;
    title: string;
    content: string;
    missionId?: string;
    attachments?: string[];
}
