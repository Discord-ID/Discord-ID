export type LiveFeedItem = {
	id?: string;
	tag: string;
	color: string;
	text: string;
};

export type UserRole = "dev" | "admin" | "moderator";

/** Entry for `/server-info`: which guild roles appear and optional copy under the name. */
export type ServerInfoRoleEntry = {
	roleId: string;
	description?: string;
};

export type SiteContent = {
	liveCommunityFeed: LiveFeedItem[];
	/** Order = display order. Omitted or empty = nothing shown on `/server-info`. */
	serverInfoRoles?: ServerInfoRoleEntry[];
};

export type BlogPost = {
	slug: string;
	title: string;
	excerpt: string;
	publishedAt: string;
	status?: "published" | "draft";
	author: string;
	authorAdminId?: string;
	tags: string[];
	coverImage?: {
		src: string;
		alt: string;
	};
	sourceUrl?: string;
	markdown: string;
};

export type AdminProfile = {
	discordId: string;
	name: string;
	defaultDisplayName?: string;
	avatarUrl?: string;
	role: UserRole;
	updatedAt: string;
};
