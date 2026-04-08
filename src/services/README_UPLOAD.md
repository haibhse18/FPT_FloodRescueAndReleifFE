# Upload Client Service

## Overview
Handles file uploads to Cloudinary using Direct Signed Uploads for optimal performance and security.

## Architecture

```
Frontend → Request Signature → Backend
   ↓
   → Upload Directly → Cloudinary
   ↓
   ← Upload Result
```

**Benefits:**
- ⚡ Faster uploads (no backend proxy)
- 🔒 Secure (API credentials never exposed)
- 📈 Scalable (Cloudinary CDN handles load)
- 🎨 Auto-optimized (WebP, quality, transformations)

## API Reference

### uploadImage()
Upload a single image with full metadata.

```typescript
function uploadImage(
  file: File,
  folder?: string,
  context?: Record<string, string>,
  eager?: boolean
): Promise<CloudinaryUploadResult>
```

**Parameters:**
- `file` - File to upload
- `folder` - Cloudinary folder (default: 'rescue_requests')
- `context` - Metadata key-value pairs
- `eager` - Generate thumbnails (default: false)

**Returns:**
```typescript
{
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resource_type: string;
  created_at: string;
  eager?: Array<{ secure_url: string }>;
}
```

**Example:**
```typescript
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

---

### uploadImageSimple()
Upload a single image and return only the URL.

```typescript
function uploadImageSimple(
  file: File,
  folder?: string,
  context?: Record<string, string>
): Promise<string>
```

**Example:**
```typescript
const url = await uploadClient.uploadImageSimple(
  file,
  'rescue_requests',
  { requestId: 'req_123' }
);

console.log('Image URL:', url);
```

---

### uploadMultipleImages()
Upload multiple images in parallel.

```typescript
function uploadMultipleImages(
  files: File[],
  folder?: string,
  context?: Record<string, string>
): Promise<CloudinaryUploadResult[]>
```

**Example:**
```typescript
const results = await uploadClient.uploadMultipleImages(
  [file1, file2, file3],
  'rescue_requests',
  { requestId: 'req_123' }
);

const urls = results.map(r => r.secure_url);
```

---

### getOptimizedUrl()
Get an optimized URL for a Cloudinary public_id.

```typescript
function getOptimizedUrl(
  publicId: string,
  transformation?: 'thumbnail' | 'medium' | 'avatar'
): string
```

**Transformations:**
- `thumbnail` - 300x300, fill, low quality
- `medium` - 800x800, limit, good quality
- `avatar` - 200x200, fill, face-focused

**Example:**
```typescript
const thumbnailUrl = uploadClient.getOptimizedUrl(
  'rescue_requests/req_123/image_1234567890',
  'thumbnail'
);

const mediumUrl = uploadClient.getOptimizedUrl(
  'rescue_requests/req_123/image_1234567890',
  'medium'
);
```

---

## Folder Structure

Use these folder names:

| Folder | Purpose |
|--------|---------|
| `rescue_requests` | Citizen rescue request images |
| `missions` | Mission evidence/completion photos |
| `users` | User avatars |
| `teams` | Team photos |
| `warehouse` | Warehouse/inventory photos |

---

## Usage Examples

### Basic Upload (Rescue Request)
```typescript
import { uploadClient } from '@/services/uploadClient';

const handleImageUpload = async (file: File) => {
  try {
    const url = await uploadClient.uploadImageSimple(
      file,
      'rescue_requests',
      { requestId: currentRequest.id }
    );
    
    setImageUrl(url);
    toast.success('Upload successful');
  } catch (error) {
    toast.error('Upload failed');
    console.error(error);
  }
};
```

### Upload with Thumbnails
```typescript
import { uploadClient } from '@/services/uploadClient';

const handleImageUpload = async (file: File) => {
  try {
    const result = await uploadClient.uploadImage(
      file,
      'rescue_requests',
      { requestId: currentRequest.id },
      true // generate thumbnails
    );
    
    // Save both URLs
    setFullImageUrl(result.secure_url);
    setThumbnailUrl(result.eager?.[0]?.secure_url || result.secure_url);
    
    // Save metadata to backend
    await saveImageMetadata({
      publicId: result.public_id,
      secureUrl: result.secure_url,
      thumbnailUrl: result.eager?.[0]?.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    });
  } catch (error) {
    toast.error('Upload failed');
  }
};
```

### Multiple Images Upload
```typescript
import { uploadClient } from '@/services/uploadClient';

const handleMultipleUpload = async (files: File[]) => {
  try {
    const results = await uploadClient.uploadMultipleImages(
      files,
      'rescue_requests',
      { requestId: currentRequest.id }
    );
    
    const urls = results.map(r => r.secure_url);
    setImageUrls(prev => [...prev, ...urls]);
    
    toast.success(`${files.length} images uploaded`);
  } catch (error) {
    toast.error('Upload failed');
  }
};
```

### Display Optimized Images
```typescript
import { uploadClient } from '@/services/uploadClient';

const ImageGallery = ({ publicIds }: { publicIds: string[] }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {publicIds.map(publicId => (
        <img
          key={publicId}
          src={uploadClient.getOptimizedUrl(publicId, 'thumbnail')}
          alt="Request image"
          className="rounded-lg"
          onClick={() => {
            // Show full image
            const fullUrl = uploadClient.getOptimizedUrl(publicId, 'medium');
            openLightbox(fullUrl);
          }}
        />
      ))}
    </div>
  );
};
```

---

## Error Handling

```typescript
try {
  const url = await uploadClient.uploadImageSimple(file, 'rescue_requests');
} catch (error) {
  if (error.message.includes('signature')) {
    toast.error('Upload session expired. Please try again.');
  } else if (error.message.includes('network')) {
    toast.error('Network error. Check your connection.');
  } else if (error.message.includes('size')) {
    toast.error('File too large. Max 10MB.');
  } else {
    toast.error('Upload failed. Please try again.');
  }
  console.error('Upload error:', error);
}
```

---

## Performance Tips

1. **Use thumbnails for lists** - Load thumbnails first, full images on demand
2. **Upload in parallel** - Use `uploadMultipleImages()` for batch uploads
3. **Show progress** - Add loading states during upload
4. **Lazy load images** - Use lazy loading for image galleries
5. **Cache optimized URLs** - Store transformed URLs to avoid regeneration

---

## Security Notes

1. **Never expose API credentials** - They stay in backend only
2. **Signatures expire** - Regenerate if upload fails
3. **Validate file types** - Check before uploading
4. **Limit file sizes** - Max 10MB enforced
5. **Context metadata** - Automatically includes userId and uploadedBy

---

## Environment Setup

Add to `.env.local`:
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

**Note:** Only cloud_name is needed in frontend. API key/secret stay in backend.

---

## Migration from Old System

### Before (DEPRECATED):
```typescript
// ❌ Old way - insecure, slow
const url = await uploadImage(file);
```

### After (RECOMMENDED):
```typescript
// ✅ New way - secure, fast
const url = await uploadClient.uploadImageSimple(
  file,
  'rescue_requests',
  { requestId: 'req_123' }
);
```

---

## TypeScript Types

```typescript
interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resource_type: string;
  created_at: string;
  eager?: Array<{ secure_url: string }>;
}

interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  resourceType: string;
  context?: Record<string, string>;
  eager?: string;
  eager_async?: boolean;
}
```

---

## Troubleshooting

### Upload fails with "Invalid signature"
- Signature expired - try again
- Check backend is running
- Verify JWT token is valid

### Images not loading
- Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set
- Verify public_id is correct
- Check Cloudinary dashboard

### Slow uploads
- Check network connection
- Reduce file size before upload
- Use eager transformations sparingly

---

## References

- Backend API: `/api/cloudinary/signature`
- Cloudinary Docs: https://cloudinary.com/documentation
- Migration Guide: `MIGRATION_CLOUDINARY.md`
