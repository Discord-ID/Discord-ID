import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAuthorProfilesForPosts, getPostBySlug } from "@/lib/blog-posts";
import { markdownComponents } from "@/lib/markdown-components";

export const dynamic = "force-dynamic";

type PostPageProps = {
	params: Promise<{ slug: string }>;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
	day: "2-digit",
	month: "long",
	year: "numeric",
});

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
	const { slug } = await params;
	const post = await getPostBySlug(slug);
	if (!post) return { title: "Post tidak ditemukan | Discord ID Blog" };
	const imageUrl = post.coverImage?.src ?? "/discord-id.svg";
	return {
		title: `${post.title} | Discord ID Blog`,
		description: post.excerpt,
		openGraph: {
			title: `${post.title} | Discord ID Blog`,
			description: post.excerpt,
			type: "article",
			images: [{ url: imageUrl, alt: post.coverImage?.alt ?? post.title }],
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
	if (!post) notFound();

	const authorProfiles = await getAuthorProfilesForPosts([post]);
	const authorProfile = post.authorAdminId ? authorProfiles[post.authorAdminId] : undefined;

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
							marginBottom: 24,
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
						padding: "28px 24px",
					}}
				>
					<ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
						{post.markdown}
					</ReactMarkdown>

					{post.sourceUrl ? (
						<div
							style={{
								marginTop: 24,
								paddingTop: 16,
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
