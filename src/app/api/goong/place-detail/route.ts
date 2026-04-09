import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const placeId = searchParams.get("place_id");

  if (!placeId) {
    return NextResponse.json(
      { error: "Place ID parameter is required" },
      { status: 400 }
    );
  }

  const apiKey =
    process.env.GOONGMAP_API_KEY || process.env.NEXT_PUBLIC_GOONGMAP_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Map service is temporarily unavailable" },
      { status: 500 }
    );
  }

  try {
    const url = `https://rsapi.goong.io/Place/Detail?place_id=${encodeURIComponent(
      placeId
    )}&api_key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Place detail fetch failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Goong Place Detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch place details" },
      { status: 500 }
    );
  }
}
