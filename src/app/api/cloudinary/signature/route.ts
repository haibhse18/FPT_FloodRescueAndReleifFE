/**
 * API endpoint để tạo Cloudinary signature cho signed uploads
 * Endpoint: POST /api/cloudinary/signature
 */

import { NextRequest, NextResponse } from 'next/server';

// Cài đặt: npm install cloudinary
const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { folder = 'rescue_requests' } = body;

        // Tạo timestamp
        const timestamp = Math.round(new Date().getTime() / 1000);

        // Các parameters cần ký
        const params = {
            timestamp,
            folder,
        };

        // Generate signature
        const signature = cloudinary.utils.api_sign_request(
            params,
            process.env.CLOUDINARY_API_SECRET
        );

        return NextResponse.json({
            signature,
            timestamp,
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder,
        });
    } catch (error) {
        console.error('Error generating Cloudinary signature:', error);
        return NextResponse.json(
            { error: 'Failed to generate signature' },
            { status: 500 }
        );
    }
}
