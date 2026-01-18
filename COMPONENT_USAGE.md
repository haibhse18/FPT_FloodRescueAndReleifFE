# 🎯 Hướng dẫn sử dụng Components

## 📦 Import Components

### Cách 1: Import từng component
```tsx
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
```

### Cách 2: Import nhiều components cùng lúc (Khuyến nghị)
```tsx
import { Button, Input, Card, Modal } from "@/app/components/ui";
import { PasswordInput, GoogleLoginButton } from "@/app/components/forms";
import { DesktopHeader, MobileHeader } from "@/app/components/layout";
```

## 🔧 Component Examples

### 1. Button Component

#### Basic Usage
```tsx
import { Button } from "@/app/components/ui";

// Primary button with link
<Button variant="primary" href="/login">
    Đăng Nhập
</Button>

// Secondary button with click handler
<Button variant="secondary" onClick={handleClick}>
    Hủy
</Button>

// Danger button
<Button variant="danger" onClick={handleDelete}>
    Xóa
</Button>

// Ghost button (transparent)
<Button variant="ghost" onClick={handleCancel}>
    Bỏ qua
</Button>
```

#### Sizes
```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
```

#### Full Width
```tsx
<Button fullWidth variant="primary">
    Full Width Button
</Button>
```

#### Disabled
```tsx
<Button disabled>Disabled Button</Button>
```

---

### 2. Input Component

```tsx
import { Input } from "@/app/components/ui";

<Input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    label="Email"
    placeholder="example@email.com"
    required
    error={emailError}  // Hiển thị lỗi nếu có
/>
```

#### Props
- `id` (required): ID của input
- `value` (required): Giá trị hiện tại
- `onChange` (required): Callback khi thay đổi
- `label`: Nhãn hiển thị
- `placeholder`: Placeholder text
- `required`: Input bắt buộc
- `error`: Thông báo lỗi
- `disabled`: Vô hiệu hóa input

---

### 3. PasswordInput Component

```tsx
import { PasswordInput } from "@/app/components/forms";

<PasswordInput
    id="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    label="Mật khẩu"
    required
/>
```

Tự động có nút toggle show/hide password ✅

---

### 4. Card Component

```tsx
import { Card } from "@/app/components/ui";

// Basic card
<Card>
    <h3>Card Title</h3>
    <p>Card content</p>
</Card>

// Card with hover effect
<Card hover>
    Hover me!
</Card>

// Clickable card
<Card onClick={handleClick} hover>
    Click me!
</Card>
```

---

### 5. Modal Component

```tsx
import { Modal } from "@/app/components/ui";
import { Button } from "@/app/components/ui";

const [showModal, setShowModal] = useState(false);

<Modal
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    title="Xác nhận"
    icon="⚠️"
    footer={
        <div className="flex gap-3">
            <Button onClick={() => setShowModal(false)}>
                Hủy
            </Button>
            <Button variant="danger" onClick={handleConfirm}>
                Xác nhận
            </Button>
        </div>
    }
>
    <p>Bạn có chắc chắn muốn xóa?</p>
</Modal>
```

---

### 6. Layout Components

#### Desktop Sidebar
```tsx
import { DesktopSidebar } from "@/app/components/layout";

<DesktopSidebar />
```

#### Mobile Header
```tsx
import { MobileHeader } from "@/app/components/layout";

<MobileHeader 
    onMenuClick={() => console.log("Menu clicked")}
    onLocationClick={() => scrollToLocation()}
/>
```

#### Desktop Header
```tsx
import { DesktopHeader } from "@/app/components/layout";

<DesktopHeader 
    title="Trang chủ"
    subtitle="Chào mừng đến với hệ thống"
    onLocationClick={() => scrollToLocation()}
/>
```

#### Mobile Bottom Navigation
```tsx
import { MobileBottomNav } from "@/app/components/layout";

<MobileBottomNav />
```

---

### 7. Form Components

#### Google Login Button
```tsx
import { GoogleLoginButton } from "@/app/components/forms";

<GoogleLoginButton />
```

#### Form Divider
```tsx
import { FormDivider } from "@/app/components/forms";

<FormDivider />  // "Hoặc"
<FormDivider text="hoặc" />  // Custom text
```

---

### 8. Citizen Components

#### Emergency Button
```tsx
import { EmergencyButton } from "@/app/components/citizen";

<EmergencyButton onClick={() => setShowRescueModal(true)} />
```

#### Location Info Card
```tsx
import { LocationInfoCard } from "@/app/components/citizen";

<LocationInfoCard
    location={currentLocation}
    coordinates={coordinates}
    isLoading={isLoadingLocation}
    onRefresh={getCurrentLocation}
/>
```

#### Quick Actions List
```tsx
import { QuickActionsList } from "@/app/components/citizen";

<QuickActionsList />  // Sử dụng default actions
```

#### Rescue Request Modal
```tsx
import { RescueRequestModal } from "@/app/components/citizen";

<RescueRequestModal
    isOpen={showRescueModal}
    onClose={() => setShowRescueModal(false)}
    currentLocation={currentLocation}
    coordinates={coordinates}
    onSubmit={handleRescueRequest}
    isSubmitting={isSubmitting}
/>
```

---

## 🎨 Styling

Tất cả components đều sử dụng Tailwind CSS và có thể thêm custom classes:

```tsx
<Button className="mt-4 animate-bounce">
    Custom Button
</Button>

<Card className="border-2 border-red-500">
    Custom Card
</Card>
```

---

## 💡 Best Practices

### 1. Tái sử dụng components
```tsx
// ❌ Không nên
<button className="px-4 py-2 bg-blue-500 text-white rounded">
    Click me
</button>

// ✅ Nên
<Button variant="primary">Click me</Button>
```

### 2. Sử dụng TypeScript
```tsx
// Components đã có types sẵn
import { Button } from "@/app/components/ui";

// TypeScript sẽ gợi ý props
<Button 
    variant="primary"  // Auto-complete: "primary" | "secondary" | "danger" | "ghost"
    size="md"          // Auto-complete: "sm" | "md" | "lg"
/>
```

### 3. Tách logic khỏi UI
```tsx
// ❌ Không nên: Logic lẫn lộn với UI
function LoginForm() {
    return (
        <div>
            <input type="email" onChange={handleEmail} />
            <input type="password" onChange={handlePassword} />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}

// ✅ Nên: Sử dụng components
function LoginForm() {
    const { email, setEmail, password, setPassword, handleLogin } = useLogin();
    
    return (
        <form onSubmit={handleLogin}>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit">Login</Button>
        </form>
    );
}
```

---

## 📚 Tham khảo

- Xem [COMPONENT_STRUCTURE.md](./COMPONENT_STRUCTURE.md) để hiểu cấu trúc
- Xem code trong [app/login/page.tsx](app/login/page.tsx) để xem ví dụ sử dụng thực tế
- Xem code trong [app/page.tsx](app/page.tsx) để xem ví dụ đơn giản
