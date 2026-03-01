import Image from "next/image";
import Link from "next/link";
import { getAllPosts, getAuthorProfilesForPosts } from "@/lib/blog-posts";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
	return new Date(value).toLocaleDateString("id-ID", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

export default async function BlogPage() {
	const posts = await getAllPosts();
	const authorProfiles = await getAuthorProfilesForPosts(posts);

	return (
		<main
			className="min-h-screen px-6 py-14 md:py-20"
			style={{ background: "#0a0a0b", color: "#f5f5f7" }}
		>
			<div className="mx-auto max-w-5xl">
				<div className="mb-10 space-y-3">
					<p
						style={{
							fontSize: 12,
							fontWeight: 600,
							letterSpacing: "0.1em",
							textTransform: "uppercase",
							color: "#ef4444",
						}}
					>
						Discord ID Blog
					</p>
					<h1
						style={{
							fontSize: "clamp(1.9rem, 3.8vw, 3rem)",
							fontWeight: 700,
							letterSpacing: "-0.03em",
						}}
					>
						Update & Insight Komunitas
					</h1>
					<p
						style={{
							color: "rgba(245,245,247,0.6)",
							fontSize: 14,
							maxWidth: 700,
						}}
					>
						Jelajahi artikel terbaru, tips, dan wawasan dari komunitas Discord
						ID. Temukan update eksklusif dan diskusi mendalam tentang
						pengembangan, teknologi, dan tren terkini.
					</p>
				</div>

				<div className="grid gap-4 md:gap-5">
					{posts.map((post) => {
						const authorProfile = post.authorAdminId
							? authorProfiles[post.authorAdminId]
							: undefined;

						return (
							<article
								key={post.slug}
								style={{
									border: "1px solid rgba(255,255,255,0.08)",
									background: "rgba(255,255,255,0.03)",
									borderRadius: 16,
									padding: "18px 20px",
								}}
							>
								{post.coverImage ? (
									<div
										style={{
											marginBottom: 14,
											borderRadius: 12,
											overflow: "hidden",
											border: "1px solid rgba(255,255,255,0.08)",
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

								<div className="mb-2 flex flex-wrap items-center gap-2">
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

								<h2
									style={{
										fontSize: 22,
										fontWeight: 700,
										letterSpacing: "-0.02em",
									}}
								>
									<Link
										href={`/blog/${post.slug}`}
										style={{ color: "#f5f5f7", textDecoration: "none" }}
									>
										{post.title}
									</Link>
								</h2>

								<p
									style={{
										fontSize: 14,
										lineHeight: 1.7,
										color: "rgba(245,245,247,0.55)",
										marginTop: 10,
									}}
								>
									{post.excerpt}
								</p>

								<div
									className="mt-3 flex flex-wrap items-center gap-2"
									style={{ fontSize: 12, color: "rgba(245,245,247,0.45)" }}
								>
									{authorProfile?.avatarUrl ? (
										<Image
											src={authorProfile.avatarUrl}
											alt={authorProfile.name}
											width={20}
											height={20}
											style={{
												borderRadius: "9999px",
												border: "1px solid rgba(255,255,255,0.12)",
											}}
										/>
									) : null}
									<span>{post.author}</span>
									<span>•</span>
									<span>{formatDate(post.publishedAt)}</span>
								</div>
							</article>
						);
					})}
				</div>
			</div>
		</main>
	);
}
