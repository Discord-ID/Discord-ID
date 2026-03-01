"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BlogPostManager } from "@/components/dashboard/blog-post-manager";
import { UserAccessManager } from "@/components/dashboard/user-access-manager";
import { LiveFeedEditor } from "@/components/dashboard/live-feed-editor";
import type { BlogPost, LiveFeedItem, SiteContent } from "@/lib/content-types";

export function DashboardEditor() {
	const { data: session } = useSession();
	const [feedItems, setFeedItems] = useState<LiveFeedItem[]>([]);
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [status, setStatus] = useState<string>("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				const [siteRes, postsRes] = await Promise.all([
					fetch("/api/admin/site-content"),
					fetch("/api/admin/blog-posts"),
				]);

				if (!siteRes.ok || !postsRes.ok) {
					throw new Error("Failed to fetch data");
				}

				const siteData = await siteRes.json();
				const postsData = await postsRes.json();

				setFeedItems(siteData.liveCommunityFeed ?? []);
				setPosts(postsData ?? []);
			} catch {
				setStatus("Gagal memuat data dashboard");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	async function saveFeed() {
		try {
			setStatus("Menyimpan feed...");
			const response = await fetch("/api/admin/site-content", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					liveCommunityFeed: feedItems.filter(
						(item) => item.tag.trim() || item.text.trim(),
					),
				} satisfies SiteContent),
			});
			if (!response.ok) throw new Error();
			setStatus("Live Community Feed berhasil disimpan ✅");
		} catch {
			setStatus("Feed gagal disimpan ❌");
		}
	}

	async function savePosts() {
		try {
			setStatus("Menyimpan blog posts...");
			const payload = posts.map((post) => ({
				...post,
				status: post.status === "draft" ? "draft" : "published",
				authorAdminId: post.authorAdminId?.trim() || undefined,
				tags: post.tags.map((tag) => tag.trim()).filter(Boolean),
				sourceUrl: post.sourceUrl?.trim() || undefined,
				coverImage:
					post.coverImage?.src?.trim() || post.coverImage?.alt?.trim()
						? {
								src: post.coverImage?.src?.trim() ?? "",
								alt: post.coverImage?.alt?.trim() ?? "",
							}
						: undefined,
				content: post.content,
			}));
			const response = await fetch("/api/admin/blog-posts", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!response.ok) throw new Error();
			setStatus("Blog posts berhasil disimpan ✅");
		} catch {
			setStatus("Blog posts gagal disimpan ❌");
		}
	}

	if (loading) {
		return (
			<main
				className="min-h-screen px-6 py-10"
				style={{ background: "#0a0a0b", color: "#f5f5f7" }}
			>
				<div className="mx-auto max-w-6xl">Loading dashboard...</div>
			</main>
		);
	}

	return (
		<main
			className="min-h-screen px-6 py-10"
			style={{ background: "#0a0a0b", color: "#f5f5f7" }}
		>
			<div className="mx-auto max-w-6xl space-y-8">
				<div>
					<p
						style={{
							fontSize: 12,
							color: "#ef4444",
							letterSpacing: "0.08em",
							textTransform: "uppercase",
							fontWeight: 700,
						}}
					>
						Dashboard Editor
					</p>
					<h1
						style={{
							fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
							fontWeight: 800,
							letterSpacing: "-0.02em",
						}}
					>
						Kelola Konten Situs
					</h1>
					<p style={{ color: "rgba(245,245,247,0.55)", marginTop: 8 }}>
						Editor disederhanakan: pilih post dari daftar kiri, lalu edit satu
						post sekali waktu atau buat post baru.
					</p>
					{status ? (
						<p
							style={{
								marginTop: 10,
								fontSize: 13,
								color: "rgba(245,245,247,0.8)",
							}}
						>
							{status}
						</p>
					) : null}
				</div>

				<LiveFeedEditor
					feedItems={feedItems}
					onChange={setFeedItems}
					onSave={saveFeed}
				/>
				<BlogPostManager
					posts={posts}
					onChange={setPosts}
					onSave={savePosts}
					canDeletePost={session?.role === "admin"}
					currentAdmin={{
						discordId: session?.user?.id,
						name: session?.user?.name,
						avatarUrl: session?.user?.image,
					}}
				/>
				<UserAccessManager role={session?.role} />
			</div>
		</main>
	);
}
