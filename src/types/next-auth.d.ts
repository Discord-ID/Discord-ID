import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/content-types";

declare module "next-auth" {
	interface Session {
		isAdmin: boolean;
		role?: UserRole;
		user: DefaultSession["user"] & {
			id?: string;
			isAdmin: boolean;
			role?: UserRole;
		};
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		discordId?: string;
		isAdmin?: boolean;
		role?: UserRole;
	}
}
