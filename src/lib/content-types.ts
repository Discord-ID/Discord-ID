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

type BlogContentBlockBase = {
	id?: string;
};

export type BlogContentBlock =
	| ({
			type: "heading";
			text: string;
	  } & BlogContentBlockBase)
	| ({
			type: "paragraph";
			text: string;
	  } & BlogContentBlockBase)
	| ({
			type: "image";
			src: string;
			alt: string;
			caption?: string;
	  } & BlogContentBlockBase)
	| ({
			type: "quote";
			text: string;
			cite?: string;
	  } & BlogContentBlockBase)
	| ({
			type: "code";
			language?: string;
			code: string;
	  } & BlogContentBlockBase)
	| ({
			type: "list";
			ordered?: boolean;
			items: string[];
	  } & BlogContentBlockBase);

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
