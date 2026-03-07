import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { discordLog } from "@/lib/discord-logger";
import {
	getAdminProfileByDiscordId,
	resetPrivilegedUserNameToDefault,
	updatePrivilegedUserName,
} from "@/lib/content-store";

export const runtime = "nodejs";

async function requirePrivilegedUser() {
	const session = await getServerSession(authOptions);
	if (!session || !session.user?.id) {
		return {
			error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
			session: null,
		};
	}

	if (session.role !== "admin" && session.role !== "moderator") {
		return {
			error: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
			session: null,
		};
	}

	return { error: null, session };
}

export async function GET() {
	try {
		const auth = await requirePrivilegedUser();
		if (auth.error) return auth.error;
		if (!auth.session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const profile = await getAdminProfileByDiscordId(auth.session.user.id);
		return NextResponse.json(profile);
	} catch {
		return NextResponse.json(
			{ message: "Gagal memuat user settings" },
			{ status: 500 },
		);
	}
}

export async function PATCH(request: Request) {
	try {
		const auth = await requirePrivilegedUser();
		if (auth.error) return auth.error;
		if (!auth.session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const payload = (await request.json()) as {
			name?: string;
			resetToDefault?: boolean;
		};

		if (payload.resetToDefault) {
			const reset = await resetPrivilegedUserNameToDefault(
				auth.session.user.id,
			);
			await discordLog(
				`USER_SETTINGS: ${auth.session.user.id} reset name to default`,
			);
			return NextResponse.json(reset);
		}

		const nextName = payload.name?.trim();

		if (!nextName) {
			return NextResponse.json(
				{ message: "Nama tidak boleh kosong" },
				{ status: 400 },
			);
		}

		const updated = await updatePrivilegedUserName(
			auth.session.user.id,
			nextName,
		);
		await discordLog(
			`USER_SETTINGS: ${auth.session.user.id} changed name to ${nextName}`,
		);
		return NextResponse.json(updated);
	} catch {
		return NextResponse.json(
			{ message: "Gagal menyimpan user settings" },
			{ status: 500 },
		);
	}
}
