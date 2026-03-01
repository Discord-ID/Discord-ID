import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const siteContentTable = sqliteTable("site_content", {
	key: text("key").primaryKey(),
	liveCommunityFeedJson: text("live_community_feed_json").notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const blogPostsTable = sqliteTable("blog_posts", {
	slug: text("slug").primaryKey(),
	title: text("title").notNull(),
	excerpt: text("excerpt").notNull(),
	publishedAt: text("published_at").notNull(),
	status: text("status").notNull().default("published"),
	author: text("author").notNull(),
	authorAdminId: text("author_admin_id"),
	tagsJson: text("tags_json").notNull(),
	contentJson: text("content_json").notNull(),
	coverImageJson: text("cover_image_json"),
	sourceUrl: text("source_url"),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const adminUsersTable = sqliteTable("admin_users", {
	discordId: text("discord_id").primaryKey(),
	name: text("name").notNull(),
	discordDisplayName: text("discord_display_name"),
	role: text("role").notNull().default("moderator"),
	avatarUrl: text("avatar_url"),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
