import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { BlogContentBlock, BlogPost } from "@/lib/content-types";
import {
	createBlogBlockId,
	emptyPost,
	itemsToText,
	newBlock,
	parseItems,
	postLabel,
} from "./helpers";
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

function PreviewModal({
	post,
	onClose,
}: {
	post: BlogPost;
	onClose: () => void;
}) {
	function renderPreviewBlock(block: BlogContentBlock) {
		if (block.type === "heading") {
			return (
				<h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
					{block.text}
				</h3>
			);
		}

		if (block.type === "paragraph") {
			return (
				<p
					style={{
						fontSize: 14,
						lineHeight: 1.8,
						color: "rgba(245,245,247,0.74)",
						whiteSpace: "pre-wrap",
					}}
				>
					{block.text}
				</p>
			);
		}

		if (block.type === "image") {
			return (
				<figure
					style={{
						margin: 0,
						borderRadius: 12,
						overflow: "hidden",
						border: "1px solid rgba(255,255,255,0.08)",
					}}
				>
					<Image
						src={block.src}
						alt={block.alt}
						width={800}
						height={600}
						style={{ display: "block", width: "100%", height: "auto" }}
					/>
					{block.caption ? (
						<figcaption
							style={{
								fontSize: 12,
								color: "rgba(245,245,247,0.5)",
								padding: "10px 12px",
							}}
						>
							{block.caption}
						</figcaption>
					) : null}
				</figure>
			);
		}

		if (block.type === "quote") {
			return (
				<blockquote
					style={{
						margin: 0,
						padding: "14px 16px",
						borderLeft: "3px solid #ef4444",
						background: "rgba(239,68,68,0.08)",
						borderRadius: 10,
					}}
				>
					<p
						style={{
							fontSize: 14,
							lineHeight: 1.75,
							color: "rgba(245,245,247,0.85)",
							margin: 0,
							whiteSpace: "pre-wrap",
						}}
					>
						&quot;{block.text}&quot;
					</p>
					{block.cite ? (
						<cite
							style={{
								display: "block",
								fontSize: 12,
								fontStyle: "normal",
								color: "rgba(245,245,247,0.5)",
								marginTop: 8,
							}}
						>
							— {block.cite}
						</cite>
					) : null}
				</blockquote>
			);
		}

		if (block.type === "code") {
			return (
				<div
					style={{
						margin: 0,
						borderRadius: 10,
						border: "1px solid rgba(255,255,255,0.1)",
						background: "rgba(0,0,0,0.35)",
						overflow: "hidden",
					}}
				>
					<div
						style={{
							padding: "8px 10px",
							fontSize: 12,
							fontWeight: 700,
							color: "rgba(245,245,247,0.55)",
							borderBottom: "1px solid rgba(255,255,255,0.08)",
							textTransform: "lowercase",
						}}
					>
						{block.language || "text"}
					</div>
					<pre
						style={{
							margin: 0,
							padding: "12px 14px",
							fontSize: 13,
							lineHeight: 1.65,
							color: "#f5f5f7",
							whiteSpace: "pre-wrap",
							overflowX: "auto",
						}}
					>
						<code>{block.code}</code>
					</pre>
				</div>
			);
		}

		const ListTag = block.ordered ? "ol" : "ul";
		return (
			<ListTag
				style={{
					paddingLeft: 20,
					margin: 0,
					color: "rgba(245,245,247,0.74)",
					lineHeight: 1.8,
					fontSize: 14,
				}}
			>
				{block.items.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ListTag>
		);
	}

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 70,
				background: "rgba(0,0,0,0.68)",
				display: "grid",
				placeItems: "center",
				padding: 16,
			}}
		>
			<div
				style={{
					width: "min(860px, 100%)",
					maxHeight: "88vh",
					overflow: "auto",
					borderRadius: 16,
					border: "1px solid rgba(255,255,255,0.12)",
					background: "#0f1012",
					padding: 18,
				}}
			>
				<div className="mb-4 flex items-center justify-between gap-2">
					<h3 style={{ fontSize: 18, fontWeight: 800 }}>Preview Halaman</h3>
					<SmallButton onClick={onClose}>Tutup</SmallButton>
				</div>

				<div
					style={{
						border: "1px solid rgba(255,255,255,0.08)",
						borderRadius: 14,
						padding: 16,
						background: "rgba(255,255,255,0.02)",
					}}
				>
					<p
						style={{
							fontSize: 12,
							color: "rgba(245,245,247,0.5)",
							marginBottom: 6,
						}}
					>
						Status: {post.status === "draft" ? "Draft" : "Published"}
					</p>
					<h2
						style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em" }}
					>
						{post.title || "Untitled"}
					</h2>
					<div
						className="mt-2 mb-4 flex flex-wrap items-center gap-2"
						style={{ fontSize: 13, color: "rgba(245,245,247,0.5)" }}
					>
						<span>{post.author || "Unknown author"}</span>
						<span>•</span>
						<span>{post.publishedAt || "No date"}</span>
					</div>

					<p
						style={{
							fontSize: 14,
							color: "rgba(245,245,247,0.68)",
							lineHeight: 1.7,
						}}
					>
						{post.excerpt}
					</p>

					<div className="mt-4 space-y-4">
						{post.content.map((block) => (
							<div key={block.id ?? createBlogBlockId()}>
								{renderPreviewBlock(block)}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

const PostEditor = memo(function PostEditor({
	post,
	currentAdmin,
	canDeletePost,
	onChange,
	onDelete,
	onPreview,
}: {
	post: BlogPost;
	currentAdmin: CurrentAdmin;
	canDeletePost: boolean;
	onChange: (post: BlogPost) => void;
	onDelete: () => void;
	onPreview: () => void;
}) {
	function updatePost(patch: Partial<BlogPost>) {
		onChange({ ...post, ...patch });
	}

	function updateBlock(blockIndex: number, block: BlogContentBlock) {
		const nextBlocks = [...post.content];
		nextBlocks[blockIndex] = block;
		updatePost({ content: nextBlocks });
	}

	return (
		<div
			style={{
				border: "1px solid rgba(255,255,255,0.1)",
				borderRadius: 12,
				padding: 12,
				background: "rgba(255,255,255,0.02)",
			}}
		>
			<div className="mb-2 flex flex-wrap gap-2">
				<SmallButton onClick={onPreview}>Preview</SmallButton>
				{canDeletePost ? (
					<SmallButton variant="danger" onClick={onDelete}>
						Hapus Post
					</SmallButton>
				) : null}
			</div>

			<div className="grid gap-2 md:grid-cols-2">
				<select
					value={post.status === "draft" ? "draft" : "published"}
					onChange={(event) =>
						updatePost({
							status: event.target.value === "draft" ? "draft" : "published",
						})
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
					onChange={(event) => updatePost({ publishedAt: event.target.value })}
				/>

				<Input
					placeholder="Slug"
					value={post.slug}
					onChange={(event) =>
						updatePost({ slug: normalizeSlugInput(event.target.value) })
					}
					style={{ gridColumn: "1 / -1" }}
				/>
				<Input
					placeholder="Judul"
					value={post.title}
					onChange={(event) => updatePost({ title: event.target.value })}
					style={{ gridColumn: "1 / -1" }}
				/>
				<Textarea
					rows={2}
					placeholder="Excerpt"
					value={post.excerpt}
					onChange={(event) => updatePost({ excerpt: event.target.value })}
					style={{ gridColumn: "1 / -1" }}
				/>
				<Input
					placeholder="Author"
					value={post.author}
					onChange={(event) => updatePost({ author: event.target.value })}
				/>
				<Input
					placeholder="Admin ID"
					value={post.authorAdminId ?? ""}
					onChange={(event) =>
						updatePost({ authorAdminId: event.target.value || undefined })
					}
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
					onChange={(event) =>
						updatePost({
							tags: event.target.value.split(","),
						})
					}
				/>
				<Input
					type="url"
					placeholder="Cover URL"
					value={post.coverImage?.src ?? ""}
					onChange={(event) =>
						updatePost({
							coverImage: {
								src: event.target.value,
								alt: post.coverImage?.alt ?? "",
							},
						})
					}
					style={{ gridColumn: "1 / -1" }}
				/>
				<Input
					placeholder="Cover Alt"
					value={post.coverImage?.alt ?? ""}
					onChange={(event) =>
						updatePost({
							coverImage: {
								src: post.coverImage?.src ?? "",
								alt: event.target.value,
							},
						})
					}
					style={{ gridColumn: "1 / -1" }}
				/>
				<Input
					type="url"
					placeholder="Source URL"
					value={post.sourceUrl ?? ""}
					onChange={(event) => updatePost({ sourceUrl: event.target.value })}
					style={{ gridColumn: "1 / -1" }}
				/>
			</div>

			<div
				style={{
					marginTop: 12,
					borderTop: "1px solid rgba(255,255,255,0.08)",
					paddingTop: 12,
				}}
			>
				<div className="mb-2 flex flex-wrap gap-2">
					<SmallButton
						onClick={() =>
							updatePost({ content: [...post.content, newBlock("heading")] })
						}
					>
						+ Heading
					</SmallButton>
					<SmallButton
						onClick={() =>
							updatePost({ content: [...post.content, newBlock("paragraph")] })
						}
					>
						+ Paragraph
					</SmallButton>
					<SmallButton
						onClick={() =>
							updatePost({ content: [...post.content, newBlock("image")] })
						}
					>
						+ Image
					</SmallButton>
					<SmallButton
						onClick={() =>
							updatePost({ content: [...post.content, newBlock("quote")] })
						}
					>
						+ Quote
					</SmallButton>
					<SmallButton
						onClick={() =>
							updatePost({ content: [...post.content, newBlock("list")] })
						}
					>
						+ List
					</SmallButton>
					<SmallButton
						onClick={() =>
							updatePost({ content: [...post.content, newBlock("code")] })
						}
					>
						+ Code Block
					</SmallButton>
				</div>

				<div className="space-y-3">
					{post.content.map((block, blockIndex) => (
						<div
							key={block.id ?? createBlogBlockId()}
							style={{
								border: "1px solid rgba(255,255,255,0.08)",
								borderRadius: 10,
								padding: 10,
							}}
						>
							<div className="mb-2 flex flex-wrap gap-2">
								<SmallButton
									onClick={() => {
										if (blockIndex === 0) return;
										const nextBlocks = [...post.content];
										const [moved] = nextBlocks.splice(blockIndex, 1);
										nextBlocks.splice(blockIndex - 1, 0, moved);
										updatePost({ content: nextBlocks });
									}}
								>
									↑
								</SmallButton>
								<SmallButton
									onClick={() => {
										if (blockIndex >= post.content.length - 1) return;
										const nextBlocks = [...post.content];
										const [moved] = nextBlocks.splice(blockIndex, 1);
										nextBlocks.splice(blockIndex + 1, 0, moved);
										updatePost({ content: nextBlocks });
									}}
								>
									↓
								</SmallButton>
								<SmallButton
									variant="danger"
									onClick={() =>
										updatePost({
											content: post.content.filter(
												(_, currentIndex) => currentIndex !== blockIndex,
											),
										})
									}
								>
									Hapus
								</SmallButton>
								<strong style={{ fontSize: 12 }}>{block.type}</strong>
							</div>

							{(block.type === "heading" || block.type === "paragraph") && (
								<Textarea
									rows={block.type === "heading" ? 2 : 4}
									value={block.text}
									onChange={(event) =>
										updateBlock(blockIndex, {
											...block,
											text: event.target.value,
										})
									}
								/>
							)}

							{block.type === "image" && (
								<div className="grid gap-2 md:grid-cols-2">
									<Input
										type="url"
										placeholder="Image URL"
										value={block.src}
										onChange={(event) =>
											updateBlock(blockIndex, {
												...block,
												src: event.target.value,
											})
										}
										style={{ gridColumn: "1 / -1" }}
									/>
									<Input
										placeholder="Alt"
										value={block.alt}
										onChange={(event) =>
											updateBlock(blockIndex, {
												...block,
												alt: event.target.value,
											})
										}
									/>
									<Input
										placeholder="Caption"
										value={block.caption ?? ""}
										onChange={(event) =>
											updateBlock(blockIndex, {
												...block,
												caption: event.target.value,
											})
										}
									/>
								</div>
							)}

							{block.type === "quote" && (
								<>
									<Textarea
										rows={3}
										placeholder="Quote text"
										value={block.text}
										onChange={(event) =>
											updateBlock(blockIndex, {
												...block,
												text: event.target.value,
											})
										}
									/>
									<Input
										placeholder="Cite"
										value={block.cite ?? ""}
										onChange={(event) =>
											updateBlock(blockIndex, {
												...block,
												cite: event.target.value,
											})
										}
									/>
								</>
							)}

							{block.type === "code" && (
								<div className="grid gap-2">
									<Input
										placeholder="Language (contoh: bash, ts, js)"
										value={block.language ?? ""}
										onChange={(event) =>
											updateBlock(blockIndex, {
												...block,
												language: event.target.value,
											})
										}
									/>
									<Textarea
										rows={8}
										// placeholder={"lucu lucu miaww\n# catcatcat\nnyaaa~~~"}
										value={block.code}
										onChange={(event) =>
											updateBlock(blockIndex, {
												...block,
												code: event.target.value,
											})
										}
										style={{ fontFamily: "monospace", lineHeight: 1.6 }}
									/>
								</div>
							)}

							{block.type === "list" && (
								<>
									<label
										className="flex items-center gap-2"
										style={{ fontSize: 12 }}
									>
										<input
											type="checkbox"
											checked={Boolean(block.ordered)}
											onChange={(event) =>
												updateBlock(blockIndex, {
													...block,
													ordered: event.target.checked,
												})
											}
										/>
										Ordered list
									</label>
									<Textarea
										rows={4}
										placeholder="Satu baris satu item"
										value={itemsToText(block.items)}
										onChange={(event) =>
											updateBlock(blockIndex, {
												...block,
												items: parseItems(event.target.value),
											})
										}
									/>
								</>
							)}
						</div>
					))}
				</div>
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
	const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);

	useEffect(() => {
		if (!posts.some((post) => post.content.some((block) => !block.id))) return;
		onChange(
			posts.map((post) => ({
				...post,
				content: post.content.map((block) =>
					block.id ? block : { ...block, id: createBlogBlockId() },
				),
			})),
		);
	}, [onChange, posts]);

	const filteredEntries = useMemo(() => {
		const entries = posts.map((post, index) => ({ post, index }));

		if (filter === "draft") {
			return entries.filter(({ post }) => post.status === "draft");
		}

		if (filter === "published") {
			return entries.filter(({ post }) => post.status !== "draft");
		}

		return entries;
	}, [posts, filter]);

	const selectedEntry =
		filteredEntries.find((entry) => entry.index === selectedIndex) ??
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
			onChange(
				posts.map((post, i) => (i === selectedEntryIndex ? updatedPost : post)),
			);
		},
		[onChange, posts, selectedEntryIndex],
	);

	const handleDelete = useCallback(() => {
		if (!canDeletePost) return;
		onChange(posts.filter((_, i) => i !== selectedEntryIndex));
		setSelectedIndex(Math.max(0, selectedEntryIndex - 1));
	}, [canDeletePost, onChange, posts, selectedEntryIndex]);

	const handlePreview = useCallback(() => {
		setPreviewPost(selectedPost);
	}, [selectedPost]);

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
				<SmallButton onClick={() => setFilter("published")}>
					Published
				</SmallButton>
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
					<p
						style={{
							fontSize: 12,
							color: "rgba(245,245,247,0.65)",
							marginBottom: 10,
						}}
					>
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
											background: active
												? "rgba(239,68,68,0.18)"
												: "rgba(255,255,255,0.02)",
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
							onPreview={handlePreview}
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

			{previewPost ? (
				<PreviewModal post={previewPost} onClose={() => setPreviewPost(null)} />
			) : null}
		</SectionCard>
	);
}
