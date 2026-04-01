import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { BlogContentBlock } from "@/lib/blog-posts";
import { getAuthorProfilesForPosts, getPostBySlug } from "@/lib/blog-posts";

export const dynamic = "force-dynamic";

type PostPageProps = {
	params: Promise<{ slug: string }>;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
	day: "2-digit",
	month: "long",
	year: "numeric",
});

function renderContentBlock(block: BlogContentBlock, index: number) {
	if (block.type === "heading") {
		return (
			<h2
				key={`${block.type}-${index}`}
				style={{
					fontSize: "clamp(1.2rem, 2vw, 1.6rem)",
					fontWeight: 700,
					letterSpacing: "-0.02em",
					marginTop: 4,
				}}
			>
				{block.text}
			</h2>
		);
	}

	if (block.type === "paragraph") {
		return (
			<p
				key={`${block.type}-${index}`}
				style={{
					fontSize: 15,
					lineHeight: 1.8,
					color: "rgba(245,245,247,0.72)",
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
				key={`${block.type}-${index}`}
				style={{
					margin: 0,
					borderRadius: 14,
					overflow: "hidden",
					border: "1px solid rgba(255,255,255,0.08)",
					background: "rgba(255,255,255,0.02)",
				}}
			>
				<Image
					src={block.src}
					alt={block.alt}
					width={1200}
					height={630}
					style={{ display: "block", width: "100%", height: "auto" }}
				/>
				{block.caption ? (
					<figcaption
						style={{
							fontSize: 12,
							color: "rgba(245,245,247,0.45)",
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
				key={`${block.type}-${index}`}
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
					“{block.text}”
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
				key={`${block.type}-${index}`}
				style={{
					borderRadius: 12,
					border: "1px solid rgba(255,255,255,0.1)",
					background: "rgba(0,0,0,0.35)",
					overflow: "hidden",
				}}
			>
				<div
					style={{
						padding: "8px 12px",
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
						padding: "14px 16px",
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
			key={`${block.type}-${index}`}
			style={{
				paddingLeft: 20,
				margin: 0,
				color: "rgba(245,245,247,0.72)",
				lineHeight: 1.8,
				fontSize: 15,
			}}
		>
			{block.items.map((item) => (
				<li key={item}>{item}</li>
			))}
		</ListTag>
	);
}

export async function generateMetadata({
	params,
}: PostPageProps): Promise<Metadata> {
	const { slug } = await params;
	const post = await getPostBySlug(slug);

	if (!post) {
		return { title: "Post tidak ditemukan | Discord ID Blog" };
	}

	const imageUrl = post.coverImage?.src ?? "/discord-id.svg";

	return {
		title: `${post.title} | Discord ID Blog`,
		description: post.excerpt,
		openGraph: {
			title: `${post.title} | Discord ID Blog`,
			description: post.excerpt,
			type: "article",
			images: [
				{
					url: imageUrl,
					alt: post.coverImage?.alt ?? post.title,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: `${post.title} | Discord ID Blog`,
			description: post.excerpt,
			images: [imageUrl],
		},
	};
}

export default async function BlogPostPage({ params }: PostPageProps) {
	const { slug } = await params;
	const post = await getPostBySlug(slug);

	if (!post) {
		notFound();
	}

	const authorProfiles = await getAuthorProfilesForPosts([post]);
	const authorProfile = post.authorAdminId
		? authorProfiles[post.authorAdminId]
		: undefined;

	return (
		<main
			className="min-h-screen px-6 py-14 md:py-20"
			style={{ background: "#0a0a0b", color: "#f5f5f7" }}
		>
			<div className="mx-auto max-w-3xl">
				<Link
					href="/blog"
					style={{
						display: "inline-block",
						fontSize: 13,
						color: "rgba(245,245,247,0.6)",
						textDecoration: "none",
						marginBottom: 18,
					}}
				>
					← Kembali ke Blog
				</Link>

				<div className="mb-5 flex flex-wrap items-center gap-2">
					{post.tags.map((tag) => (
						<span
							key={tag}
							style={{
								fontSize: 11,
								padding: "4px 8px",
								borderRadius: 9999,
								background: "rgba(239,68,68,0.14)",
								color: "#ef4444",
								fontWeight: 600,
							}}
						>
							{tag}
						</span>
					))}
				</div>

				<h1
					style={{
						fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
						fontWeight: 700,
						letterSpacing: "-0.03em",
						lineHeight: 1.2,
					}}
				>
					{post.title}
				</h1>

				<div
					className="mt-3 mb-8 flex flex-wrap items-center gap-2"
					style={{ fontSize: 13, color: "rgba(245,245,247,0.45)" }}
				>
					{authorProfile?.avatarUrl ? (
						<Image
							src={authorProfile.avatarUrl}
							alt={authorProfile.name}
							width={22}
							height={22}
							style={{
								borderRadius: "9999px",
								border: "1px solid rgba(255,255,255,0.12)",
							}}
						/>
					) : null}
					<span>{post.author}</span>
					<span>•</span>
					<span>{dateFormatter.format(new Date(post.publishedAt))}</span>
				</div>

				{post.coverImage ? (
					<div
						style={{
							borderRadius: 14,
							overflow: "hidden",
							border: "1px solid rgba(255,255,255,0.08)",
							marginBottom: 18,
						}}
					>
						<Image
							src={post.coverImage.src}
							alt={post.coverImage.alt}
							width={1200}
							height={630}
							style={{
								display: "block",
								width: "100%",
								height: "auto",
								aspectRatio: "1200 / 630",
								objectFit: "cover",
							}}
						/>
					</div>
				) : null}

				<article
					style={{
						border: "1px solid rgba(255,255,255,0.08)",
						background: "rgba(255,255,255,0.03)",
						borderRadius: 16,
						padding: "20px",
					}}
				>
					<div className="space-y-4">
						{post.content.map((block, index) =>
							renderContentBlock(block, index),
						)}
					</div>

					{post.sourceUrl ? (
						<div
							style={{
								marginTop: 20,
								paddingTop: 14,
								borderTop: "1px solid rgba(255,255,255,0.08)",
							}}
						>
							<a
								href={post.sourceUrl}
								target="_blank"
								rel="noreferrer"
								style={{
									fontSize: 13,
									color: "#ef4444",
									textDecoration: "none",
									fontWeight: 600,
								}}
							>
								Lihat referensi resmi ↗
							</a>
						</div>
					) : null}
				</article>
			</div>
		</main>
	);
}
