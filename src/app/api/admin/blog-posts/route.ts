import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBlogPosts, updateBlogPosts } from "@/lib/content-store";
import type { BlogPost } from "@/lib/content-types";
import { discordLog } from "@/lib/discord-logger";

export const runtime = "nodejs";

async function requireEditor() {
	const session = await getServerSession(authOptions);
	if (!session) {
		return {
			error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
			session: null,
		};
	}

	if (
		session.role !== "dev" &&
		session.role !== "admin" &&
		session.role !== "moderator"
	) {
		return {
			error: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
			session: null,
		};
	}

	return { error: null, session };
}

function isBlogPost(post: unknown): post is BlogPost {
	if (!post || typeof post !== "object") return false;
	const maybe = post as BlogPost;
	return (
		typeof maybe.slug === "string" &&
		typeof maybe.title === "string" &&
		typeof maybe.excerpt === "string" &&
		typeof maybe.publishedAt === "string" &&
		typeof maybe.author === "string" &&
		typeof maybe.markdown === "string" &&
		Array.isArray(maybe.tags)
	);
}

export async function GET() {
	try {
		const auth = await requireEditor();
		if (auth.error) return auth.error;

		const posts = await getBlogPosts();
		return NextResponse.json(posts);
	} catch {
		return NextResponse.json(
			{ message: "Gagal memuat blog posts" },
			{ status: 500 },
		);
	}
}

export async function PUT(request: Request) {
	try {
		const auth = await requireEditor();
		if (auth.error) return auth.error;
		if (!auth.session) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const payload = (await request.json()) as unknown;
		if (!Array.isArray(payload) || !payload.every(isBlogPost)) {
			return NextResponse.json(
				{ message: "Format Blog Posts tidak valid" },
				{ status: 400 },
			);
		}

		if (auth.session.role === "moderator") {
			const existing = await getBlogPosts();
			const incomingSlugSet = new Set(payload.map((post) => post.slug));
			const deletedSlug = existing.find(
				(post) => !incomingSlugSet.has(post.slug),
			);

			if (deletedSlug) {
				return NextResponse.json(
					{ message: "Moderator tidak boleh menghapus post" },
					{ status: 403 },
				);
			}
		}

		const before = await getBlogPosts();
		const updated = await updateBlogPosts(payload);

		const added = updated.filter(
			(post) => !before.find((prev) => prev.slug === post.slug),
		);
		const removed = before.filter(
			(prev) => !updated.find((post) => post.slug === prev.slug),
		);
		const statusChanged = updated.filter((post) => {
			const old = before.find((prev) => prev.slug === post.slug);
			return old && old.status !== post.status;
		});

		await discordLog(
			`BLOG_UPDATE: ${auth.session?.user?.id || "?"} added=${added.map((x) => x.slug).join(",")} removed=${removed.map((x) => x.slug).join(",")} status=${statusChanged.map((x) => `${x.slug}:${x.status}`).join(",")}`,
		);

		return NextResponse.json(updated);
	} catch {
		return NextResponse.json(
			{ message: "Gagal menyimpan Blog Posts" },
			{ status: 500 },
		);
	}
}
