# Cloudinary API Documentation

## Overview
API endpoints for Cloudinary image upload signature generation and management.

Base URL: `http://localhost:8080/api/cloudinary`

---

## Endpoints

### 1. Generate Upload Signature

Generate a signed upload signature for direct Cloudinary uploads.

**Endpoint:** `POST /api/cloudinary/signature`

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "folder": "rescue_requests",
  "context": {
    "requestId": "req_123",
    "requestType": "rescue"
  },
  "eager": false
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| folder | string | Yes | Cloudinary folder name. Valid values: `rescue_requests`, `missions`, `users`, `teams`, `warehouse` |
| context | object | No | Metadata key-value pairs to attach to the upload |
| eager | boolean | No | Generate eager transformations (thumbnails). Default: false |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Signature generated successfully",
  "data": {
    "signature": "a1b2c3d4e5f6...",
    "timestamp": 1704067200,
    "apiKey": "123456789012345",
    "cloudName": "your-cloud-name",
    "folder": "rescue_requests",
    "resourceType": "image",
    "context": {
      "requestId": "req_123",
      "requestType": "rescue",
      "userId": "user_456",
      "uploadedBy": "John Doe"
    },
    "eager": "w_300,h_300,c_fill,q_auto:low,f_auto|w_800,h_800,c_limit,q_auto:good,f_auto",
    "eager_async": true
  }
}
```

**Error Responses:**

400 Bad Request - Invalid folder name:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "folder",
      "message": "Invalid folder name"
    }
  ]
}
```

401 Unauthorized - Missing or invalid token:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### 2. Get Optimized Image URL

Get an optimized/transformed URL for a Cloudinary image.

**Endpoint:** `GET /api/cloudinary/url/:publicId`

**Authentication:** Not required (public endpoint)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| publicId | string | Yes | Cloudinary public ID (e.g., `rescue_requests/req_123/image_1234567890`) |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| transformation | string | No | Transformation preset: `thumbnail`, `medium`, `avatar`. Default: `medium` |

**Example Request:**
```
GET /api/cloudinary/url/rescue_requests%2Freq_123%2Fimage_1234567890?transformation=thumbnail
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "URL generated successfully",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/w_300,h_300,c_fill,q_auto:low,f_auto/rescue_requests/req_123/image_1234567890"
  }
}
```

---

### 3. Delete Image

Delete an image from Cloudinary.

**Endpoint:** `DELETE /api/cloudinary/:publicId`

**Authentication:** Required (JWT token)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| publicId | string | Yes | Cloudinary public ID to delete |

**Example Request:**
```
DELETE /api/cloudinary/rescue_requests%2Freq_123%2Fimage_1234567890
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Image deleted successfully",
  "data": {
    "result": "ok"
  }
}
```

**Error Responses:**

400 Bad Request - Missing publicId:
```json
{
  "success": false,
  "message": "publicId is required"
}
```

500 Internal Server Error - Deletion failed:
```json
{
  "success": false,
  "message": "Failed to delete asset: Resource not found"
}
```

---

## Frontend Usage Examples

### Upload Image with Signature

```typescript
import { uploadClient } from '@/services/uploadClient';

// Simple upload
const url = await uploadClient.uploadImageSimple(
  file,
  'rescue_requests',
  { requestId: 'req_123' }
);

// Full upload with metadata
const result = await uploadClient.uploadImage(
  file,
  'rescue_requests',
  { requestId: 'req_123', userId: 'user_456' },
  true // generate thumbnails
);

console.log('Full URL:', result.secure_url);
console.log('Thumbnail:', result.eager?.[0]?.secure_url);
console.log('Public ID:', result.public_id);
```

### Get Optimized URL

```typescript
import { uploadClient } from '@/services/uploadClient';

const thumbnailUrl = uploadClient.getOptimizedUrl(
  'rescue_requests/req_123/image_1234567890',
  'thumbnail'
);

const mediumUrl = uploadClient.getOptimizedUrl(
  'rescue_requests/req_123/image_1234567890',
  'medium'
);
```

### Upload Multiple Images

```typescript
import { uploadClient } from '@/services/uploadClient';

const results = await uploadClient.uploadMultipleImages(
  [file1, file2, file3],
  'rescue_requests',
  { requestId: 'req_123' }
);

const urls = results.map(r => r.secure_url);
```

---

## Transformation Presets

### Thumbnail
- Width: 300px
- Height: 300px
- Crop: fill
- Quality: auto:low
- Format: auto (WebP for supported browsers)

### Medium
- Width: 800px
- Height: 800px
- Crop: limit (maintain aspect ratio)
- Quality: auto:good
- Format: auto

### Avatar
- Width: 200px
- Height: 200px
- Crop: fill
- Gravity: face (focus on faces)
- Quality: auto
- Format: auto

---

## Folder Structure

```
cloudinary://
├── rescue_requests/     # Citizen rescue requests
├── missions/            # Mission evidence photos
├── users/               # User avatars
├── teams/               # Team photos
└── warehouse/           # Warehouse/inventory photos
```

---

## Security Notes

1. **API Secret Protection**: Never expose `CLOUDINARY_API_SECRET` to frontend
2. **Signature Expiration**: Signatures expire after a short time (default: 1 hour)
3. **Authentication Required**: All signature generation requires valid JWT token
4. **Folder Restrictions**: Only predefined folders are allowed
5. **Context Enrichment**: Backend automatically adds `userId` and `uploadedBy` to context

---

## Error Handling

All endpoints follow the standard error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error message"
    }
  ]
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Internal Server Error
