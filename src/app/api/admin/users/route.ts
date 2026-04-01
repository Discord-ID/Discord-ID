import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
	deletePrivilegedUserByDiscordId,
	getAdminProfileByDiscordId,
	listPrivilegedUsers,
	upsertPrivilegedUserByAdmin,
} from "@/lib/content-store";
import type { UserRole } from "@/lib/content-types";
import { discordLog } from "@/lib/discord-logger";

export const runtime = "nodejs";

function roleRank(role?: UserRole) {
	if (role === "dev") return 3;
	if (role === "admin") return 2;
	if (role === "moderator") return 1;
	return 0;
}

async function requireManager() {
	const session = await getServerSession(authOptions);
	if (!session) {
		return {
			error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
			session: null,
		};
	}

	if (session.role !== "admin" && session.role !== "dev") {
		return {
			error: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
			session: null,
		};
	}

	return { error: null, session };
}

function isRole(value: unknown): value is UserRole {
	return value === "dev" || value === "admin" || value === "moderator";
}

function canAssignRole(actorRole: UserRole | undefined, targetRole: UserRole) {
	if (!actorRole) return false;
	if (actorRole === "dev") return true;
	if (actorRole === "admin") return targetRole !== "dev";
	return false;
}

function canDeleteTarget(
	actorRole: UserRole | undefined,
	targetRole: UserRole,
	actorDiscordId?: string,
	targetDiscordId?: string,
) {
	if (!actorRole) return false;
	if (!targetDiscordId) return false;

	// keep at least one manager alive, block self-delete
	if (actorDiscordId && actorDiscordId === targetDiscordId) return false;

	if (actorRole === "dev") return true;
	if (actorRole === "admin") return targetRole !== "dev";
	return false;
}

export async function GET() {
	try {
		const auth = await requireManager();
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
		const auth = await requireManager();
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

		if (!canAssignRole(auth.session?.role, payload.role)) {
			return NextResponse.json(
				{ message: "Role ini tidak bisa dikelola oleh akun kamu" },
				{ status: 403 },
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

export async function DELETE(request: Request) {
	try {
		const auth = await requireManager();
		if (auth.error) return auth.error;

		const payload = (await request.json()) as {
			discordId?: string;
		};
		const targetDiscordId = payload.discordId?.trim();
		if (!targetDiscordId) {
			return NextResponse.json(
				{ message: "discordId wajib diisi" },
				{ status: 400 },
			);
		}

		const target = await getAdminProfileByDiscordId(targetDiscordId);
		if (!target) {
			return NextResponse.json(
				{ message: "User tidak ditemukan" },
				{ status: 404 },
			);
		}

		if (
			!canDeleteTarget(
				auth.session?.role,
				target.role,
				auth.session?.user?.id,
				target.discordId,
			)
		) {
			return NextResponse.json(
				{
					message:
						roleRank(target.role) > roleRank(auth.session?.role)
							? "Tidak punya izin menghapus role lebih tinggi"
							: "Aksi hapus tidak diizinkan",
				},
				{ status: 403 },
			);
		}

		const removed = await deletePrivilegedUserByDiscordId(targetDiscordId);
		if (!removed) {
			return NextResponse.json(
				{ message: "User tidak ditemukan" },
				{ status: 404 },
			);
		}

		await discordLog(
			`USER_REMOVED by ${auth.session?.user?.id || "?"}: ${removed.discordId} role=${removed.role}`,
		);
		return NextResponse.json({ success: true, removed });
	} catch {
		return NextResponse.json(
			{ message: "Gagal menghapus user" },
			{ status: 500 },
		);
	}
}
