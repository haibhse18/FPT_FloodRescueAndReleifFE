import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    console.log('📍 Reverse geocode request:', { lat, lon, url: request.url });

    if (!lat || !lon) {
        return NextResponse.json(
            { error: 'Missing lat or lon' },
            { status: 400 }
        );
    }

    try {
        // Use Nominatim (OpenStreetMap) — free, no API key needed
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=vi`;

        console.log('🚀 Calling Nominatim:', url);

        const response = await fetch(url, {
            headers: {
                // Nominatim requires a valid email in User-Agent per their policy
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 - FPT-FloodRescue/1.0',
                'Accept': 'application/json',
                'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
                'Referer': 'http://localhost:3000',
            },
            signal: AbortSignal.timeout(10000),
        });

        console.log('📨 Nominatim response status:', response.status);
        console.log('📨 Response headers:', Object.fromEntries(response.headers));

        if (!response.ok) {
            console.error('❌ Nominatim error:', response.status, response.statusText);
            return NextResponse.json(
                { error: `Nominatim returned ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('✅ Nominatim data:', data);
        return NextResponse.json(data);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        // TimeoutError is expected when Nominatim is slow — return 503 not 500
        const isTimeout = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
        console.error('❌ Reverse geocode proxy error:', message, error);
        return NextResponse.json(
            { error: isTimeout ? 'Geocoding service timeout' : message },
            { status: isTimeout ? 503 : 500 }
        );
    }
}
