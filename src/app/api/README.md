# API Routes - Organized by Role

API routes được tổ chức theo từng role để dễ quản lý và mở rộng.

## 📁 Cấu trúc

```
api/
├── citizens/               # API cho Citizens
│   ├── reverse-geocode/    # Chuyển tọa độ GPS → địa chỉ
│   │   └── route.ts        # GET /api/citizens/reverse-geocode
│   └── cloudinary/         # Upload ảnh
│       └── signature/
│           └── route.ts    # POST /api/citizens/cloudinary/signature
│
├── coordinator/            # API cho Coordinator (coming soon)
│
├── rescue-team/            # API cho Rescue Team (coming soon)
│
├── manager/                # API cho Manager (coming soon)
│
└── admin/                  # API cho Admin (coming soon)
```

## 🎯 Citizens APIs

### 1. Reverse Geocode
**Endpoint:** `GET /api/citizens/reverse-geocode`

Chuyển đổi tọa độ GPS thành địa chỉ thực.

**Query Parameters:**
- `lat` (required) - Latitude
- `lng` (required) - Longitude

**Response:**
```json
{
  "results": [
    {
      "formatted_address": "123 Đường ABC, Quận 1, TP.HCM",
      "address": "..."
    }
  ]
}
```

**Sử dụng:**
```tsx
const res = await fetch(
    `/api/citizens/reverse-geocode?lat=${lat}&lng=${lng}`
);
```

---

### 2. Cloudinary Signature
**Endpoint:** `POST /api/citizens/cloudinary/signature`

Tạo signature để upload ảnh lên Cloudinary một cách an toàn.

**Request Body:**
```json
{
  "folder": "rescue_requests"
}
```

**Response:**
```json
{
  "signature": "...",
  "timestamp": 1234567890,
  "cloudName": "...",
  "apiKey": "...",
  "folder": "rescue_requests"
}
```

**Sử dụng:**
```tsx
const signatureData = await API.cloudinary.getSignature('rescue_requests');
```

---

## 🔐 Environment Variables

```env
# OpenMap API
NEXT_PUBLIC_OPENMAP_API_KEY=your_openmap_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📝 Thêm API mới

### Cho Citizens:
1. Tạo folder trong `api/citizens/your-endpoint/`
2. Tạo file `route.ts`
3. Export GET/POST/PUT/DELETE handlers

### Cho role khác:
1. Tạo trong `api/coordinator/`, `api/rescue-team/`, etc.
2. Follow cùng pattern

**Example:**
```typescript
// api/citizens/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // Your logic
    return NextResponse.json({ data: 'success' });
}
```

---

## 🚀 Best Practices

1. **Tổ chức theo role** - Mỗi role có folder riêng
2. **Naming convention** - Dùng kebab-case cho folder names
3. **Error handling** - Always return proper status codes
4. **Environment variables** - Never commit secrets
5. **Documentation** - Document all endpoints
