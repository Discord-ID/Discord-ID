import { NextResponse } from "next/server";
import { getSiteContent } from "@/lib/content-store";

export const runtime = "nodejs";

export async function GET() {
	try {
		const content = await getSiteContent();
		return NextResponse.json(content);
	} catch {
		return NextResponse.json(
			{ message: "Gagal memuat konten situs" },
			{ status: 500 },
		);
	}
}
