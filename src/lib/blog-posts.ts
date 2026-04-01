import {
	getAdminProfilesByDiscordIds,
	getBlogPostBySlug,
	getBlogPosts,
} from "@/lib/content-store";
import type {
	AdminProfile,
	BlogContentBlock,
	BlogPost,
} from "@/lib/content-types";

export type { AdminProfile, BlogContentBlock, BlogPost };

const DEFAULT_BLOG_COVERS = [
	"/blog/cover-age-assurance.svg",
	"/blog/cover-dave-e2ee.svg",
	"/blog/cover-dave-platforms.svg",
	"/blog/content-age-flow.svg",
];

function hashString(input: string) {
	let hash = 0;
	for (let index = 0; index < input.length; index += 1) {
		hash = (hash << 5) - hash + input.charCodeAt(index);
		hash |= 0;
	}
	return Math.abs(hash);
}

function fallbackTitle(post: BlogPost) {
	if (post.title.trim()) return post.title;

	if (post.slug.trim()) {
		return post.slug
			.split("-")
			.map((part) =>
				part ? `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}` : "",
			)
			.join(" ")
			.trim();
	}

	return "Untitled Blog Post";
}

function fallbackCover(post: BlogPost, title: string) {
	const hasCustomCover =
		Boolean(post.coverImage?.src?.trim()) &&
		Boolean(post.coverImage?.alt?.trim());

	if (hasCustomCover) {
		return {
			src: post.coverImage?.src?.trim() ?? "",
			alt: post.coverImage?.alt?.trim() ?? title,
		};
	}

	const seed = `${post.slug}-${title}`;
	const fallbackSrc =
		DEFAULT_BLOG_COVERS[hashString(seed) % DEFAULT_BLOG_COVERS.length];

	return {
		src: fallbackSrc,
		alt: `Cover ${title}`,
	};
}

function normalizePost(post: BlogPost): BlogPost {
	const normalizedTitle = fallbackTitle(post);

	return {
		...post,
		title: normalizedTitle,
		coverImage: fallbackCover(post, normalizedTitle),
	};
}

export async function getAllPosts() {
	const posts = await getBlogPosts();
	return posts.filter((post) => post.status !== "draft").map(normalizePost);
}

export async function getPostBySlug(slug: string) {
	const post = await getBlogPostBySlug(slug);
	if (!post || post.status === "draft") {
		return null;
	}
	return normalizePost(post);
}

export async function getAuthorProfilesForPosts(posts: BlogPost[]) {
	const ids = posts
		.map((post) => post.authorAdminId)
		.filter((id): id is string => Boolean(id));

	if (!ids.length) {
		return {} as Record<string, AdminProfile>;
	}

	const profiles = await getAdminProfilesByDiscordIds(ids);
	return Object.fromEntries(
		profiles.map((profile) => [profile.discordId, profile]),
	) as Record<string, AdminProfile>;
}
