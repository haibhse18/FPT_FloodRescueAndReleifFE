# CẤU TRÚC PROJECT - FPT FLOOD RESCUE & RELIEF

## 📁 Cấu trúc thư mục (Updated - Shadcn/ui)

```
src/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin role
│   │   ├── components/           # Admin-specific components
│   │   └── page.tsx             # Admin dashboard
│   │
│   ├── citizens/                 # Citizens role  
│   │   ├── components/           # ⭐ CITIZEN COMPONENTS
│   │   │   ├── layout/          # Layout components (MobileHeader, DesktopSidebar, etc)
│   │   │   └── index.ts         # Export barrel
│   │   ├── layout.tsx           # ⭐ LAYOUT CHUNG CHO CITIZENS
│   │   ├── page.tsx             # Citizen homepage
│   │   ├── history/             # Lịch sử
│   │   ├── notifications/       # Thông báo
│   │   ├── profile/             # Thông tin cá nhân
│   │   └── safety-guide/        # Hướng dẫn an toàn
│   │
│   ├── coordinator/              # Coordinator role
│   │   ├── components/           # Coordinator-specific components
│   │   └── page.tsx             # Coordinator dashboard
│   │
│   ├── manager/                  # Manager role
│   │   ├── components/           # Manager-specific components
│   │   └── page.tsx             # Manager dashboard
│   │
│   ├── rescue-team/              # Rescue Team role
│   │   ├── components/           # Rescue team-specific components
│   │   └── page.tsx             # Rescue team dashboard
│   │
│   ├── api/                      # ⭐ API ROUTES (Organized by Role)
│   │   ├── citizens/             # APIs cho Citizens
│   │   │   ├── reverse-geocode/ # GPS → Address
│   │   │   └── cloudinary/      # Upload ảnh
│   │   ├── coordinator/          # APIs cho Coordinator (coming soon)
│   │   ├── rescue-team/          # APIs cho Rescue Team (coming soon)
│   │   ├── manager/              # APIs cho Manager (coming soon)
│   │   ├── admin/                # APIs cho Admin (coming soon)
│   │   └── README.md            # API documentation
│   │
│   ├── components/               # Shared components across ALL roles
│   │   ├── forms/                # Form components (shared)
│   │   │   ├── FormDivider.tsx
│   │   │   ├── GoogleLoginButton.tsx
│   │   │   ├── PasswordInput.tsx
│   │   │   └── index.ts
│   │   ├── LocationMap.tsx       # Map components (shared)
│   │   └── OpenMap.tsx
│   │
│   ├── login/                    # Login page
│   ├── register/                 # Register page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Global styles
│
├── components/
│   └── ui/                       # ⭐ SHADCN/UI COMPONENTS
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── badge.tsx
│       ├── separator.tsx
│       ├── avatar.tsx
│       ├── dialog.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       └── success-popup.tsx
│
├── hooks/
│   └── use-toast.ts             # Toast hook
│
├── lib/
│   ├── services/
│   │   └── apiClient.ts         # ⭐ API CLIENT - QUẢN LÝ TẤT CẢ API CALLS
│   └── utils.ts                 # ⭐ cn() utility cho Shadcn
│
├── types/
│   └── index.ts                 # TypeScript types & interfaces
│
└── utils/                        # Utility functions

```

## ⭐ THAY ĐỔI QUAN TRỌNG

### 1. **Shadcn/ui Components** (Mới)
Thay thế toàn bộ custom components bằng Shadcn/ui:
- ✅ `components/ui/button.tsx` - Nút bấm với variants
- ✅ `components/ui/card.tsx` - Card với Header/Content
- ✅ `components/ui/input.tsx` - Input field
- ✅ `components/ui/label.tsx` - Label
- ✅ `components/ui/badge.tsx` - Badges
- ✅ `components/ui/avatar.tsx` - Avatar
- ✅ `components/ui/dialog.tsx` - Modal/Dialog
- ✅ `components/ui/toast.tsx` - Toast notifications
- ✅ `components/ui/success-popup.tsx` - Success dialog

### 2. **API Client** (Renamed)
File: `lib/services/apiClient.ts` (trước đây: api.ts)
- Tập trung quản lý tất cả API calls
- Tránh nhầm lẫn với Next.js API routes folder

### 3. **API Routes by Role** (Organized)
Folder: `app/api/`
- `api/citizens/` - APIs cho Citizens
- `api/coordinator/` - APIs cho Coordinator
- `api/rescue-team/` - APIs cho Rescue Team  
- `api/manager/` - APIs cho Manager
- `api/admin/` - APIs cho Admin

### 4. **Citizen Layout** (Mới)
File: `app/citizens/layout.tsx`
- Layout chung cho tất cả pages trong `/citizens/*`
- Responsive (Mobile + Desktop)
- Tích hợp sẵn Header, Sidebar, Bottom Nav

### 3. **Đã xóa** (Không dùng nữa)
- ❌ `app/components/ui/` - Toàn bộ custom UI components cũ
- ❌ `app/citizens/components/` - Components cũ
- ❌ `COMPONENT_USAGE.md` - Tài liệu cũ
- ❌ `COMPONENT_STRUCTURE.md` - Tài liệu cũ

### Auth APIs
- `authAPI.login()` - Đăng nhập
- `authAPI.register()` - Đăng ký
- `authAPI.logout()` - Đăng xuất
- `authAPI.getCurrentUser()` - Lấy thông tin user
- `authAPI.changePassword()` - Đổi mật khẩu

### Citizen APIs
- `citizenAPI.createEmergencyRequest()` - Gửi yêu cầu cứu trợ
- `citizenAPI.getMyRequests()` - Lấy danh sách yêu cầu
- `citizenAPI.updateProfile()` - Cập nhật profile
- `citizenAPI.getHistory()` - Lịch sử
- `citizenAPI.getNotifications()` - Thông báo

### Rescue Team APIs
- `rescueTeamAPI.getAssignedRequests()` - Lấy yêu cầu được phân công
- `rescueTeamAPI.updateRequestStatus()` - Cập nhật trạng thái
- `rescueTeamAPI.updateLocation()` - Cập nhật vị trí
- `rescueTeamAPI.reportProgress()` - Báo cáo tiến độ

### Coordinator APIs
- `coordinatorAPI.getAllRequests()` - Lấy tất cả yêu cầu
- `coordinatorAPI.assignRescueTeam()` - Phân công đội cứu hộ
- `coordinatorAPI.getRescueTeams()` - Danh sách đội cứu hộ
- `coordinatorAPI.updateRequestPriority()` - Cập nhật ưu tiên

### Manager APIs
- `managerAPI.getDashboardStats()` - Thống kê dashboard
- `managerAPI.getReports()` - Báo cáo
- `managerAPI.getUsers()` - Danh sách users
- `managerAPI.updateUser()` - Cập nhật user
- `managerAPI.deleteUser()` - Xóa user

### Admin APIs
- `adminAPI.getAllUsers()` - Tất cả users
- `adminAPI.getSystemConfig()` - Cấu hình hệ thống
- `adminAPI.updateSystemConfig()` - Cập nhật config
- `adminAPI.getSystemLogs()` - Logs hệ thống
- `adminAPI.backupDatabase()` - Backup database

### Map APIs
- `mapAPI.reverseGeocode()` - Lấy địa chỉ từ tọa độ
- `mapAPI.geocode()` - Lấy tọa độ từ địa chỉ
- `mapAPI.getFloodZones()` - Khu vực ngập lụt
- `mapAPI.getSafeZones()` - Khu vực an toàn

## 🔧 Cách sử dụng API Service

```typescript
// Import API service
import API from '@/lib/services/api';

// Sử dụng trong component
async function handleLogin() {
  try {
    const response = await API.auth.login(email, password);
    console.log('Login success:', response);
  } catch (error) {
    console.error('Login failed:', error);
  }
}

// Citizen gửi yêu cầu cứu trợ
async function sendEmergencyRequest() {
  try {
    const response = await API.citizen.createEmergencyRequest({
      location: { lat: 21.0285, lng: 105.8542 },
      address: 'Hà Nội',
      description: 'Cần cứu trợ khẩn cấp',
      urgencyLevel: 'high',
      peopleCount: 5,
      hasInjuries: false,
      hasChildren: true,
      hasElderly: true,
      phone: '0123456789',
    });
  } catch (error) {
    console.error(error);
  }
}
```

## 📝 TypeScript Types

File: `src/types/index.ts`

Chứa tất cả các interfaces và types:
- User, UserRole, AuthResponse
- RescueRequest, UrgencyLevel, RequestStatus
- RescueTeam, TeamStatus
- Notification, NotificationType
- FloodZone, SafeZone
- DashboardStats, Report
- ApiResponse, PaginatedResponse

## 🚀 Next Steps

1. **Cập nhật imports trong các file hiện tại** từ `@/app/...` sang `@/...`
2. **Xóa folder app/ cũ** ở root (đã được copy vào src/app/)
3. **Kết nối với Backend API** - cập nhật `API_BASE_URL` trong `api.ts`
4. **Thêm Redux/Zustand** nếu cần state management phức tạp
5. **Tạo các components cụ thể** cho từng role

## ⚠️ Lưu ý

- Folder `app/` cũ vẫn còn ở root, cần xóa sau khi đã test kỹ
- Cần update tất cả imports từ `@/app/components/...` sang `@/components/shared/...`
- Kiểm tra lại các đường dẫn và imports sau khi restructure

## 🔗 Routes

- `/` - Homepage
- `/admin` - Admin dashboard
- `/citizens` - Citizens homepage
- `/coordinator` - Coordinator dashboard  
- `/manager` - Manager dashboard
- `/rescue-team` - Rescue team dashboard
- `/login` - Login page
- `/register` - Register page
