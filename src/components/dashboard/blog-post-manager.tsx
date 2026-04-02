"use client";

import { memo, useCallback, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { BlogPost } from "@/lib/content-types";
import { previewMarkdownComponents } from "@/lib/markdown-components";
import { emptyPost, postLabel } from "./helpers";
import { Input, SectionCard, SmallButton, Textarea } from "./ui";

type CurrentAdmin = {
	discordId?: string;
	name?: string | null;
	avatarUrl?: string | null;
};

type PostFilter = "all" | "published" | "draft";

function normalizeSlugInput(value: string) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-/, "");
}

function MarkdownPreview({ markdown }: { markdown: string }) {
	if (!markdown.trim()) {
		return (
			<span style={{ color: "rgba(245,245,247,0.3)", fontStyle: "italic", fontSize: 13 }}>
				Belum ada konten...
			</span>
		);
	}
	return (
		<ReactMarkdown remarkPlugins={[remarkGfm]} components={previewMarkdownComponents}>
			{markdown}
		</ReactMarkdown>
	);
}

const PostEditor = memo(function PostEditor({
	post,
	currentAdmin,
	canDeletePost,
	onChange,
	onDelete,
}: {
	post: BlogPost;
	currentAdmin: CurrentAdmin;
	canDeletePost: boolean;
	onChange: (post: BlogPost) => void;
	onDelete: () => void;
}) {
	const [tab, setTab] = useState<"edit" | "preview">("edit");

	function updatePost(patch: Partial<BlogPost>) {
		onChange({ ...post, ...patch });
	}

	const tabStyle = (active: boolean) => ({
		padding: "5px 12px",
		borderRadius: 8,
		border: active
			? "1px solid rgba(239,68,68,0.45)"
			: "1px solid rgba(255,255,255,0.1)",
		background: active ? "rgba(239,68,68,0.18)" : "transparent",
		color: active ? "#ef4444" : "rgba(245,245,247,0.6)",
		cursor: "pointer",
		fontSize: 12,
		fontWeight: 600,
	});

	return (
		<div
			style={{
				border: "1px solid rgba(255,255,255,0.1)",
				borderRadius: 12,
				padding: 12,
				background: "rgba(255,255,255,0.02)",
			}}
		>
			{canDeletePost ? (
				<div className="mb-2">
					<SmallButton variant="danger" onClick={onDelete}>
						Hapus Post
					</SmallButton>
				</div>
			) : null}

			<div className="grid gap-2 md:grid-cols-2">
				<select
					value={post.status === "draft" ? "draft" : "published"}
					onChange={(e) =>
						updatePost({ status: e.target.value === "draft" ? "draft" : "published" })
					}
					style={{
						width: "100%",
						height: 38,
						padding: "0 12px",
						borderRadius: 10,
						border: "1px solid rgba(255,255,255,0.1)",
						background: "rgba(10,10,11,0.7)",
						color: "#f5f5f7",
						fontSize: 13,
					}}
				>
					<option value="published">Published</option>
					<option value="draft">Draft</option>
				</select>
				<Input
					type="date"
					value={post.publishedAt}
					onChange={(e) => updatePost({ publishedAt: e.target.value })}
				/>
				<Input
					placeholder="Slug"
					value={post.slug}
					onChange={(e) => updatePost({ slug: normalizeSlugInput(e.target.value) })}
					style={{ gridColumn: "1 / -1" }}
				/>
				<Input
					placeholder="Judul"
					value={post.title}
					onChange={(e) => updatePost({ title: e.target.value })}
					style={{ gridColumn: "1 / -1" }}
				/>
				<Textarea
					rows={2}
					placeholder="Excerpt"
					value={post.excerpt}
					onChange={(e) => updatePost({ excerpt: e.target.value })}
					style={{ gridColumn: "1 / -1" }}
				/>
				<Input
					placeholder="Author"
					value={post.author}
					onChange={(e) => updatePost({ author: e.target.value })}
				/>
				<Input
					placeholder="Admin ID"
					value={post.authorAdminId ?? ""}
					onChange={(e) => updatePost({ authorAdminId: e.target.value || undefined })}
				/>
				<SmallButton
					onClick={() =>
						updatePost({
							author: currentAdmin.name?.trim() || post.author,
							authorAdminId: currentAdmin.discordId ?? post.authorAdminId,
						})
					}
					style={{ gridColumn: "1 / -1", width: "fit-content" }}
				>
					Gunakan Admin Login
				</SmallButton>
				<Input
					placeholder="Tags (pisah koma)"
					value={post.tags.join(",")}
					onChange={(e) => updatePost({ tags: e.target.value.split(",") })}
				/>
				<Input
					type="url"
					placeholder="Cover URL"
					value={post.coverImage?.src ?? ""}
					onChange={(e) =>
						updatePost({ coverImage: { src: e.target.value, alt: post.coverImage?.alt ?? "" } })
					}
					style={{ gridColumn: "1 / -1" }}
				/>
				<Input
					placeholder="Cover Alt"
					value={post.coverImage?.alt ?? ""}
					onChange={(e) =>
						updatePost({ coverImage: { src: post.coverImage?.src ?? "", alt: e.target.value } })
					}
					style={{ gridColumn: "1 / -1" }}
				/>
				<Input
					type="url"
					placeholder="Source URL"
					value={post.sourceUrl ?? ""}
					onChange={(e) => updatePost({ sourceUrl: e.target.value })}
					style={{ gridColumn: "1 / -1" }}
				/>
			</div>

			<div
				style={{
					marginTop: 14,
					borderTop: "1px solid rgba(255,255,255,0.08)",
					paddingTop: 12,
				}}
			>
				<div className="mb-3 flex items-center gap-2">
					<span style={{ fontSize: 12, color: "rgba(245,245,247,0.5)", marginRight: 4 }}>
						Konten
					</span>
					<button type="button" style={tabStyle(tab === "edit")} onClick={() => setTab("edit")}>
						Edit
					</button>
					<button type="button" style={tabStyle(tab === "preview")} onClick={() => setTab("preview")}>
						Preview
					</button>
					<span style={{ fontSize: 11, color: "rgba(245,245,247,0.3)", marginLeft: "auto" }}>
						Markdown
					</span>
				</div>

				{tab === "edit" ? (
					<Textarea
						rows={20}
						placeholder={`# Judul Section\n\nParagraf biasa, **bold**, *italic*, ~~coret~~\n\n## Subheading\n\n- item list\n- item lain\n\n1. nomor satu\n2. nomor dua\n\n> blockquote\n\n\`\`\`js\nconsole.log("code block")\n\`\`\`\n\n| Kolom 1 | Kolom 2 |\n|---------|----------|\n| data    | data     |`}
						value={post.markdown}
						onChange={(e) => updatePost({ markdown: e.target.value })}
						style={{ fontFamily: "ui-monospace, monospace", lineHeight: 1.65, fontSize: 13 }}
					/>
				) : (
					<div
						style={{
							border: "1px solid rgba(255,255,255,0.08)",
							borderRadius: 10,
							padding: "14px 16px",
							minHeight: 200,
							background: "rgba(0,0,0,0.2)",
						}}
					>
						<MarkdownPreview markdown={post.markdown} />
					</div>
				)}
			</div>
		</div>
	);
});

export function BlogPostManager({
	posts,
	onChange,
	onSave,
	currentAdmin,
	canDeletePost,
}: {
	posts: BlogPost[];
	onChange: (posts: BlogPost[]) => void;
	onSave: () => void;
	currentAdmin: CurrentAdmin;
	canDeletePost: boolean;
}) {
	const [filter, setFilter] = useState<PostFilter>("all");
	const [selectedIndex, setSelectedIndex] = useState(0);

	const filteredEntries = useMemo(() => {
		const entries = posts.map((post, index) => ({ post, index }));
		if (filter === "draft") return entries.filter(({ post }) => post.status === "draft");
		if (filter === "published") return entries.filter(({ post }) => post.status !== "draft");
		return entries;
	}, [posts, filter]);

	const selectedEntry =
		filteredEntries.find((e) => e.index === selectedIndex) ??
		filteredEntries[0] ??
		null;

	const selectedPost = selectedEntry?.post ?? null;
	const selectedEntryIndex = selectedEntry?.index ?? 0;

	function createPost() {
		const nextPosts = [
			...posts,
			{
				...emptyPost(),
				status: "draft" as const,
				author: currentAdmin.name?.trim() || "Admin",
				authorAdminId: currentAdmin.discordId,
			},
		];
		onChange(nextPosts);
		setFilter("draft");
		setSelectedIndex(nextPosts.length - 1);
	}

	const handlePostChange = useCallback(
		(updatedPost: BlogPost) => {
			onChange(posts.map((p, i) => (i === selectedEntryIndex ? updatedPost : p)));
		},
		[onChange, posts, selectedEntryIndex],
	);

	const handleDelete = useCallback(() => {
		if (!canDeletePost) return;
		onChange(posts.filter((_, i) => i !== selectedEntryIndex));
		setSelectedIndex(Math.max(0, selectedEntryIndex - 1));
	}, [canDeletePost, onChange, posts, selectedEntryIndex]);

	return (
		<SectionCard
			title="Blog Home"
			actions={
				<>
					<SmallButton onClick={createPost}>+ Buat Post Baru</SmallButton>
					<button
						type="button"
						onClick={onSave}
						className="btn-red"
						style={{ padding: "8px 14px", fontSize: 13, fontWeight: 700 }}
					>
						Simpan Blog
					</button>
				</>
			}
		>
			<div className="mb-3 flex flex-wrap gap-2">
				<SmallButton onClick={() => setFilter("all")}>Semua</SmallButton>
				<SmallButton onClick={() => setFilter("published")}>Published</SmallButton>
				<SmallButton onClick={() => setFilter("draft")}>Draft</SmallButton>
			</div>

			<div className="grid gap-4 lg:grid-cols-[320px_1fr]">
				<div
					style={{
						border: "1px solid rgba(255,255,255,0.08)",
						borderRadius: 12,
						padding: 12,
						background: "rgba(255,255,255,0.02)",
					}}
				>
					<p style={{ fontSize: 12, color: "rgba(245,245,247,0.65)", marginBottom: 10 }}>
						Pilih post yang mau diedit
					</p>
					<div className="space-y-2">
						{filteredEntries.length ? (
							filteredEntries.map(({ post, index }) => {
								const active = selectedEntry?.index === index;
								return (
									<button
										key={`${post.slug}-${post.title}-${post.publishedAt}`}
										type="button"
										onClick={() => setSelectedIndex(index)}
										style={{
											width: "100%",
											textAlign: "left",
											padding: "10px 12px",
											borderRadius: 10,
											border: active
												? "1px solid rgba(239,68,68,0.45)"
												: "1px solid rgba(255,255,255,0.08)",
											background: active ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.02)",
											color: "#f5f5f7",
											cursor: "pointer",
										}}
									>
										<div style={{ fontWeight: 700, fontSize: 13 }}>
											{postLabel(post, index)}
										</div>
										<div style={{ fontSize: 11, opacity: 0.7 }}>
											{post.status === "draft" ? "Draft" : "Published"} •{" "}
											{post.publishedAt || "No date"}
										</div>
									</button>
								);
							})
						) : (
							<p style={{ fontSize: 13, color: "rgba(245,245,247,0.6)" }}>
								Belum ada post di menu ini.
							</p>
						)}
					</div>
				</div>

				<div>
					{selectedPost ? (
						<PostEditor
							post={selectedPost}
							currentAdmin={currentAdmin}
							canDeletePost={canDeletePost}
							onChange={handlePostChange}
							onDelete={handleDelete}
						/>
					) : (
						<div
							style={{
								border: "1px dashed rgba(255,255,255,0.2)",
								borderRadius: 12,
								padding: 16,
								color: "rgba(245,245,247,0.65)",
							}}
						>
							Pilih post dari panel kiri atau buat post baru.
						</div>
					)}
				</div>
			</div>
		</SectionCard>
	);
}
