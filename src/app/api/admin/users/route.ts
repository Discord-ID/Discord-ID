import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { UserRole } from "@/lib/content-types";
import { authOptions } from "@/lib/auth";
import { discordLog } from "@/lib/discord-logger";
import {
	listPrivilegedUsers,
	upsertPrivilegedUserByAdmin,
} from "@/lib/content-store";

export const runtime = "nodejs";

async function requireAdmin() {
	const session = await getServerSession(authOptions);
	if (!session) {
		return {
			error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
			session: null,
		};
	}

	if (session.role !== "admin") {
		return {
			error: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
			session: null,
		};
	}

	return { error: null, session };
}

function isRole(value: unknown): value is UserRole {
	return value === "admin" || value === "moderator";
}

export async function GET() {
	try {
		const auth = await requireAdmin();
		if (auth.error) return auth.error;

		const users = await listPrivilegedUsers();
		return NextResponse.json(users);
	} catch {
		return NextResponse.json(
			{ message: "Gagal memuat daftar user" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const auth = await requireAdmin();
		if (auth.error) return auth.error;

		const payload = (await request.json()) as {
			discordId?: string;
			role?: UserRole;
			name?: string;
		};

		if (!payload.discordId || !isRole(payload.role)) {
			return NextResponse.json(
				{ message: "discordId dan role wajib diisi" },
				{ status: 400 },
			);
		}

		const user = await upsertPrivilegedUserByAdmin({
			discordId: payload.discordId.trim(),
			role: payload.role,
			name: payload.name,
		});
		await discordLog(
			`USER_MODIFIED by ${auth.session?.user?.id || "?"}: ${user.discordId} role=${user.role}`,
		);
		return NextResponse.json(user);
	} catch {
		return NextResponse.json(
			{ message: "Gagal menyimpan user" },
			{ status: 500 },
		);
	}
}
