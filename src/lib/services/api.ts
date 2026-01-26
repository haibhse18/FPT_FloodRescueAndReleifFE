/**
 * ==============================================
 * API SERVICE - QUẢN LÝ TẬP TRUNG TẤT CẢ API CALLS
 * ==============================================
 * File này chứa tất cả các API endpoints để dễ dàng quản lý và bảo trì
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// ==============================================
// HELPER FUNCTIONS
// ==============================================

/**
 * Fetch wrapper với error handling
 */
async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API call failed: ${endpoint}`, error);
        throw error;
    }
}

/**
 * Get token from storage
 */
function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('authToken');
    }
    return null;
}

/**
 * Add authorization header
 */
function getAuthHeaders(): HeadersInit {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ==============================================
// AUTH APIs
// ==============================================

export const authAPI = {
    /**
     * Đăng nhập
     */
    login: async (email: string, password: string) => {
        return fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    /**
     * Đăng ký
     */
    register: async (data: {
        email: string;
        password: string;
        fullName: string;
        phone: string;
        role: string;
    }) => {
        return fetchAPI('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Đăng xuất
     */
    logout: async () => {
        return fetchAPI('/auth/logout', {
            method: 'POST',
            headers: getAuthHeaders(),
        });
    },

    /**
     * Lấy thông tin user hiện tại
     */
    getCurrentUser: async () => {
        return fetchAPI('/auth/me', {
            headers: getAuthHeaders(),
        });
    },

    /**
     * Đổi mật khẩu
     */
    changePassword: async (oldPassword: string, newPassword: string) => {
        return fetchAPI('/auth/change-password', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ oldPassword, newPassword }),
        });
    },
};

// ==============================================
// CITIZEN APIs
// ==============================================

export const citizenAPI = {
    /**
     * Gửi yêu cầu cứu trợ khẩn cấp
     */
    createEmergencyRequest: async (data: {
        location: { lat: number; lng: number };
        address: string;
        description: string;
        urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
        peopleCount: number;
        hasInjuries: boolean;
        hasChildren: boolean;
        hasElderly: boolean;
        phone: string;
    }) => {
        return fetchAPI('/citizen/emergency-request', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
    },

    /**
     * Lấy danh sách yêu cầu của citizen
     */
    getMyRequests: async () => {
        return fetchAPI('/citizen/requests', {
            headers: getAuthHeaders(),
        });
    },

    /**
     * Cập nhật thông tin cá nhân
     */
    updateProfile: async (data: {
        fullName?: string;
        phone?: string;
        address?: string;
    }) => {
        return fetchAPI('/citizen/profile', {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
    },

    /**
     * Lấy lịch sử cứu trợ
     */
    getHistory: async () => {
        return fetchAPI('/citizen/history', {
            headers: getAuthHeaders(),
        });
    },

    /**
     * Lấy thông báo
     */
    getNotifications: async () => {
        return fetchAPI('/citizen/notifications', {
            headers: getAuthHeaders(),
        });
    },
};

// ==============================================
// RESCUE TEAM APIs
// ==============================================

export const rescueTeamAPI = {
    /**
     * Lấy danh sách yêu cầu cứu trợ được phân công
     */
    getAssignedRequests: async () => {
        return fetchAPI('/rescue-team/assigned-requests', {
            headers: getAuthHeaders(),
        });
    },

    /**
     * Cập nhật trạng thái yêu cầu
     */
    updateRequestStatus: async (
        requestId: string,
        status: 'in_progress' | 'completed' | 'failed',
        note?: string
    ) => {
        return fetchAPI(`/rescue-team/requests/${requestId}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status, note }),
        });
    },

    /**
     * Cập nhật vị trí của đội cứu hộ
     */
    updateLocation: async (location: { lat: number; lng: number }) => {
        return fetchAPI('/rescue-team/location', {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(location),
        });
    },

    /**
     * Báo cáo tiến độ
     */
    reportProgress: async (requestId: string, progress: string) => {
        return fetchAPI(`/rescue-team/requests/${requestId}/progress`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ progress }),
        });
    },
};

// ==============================================
// COORDINATOR APIs
// ==============================================

export const coordinatorAPI = {
    /**
     * Lấy tất cả yêu cầu cứu trợ
     */
    getAllRequests: async (filters?: {
        status?: string;
        urgency?: string;
        dateFrom?: string;
        dateTo?: string;
    }) => {
        const params = new URLSearchParams(filters as any);
        return fetchAPI(`/coordinator/requests?${params}`, {
            headers: getAuthHeaders(),
        });
    },

    /**
     * Phân công rescue team cho yêu cầu
     */
    assignRescueTeam: async (requestId: string, teamId: string) => {
        return fetchAPI(`/coordinator/requests/${requestId}/assign`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ teamId }),
        });
    },

    /**
     * Lấy danh sách rescue teams
     */
    getRescueTeams: async () => {
        return fetchAPI('/coordinator/rescue-teams', {
            headers: getAuthHeaders(),
        });
    },

    /**
     * Cập nhật ưu tiên yêu cầu
     */
    updateRequestPriority: async (
        requestId: string,
        priority: 'low' | 'medium' | 'high' | 'critical'
    ) => {
        return fetchAPI(`/coordinator/requests/${requestId}/priority`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ priority }),
        });
    },
};

// ==============================================
// MANAGER APIs
// ==============================================

export const managerAPI = {
    /**
     * Lấy dashboard statistics
     */
    getDashboardStats: async () => {
        return fetchAPI('/manager/dashboard', {
            headers: getAuthHeaders(),
        });
    },

    /**
     * Lấy báo cáo
     */
    getReports: async (type: 'daily' | 'weekly' | 'monthly') => {
        return fetchAPI(`/manager/reports?type=${type}`, {
            headers: getAuthHeaders(),
        });
    },

    /**
     * Quản lý người dùng
     */
    getUsers: async (role?: string) => {
        const params = role ? `?role=${role}` : '';
        return fetchAPI(`/manager/users${params}`, {
            headers: getAuthHeaders(),
        });
    },

    /**
     * Cập nhật user
     */
    updateUser: async (userId: string, data: any) => {
        return fetchAPI(`/manager/users/${userId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
    },

    /**
     * Xóa user
     */
    deleteUser: async (userId: string) => {
        return fetchAPI(`/manager/users/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
    },
};

// ==============================================
// ADMIN APIs
// ==============================================

export const adminAPI = {
    /**
     * Lấy tất cả users
     */
    getAllUsers: async () => {
        return fetchAPI('/admin/users', {
            headers: getAuthHeaders(),
        });
    },

    /**
     * Cấu hình hệ thống
     */
    getSystemConfig: async () => {
        return fetchAPI('/admin/config', {
            headers: getAuthHeaders(),
        });
    },

    /**
     * Cập nhật cấu hình hệ thống
     */
    updateSystemConfig: async (config: any) => {
        return fetchAPI('/admin/config', {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(config),
        });
    },

    /**
     * Lấy logs hệ thống
     */
    getSystemLogs: async (page: number = 1, limit: number = 50) => {
        return fetchAPI(`/admin/logs?page=${page}&limit=${limit}`, {
            headers: getAuthHeaders(),
        });
    },

    /**
     * Backup database
     */
    backupDatabase: async () => {
        return fetchAPI('/admin/backup', {
            method: 'POST',
            headers: getAuthHeaders(),
        });
    },
};

// ==============================================
// MAP & LOCATION APIs
// ==============================================

export const mapAPI = {
    /**
     * Reverse geocoding - Lấy địa chỉ từ tọa độ
     */
    reverseGeocode: async (lat: number, lng: number) => {
        return fetchAPI(`/reverse-geocode?lat=${lat}&lng=${lng}`);
    },

    /**
     * Geocoding - Lấy tọa độ từ địa chỉ
     */
    geocode: async (address: string) => {
        return fetchAPI(`/geocode?address=${encodeURIComponent(address)}`);
    },

    /**
     * Lấy flood zones (khu vực ngập lụt)
     */
    getFloodZones: async () => {
        return fetchAPI('/map/flood-zones');
    },

    /**
     * Lấy safe zones (khu vực an toàn)
     */
    getSafeZones: async () => {
        return fetchAPI('/map/safe-zones');
    },
};

// ==============================================
// CLOUDINARY APIs
// ==============================================

export const cloudinaryAPI = {
    /**
     * Lấy signature từ backend để signed upload
     */
    getSignature: async (folder: string = 'rescue_requests') => {
        return fetchAPI('/cloudinary/signature', {
            method: 'POST',
            body: JSON.stringify({ folder }),
        });
    },

    /**
     * Upload hình ảnh lên Cloudinary với signed upload (Bảo mật)
     */
    uploadImage: async (file: File): Promise<string> => {
        try {
            // Lấy signature từ backend
            const signatureData: any = await cloudinaryAPI.getSignature('rescue_requests');
            const { signature, timestamp, cloudName, apiKey, folder } = signatureData;

            // Tạo FormData với signed upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp.toString());
            formData.append('api_key', apiKey);
            formData.append('folder', folder);

            // Upload lên Cloudinary
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Upload failed');
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw error;
        }
    },

    /**
     * Upload nhiều hình ảnh
     */
    uploadMultipleImages: async (files: File[]): Promise<string[]> => {
        const uploadPromises = files.map(file => cloudinaryAPI.uploadImage(file));
        return Promise.all(uploadPromises);
    },
};

// ==============================================
// EXPORT TẬP TRUNG
// ==============================================

const API = {
    auth: authAPI,
    citizen: citizenAPI,
    rescueTeam: rescueTeamAPI,
    coordinator: coordinatorAPI,
    manager: managerAPI,
    admin: adminAPI,
    map: mapAPI,
    cloudinary: cloudinaryAPI,
};

export default API;
