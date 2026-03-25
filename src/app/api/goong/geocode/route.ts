import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Address parameter is required" },
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
    const url = `https://rsapi.goong.io/geocode?address=${encodeURIComponent(
      address
    )}&api_key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Geocoding failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Goong Geocoding API error:", error);
    return NextResponse.json(
      { error: "Failed to geocode address" },
      { status: 500 }
    );
  }
}
