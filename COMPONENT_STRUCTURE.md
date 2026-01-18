# Cấu trúc Component - FPT Flood Rescue

## 📁 Tổ chức thư mục

```
app/
├── components/
│   ├── ui/                    # UI Components cơ bản
│   │   ├── Button.tsx         # Nút bấm tùy chỉnh
│   │   ├── Input.tsx          # Input field
│   │   ├── Card.tsx           # Card container
│   │   └── Modal.tsx          # Modal popup
│   │
│   ├── forms/                 # Form-related components
│   │   ├── PasswordInput.tsx  # Input mật khẩu với toggle
│   │   ├── GoogleLoginButton.tsx
│   │   └── FormDivider.tsx
│   │
│   ├── layout/                # Layout components
│   │   ├── DesktopSidebar.tsx # Sidebar cho desktop
│   │   ├── MobileHeader.tsx   # Header cho mobile
│   │   ├── DesktopHeader.tsx  # Header cho desktop
│   │   └── MobileBottomNav.tsx # Bottom navigation
│   │
│   ├── citizen/               # Citizen-specific components
│   │   ├── LocationInfoCard.tsx
│   │   ├── EmergencyButton.tsx
│   │   ├── QuickActionsList.tsx
│   │   └── RescueRequestModal.tsx
│   │
│   ├── LeafletMap.tsx         # Map component
│   └── LocationMap.tsx
│
├── login/
│   └── page.tsx              # Login page
├── register/
│   └── page.tsx              # Register page
└── citizen/
    └── page.tsx              # Citizen homepage
```

## 🎯 Nguyên tắc tổ chức

### 1. **UI Components** (`components/ui/`)
- Components tái sử dụng, không có logic nghiệp vụ
- Nhận props và render UI
- Ví dụ: Button, Input, Card, Modal

### 2. **Form Components** (`components/forms/`)
- Components liên quan đến form
- Có thể chứa state riêng (như PasswordInput)
- Xử lý validation, formatting

### 3. **Layout Components** (`components/layout/`)
- Components cấu trúc trang
- Header, Sidebar, Navigation
- Responsive design

### 4. **Feature Components** (`components/citizen/`)
- Components đặc thù cho từng feature
- Chứa logic nghiệp vụ
- Kết hợp nhiều UI components

## 📝 Ví dụ sử dụng

### Button Component
```tsx
import Button from "@/app/components/ui/Button";

// Primary button
<Button variant="primary" href="/login">
    Đăng Nhập
</Button>

// Danger button với onClick
<Button variant="danger" onClick={handleDelete}>
    Xóa
</Button>
```

### Input Component
```tsx
import Input from "@/app/components/ui/Input";

<Input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    label="Email"
    placeholder="example@email.com"
    required
/>
```

### Modal Component
```tsx
import Modal from "@/app/components/ui/Modal";

<Modal
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    title="Xác nhận"
    icon="⚠️"
    footer={<Button onClick={handleConfirm}>OK</Button>}
>
    <p>Nội dung modal</p>
</Modal>
```

## ✅ Lợi ích

1. **Tái sử dụng code**: Components có thể dùng ở nhiều nơi
2. **Dễ bảo trì**: Sửa một component, cập nhật toàn bộ
3. **Dễ test**: Test từng component độc lập
4. **Rõ ràng**: Mỗi component có trách nhiệm riêng
5. **Mở rộng**: Dễ thêm features mới

## 🔄 Cách refactor pages

### Login Page (Trước)
```tsx
// 200 dòng code với HTML lẫn lộn
```

### Login Page (Sau)
```tsx
import Input from "@/app/components/ui/Input";
import PasswordInput from "@/app/components/forms/PasswordInput";
import Button from "@/app/components/ui/Button";
import GoogleLoginButton from "@/app/components/forms/GoogleLoginButton";
import FormDivider from "@/app/components/forms/FormDivider";

// Chỉ còn 50 dòng, sạch sẽ, dễ đọc
```

## 📦 Props Pattern

### Đặt tên props rõ ràng
```tsx
interface ButtonProps {
    children: ReactNode;       // Nội dung
    variant?: "primary" | "secondary";  // Kiểu
    size?: "sm" | "md" | "lg"; // Kích thước
    onClick?: () => void;      // Callback
    disabled?: boolean;        // Trạng thái
}
```

### Optional vs Required
- Dùng `?` cho optional props
- Không có `?` cho required props
- Set default values khi cần

## 🎨 Styling Pattern

- Dùng Tailwind CSS
- Tách classes thành biến
- Sử dụng conditional classes
- Tránh inline styles

```tsx
const baseClasses = "px-4 py-2 rounded-lg";
const variantClasses = {
    primary: "bg-blue-500 text-white",
    secondary: "bg-gray-200 text-black"
};
```
