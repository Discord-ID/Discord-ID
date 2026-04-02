import { desc, eq, inArray, sql } from "drizzle-orm";
import type {
	AdminProfile,
	BlogPost,
	SiteContent,
	UserRole,
} from "@/lib/content-types";
import { db } from "@/lib/db/client";
import {
	adminUsersTable,
	blogPostsTable,
	siteContentTable,
} from "@/lib/db/schema";

const DEFAULT_SITE_CONTENT_KEY = "default";

let dbInitPromise: Promise<void> | null = null;

function getDbOrThrow() {
	if (!db) {
		throw new Error(
			"Turso belum dikonfigurasi. Set TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN.",
		);
	}

	return db;
}

function parseJson<T>(value: string): T {
	return JSON.parse(value) as T;
}

function siteContentToRow(next: SiteContent) {
	return {
		key: DEFAULT_SITE_CONTENT_KEY,
		liveCommunityFeedJson: JSON.stringify(next.liveCommunityFeed),
		updatedAt: new Date(),
	};
}

function rowToSiteContent(row: { liveCommunityFeedJson: string }): SiteContent {
	return {
		liveCommunityFeed: parseJson(row.liveCommunityFeedJson),
	};
}

function blogPostToRow(post: BlogPost) {
	return {
		slug: post.slug,
		title: post.title,
		excerpt: post.excerpt,
		publishedAt: post.publishedAt,
		status: post.status === "draft" ? "draft" : "published",
		author: post.author,
		authorAdminId: post.authorAdminId ?? null,
		tagsJson: JSON.stringify(post.tags),
		contentJson: post.markdown,
		coverImageJson: post.coverImage ? JSON.stringify(post.coverImage) : null,
		sourceUrl: post.sourceUrl ?? null,
		updatedAt: new Date(),
	};
}

function rowToBlogPost(row: {
	slug: string;
	title: string;
	excerpt: string;
	publishedAt: string;
	status: string;
	author: string;
	authorAdminId: string | null;
	tagsJson: string;
	contentJson: string;
	coverImageJson: string | null;
	sourceUrl: string | null;
}): BlogPost {
	return {
		slug: row.slug,
		title: row.title,
		excerpt: row.excerpt,
		publishedAt: row.publishedAt,
		status: row.status === "draft" ? "draft" : "published",
		author: row.author,
		authorAdminId: row.authorAdminId ?? undefined,
		tags: parseJson<string[]>(row.tagsJson),
		markdown: row.contentJson,
		coverImage: row.coverImageJson ? parseJson(row.coverImageJson) : undefined,
		sourceUrl: row.sourceUrl ?? undefined,
	};
}

function rowToAdminProfile(row: {
	discordId: string;
	name: string;
	discordDisplayName: string | null;
	role: string;
	avatarUrl: string | null;
	updatedAt: Date;
}): AdminProfile {
	const role =
		row.role === "dev" ? "dev" : row.role === "admin" ? "admin" : "moderator";

	return {
		discordId: row.discordId,
		name: row.name,
		defaultDisplayName: row.discordDisplayName ?? undefined,
		role,
		avatarUrl: row.avatarUrl ?? undefined,
		updatedAt: row.updatedAt.toISOString(),
	};
}

function getBootstrapAdminIds() {
	return (process.env.DISCORD_ADMIN_IDS ?? "")
		.split(",")
		.map((id) => id.trim())
		.filter(Boolean);
}

function getBootstrapDevIds() {
	return (process.env.DISCORD_DEV_IDS ?? "")
		.split(",")
		.map((id) => id.trim())
		.filter(Boolean);
}

// seed database with initial admin users from environment variable
async function seedDb() {
	const dbClient = getDbOrThrow();
	const bootstrapDevIds = getBootstrapDevIds();
	for (const discordId of bootstrapDevIds) {
		await dbClient
			.insert(adminUsersTable)
			.values({
				discordId,
				name: `Dev ${discordId}`,
				discordDisplayName: null,
				role: "dev",
				avatarUrl: null,
				updatedAt: new Date(),
			})
			.onConflictDoUpdate({
				target: adminUsersTable.discordId,
				set: {
					role: "dev",
					updatedAt: new Date(),
				},
			});
	}

	const bootstrapAdminIds = getBootstrapAdminIds();
	for (const discordId of bootstrapAdminIds) {
		await dbClient
			.insert(adminUsersTable)
			.values({
				discordId,
				name: `Admin ${discordId}`,
				discordDisplayName: null,
				role: "admin",
				avatarUrl: null,
				updatedAt: new Date(),
			})
			.onConflictDoUpdate({
				target: adminUsersTable.discordId,
				set: {
					role: "admin",
					updatedAt: new Date(),
				},
			});
	}
}

async function ensureDbReady() {
	const dbClient = getDbOrThrow();
	if (!dbInitPromise) {
		dbInitPromise = (async () => {
			const safeRun = async (query: ReturnType<typeof sql>) => {
				try {
					await dbClient.run(query);
				} catch {}
			};

			await dbClient.run(sql`
				CREATE TABLE IF NOT EXISTS site_content (
					key TEXT PRIMARY KEY NOT NULL,
					live_community_feed_json TEXT NOT NULL,
					updated_at INTEGER NOT NULL
				)
			`);
			await dbClient.run(sql`
				CREATE TABLE IF NOT EXISTS blog_posts (
					slug TEXT PRIMARY KEY NOT NULL,
					title TEXT NOT NULL,
					excerpt TEXT NOT NULL,
					published_at TEXT NOT NULL,
					status TEXT NOT NULL DEFAULT 'published',
					author TEXT NOT NULL,
					author_admin_id TEXT,
					tags_json TEXT NOT NULL,
					content_json TEXT NOT NULL,
					cover_image_json TEXT,
					source_url TEXT,
					updated_at INTEGER NOT NULL
				)
			`);
			await safeRun(sql`
				ALTER TABLE blog_posts ADD COLUMN status TEXT NOT NULL DEFAULT 'published'
			`);
			await safeRun(sql`
				ALTER TABLE blog_posts ADD COLUMN author_admin_id TEXT
			`);
			await dbClient.run(sql`
				CREATE TABLE IF NOT EXISTS admin_users (
					discord_id TEXT PRIMARY KEY NOT NULL,
					name TEXT NOT NULL,
					discord_display_name TEXT,
					role TEXT NOT NULL DEFAULT 'moderator',
					avatar_url TEXT,
					updated_at INTEGER NOT NULL
				)
			`);
			await safeRun(sql`
				ALTER TABLE admin_users ADD COLUMN discord_display_name TEXT
			`);
			await safeRun(sql`
				ALTER TABLE admin_users ADD COLUMN role TEXT NOT NULL DEFAULT 'moderator'
			`);
			await seedDb();
		})();
	}

	await dbInitPromise;
}

export async function getSiteContent() {
	const dbClient = getDbOrThrow();
	await ensureDbReady();
	const row = await dbClient.query.siteContentTable.findFirst({
		where: eq(siteContentTable.key, DEFAULT_SITE_CONTENT_KEY),
	});

	if (row) {
		return rowToSiteContent(row);
	}

	// if not present, return empty default and optionally create an empty record
	const empty: SiteContent = { liveCommunityFeed: [] };
	await dbClient
	    .insert(siteContentTable)
		.values(siteContentToRow(empty))
		.onConflictDoNothing();
	return empty;
}

export async function updateSiteContent(next: SiteContent) {
	const dbClient = getDbOrThrow();
	await ensureDbReady();
	await dbClient
		.insert(siteContentTable)
		.values(siteContentToRow(next))
		.onConflictDoUpdate({
			target: siteContentTable.key,
			set: {
				liveCommunityFeedJson: JSON.stringify(next.liveCommunityFeed),
				updatedAt: new Date(),
			},
		});
	return next;
}

export async function getBlogPosts() {
	const dbClient = getDbOrThrow();
	await ensureDbReady();
	const rows = await dbClient
		.select()
		.from(blogPostsTable)
		.orderBy(desc(blogPostsTable.publishedAt));

	// no posts yet – return empty array
	return rows.length > 0 ? rows.map(rowToBlogPost) : [];
}

export async function getBlogPostBySlug(slug: string) {
	const posts = await getBlogPosts();
	return posts.find((post) => post.slug === slug);
}

export async function updateBlogPosts(next: BlogPost[]) {
	const dbClient = getDbOrThrow();
	await ensureDbReady();
	await dbClient.delete(blogPostsTable);
	if (next.length > 0) {
		await dbClient.insert(blogPostsTable).values(next.map(blogPostToRow));
	}
	return next;
}

export async function upsertAdminProfile(profile: {
	discordId: string;
	discordDisplayName: string;
	avatarUrl?: string;
}) {
	const dbClient = getDbOrThrow();
	await ensureDbReady();
	const existing = await dbClient.query.adminUsersTable.findFirst({
		where: eq(adminUsersTable.discordId, profile.discordId),
	});

	const role =
		existing?.role === "dev"
			? "dev"
			: existing?.role === "admin"
				? "admin"
				: "moderator";
	const previousDiscordName = existing?.discordDisplayName ?? null;
	const shouldKeepCustomName =
		Boolean(existing?.name) &&
		existing?.name !== previousDiscordName &&
		previousDiscordName !== null;
	const resolvedName = shouldKeepCustomName
		? (existing?.name ?? profile.discordDisplayName)
		: profile.discordDisplayName;

	await dbClient
		.insert(adminUsersTable)
		.values({
			discordId: profile.discordId,
			name: resolvedName,
			discordDisplayName: profile.discordDisplayName,
			role,
			avatarUrl: profile.avatarUrl ?? null,
			updatedAt: new Date(),
		})
		.onConflictDoUpdate({
			target: adminUsersTable.discordId,
			set: {
				name: resolvedName,
				discordDisplayName: profile.discordDisplayName,
				role,
				avatarUrl: profile.avatarUrl ?? null,
				updatedAt: new Date(),
			},
		});
}

export async function getUserRoleByDiscordId(discordId: string) {
	const dbClient = getDbOrThrow();
	await ensureDbReady();
	const row = await dbClient.query.adminUsersTable.findFirst({
		where: eq(adminUsersTable.discordId, discordId),
	});

	if (!row) {
		return null;
	}

	return row.role === "dev"
	    ? "dev"
		: row.role === "admin"
		    ? "admin"
			: "moderator";
}

export async function getAdminProfileByDiscordId(discordId: string) {
	const dbClient = getDbOrThrow();
	await ensureDbReady();
	const row = await dbClient.query.adminUsersTable.findFirst({
		where: eq(adminUsersTable.discordId, discordId),
	});

	if (!row) {
		return null;
	}

	return rowToAdminProfile(row);
}

export async function getAdminProfilesByDiscordIds(discordIds: string[]) {
	const dbClient = getDbOrThrow();
	await ensureDbReady();
	const uniqueIds = [...new Set(discordIds.filter(Boolean))];

	if (!uniqueIds.length) {
		return [] as AdminProfile[];
	}

	const rows = await dbClient
		.select()
		.from(adminUsersTable)
		.where(inArray(adminUsersTable.discordId, uniqueIds));

	return rows.map(rowToAdminProfile);
}

export async function listPrivilegedUsers() {
	const dbClient = getDbOrThrow();
	await ensureDbReady();
	const rows = await dbClient
		.select()
		.from(adminUsersTable)
		.orderBy(desc(adminUsersTable.updatedAt));

	return rows.map(rowToAdminProfile);
}

export async function upsertPrivilegedUserByAdmin(input: {
	discordId: string;
	role: UserRole;
	name?: string;
}) {
	const dbClient = getDbOrThrow();
	await ensureDbReady();
	const existing = await dbClient.query.adminUsersTable.findFirst({
		where: eq(adminUsersTable.discordId, input.discordId),
	});

	const fallbackName =
		input.name?.trim() || existing?.name || `User ${input.discordId}`;

	await dbClient
		.insert(adminUsersTable)
		.values({
			discordId: input.discordId,
			name: fallbackName,
			discordDisplayName: existing?.discordDisplayName ?? null,
			role: input.role,
			avatarUrl: existing?.avatarUrl ?? null,
			updatedAt: new Date(),
		})
		.onConflictDoUpdate({
			target: adminUsersTable.discordId,
			set: {
				name: fallbackName,
				role: input.role,
				updatedAt: new Date(),
			},
		});

	const updated = await dbClient.query.adminUsersTable.findFirst({
		where: eq(adminUsersTable.discordId, input.discordId),
	});

	if (!updated) {
		throw new Error("Gagal menyimpan user");
	}

	return rowToAdminProfile(updated);
}

export async function updatePrivilegedUserName(
	discordId: string,
	name: string,
) {
	const dbClient = getDbOrThrow();
	await ensureDbReady();

	await dbClient
		.update(adminUsersTable)
		.set({
			name,
			updatedAt: new Date(),
		})
		.where(eq(adminUsersTable.discordId, discordId));

	return getAdminProfileByDiscordId(discordId);
}

export async function deletePrivilegedUserByDiscordId(discordId: string) {
	const dbClient = getDbOrThrow();
	await ensureDbReady();

	const existing = await dbClient.query.adminUsersTable.findFirst({
		where: eq(adminUsersTable.discordId, discordId),
	});

	if (!existing) {
		return null;
	}

	await dbClient
	    .delete(adminUsersTable)
		.where(eq(adminUsersTable.discordId, discordId));

	return rowToAdminProfile(existing);
}

export async function resetPrivilegedUserNameToDefault(discordId: string) {
	const dbClient = getDbOrThrow();
	await ensureDbReady();
	
	const existing = await dbClient.query.adminUsersTable.findFirst({
		where: eq(adminUsersTable.discordId, discordId),
	});

	if (!existing) {
		return null;
	}

	const defaultName = existing.discordDisplayName?.trim();
	if (!defaultName) {
		return getAdminProfileByDiscordId(discordId);
	}

	await dbClient
		.update(adminUsersTable)
		.set({
			name: defaultName,
			updatedAt: new Date(),
		})
		.where(eq(adminUsersTable.discordId, discordId));

		return getAdminProfileByDiscordId(discordId);
}
