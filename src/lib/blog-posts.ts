import type {
	AdminProfile,
	BlogContentBlock,
	BlogPost,
} from "@/lib/content-types";
import {
	getAdminProfilesByDiscordIds,
	getBlogPostBySlug,
	getBlogPosts,
} from "@/lib/content-store";

export type { AdminProfile, BlogContentBlock, BlogPost };

export async function getAllPosts() {
	const posts = await getBlogPosts();
	return posts.filter((post) => post.status !== "draft");
}

export async function getPostBySlug(slug: string) {
	const post = await getBlogPostBySlug(slug);
	if (!post || post.status === "draft") {
		return null;
	}
	return post;
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
