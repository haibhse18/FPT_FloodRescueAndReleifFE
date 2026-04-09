# Kiến trúc Cloudinary mới cho Hệ thống Cứu hộ Lũ lụt

Đề xuất kiến trúc tối ưu cho việc tích hợp Cloudinary sử dụng **Direct Signed Uploads** với Best Practices, tập trung vào upload ảnh hiệu quả và bảo mật.

## Tóm tắt

Chuyển đổi từ kiến trúc hiện tại (hybrid BE/FE uploads) sang kiến trúc **Direct Signed Uploads** chuẩn Cloudinary, trong đó:
- Frontend upload trực tiếp lên Cloudinary với signature từ Backend
- Backend chỉ cung cấp signatures và quản lý metadata
- Tối ưu hóa transformations, caching, và folder structure
- Tuân thủ Cloudinary Best Practices cho production

---

## 1. Phân tích kiến trúc hiện tại

### Vấn đề đã phát hiện:

#### Backend (`flood_rescue`)
- ✅ Có config Cloudinary cơ bản (`src/config/cloudinary.js`)
- ❌ Upload qua Multer + disk storage rồi mới lên Cloudinary (2 bước không cần thiết)
- ❌ Không có endpoint cung cấp signature cho FE
- ❌ Folder structure đơn giản: `users/{userId}/{scope}/{refId}`
- ❌ Không có transformations, optimizations
- ❌ Không có error handling cho Cloudinary API

#### Frontend (`FPT_FloodRescueAndReleifFE`)
- ✅ Có service `uploadClient.ts` với function `uploadImageSigned()` (đã chuẩn bị sẵn)
- ❌ API route `/api/upload/route.ts` tự tạo signature (expose API secret - **BẢO MẬT YẾU**)
- ❌ Function `getSignature()` gọi endpoint `/cloudinary/signature` **không tồn tại** ở BE
- ⚠️ Đang dùng 2 phương thức song song: `uploadImage()` (FE route) và `uploadImageSigned()` (BE signature)

### Kết luận:
Kiến trúc hiện tại **chưa hoàn chỉnh** và có **lỗ hổng bảo mật** (API secret ở FE). Cần refactor toàn bộ.

---

## 2. Kiến trúc mới đề xuất

### 2.1. Nguyên tắc thiết kế

1. **Security First**: API credentials chỉ tồn tại ở Backend
2. **Direct Upload**: FE upload trực tiếp lên Cloudinary (giảm tải BE, tăng tốc độ)
3. **Signed Uploads**: Mọi upload đều cần signature từ BE (bảo mật + kiểm soát)
4. **Modular Structure**: Tách riêng Cloudinary module theo DDD pattern
5. **Transformation Pipeline**: Tự động optimize images khi upload
6. **Metadata Tracking**: Lưu thông tin media vào MongoDB

### 2.2. Luồng hoạt động (Flow)

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │         │   Backend   │         │  Cloudinary │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │ 1. Request signature  │                       │
       ├──────────────────────>│                       │
       │   POST /api/cloudinary/signature              │
       │   { folder, context } │                       │
       │                       │                       │
       │                       │ 2. Generate signature │
       │                       │    (timestamp + params)
       │                       │                       │
       │ 3. Return signature   │                       │
       │<──────────────────────┤                       │
       │   { signature, timestamp, apiKey, ... }       │
       │                       │                       │
       │ 4. Upload file directly                       │
       ├───────────────────────────────────────────────>│
       │   POST https://api.cloudinary.com/...         │
       │   FormData: file + signature + params         │
       │                       │                       │
       │                       │                  5. Process & store
       │                       │                       │
       │ 6. Return upload result                       │
       │<───────────────────────────────────────────────┤
       │   { secure_url, public_id, ... }              │
       │                       │                       │
       │ 7. Save metadata to DB│                       │
       ├──────────────────────>│                       │
       │   POST /api/requests (with imageUrl)          │
       │                       │                       │
       │                       │ 8. Store in MongoDB   │
       │                       ├──> Request.media[]    │
       │                       │                       │
```

### 2.3. Folder Structure & Naming Convention

```
cloudinary://
├── rescue_requests/          # Yêu cầu cứu hộ từ citizen
│   ├── {requestId}/
│   │   ├── original_{timestamp}.jpg
│   │   └── thumbnail_{timestamp}.jpg
│
├── missions/                 # Ảnh nhiệm vụ cứu hộ
│   ├── {missionId}/
│   │   ├── evidence_{timestamp}.jpg
│   │   └── completion_{timestamp}.jpg
│
├── users/                    # Avatar người dùng
│   ├── {userId}/
│   │   └── avatar_{timestamp}.jpg
│
├── teams/                    # Ảnh đội cứu hộ
│   └── {teamId}/
│       └── team_photo_{timestamp}.jpg
│
└── warehouse/                # Ảnh kho vật tư
    └── {warehouseId}/
        └── inventory_{timestamp}.jpg
```

---

## 3. Chi tiết triển khai

### 3.1. Backend - Module Structure

Tạo module mới: `src/modules/cloudinary/`

```
src/modules/cloudinary/
├── cloudinary.config.js       # Cloudinary SDK config
├── cloudinary.service.js      # Business logic (signature, transformations)
├── cloudinary.controller.js   # HTTP handlers
├── cloudinary.routes.js       # API routes
├── cloudinary.validation.js   # Joi schemas
└── cloudinary.constants.js    # Folders, transformations presets
```

### 3.2. Backend - Core Components

#### A. `cloudinary.config.js`
```javascript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
```

#### B. `cloudinary.service.js` - Core Functions
```javascript
// 1. Generate signed upload signature
generateUploadSignature({ folder, context, resourceType })

// 2. Generate transformation URLs
getOptimizedUrl(publicId, options)

// 3. Delete assets
deleteAsset(publicId)

// 4. Validate upload result
validateUploadResult(cloudinaryResponse)
```

#### C. `cloudinary.controller.js` - API Endpoints
```javascript
// POST /api/cloudinary/signature
// Generate signature for direct upload
export const getUploadSignature = async (req, res) => {
  const { folder, context } = req.body;
  const userId = req.user.id;
  
  // Generate signature with params
  const signature = cloudinaryService.generateUploadSignature({
    folder: `${folder}/${userId}`,
    context,
    timestamp: Math.round(Date.now() / 1000),
  });
  
  return res.json(signature);
};
```

#### D. `cloudinary.constants.js` - Presets
```javascript
export const FOLDERS = {
  RESCUE_REQUESTS: 'rescue_requests',
  MISSIONS: 'missions',
  USERS: 'users',
  TEAMS: 'teams',
  WAREHOUSE: 'warehouse',
};

export const TRANSFORMATIONS = {
  THUMBNAIL: {
    width: 300,
    height: 300,
    crop: 'fill',
    quality: 'auto:low',
    fetch_format: 'auto',
  },
  MEDIUM: {
    width: 800,
    height: 800,
    crop: 'limit',
    quality: 'auto:good',
    fetch_format: 'auto',
  },
  AVATAR: {
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    fetch_format: 'auto',
  },
};
```

### 3.3. Frontend - Service Layer

#### A. Refactor `src/services/uploadClient.ts`

```typescript
// 1. Get signature from BE
async function getSignature(folder: string, context?: Record<string, string>)

// 2. Upload to Cloudinary with signature
async function uploadImageDirect(file: File, folder: string, context?: Record<string, string>)

// 3. Upload multiple images
async function uploadMultipleImages(files: File[], folder: string)

// 4. Get optimized URL
function getOptimizedUrl(publicId: string, transformation: 'thumbnail' | 'medium' | 'avatar')
```

#### B. Remove `/api/upload/route.ts`
- Xóa hoàn toàn file này (không cần nữa)
- Tất cả uploads đi qua signature flow

### 3.4. Image Transformations & Optimization

#### Upload Parameters (Best Practices)
```javascript
{
  folder: 'rescue_requests/req_123',
  resource_type: 'image',
  allowed_formats: ['jpg', 'png', 'webp', 'heic'],
  max_file_size: 10485760, // 10MB
  
  // Auto-optimization
  quality: 'auto:good',
  fetch_format: 'auto',
  
  // Eager transformations (tạo sẵn thumbnails)
  eager: [
    { width: 300, height: 300, crop: 'fill', quality: 'auto:low' },
    { width: 800, height: 800, crop: 'limit', quality: 'auto:good' },
  ],
  eager_async: true,
  
  // Context metadata
  context: {
    userId: 'user_123',
    requestId: 'req_456',
    uploadedBy: 'John Doe',
  },
}
```

#### Responsive Images
```javascript
// Frontend sử dụng URL transformations
const thumbnailUrl = cloudinary.url(publicId, {
  width: 300,
  height: 300,
  crop: 'fill',
  quality: 'auto:low',
  fetch_format: 'auto',
});

const fullUrl = cloudinary.url(publicId, {
  quality: 'auto:good',
  fetch_format: 'auto',
});
```

### 3.5. Database Schema Updates

#### Request Model - Media Schema
```javascript
const MediaSchema = new Schema({
  publicId: { type: String, required: true },      // Cloudinary public_id
  secureUrl: { type: String, required: true },     // HTTPS URL
  thumbnailUrl: { type: String },                  // Pre-generated thumbnail
  format: { type: String },                        // jpg, png, webp
  width: { type: Number },
  height: { type: Number },
  bytes: { type: Number },
  resourceType: { type: String, default: 'image' },
  context: { type: Map, of: String },              // Metadata
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: ObjectId, ref: 'User' },
});
```

---

## 4. Migration Plan

### Phase 1: Backend Setup
1. Tạo module `src/modules/cloudinary/` với đầy đủ files
2. Implement signature generation service
3. Tạo API endpoint `/api/cloudinary/signature`
4. Thêm validation cho signature requests
5. Update environment variables

### Phase 2: Frontend Refactor
1. Refactor `uploadClient.ts` để dùng signature flow
2. Xóa `/api/upload/route.ts` (không dùng nữa)
3. Update các components sử dụng upload (CitizenRequestPage, etc.)
4. Thêm error handling và progress indicators

### Phase 3: Database Migration
1. Update Request.media schema với fields mới
2. Migrate existing media records (nếu có)
3. Update các services liên quan (request.service.js)

### Phase 4: Testing & Optimization
1. Test upload flow end-to-end
2. Test transformations và responsive images
3. Performance testing (upload speed, CDN caching)
4. Security audit (signature validation)

---

## 5. Best Practices được áp dụng

### Security
- ✅ API credentials chỉ ở Backend
- ✅ Signed uploads với timestamp expiration
- ✅ Validate file types và sizes
- ✅ Context metadata cho audit trail

### Performance
- ✅ Direct uploads (không qua BE proxy)
- ✅ Eager transformations (pre-generate thumbnails)
- ✅ Auto-format (WebP cho browsers hỗ trợ)
- ✅ Auto-quality optimization
- ✅ CDN caching

### Scalability
- ✅ Stateless signature generation
- ✅ Async eager transformations
- ✅ Folder-based organization
- ✅ Metadata trong MongoDB (không query Cloudinary API)

### Maintainability
- ✅ Modular structure (DDD pattern)
- ✅ Constants cho folders & transformations
- ✅ Centralized error handling
- ✅ TypeScript types cho FE

---

## 6. Environment Variables

### Backend `.env`
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env.local`
```bash
# Chỉ cần cloud_name (public info)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

**Lưu ý**: Không để API_KEY và API_SECRET ở Frontend!

---

## 7. Code Examples

### Backend - Generate Signature
```javascript
// src/modules/cloudinary/cloudinary.service.js
import cloudinary from './cloudinary.config.js';

export const generateUploadSignature = ({ folder, context, resourceType = 'image' }) => {
  const timestamp = Math.round(Date.now() / 1000);
  
  const params = {
    folder,
    timestamp,
    resource_type: resourceType,
    ...(context && { context: Object.entries(context).map(([k, v]) => `${k}=${v}`).join('|') }),
  };
  
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
  
  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
    ...(context && { context }),
  };
};
```

### Frontend - Upload with Signature
```typescript
// src/services/uploadClient.ts
export async function uploadImageDirect(
  file: File,
  folder: string,
  context?: Record<string, string>
): Promise<string> {
  // 1. Get signature from BE
  const signatureData = await getSignature(folder, context);
  
  // 2. Prepare FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', signatureData.signature);
  formData.append('timestamp', signatureData.timestamp.toString());
  formData.append('api_key', signatureData.apiKey);
  formData.append('folder', signatureData.folder);
  
  if (context) {
    const contextStr = Object.entries(context)
      .map(([k, v]) => `${k}=${v}`)
      .join('|');
    formData.append('context', contextStr);
  }
  
  // 3. Upload directly to Cloudinary
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );
  
  const data = await response.json();
  return data.secure_url;
}
```

### Frontend - Usage in Component
```typescript
// src/modules/requests/presentation/pages/CitizenRequestPage.tsx
const handleImageUpload = async (file: File) => {
  try {
    const url = await uploadClient.uploadImageDirect(
      file,
      'rescue_requests',
      { userId: currentUser.id, requestType: 'rescue' }
    );
    
    setImageUrls(prev => [...prev, url]);
  } catch (error) {
    toast.error('Upload failed');
  }
};
```

---

## 8. Lợi ích của kiến trúc mới

### So với kiến trúc cũ:

| Aspect | Cũ | Mới |
|--------|-----|-----|
| **Upload Speed** | Chậm (FE → BE → Cloudinary) | Nhanh (FE → Cloudinary trực tiếp) |
| **BE Load** | Cao (proxy files) | Thấp (chỉ generate signatures) |
| **Security** | ⚠️ API secret ở FE route | ✅ Credentials chỉ ở BE |
| **Scalability** | Giới hạn bởi BE bandwidth | Unlimited (Cloudinary CDN) |
| **Transformations** | ❌ Không có | ✅ Auto-optimize + eager transforms |
| **Code Quality** | Scattered, inconsistent | Modular, DDD pattern |
| **Maintenance** | Khó (2 upload flows) | Dễ (1 flow chuẩn) |

---

## 9. Rủi ro & Giải pháp

### Rủi ro 1: Breaking changes cho code hiện tại
**Giải pháp**: Migration từng bước, giữ backward compatibility trong giai đoạn chuyển đổi

### Rủi ro 2: Cloudinary quota limits
**Giải pháp**: Monitor usage, implement rate limiting, có fallback plan

### Rủi ro 3: Network failures khi upload
**Giải pháp**: Retry logic, progress indicators, error handling rõ ràng

---

## 10. Next Steps

Sau khi plan được approve:

1. **Backend**: Tạo module cloudinary mới
2. **Frontend**: Refactor uploadClient.ts
3. **Database**: Update schemas
4. **Testing**: End-to-end testing
5. **Documentation**: Update API docs (Swagger)
6. **Deployment**: Deploy BE trước, sau đó FE

---

## Tài liệu tham khảo

- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Signed Upload Tutorial](https://cloudinary.com/documentation/upload_images#signed_upload)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [Best Practices Guide](https://cloudinary.com/documentation/image_optimization)
