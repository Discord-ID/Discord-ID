import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "sqlite",
	schema: "./src/lib/db/schema.ts",
	out: "./drizzle",
	dbCredentials: {
		url: process.env.TURSO_DATABASE_URL ?? "",
		token: process.env.TURSO_AUTH_TOKEN ?? "",
	},
});
