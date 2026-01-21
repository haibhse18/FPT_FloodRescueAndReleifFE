import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
        return NextResponse.json(
            { error: 'Missing lat or lng parameter' },
            { status: 400 }
        );
    }

    const apiKey = process.env.NEXT_PUBLIC_OPENMAP_API_KEY;

    try {
        // Thử gọi API Openmap.vn trước
        const openmapResponse = await fetch(
            `https://mapapis.openmap.vn/v1/geocode/reverse?format=google&latlng=${lat},${lng}&apikey=${apiKey}`,

            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        // Nếu Openmap.vn thành công
        if (openmapResponse.ok) {
            const data = await openmapResponse.json();
            return NextResponse.json(data);
        }

        
        console.log('Openmap API failed');

        const nominatimResponse = await fetch(
            `https://mapapis.openmap.vn/v1/geocode/reverse?format=google&latlng=${lat},${lng}&apikey=${apiKey}`,

            {
                method: 'GET',
                headers: {
                    'User-Agent': 'FPT-Flood-Rescue-App/1.0'
                }
            }
        );

        if (!nominatimResponse.ok) {
            return NextResponse.json(
                { error: 'Both geocoding services failed' },
                { status: 500 }
            );
        }

        const nominatimData = await nominatimResponse.json();

        // Chuyển đổi format từ Nominatim sang format giống Openmap
        const address = nominatimData.address || {};
        const formattedData = {
            address: {
                ward: address.suburb || address.neighbourhood || address.village,
                district: address.county || address.city_district || address.town,
                city: address.city || address.province,
                province: address.state,
                country: address.country
            },
            display_name: nominatimData.display_name
        };

        return NextResponse.json(formattedData);

    } catch (error) {
        console.error('Error calling geocoding API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
