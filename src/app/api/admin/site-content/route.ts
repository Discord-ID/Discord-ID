import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { SiteContent } from "@/lib/content-types";
import { authOptions } from "@/lib/auth";
import { getSiteContent, updateSiteContent } from "@/lib/content-store";

export const runtime = "nodejs";

async function requireEditor() {
	const session = await getServerSession(authOptions);
	if (!session) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	if (session.role !== "admin" && session.role !== "moderator") {
		return NextResponse.json({ message: "Forbidden" }, { status: 403 });
	}

	return null;
}

function isValidSiteContent(payload: unknown): payload is SiteContent {
	if (!payload || typeof payload !== "object") return false;
	const maybe = payload as SiteContent;
	if (!Array.isArray(maybe.liveCommunityFeed)) return false;
	return maybe.liveCommunityFeed.every(
		(item) =>
			typeof item.tag === "string" &&
			typeof item.color === "string" &&
			typeof item.text === "string",
	);
}

export async function GET() {
	try {
		const authError = await requireEditor();
		if (authError) return authError;

		const content = await getSiteContent();
		return NextResponse.json(content);
	} catch {
		return NextResponse.json(
			{ message: "Gagal memuat konten situs" },
			{ status: 500 },
		);
	}
}

export async function PUT(request: Request) {
	try {
		const authError = await requireEditor();
		if (authError) return authError;

		const payload = (await request.json()) as unknown;
		if (!isValidSiteContent(payload)) {
			return NextResponse.json(
				{ message: "Format Site Content tidak valid" },
				{ status: 400 },
			);
		}
		const updated = await updateSiteContent(payload);
		return NextResponse.json(updated);
	} catch {
		return NextResponse.json(
			{ message: "Gagal menyimpan Site Content" },
			{ status: 500 },
		);
	}
}
