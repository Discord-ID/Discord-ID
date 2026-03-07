import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildDiscordEmbedLogPayload, discordLog } from "@/lib/discord-logger";

export const runtime = "nodejs";

type LogPayload = {
	action?: string;
	details?: unknown;
};

export async function POST(request: Request) {
	const session = await getServerSession(authOptions);
	if (!session || !session.user?.id) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		const payload = (await request.json()) as LogPayload;
		if (!payload.action || typeof payload.action !== "string") {
			return NextResponse.json({ message: "Invalid action" }, { status: 400 });
		}
		const actor = `${session.user.name || session.user.id} (${session.user.id})`;
		await discordLog(
			buildDiscordEmbedLogPayload({
				action: payload.action,
				actor,
				details: payload.details,
			}),
		);
		return NextResponse.json({ success: true });
	} catch {
		return NextResponse.json({ message: "Failed to log" }, { status: 500 });
	}
}
