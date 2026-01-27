# Citizens Components

Components dành riêng cho module Citizens.

## 📁 Cấu trúc

```
components/
├── layout/                 # Layout components cho Citizens
│   ├── DesktopHeader.tsx   # Header desktop
│   ├── DesktopSidebar.tsx  # Sidebar desktop với navigation
│   ├── MobileHeader.tsx    # Header mobile
│   ├── MobileBottomNav.tsx # Bottom navigation mobile
│   └── index.ts            # Export barrel
└── index.ts                # Main export
```

## 🎯 Sử dụng

### Import components

```tsx
// Import từ layout folder
import { 
    MobileHeader, 
    MobileBottomNav, 
    DesktopHeader, 
    DesktopSidebar 
} from "./components/layout";

// Hoặc import riêng lẻ
import { MobileHeader } from "./components/layout";
```

### Layout đã tích hợp sẵn

File `citizens/layout.tsx` đã sử dụng tất cả layout components này.
Các page con trong `/citizens/*` sẽ tự động có layout.

## 📝 Components

### MobileHeader
- Header cho mobile view
- Có menu button và location button
- Props: `onMenuClick?`, `onLocationClick?`

### MobileBottomNav
- Bottom navigation cho mobile
- Fixed ở bottom
- Props: `items?`, `currentPath?`

### DesktopHeader
- Header cho desktop view
- Hiển thị title, subtitle, system status
- Props: `title`, `subtitle?`, `onLocationClick?`

### DesktopSidebar
- Sidebar cho desktop view
- Navigation menu với icons
- User info ở footer
- Props: `userName?`, `userRole?`

## 🎨 Responsive

- Mobile: `< lg` (< 1024px)
  - Hiện: MobileHeader + MobileBottomNav
  - Ẩn: DesktopHeader + DesktopSidebar

- Desktop: `>= lg` (>= 1024px)
  - Hiện: DesktopHeader + DesktopSidebar
  - Ẩn: MobileHeader + MobileBottomNav
