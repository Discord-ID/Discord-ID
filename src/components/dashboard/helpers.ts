import type { BlogPost, LiveFeedItem } from "@/lib/content-types";

export function createLiveFeedItemId() {
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}
	return `feed-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function reorderArray<T>(
	items: T[],
	fromIndex: number,
	toIndex: number,
) {
	const next = [...items];
	const [moved] = next.splice(fromIndex, 1);
	next.splice(toIndex, 0, moved);
	return next;
}

export function emptyFeedItem(): LiveFeedItem {
	return { id: createLiveFeedItemId(), tag: "", color: "#ef4444", text: "" };
}

export function emptyPost(): BlogPost {
	return {
		slug: "",
		title: "",
		excerpt: "",
		publishedAt: new Date().toISOString().slice(0, 10),
		author: "",
		tags: [],
		coverImage: { src: "", alt: "" },
		sourceUrl: "",
		markdown: "",
	};
}

export function postLabel(post: BlogPost, index: number) {
	if (post.title.trim()) return post.title;
	if (post.slug.trim()) return post.slug;
	return `Untitled Post ${index + 1}`;
}
