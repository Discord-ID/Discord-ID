export type LiveFeedItem = {
	tag: string;
	color: string;
	text: string;
};

export type UserRole = "admin" | "moderator";

export type SiteContent = {
	liveCommunityFeed: LiveFeedItem[];
};

export type BlogContentBlock =
	| {
			type: "heading";
			text: string;
	  }
	| {
			type: "paragraph";
			text: string;
	  }
	| {
			type: "image";
			src: string;
			alt: string;
			caption?: string;
	  }
	| {
			type: "quote";
			text: string;
			cite?: string;
	  }
	| {
			type: "list";
			ordered?: boolean;
			items: string[];
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
	content: BlogContentBlock[];
};

export type AdminProfile = {
	discordId: string;
	name: string;
	defaultDisplayName?: string;
	avatarUrl?: string;
	role: UserRole;
	updatedAt: string;
};
