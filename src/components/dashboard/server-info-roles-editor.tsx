"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useMemo, useState } from "react";
import type { ServerInfoRoleEntry } from "@/lib/content-types";
import { previewMarkdownComponents } from "@/lib/markdown-components";
import { reorderArray } from "./helpers";
import { SectionCard, SmallButton, Textarea } from "./ui";

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
	roles: GuildRole[];
};

function discordRoleColorRgb(colorInt: number): string | null {
	if (!colorInt) return null;
	const r = (colorInt >> 16) & 0xff;
	const g = (colorInt >> 8) & 0xff;
	const b = colorInt & 0xff;
	return `rgb(${r}, ${g}, ${b})`;
}

function roleLabel(
	role: GuildRole | undefined,
	fallbackRoleId: string,
): string {
	return role?.name ?? fallbackRoleId;
}

export function ServerInfoRolesEditor({
	serverInfoRoles,
	onChange,
	onSave,
}: {
	serverInfoRoles: ServerInfoRoleEntry[];
	onChange: (roles: ServerInfoRoleEntry[]) => void;
	onSave: () => void;
}) {
	const [roles, setRoles] = useState<GuildRole[]>([]);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [rolesLoading, setRolesLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		fetch("/api/public/guild-roles", { cache: "no-store" })
			.then(async (res) => {
				if (!res.ok) throw new Error();
				const payload = (await res.json()) as GuildRolesPayload;
				if (!payload?.ok || !Array.isArray(payload.roles)) throw new Error();
				if (!cancelled) {
					setRoles(payload.roles);
					setLoadError(null);
				}
			})
			.catch(() => {
				if (!cancelled)
					setLoadError(
						"Tidak bisa memuat daftar role dari bot/state API. Cek DISCORD_STATE_API_BASE_URL.",
					);
			})
			.finally(() => {
				if (!cancelled) setRolesLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const sortedRoles = useMemo(
		() => [...roles].sort((a, b) => b.position - a.position),
		[roles],
	);

	const visibleSet = useMemo(
		() => new Set(serverInfoRoles.map((r) => r.roleId)),
		[serverInfoRoles],
	);

	function toggleRole(id: string) {
		if (visibleSet.has(id)) {
			onChange(serverInfoRoles.filter((r) => r.roleId !== id));
			return;
		}
		onChange([...serverInfoRoles, { roleId: id }]);
	}

	function setRoleDescription(roleId: string, description: string) {
		onChange(
			serverInfoRoles.map((r) =>
				r.roleId === roleId ? { ...r, description } : r,
			),
		);
	}

	function moveRole(fromIndex: number, toIndex: number) {
		if (fromIndex === toIndex) return;
		if (toIndex < 0 || toIndex >= serverInfoRoles.length) return;
		onChange(reorderArray(serverInfoRoles, fromIndex, toIndex));
	}

	function selectNone() {
		onChange([]);
	}

	const roleMap = useMemo(() => new Map(roles.map((r) => [r.id, r])), [roles]);

	return (
		<SectionCard
			actions={
				<>
					<SmallButton type="button" onClick={selectNone} variant="danger">
						Kosongkan pilihan
					</SmallButton>
					<button
						type="button"
						onClick={onSave}
						className="btn-red"
						style={{ padding: "8px 14px", fontSize: 13, fontWeight: 700 }}
					>
						Simpan
					</button>
				</>
			}
		>
			<p
				style={{
					fontSize: 13,
					color: "rgba(245,245,247,0.55)",
					marginBottom: 14,
				}}
			>
				Centang role yang boleh tampil di{" "}
				<code style={{ fontSize: 12 }}>/server-info</code>. Urutan tampilan
				mengikuti urutan di panel “Role terpilih” di bawah. Deskripsi support{" "}
				<strong>Markdown</strong>.
			</p>
			{loadError ? (
				<p style={{ fontSize: 13, color: "#fca5a5", marginBottom: 12 }}>
					{loadError}
				</p>
			) : null}
			{rolesLoading ? (
				<p style={{ fontSize: 13, color: "rgba(245,245,247,0.45)" }}>
					Memuat role guild...
				</p>
			) : null}
			{!rolesLoading && !loadError && sortedRoles.length === 0 ? (
				<p style={{ fontSize: 13, color: "rgba(245,245,247,0.45)" }}>
					Tidak ada role untuk ditampilkan.
				</p>
			) : null}
			{serverInfoRoles.length > 0 ? (
				<div className="mt-4">
					<p
						style={{
							fontSize: 13,
							fontWeight: 700,
							marginBottom: 14,
							color: "rgba(245,245,247,0.88)",
						}}
					>
						Role terpilih (sortable)
					</p>
					<p
						style={{
							fontSize: 12,
							color: "rgba(245,245,247,0.5)",
							marginBottom: 16,
						}}
					>
						Pakai tombol ↑ ↓ untuk urutan tampil di halaman publik. Teks di
						kolom deskripsi mendukung Markdown.
					</p>
					<ul className="space-y-4" style={{ listStyle: "none", padding: 0 }}>
						{serverInfoRoles.map((entry, index) => {
							const role = roleMap.get(entry.roleId);
							const stripe = role ? discordRoleColorRgb(role.color) : null;
							const label = roleLabel(role, entry.roleId);
							return (
								<li
									key={entry.roleId}
									style={{
										border: "1px solid rgba(255,255,255,0.08)",
										borderRadius: 12,
										padding: 12,
										background: "rgba(255,255,255,0.02)",
									}}
								>
									<div className="mb-3 flex flex-wrap items-center gap-2">
										<p
											className="min-w-0 flex-1 truncate font-semibold text-[14px]"
											style={{ color: stripe ?? "#f5f5f7" }}
											title={label}
										>
											{label}
										</p>
										<SmallButton
											onClick={() => moveRole(index, index - 1)}
											disabled={index === 0}
											aria-label={`Naikkan urutan ${label}`}
										>
											↑
										</SmallButton>
										<SmallButton
											onClick={() => moveRole(index, index + 1)}
											disabled={index === serverInfoRoles.length - 1}
											aria-label={`Turunkan urutan ${label}`}
										>
											↓
										</SmallButton>
										<SmallButton
											variant="danger"
											onClick={() => toggleRole(entry.roleId)}
										>
											Hapus
										</SmallButton>
									</div>
									<Textarea
										rows={3}
										placeholder="Contoh: **Moderator** untuk chat, event, dan support."
										value={entry.description ?? ""}
										onChange={(e) =>
											setRoleDescription(entry.roleId, e.target.value)
										}
									/>
									{entry.description?.trim() ? (
										<div
											className="mt-3 rounded-lg border border-white/[0.08] p-3"
											style={{ background: "rgba(255,255,255,0.02)" }}
										>
											<p
												className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em]"
												style={{ color: "rgba(245,245,247,0.42)" }}
											>
												Preview
											</p>
											<ReactMarkdown
												remarkPlugins={[remarkGfm]}
												components={previewMarkdownComponents}
											>
												{entry.description}
											</ReactMarkdown>
										</div>
									) : null}
								</li>
							);
						})}
					</ul>
				</div>
			) : null}

			<details className="mt-8 border-t border-white/[0.08] pt-8">
				<summary
					className="cursor-pointer text-[13px] font-semibold"
					style={{ color: "rgba(245,245,247,0.9)" }}
				>
					Check role ({serverInfoRoles.length} dipilih / {sortedRoles.length}{" "}
					total)
				</summary>
				<p
					className="mt-2 text-[12px]"
					style={{ color: "rgba(245,245,247,0.55)" }}
				>
					Tip: fokus edit deskripsi di panel “Role terpilih”, lalu buka bagian
					ini cuma saat mau tambah/hapus role.
				</p>
				<ul
					className="mt-3 space-y-2"
					style={{ listStyle: "none", padding: 0, marginBottom: 0 }}
				>
					{sortedRoles.map((role) => {
						const stripe = discordRoleColorRgb(role.color);
						const checked = visibleSet.has(role.id);
						return (
							<li key={role.id}>
								<label
									className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.08] px-3 py-2"
									style={{ background: "rgba(255,255,255,0.03)" }}
								>
									<input
										type="checkbox"
										checked={checked}
										onChange={() => toggleRole(role.id)}
										style={{ width: 18, height: 18, flexShrink: 0 }}
									/>
									<span
										style={{
											width: 5,
											flexShrink: 0,
											alignSelf: "stretch",
											borderRadius: 4,
											background: stripe ?? "rgba(245,245,247,0.2)",
										}}
										aria-hidden
									/>
									<span className="min-w-0 flex-1">
										<span
											className="block truncate font-semibold text-[14px]"
											style={{ color: stripe ?? "#f5f5f7" }}
											title={role.name}
										>
											{role.name}
										</span>
										<span
											className="font-mono text-[11px]"
											style={{ color: "rgba(245,245,247,0.38)" }}
										>
											{role.id}
										</span>
									</span>
								</label>
							</li>
						);
					})}
				</ul>
			</details>
		</SectionCard>
	);
}
