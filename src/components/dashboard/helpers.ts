import type {
	BlogContentBlock,
	BlogPost,
	LiveFeedItem,
} from "@/lib/content-types";

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
	return { tag: "", color: "#ef4444", text: "" };
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
		content: [{ type: "paragraph", text: "" }],
	};
}

export function newBlock(type: BlogContentBlock["type"]): BlogContentBlock {
	if (type === "heading") return { type: "heading", text: "" };
	if (type === "paragraph") return { type: "paragraph", text: "" };
	if (type === "image") return { type: "image", src: "", alt: "", caption: "" };
	if (type === "quote") return { type: "quote", text: "", cite: "" };
	return { type: "list", ordered: false, items: [""] };
}

export function parseItems(value: string) {
	return value
		.split("\n")
		.map((entry) => entry.trim())
		.filter(Boolean);
}

export function itemsToText(items: string[]) {
	return items.join("\n");
}

export function blockStableKey(block: BlogContentBlock) {
	if (block.type === "heading" || block.type === "paragraph") {
		return `${block.type}-${block.text}`;
	}

	if (block.type === "image") {
		return `${block.type}-${block.src}-${block.alt}-${block.caption ?? ""}`;
	}

	if (block.type === "quote") {
		return `${block.type}-${block.text}-${block.cite ?? ""}`;
	}

	return `${block.type}-${block.ordered ? "ordered" : "unordered"}-${block.items.join("|")}`;
}

export function postLabel(post: BlogPost, index: number) {
	if (post.title.trim()) return post.title;
	if (post.slug.trim()) return post.slug;
	return `Untitled Post ${index + 1}`;
}
