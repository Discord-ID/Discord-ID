import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveStaffEndpoint() {
	const baseUrl = process.env.DISCORD_STATE_API_BASE_URL;
	if (!baseUrl) return null;

	const normalizedBaseUrl = baseUrl.endsWith("/")
		? baseUrl.slice(0, -1)
		: baseUrl;
	return `${normalizedBaseUrl}/guilds/staff`;
}

export async function GET() {
	const endpoint = resolveStaffEndpoint();

	if (!endpoint) {
		return NextResponse.json(
			{
				message:
					"Konfigurasi endpoint staff belum ada. Isi DISCORD_STATE_API_BASE_URL.",
			},
			{ status: 500 },
		);
	}

	try {
		const response = await fetch(endpoint, {
			method: "GET",
			headers: { Accept: "application/json" },
			cache: "no-store",
		});

		if (!response.ok) {
			return NextResponse.json(
				{ message: "Gagal memuat data staff" },
				{ status: response.status },
			);
		}

		const payload = (await response.json()) as unknown;
		return NextResponse.json(payload);
	} catch {
		return NextResponse.json(
			{ message: "Gagal menghubungi endpoint staff" },
			{ status: 502 },
		);
	}
}
