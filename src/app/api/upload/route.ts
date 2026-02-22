import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'Không có file được cung cấp' },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'Kích thước file vượt quá 10MB' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png',
            'image/webp', 'image/gif', 'image/heic',
            'image/heif', 'image/avif',
        ];
        if (!allowedTypes.includes(file.type.toLowerCase())) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Định dạng không hợp lệ (${file.type}). Hỗ trợ: JPG, PNG, WEBP, GIF, HEIC, AVIF`,
                },
                { status: 400 }
            );
        }

        // Resolve Cloudinary credentials (support both NEXT_PUBLIC_ and plain prefix)
        const cloudName =
            process.env.CLOUDINARY_CLOUD_NAME ||
            process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
        const apiKey =
            process.env.CLOUDINARY_API_KEY ||
            process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '';
        const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

        if (!cloudName || !apiKey || !apiSecret) {
            console.error('Missing Cloudinary env vars:', {
                cloudName: !!cloudName,
                apiKey: !!apiKey,
                apiSecret: !!apiSecret,
            });
            return NextResponse.json(
                { success: false, error: 'Cấu hình Cloudinary chưa đầy đủ trên server' },
                { status: 500 }
            );
        }

        // Build signed upload — no unsigned preset needed
        const timestamp = Math.round(Date.now() / 1000);
        const folder = 'rescue_requests';
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
        const signature = crypto
            .createHash('sha1')
            .update(paramsToSign + apiSecret)
            .digest('hex');

        const cloudinaryForm = new FormData();
        cloudinaryForm.append('file', file);
        cloudinaryForm.append('api_key', apiKey);
        cloudinaryForm.append('timestamp', timestamp.toString());
        cloudinaryForm.append('signature', signature);
        cloudinaryForm.append('folder', folder);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const cloudinaryResponse = await fetch(uploadUrl, {
            method: 'POST',
            body: cloudinaryForm,
        });

        const data = await cloudinaryResponse.json();

        if (!cloudinaryResponse.ok || !data.secure_url) {
            const msg = data?.error?.message || `Cloudinary lỗi HTTP ${cloudinaryResponse.status}`;
            console.error('Cloudinary error:', msg, data);
            return NextResponse.json(
                { success: false, error: msg },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            url: data.secure_url,
            publicId: data.public_id,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Lỗi không xác định';
        console.error('Upload route error:', message);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
