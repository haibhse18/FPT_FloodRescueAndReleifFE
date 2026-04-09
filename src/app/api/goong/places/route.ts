import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const input = searchParams.get("input");
  const location = searchParams.get("location"); // Optional: lat,lng for bias
  const radius = searchParams.get("radius"); // Optional: radius in meters

  if (!input) {
    return NextResponse.json(
      { error: "Input parameter is required" },
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
    let url = `https://rsapi.goong.io/Place/AutoComplete?input=${encodeURIComponent(
      input
    )}&api_key=${apiKey}`;

    if (location) {
      url += `&location=${location}`;
    }
    if (radius) {
      url += `&radius=${radius}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Places search failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Goong Places API error:", error);
    return NextResponse.json(
      { error: "Failed to search places" },
      { status: 500 }
    );
  }
}
