import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Latitude and longitude parameters are required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_GOONGMAP_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Goong API key not configured" },
      { status: 500 }
    );
  }

  try {
    const url = `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Reverse geocoding failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Goong Reverse Geocoding API error:", error);
    return NextResponse.json(
      { error: "Failed to reverse geocode coordinates" },
      { status: 500 }
    );
  }
}
