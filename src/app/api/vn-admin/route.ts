import { NextResponse } from "next/server";

type OpenApiWard = {
    code: number;
    name: string;
};

type OpenApiDistrict = {
    code: number;
    name: string;
    wards?: OpenApiWard[];
};

type OpenApiProvince = {
    code: number;
    name: string;
    districts?: OpenApiDistrict[];
};

export async function GET() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch("https://provinces.open-api.vn/api/?depth=3", {
            method: "GET",
            signal: controller.signal,
            cache: "force-cache",
            next: { revalidate: 86400 },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Khong the tai danh muc hanh chinh" },
                { status: response.status },
            );
        }

        const data = (await response.json()) as OpenApiProvince[];

        const provinces = (Array.isArray(data) ? data : []).map((province) => ({
            code: province.code,
            name: province.name,
            districts: (province.districts ?? []).map((district) => ({
                code: district.code,
                name: district.name,
                wards: (district.wards ?? []).map((ward) => ({
                    code: ward.code,
                    name: ward.name,
                })),
            })),
        }));

        return NextResponse.json({ provinces });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: "Loi khi tai danh muc hanh chinh", detail: message },
            { status: 500 },
        );
    } finally {
        clearTimeout(timeout);
    }
}
