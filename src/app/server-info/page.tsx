"use client";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ServerInfoRoleEntry, SiteContent } from "@/lib/content-types";
import { previewMarkdownComponents } from "@/lib/markdown-components";

type GuildRole = {
	id: string;
	name: string;
	color: number;
	position: number;
	mentionable: boolean;
	hoist: boolean;
	managed: boolean;
};

type GuildRolesPayload = {
	ok: boolean;
	guild: {
		id: string;
		name: string;
	};
	summary: {
		total: number;
	};
	roles: GuildRole[];
};

function discordRoleColorRgb(colorInt: number): string | null {
	if (!colorInt) return null;
	const r = (colorInt >> 16) & 0xff;
	const g = (colorInt >> 8) & 0xff;
	const b = colorInt & 0xff;
	return `rgb(${r}, ${g}, ${b})`;
}

type DisplayedGuildRoleRow = GuildRole & { description?: string };

export default function ServerInfoPage() {
	const [data, setData] = useState<GuildRolesPayload | null>(null);
	const [serverInfoRoles, setServerInfoRoles] = useState<ServerInfoRoleEntry[]>(
		[],
	);
	const [siteContentError, setSiteContentError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		Promise.all([
			fetch("/api/public/site-content", { cache: "no-store" }),
			fetch("/api/public/guild-roles", { cache: "no-store" }),
		])
			.then(async ([siteRes, rolesRes]) => {
				if (!rolesRes.ok) throw new Error("Gagal memuat role guild");
				const rolesPayload = (await rolesRes.json()) as GuildRolesPayload;
				if (!rolesPayload?.ok) throw new Error("Response tidak valid");

				let rolesConfig: ServerInfoRoleEntry[] = [];
				if (siteRes.ok) {
					const sitePayload = (await siteRes.json()) as SiteContent;
					if (Array.isArray(sitePayload.serverInfoRoles)) {
						rolesConfig = sitePayload.serverInfoRoles.filter(
							(e): e is ServerInfoRoleEntry =>
								Boolean(e) &&
								typeof e === "object" &&
								typeof e.roleId === "string",
						);
					}
				} else if (isMounted) {
					setSiteContentError(
						"Pengaturan role publik belum dimuat; daftar mungkin kosong sampai halaman dimuat ulang.",
					);
				}

				if (isMounted) {
					setData(rolesPayload);
					setServerInfoRoles(rolesConfig);
					setError(null);
				}
			})
			.catch(() => {
				if (isMounted) setError("Data role belum bisa dimuat sekarang.");
			})
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, []);

	const sortedRoles = useMemo(() => {
		const roles = data?.roles ?? [];
		return [...roles].sort((a, b) => b.position - a.position);
	}, [data?.roles]);

	const displayedRoles = useMemo(() => {
		const map = new Map(sortedRoles.map((r) => [r.id, r]));
		return serverInfoRoles
			.map((entry) => {
				const row = map.get(entry.roleId);
				if (!row) return null;
				const trimmed = entry.description?.trim();
				const withDesc: DisplayedGuildRoleRow = trimmed
					? { ...row, description: trimmed }
					: row;
				return withDesc;
			})
			.filter(Boolean) as DisplayedGuildRoleRow[];
	}, [sortedRoles, serverInfoRoles]);

	return (
		<main
			className="min-h-screen px-6 py-14 md:py-20"
			style={{ background: "#0a0a0b", color: "#f5f5f7" }}
		>
			<div className="mx-auto max-w-6xl space-y-7 md:space-y-8">
				<div
					style={{
						border: "1px solid rgba(255,255,255,0.08)",
						background:
							"linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
						borderRadius: 18,
						padding: "20px 22px",
					}}
				>
					<p
						style={{
							fontSize: 12,
							fontWeight: 600,
							letterSpacing: "0.1em",
							textTransform: "uppercase",
							color: "#ef4444",
							marginBottom: 6,
						}}
					>
						Discord ID Server Info
					</p>
					<h1
						style={{
							fontSize: "clamp(1.9rem, 3.8vw, 3rem)",
							fontWeight: 700,
							letterSpacing: "-0.03em",
							lineHeight: 1.15,
							marginBottom: 4,
						}}
					>
						Role Guild
					</h1>
					<p
						style={{
							color: "rgba(245,245,247,0.62)",
							fontSize: 14,
							maxWidth: 720,
						}}
					>
						{data
							? `${data.guild.name} • ${displayedRoles.length.toLocaleString("id-ID")} role ditampilkan (dipilih dari dashboard) • total guild ${data.summary.total.toLocaleString("id-ID")}`
							: "Memuat daftar role server... "}
						<span style={{ color: "rgba(245,245,247,0.45)" }}>
							{" "}
							Hanya role (dan teks deskripsi) yang diatur di Dashboard yang
							muncul di sini.
						</span>
					</p>
				</div>

				{isLoading ? (
					<section className="space-y-2">
						{Array.from({ length: 8 }).map((_, i) => (
							<div
								key={`skeleton-role-${String(i)}`}
								style={{
									height: 56,
									borderRadius: 12,
									border: "1px solid rgba(255,255,255,0.08)",
									background: "rgba(255,255,255,0.04)",
								}}
							/>
						))}
					</section>
				) : null}

				{error ? (
					<div
						style={{
							border: "1px solid rgba(239,68,68,0.3)",
							background: "rgba(239,68,68,0.08)",
							borderRadius: 14,
							padding: "12px 14px",
						}}
					>
						<p style={{ fontSize: 13.5, color: "#fca5a5", fontWeight: 600 }}>
							{error}
						</p>
					</div>
				) : null}

				{siteContentError ? (
					<div
						style={{
							border: "1px solid rgba(234,179,8,0.35)",
							background: "rgba(234,179,8,0.08)",
							borderRadius: 14,
							padding: "12px 14px",
						}}
					>
						<p style={{ fontSize: 13.5, color: "#fde047", fontWeight: 600 }}>
							{siteContentError}
						</p>
					</div>
				) : null}

				{data && !isLoading && !error && serverInfoRoles.length === 0 ? (
					<div
						style={{
							border: "1px solid rgba(255,255,255,0.1)",
							background: "rgba(255,255,255,0.04)",
							borderRadius: 14,
							padding: "14px 16px",
						}}
					>
						<p style={{ fontSize: 14, color: "rgba(245,245,247,0.75)" }}>
							Belum ada role yang dipilih untuk halaman ini. Buka{" "}
							<strong>Dashboard</strong> → bagian{" "}
							<strong>Dashboard → Server Info</strong>, centang role dan isi
							deskripsi jika perlu, yang ingin dipublikasikan, lalu klik Simpan.
						</p>
					</div>
				) : null}

				{data &&
				!isLoading &&
				!error &&
				serverInfoRoles.length > 0 &&
				displayedRoles.length === 0 ? (
					<div
						style={{
							border: "1px solid rgba(255,255,255,0.1)",
							background: "rgba(255,255,255,0.04)",
							borderRadius: 14,
							padding: "14px 16px",
						}}
					>
						<p style={{ fontSize: 14, color: "rgba(245,245,247,0.75)" }}>
							Tidak ada role yang cocok dengan pilihan dashboard (mungkin sudah
							dihapus dari server). Perbarui centangan di Dashboard lalu simpan
							lagi.
						</p>
					</div>
				) : null}

				{data && !isLoading ? (
					<section className="grid gap-2">
						{displayedRoles.map((role) => {
							const stripe = discordRoleColorRgb(role.color);

							return (
								<div
									key={role.id}
									className="flex min-w-0 items-stretch gap-0 overflow-hidden rounded-xl border border-white/[0.08] bg-[rgba(255,255,255,0.04)]"
								>
									<div
										style={{
											width: 6,
											flexShrink: 0,
											background: stripe ?? "rgba(245,245,247,0.18)",
										}}
										aria-hidden
									/>
									<div className="min-w-0 flex-1 px-4 py-3">
										<div className="flex flex-wrap items-center gap-2">
											<p
												className="min-w-0 truncate font-semibold text-[15px] tracking-tight"
												style={{
													color: stripe ?? "#f5f5f7",
												}}
												title={role.name}
											>
												{role.name}
											</p>
										</div>
										{role.description ? (
											<div className="mt-2 text-[13px] leading-relaxed text-[rgba(245,245,247,0.72)]">
												<ReactMarkdown
													remarkPlugins={[remarkGfm]}
													components={previewMarkdownComponents}
												>
													{role.description}
												</ReactMarkdown>
											</div>
										) : null}
									</div>
								</div>
							);
						})}
					</section>
				) : null}
			</div>
		</main>
	);
}
