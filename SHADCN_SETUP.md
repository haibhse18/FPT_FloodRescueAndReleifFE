# 🎨 Citizen Layout với Shadcn/ui - Hướng dẫn sử dụng

## ✅ Đã hoàn thành

### 1. **Setup Shadcn/ui**
- ✅ Khởi tạo Shadcn với Stone theme
- ✅ Cài đặt components: Button, Card, Input, Label, Badge, Separator, Avatar
- ✅ Tạo file `lib/utils.ts` với cn() helper

### 2. **Layout chung cho Citizens**
- ✅ Tạo `src/app/citizens/layout.tsx`
- ✅ Responsive design (Mobile + Desktop)
- ✅ Tích hợp MobileHeader, MobileBottomNav, DesktopHeader, DesktopSidebar
- ✅ Padding tự động cho content area

### 3. **Pages đã refactor với Shadcn**
- ✅ **History Page** - Lịch sử yêu cầu với Card, Badge, Button
- ✅ **Notifications Page** - Thông báo với filters và mark as read
- ✅ **Profile Page** - Thông tin cá nhân với Input, Label, Avatar

---

## 📁 Cấu trúc mới

```
src/
├── app/
│   └── citizens/
│       ├── layout.tsx              # ⭐ LAYOUT CHUNG
│       ├── page.tsx                # Trang chủ (chưa refactor)
│       ├── history/
│       │   └── page.tsx            # ✅ Đã dùng Shadcn
│       ├── notifications/
│       │   └── page.tsx            # ✅ Đã dùng Shadcn
│       └── profile/
│           └── page.tsx            # ✅ Đã dùng Shadcn
│
├── components/
│   └── ui/                         # Shadcn components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── badge.tsx
│       ├── separator.tsx
│       └── avatar.tsx
│
└── lib/
    └── utils.ts                    # cn() helper
```

---

## 🎯 Cách sử dụng

### **1. Layout tự động áp dụng**
Tất cả pages trong `/citizens/*` sẽ tự động có:
- Mobile Header + Bottom Nav
- Desktop Sidebar + Header
- Padding và spacing chuẩn

```tsx
// src/app/citizens/new-page/page.tsx
export default function NewPage() {
    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            <h1>Trang mới</h1>
            {/* Layout tự động bao quanh */}
        </div>
    );
}
```

### **2. Sử dụng Shadcn Components**

#### **Card với Header:**
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

<Card className="bg-white/5 border-white/10">
    <CardHeader>
        <CardTitle className="text-white">Tiêu đề</CardTitle>
        <CardDescription className="text-gray-400">Mô tả</CardDescription>
    </CardHeader>
    <CardContent>
        Nội dung
    </CardContent>
</Card>
```

#### **Button với variants:**
```tsx
import { Button } from "@/components/ui/button";

<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

#### **Badge:**
```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="default">Mới</Badge>
<Badge variant="secondary">10</Badge>
<Badge variant="outline">Pending</Badge>
```

#### **Input + Label:**
```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input 
        id="email" 
        type="email" 
        className="bg-white/5 border-white/20 text-white"
    />
</div>
```

#### **Avatar:**
```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

<Avatar className="w-12 h-12">
    <AvatarImage src="/avatar.jpg" />
    <AvatarFallback className="bg-primary text-white">
        A
    </AvatarFallback>
</Avatar>
```

---

## 🎨 Styling với Tailwind

### **Dark theme classes:**
```tsx
// Background
className="bg-white/5"        // Light background
className="bg-white/10"       // Hover background

// Border
className="border-white/10"   // Subtle border
className="border-white/20"   // Stronger border

// Text
className="text-white"        // Primary text
className="text-gray-400"     // Secondary text
className="text-gray-300"     // Mid-tone text

// Gradient
className="bg-gradient-to-br from-primary to-orange-600"
```

### **Responsive design:**
```tsx
// Mobile first
className="px-4 lg:px-8"           // Padding
className="grid grid-cols-1 md:grid-cols-2"  // Grid
className="hidden lg:block"         // Desktop only
className="lg:hidden"               // Mobile only
```

---

## 📦 Thêm Shadcn components mới

```bash
# Xem tất cả components có sẵn
npx shadcn@latest add

# Thêm component cụ thể
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast
npx shadcn@latest add form
```

---

## 🚀 Next steps

### **Các page cần refactor tiếp:**
1. ✅ History - Done
2. ✅ Notifications - Done
3. ✅ Profile - Done
4. ⏳ Home (citizens/page.tsx) - Chưa refactor
5. ⏳ Safety Guide - Chưa có

### **Components nên thêm:**
- `dialog` - Modal/Dialog
- `select` - Dropdown select
- `toast` - Notifications
- `form` - Form với validation
- `table` - Data tables

---

## 📚 Resources

- **Shadcn/ui docs**: https://ui.shadcn.com
- **Components**: https://ui.shadcn.com/docs/components
- **Themes**: https://ui.shadcn.com/themes
- **Examples**: https://ui.shadcn.com/examples

---

## 🐛 Troubleshooting

### **Components không hiển thị đúng:**
```bash
# Check Tailwind config
npm run dev

# Xem console có lỗi không
```

### **Layout không áp dụng:**
- Kiểm tra file đang ở trong `/citizens/` folder
- Layout chỉ áp dụng cho routes con

### **Màu sắc không đúng:**
- Check `tailwind.config.ts` có CSS variables
- Check `globals.css` có color definitions
