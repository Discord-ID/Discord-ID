import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import type { UserRole } from "@/lib/content-types";
import { discordLog } from "@/lib/discord-logger";
import {
	getAdminProfileByDiscordId,
	getUserRoleByDiscordId,
	upsertAdminProfile,
} from "@/lib/content-store";

function getAdminDiscordIds() {
	return (process.env.DISCORD_ADMIN_IDS ?? "")
		.split(",")
		.map((id) => id.trim())
		.filter(Boolean);
}

export function isAdminDiscordId(discordId?: string | null) {
	if (!discordId) return false;
	const adminIds = getAdminDiscordIds();
	return adminIds.includes(discordId);
}

async function resolveUserRole(
	discordId?: string | null,
): Promise<UserRole | null> {
	if (!discordId) return null;

	if (isAdminDiscordId(discordId)) {
		return "admin";
	}

	try {
		return await getUserRoleByDiscordId(discordId);
	} catch {
		return null;
	}
}

export const authOptions: NextAuthOptions = {
	providers: [
		DiscordProvider({
			clientId: process.env.DISCORD_CLIENT_ID ?? "",
			clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
			profile(profile) {
				const displayName =
					typeof profile.global_name === "string" && profile.global_name.trim()
						? profile.global_name
						: typeof profile.username === "string"
							? profile.username
							: `User ${String(profile.id)}`;

				return {
					id: String(profile.id),
					name: displayName,
					image: profile.avatar
						? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
						: null,
					email: null,
				};
			},
			authorization: {
				params: {
					scope: "identify",
				},
			},
		}),
	],
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/login",
	},
	callbacks: {
		async signIn({ account, user }) {
			const discordId = account?.providerAccountId ?? null;
			const role = await resolveUserRole(discordId);

			if (role && discordId) {
				try {
					await upsertAdminProfile({
						discordId,
						discordDisplayName: user.name?.trim() || `User ${discordId}`,
						avatarUrl: user.image ?? undefined,
					});
				} catch {}
			}

			// record login event
			await discordLog(
				`LOGIN: ${user.name || "?"} (${discordId}) role=${role}`,
			);

			return Boolean(role);
		},
		async jwt({ token, account }) {
			if (account?.provider === "discord" && account.providerAccountId) {
				token.discordId = account.providerAccountId;
			}

			if (typeof token.discordId === "string") {
				const role = await resolveUserRole(token.discordId);
				token.role = role ?? undefined;
				token.isAdmin = role === "admin";
			} else {
				token.isAdmin = false;
				token.role = undefined;
			}

			return token;
		},
		async session({ session, token }) {
			const discordId =
				typeof token.discordId === "string" ? token.discordId : undefined;
			const role =
				token.role === "admin" || token.role === "moderator"
					? token.role
					: undefined;
			const isAdmin = Boolean(token.isAdmin);
			let resolvedName = session.user?.name;

			if (discordId && role) {
				try {
					const profile = await getAdminProfileByDiscordId(discordId);
					if (profile?.name) {
						resolvedName = profile.name;
					}
				} catch {}
			}

			session.user = {
				...session.user,
				name: resolvedName,
				id: discordId,
				isAdmin,
				role,
			};
			session.isAdmin = isAdmin;
			session.role = role;

			return session;
		},
	},
};
