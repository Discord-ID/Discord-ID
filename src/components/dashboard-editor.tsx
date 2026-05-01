"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { BlogPostManager } from "@/components/dashboard/blog-post-manager";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { LiveFeedEditor } from "@/components/dashboard/live-feed-editor";
import { ServerInfoRolesEditor } from "@/components/dashboard/server-info-roles-editor";
import { UserAccessManager } from "@/components/dashboard/user-access-manager";
import type {
	BlogPost,
	LiveFeedItem,
	ServerInfoRoleEntry,
	SiteContent,
} from "@/lib/content-types";

export function DashboardEditor() {
	const { data: session } = useSession();
	const [feedItems, setFeedItems] = useState<LiveFeedItem[]>([]);
	const [serverInfoRoles, setServerInfoRoles] = useState<ServerInfoRoleEntry[]>(
		[],
	);
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

				const siteData = (await siteRes.json()) as SiteContent;
				const postsData = await postsRes.json();

				setFeedItems(siteData.liveCommunityFeed ?? []);

				let rolesPayload: ServerInfoRoleEntry[] = [];
				if (Array.isArray(siteData.serverInfoRoles)) {
					rolesPayload = siteData.serverInfoRoles;
				} else {
					const raw = siteData as unknown as {
						serverInfoVisibleRoleIds?: unknown;
					};
					if (Array.isArray(raw.serverInfoVisibleRoleIds)) {
						const legacy = raw.serverInfoVisibleRoleIds.filter(
							(id): id is string => typeof id === "string",
						);
						rolesPayload = legacy.map((roleId) => ({ roleId }));
					}
				}
				setServerInfoRoles(rolesPayload);

				setPosts(postsData ?? []);
			} catch {
				setStatus("Gagal memuat data dashboard");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	async function saveSiteContent() {
		try {
			setStatus("Menyimpan konten situs...");
			const response = await fetch("/api/admin/site-content", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					liveCommunityFeed: feedItems.filter(
						(item) => item.tag.trim() || item.text.trim(),
					),
					serverInfoRoles,
				} satisfies SiteContent),
			});
			if (!response.ok) throw new Error();
			setStatus(
				"Tersimpan: Live feed + pengaturan Server Info (role & deskripsi) ✅",
			);
		} catch {
			setStatus("Konten situs gagal disimpan ❌");
		}
	}

	async function savePosts() {
		try {
			setStatus("Menyimpan blog posts...");
			const normalizeSlugForSave = (value: string) =>
				value
					.toLowerCase()
					.replace(/[^a-z0-9\s-]/g, "")
					.replace(/\s+/g, "-")
					.replace(/-+/g, "-")
					.replace(/^-+/, "")
					.replace(/-+$/, "");

			const payload = posts.map((post) => ({
				...post,
				slug: normalizeSlugForSave(post.slug),
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
				content: post.markdown,
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
			<div className="mx-auto max-w-6xl">
				<div className="pb-8">
					<p
						style={{
							fontSize: 12,
							color: "#ef4444",
							letterSpacing: "0.08em",
							textTransform: "uppercase",
							fontWeight: 700,
						}}
					>
						Dashboard
					</p>
					<h1
						style={{
							fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
							fontWeight: 800,
							letterSpacing: "-0.02em",
						}}
					>
						Kelola konten situs
					</h1>
					<p style={{ color: "rgba(245,245,247,0.55)", marginTop: 8 }}>
						Setiap blok di bawah mengurus satu area. Klik judul blok untuk
						membuka atau menutup isinya — pilihan buka/tutup diingat di browser
						kamu. Blog dan tim punya penyimpanan tersendiri; tombol simpan pada
						blok Beranda atau Server Info menyimpan Live feed bersama pengaturan
						role halaman Server Info dalam satu kali kirim.
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

				<div className="flex flex-col gap-5">
					<DashboardPanel
						id="dashboard-beranda"
						defaultOpen
						kicker="Beranda"
						title="Live Community Feed"
						description="Cuplikan aktivitas atau pengumuman singkat di halaman utama."
					>
						<LiveFeedEditor
							feedItems={feedItems}
							onChange={setFeedItems}
							onSave={saveSiteContent}
						/>
					</DashboardPanel>

					<DashboardPanel
						id="dashboard-server-info"
						kicker="Halaman publik"
						title="Server Info"
						description="Pilih role guild yang boleh dilihat publik di /server-info beserta deskripsi singkat per role."
					>
						<ServerInfoRolesEditor
							serverInfoRoles={serverInfoRoles}
							onChange={setServerInfoRoles}
							onSave={saveSiteContent}
						/>
					</DashboardPanel>

					<DashboardPanel
						id="dashboard-blog"
						kicker="Konten"
						title="Blog"
						description="Artikel Markdown, thumbnail, draft/published."
					>
						<BlogPostManager
							posts={posts}
							onChange={setPosts}
							onSave={savePosts}
							canDeletePost={
								session?.role === "admin" || session?.role === "dev"
							}
							currentAdmin={{
								discordId: session?.user?.id,
								name: session?.user?.name,
								avatarUrl: session?.user?.image,
							}}
						/>
					</DashboardPanel>

					<DashboardPanel
						id="dashboard-team"
						kicker="Tim & izin"
						title="Akses dashboard"
						description="Moderator / admin / dev yang boleh masuk dashboard dan pengaturan tulisan."
					>
						<UserAccessManager
							role={session?.role}
							currentUserId={session?.user?.id}
						/>
					</DashboardPanel>
				</div>
			</div>
		</main>
	);
}
