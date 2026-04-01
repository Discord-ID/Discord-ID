import type {
	BlogContentBlock,
	BlogPost,
	LiveFeedItem,
} from "@/lib/content-types";

export function createBlogBlockId() {
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}
	return `block-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

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
		content: [{ id: createBlogBlockId(), type: "paragraph", text: "" }],
	};
}

export function newBlock(type: BlogContentBlock["type"]): BlogContentBlock {
	const id = createBlogBlockId();
	if (type === "heading") return { id, type: "heading", text: "" };
	if (type === "paragraph") return { id, type: "paragraph", text: "" };
	if (type === "image")
		return { id, type: "image", src: "", alt: "", caption: "" };
	if (type === "quote") return { id, type: "quote", text: "", cite: "" };
	if (type === "code") return { id, type: "code", language: "bash", code: "" };
	return { id, type: "list", ordered: false, items: [""] };
}

export function parseItems(value: string) {
	// Keep raw spacing/newlines while typing; sanitize later on save/render if needed.
	return value.split("\n");
}

export function itemsToText(items: string[]) {
	return items.join("\n");
}

export function postLabel(post: BlogPost, index: number) {
	if (post.title.trim()) return post.title;
	if (post.slug.trim()) return post.slug;
	return `Untitled Post ${index + 1}`;
}
