import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
        return NextResponse.json(
            { error: 'Missing lat or lon' },
            { status: 400 }
        );
    }

    try {
        // Use Nominatim (OpenStreetMap) — free, no API key needed
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=vi`;

        const response = await fetch(url, {
            headers: {
                // Nominatim requires a descriptive User-Agent
                'User-Agent': 'FPT-FloodRescue/1.0 (contact@example.com)',
                'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Nominatim returned ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        // TimeoutError is expected when Nominatim is slow — return 503 not 500
        const isTimeout = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
        console.warn('Reverse geocode proxy error:', message);
        return NextResponse.json(
            { error: isTimeout ? 'Geocoding service timeout' : message },
            { status: isTimeout ? 503 : 500 }
        );
    }
}
