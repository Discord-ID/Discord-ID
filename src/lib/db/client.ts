import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/lib/db/schema";

const tursoUrl = process.env.TURSO_DATABASE_URL;

const client = tursoUrl
	? createClient({
			url: tursoUrl,
			authToken: process.env.TURSO_AUTH_TOKEN,
		})
	: null;

export const db = client ? drizzle(client, { schema }) : null;

export function isTursoConfigured() {
	return Boolean(client);
}
