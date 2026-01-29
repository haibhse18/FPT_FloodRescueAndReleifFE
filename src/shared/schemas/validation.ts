import { z } from 'zod';

// Login validation schema - theo API_list.md
export const loginSchema = z.object({
    email: z.string()
        .min(1, 'Email là bắt buộc')
        .email('Email không hợp lệ')
        .max(255, 'Email quá dài'),
    password: z.string()
        .min(1, 'Mật khẩu là bắt buộc')
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
        .max(100, 'Mật khẩu quá dài'),
});

// Register validation schema - theo API_list.md
// Request: { userName, displayName, email, phoneNumber?, password, role? }
export const registerSchema = z.object({
    userName: z.string()
        .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
        .max(50, 'Tên đăng nhập quá dài')
        .regex(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới'),
    displayName: z.string()
        .min(2, 'Tên hiển thị phải có ít nhất 2 ký tự')
        .max(100, 'Tên hiển thị quá dài'),
    email: z.string()
        .min(1, 'Email là bắt buộc')
        .email('Email không hợp lệ')
        .max(255, 'Email quá dài'),
    phoneNumber: z.string()
        .regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không đúng định dạng')
        .optional()
        .or(z.literal('')),
    password: z.string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
        .max(100, 'Mật khẩu quá dài')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải chứa chữ hoa, chữ thường và số'),
    confirmPassword: z.string(),
    role: z.enum(['Citizen', 'Rescue Team', 'Rescue Coordinator', 'Manager', 'Admin'])
        .optional()
        .default('Citizen'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
});

// Rescue request validation schema
export const rescueRequestSchema = z.object({
    dangerType: z.string()
        .min(1, 'Vui lòng chọn loại nguy hiểm'),
    description: z.string()
        .min(10, 'Mô tả phải có ít nhất 10 ký tự')
        .max(1000, 'Mô tả quá dài'),
    numberOfPeople: z.number()
        .int('Số người phải là số nguyên')
        .min(1, 'Số người phải ít nhất là 1')
        .max(1000, 'Số người không hợp lệ'),
    urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']),
    latitude: z.number()
        .min(-90, 'Vĩ độ không hợp lệ')
        .max(90, 'Vĩ độ không hợp lệ'),
    longitude: z.number()
        .min(-180, 'Kinh độ không hợp lệ')
        .max(180, 'Kinh độ không hợp lệ'),
    location: z.string()
        .min(1, 'Vị trí không được để trống'),
    images: z.array(z.string().url('URL ảnh không hợp lệ')).optional(),
});

// Profile update validation schema
export const profileUpdateSchema = z.object({
    fullName: z.string()
        .min(2, 'Họ tên phải có ít nhất 2 ký tự')
        .max(100, 'Họ tên quá dài')
        .optional(),
    phone: z.string()
        .regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không đúng định dạng')
        .optional(),
    address: z.string()
        .max(500, 'Địa chỉ quá dài')
        .optional(),
});

// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RescueRequestInput = z.infer<typeof rescueRequestSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
