"use client";

import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { AdminProfile } from "@/lib/content-types";

export function UserProfileSettings() {
	const { data: session } = useSession();
	const [profile, setProfile] = useState<AdminProfile | null>(null);
	const [name, setName] = useState("");
	const [status, setStatus] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				const response = await fetch("/api/user/settings");
				if (!response.ok) throw new Error();
				const payload = (await response.json()) as AdminProfile;
				setProfile(payload);
				setName(payload?.name ?? "");
			} catch {
				setStatus("Gagal memuat profil");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	async function saveName() {
		try {
			setStatus("Menyimpan nama...");
			const response = await fetch("/api/user/settings", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name }),
			});
			if (!response.ok) throw new Error();
			const updated = (await response.json()) as AdminProfile;
			setProfile(updated);
			setName(updated?.name ?? name);
			setStatus("Nama berhasil disimpan ✅");
		} catch {
			setStatus("Gagal menyimpan nama ❌");
		}
	}

	async function resetName() {
		try {
			setStatus("Reset ke display name default...");
			const response = await fetch("/api/user/settings", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ resetToDefault: true }),
			});
			if (!response.ok) throw new Error();
			const updated = (await response.json()) as AdminProfile;
			setProfile(updated);
			setName(updated?.name ?? "");
			setStatus("Nama berhasil direset ✅");
		} catch {
			setStatus("Gagal reset nama ❌");
		}
	}

	if (loading) {
		return (
			<main
				className="min-h-screen px-6 py-14"
				style={{ background: "#0a0a0b", color: "#f5f5f7" }}
			>
				<div className="mx-auto max-w-3xl">Loading settings...</div>
			</main>
		);
	}

	return (
		<main
			className="min-h-screen px-6 py-14"
			style={{ background: "#0a0a0b", color: "#f5f5f7" }}
		>
			<div className="mx-auto max-w-3xl space-y-6">
				<div>
					<p
						style={{
							fontSize: 12,
							fontWeight: 700,
							letterSpacing: "0.08em",
							textTransform: "uppercase",
							color: "#ef4444",
						}}
					>
						User Settings
					</p>
					<h1
						style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800 }}
					>
						Edit Profil User
					</h1>
				</div>

				{/* header with avatar and basic info */}
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-4">
						{(profile?.avatarUrl ?? session?.user?.image) ? (
							<Image
								src={(profile?.avatarUrl ?? session?.user?.image) || ""}
								alt="avatar"
								width={64}
								height={64}
								className="w-16 h-16 rounded-full"
							/>
						) : null}
						<div>
							<h2 className="text-xl font-bold">
								{profile?.name ||
									profile?.defaultDisplayName ||
									session?.user?.name}
							</h2>
							<p className="text-sm text-gray-400">
								Discord: {session?.user?.name ?? "-"}
							</p>
							{session?.user?.email ? (
								<p className="text-sm text-gray-400">
									Email: {session.user.email}
								</p>
							) : null}
							<p className="text-sm text-gray-400">
								ID: {profile?.discordId ?? "-"}
							</p>
							{profile?.updatedAt ? (
								<p className="text-sm text-gray-400">
									Last updated: {new Date(profile.updatedAt).toLocaleString()}
								</p>
							) : null}
						</div>
					</div>
					<button
						type="button"
						onClick={async () => {
							try {
								await fetch("/api/log", {
									method: "POST",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({ action: "logout" }),
								});
							} catch {}
							signOut({ callbackUrl: "/" });
						}}
						className="btn-red"
						style={{ padding: "6px 10px", fontSize: 12, fontWeight: 700 }}
					>
						Logout
					</button>
				</div>

				<section
					style={{
						border: "1px solid rgba(255,255,255,0.08)",
						borderRadius: 16,
						padding: 16,
						background: "rgba(255,255,255,0.03)",
					}}
				>
					<p
						style={{
							fontSize: 12,
							color: "rgba(245,245,247,0.6)",
							marginBottom: 8,
						}}
					>
						Role: <strong>{profile?.role ?? "-"}</strong>
					</p>
					<p
						style={{
							fontSize: 12,
							color: "rgba(245,245,247,0.6)",
							marginBottom: 12,
						}}
					>
						Default Discord display name:{" "}
						{profile?.defaultDisplayName ?? "(tidak tersedia)"}
					</p>

					<div className="flex flex-wrap items-center gap-2">
						<input
							type="text"
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="Display name"
							style={{
								minWidth: 260,
								height: 38,
								padding: "0 12px",
								borderRadius: 10,
								border: "1px solid rgba(255,255,255,0.12)",
								background: "rgba(10,10,11,0.7)",
								color: "#f5f5f7",
							}}
						/>
						<button
							type="button"
							onClick={saveName}
							className="btn-red"
							style={{ padding: "8px 12px", fontSize: 12, fontWeight: 700 }}
						>
							Simpan Nama
						</button>
						<button
							type="button"
							onClick={resetName}
							style={{
								height: 36,
								padding: "0 12px",
								borderRadius: 10,
								border: "1px solid rgba(255,255,255,0.12)",
								background: "rgba(255,255,255,0.06)",
								color: "#f5f5f7",
								fontSize: 12,
								fontWeight: 700,
								cursor: "pointer",
							}}
						>
							Reset Default Display Name
						</button>
					</div>

					{status ? (
						<p
							style={{
								marginTop: 10,
								fontSize: 12,
								color: "rgba(245,245,247,0.8)",
							}}
						>
							{status}
						</p>
					) : null}
				</section>
			</div>
		</main>
	);
}
