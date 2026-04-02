export type LiveFeedItem = {
	id?: string;
	tag: string;
	color: string;
	text: string;
};

export type UserRole = "dev" | "admin" | "moderator";

export type SiteContent = {
	liveCommunityFeed: LiveFeedItem[];
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
