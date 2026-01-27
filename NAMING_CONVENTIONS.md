# 📝 Naming Conventions - FPT Flood Rescue

Quy tắc đặt tên trong project để tránh nhầm lẫn.

## 🎯 **Giải quyết vấn đề:**

### ❌ **Trước đây - Confusing:**
```
src/
├── app/api/              ← API Routes (Next.js)
└── lib/services/api.ts   ← API Client (confusing!)
```
**Vấn đề:** 2 thứ cùng tên "api" gây nhầm lẫn!

### ✅ **Bây giờ - Clear:**
```
src/
├── app/api/                  ← API Routes (Next.js)
└── lib/services/apiClient.ts ← API Client (clear!)
```

---

## 📂 **Naming Rules:**

### 1. **Folders - kebab-case**
```
api/
citizens/
rescue-team/
reverse-geocode/
```

### 2. **Components - PascalCase**
```
MobileHeader.tsx
DesktopSidebar.tsx
SuccessPopup.tsx
```

### 3. **Utilities/Services - camelCase**
```
apiClient.ts
utils.ts
use-toast.ts
```

### 4. **Routes - lowercase + kebab**
```
route.ts
page.tsx
layout.tsx
```

---

## 🔤 **Specific Examples:**

### **API-related:**
- ✅ `app/api/` - Next.js API routes folder
- ✅ `apiClient.ts` - Service layer for API calls
- ❌ `api.ts` - Too generic, confusing

### **Components:**
- ✅ `MobileHeader` - Component tên
- ✅ `components/layout/` - Folder chứa components
- ❌ `mobile-header` - Components nên PascalCase

### **Services:**
- ✅ `apiClient` - Service for API
- ✅ `authService` - Service for Auth (nếu có)
- ✅ `mapService` - Service for Maps (nếu có)

---

## 💡 **Import Examples:**

### ✅ **Correct:**
```tsx
// API Client
import API from "@/lib/services/apiClient";

// Components
import { MobileHeader } from "./components/layout";

// UI Components
import { Button } from "@/components/ui/button";

// API Route (trong route.ts)
export async function GET(request: NextRequest) { }
```

### ❌ **Avoid:**
```tsx
// Confusing - ai biết đây là gì?
import API from "@/lib/services/api";
import api from "@/api";
```

---

## 📋 **Checklist khi tạo file mới:**

- [ ] Tên file có rõ ràng mục đích không?
- [ ] Có trùng tên với folder/module khác không?
- [ ] Follow naming convention (PascalCase, camelCase, kebab-case)?
- [ ] Import path có dễ hiểu không?
- [ ] Document trong README nếu cần?

---

## 🎯 **Quick Reference:**

| Type | Convention | Example |
|------|-----------|---------|
| **Component** | PascalCase | `UserProfile.tsx` |
| **Folder** | kebab-case | `user-profile/` |
| **Service/Util** | camelCase | `apiClient.ts` |
| **Constant** | UPPER_SNAKE | `API_BASE_URL` |
| **Variable** | camelCase | `userName` |
| **Interface/Type** | PascalCase | `UserProfile` |

---

**Mục tiêu:** Code dễ đọc, dễ maintain, không nhầm lẫn! 🎯
