import { useEffect, useState } from "react";
import Link from "next/link";
import type { AdminProfile, UserRole } from "@/lib/content-types";
import { SectionCard, SmallButton } from "./ui";

export function UserAccessManager({ role }: { role?: UserRole }) {
	const [users, setUsers] = useState<AdminProfile[]>([]);
	const [discordId, setDiscordId] = useState("");
	const [userRole, setUserRole] = useState<UserRole>("moderator");
	const [seedName, setSeedName] = useState("");
	const [status, setStatus] = useState("");

	useEffect(() => {
		if (role !== "admin") return;
		(async () => {
			try {
				const response = await fetch("/api/admin/users");
				if (!response.ok) return;
				const payload = await response.json();
				setUsers(Array.isArray(payload) ? payload : []);
			} catch {}
		})();
	}, [role]);

	async function addPrivilegedUser() {
		if (!discordId.trim()) {
			setStatus("Discord ID wajib diisi");
			return;
		}

		try {
			setStatus("Menyimpan user...");
			const response = await fetch("/api/admin/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					discordId: discordId.trim(),
					role: userRole,
					name: seedName.trim() || undefined,
				}),
			});
			if (!response.ok) throw new Error();
			const created = await response.json();
			setUsers((current) => [
				created,
				...current.filter((user) => user.discordId !== created.discordId),
			]);
			setDiscordId("");
			setSeedName("");
			setStatus("User role berhasil disimpan ✅");
		} catch {
			setStatus("Gagal menyimpan user role ❌");
		}
	}

	return (
		<SectionCard title="User Settings & Roles">
			<div className="space-y-4">
				<div
					style={{
						border: "1px solid rgba(255,255,255,0.08)",
						borderRadius: 12,
						padding: 12,
						background: "rgba(255,255,255,0.02)",
					}}
				>
					<p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
						User Settings
					</p>
					<p
						style={{
							fontSize: 12,
							color: "rgba(245,245,247,0.6)",
							marginBottom: 10,
						}}
					>
						Edit profil user dipisah ke halaman settings khusus.
					</p>
					<Link
						href="/settings"
						style={{
							display: "inline-flex",
							alignItems: "center",
							height: 32,
							padding: "0 10px",
							borderRadius: 10,
							border: "1px solid rgba(255,255,255,0.12)",
							background: "rgba(255,255,255,0.06)",
							color: "#f5f5f7",
							fontSize: 12,
							fontWeight: 700,
							textDecoration: "none",
						}}
					>
						Buka Halaman Settings
					</Link>
				</div>

				{role === "admin" ? (
					<div
						style={{
							border: "1px solid rgba(255,255,255,0.08)",
							borderRadius: 12,
							padding: 12,
							background: "rgba(255,255,255,0.02)",
						}}
					>
						<p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
							Tambah Admin / Moderator
						</p>
						<div className="grid gap-2 md:grid-cols-[1fr_160px_1fr_auto]">
							<input
								type="text"
								value={discordId}
								onChange={(event) => setDiscordId(event.target.value)}
								placeholder="Discord ID"
								style={{
									height: 36,
									padding: "0 10px",
									borderRadius: 10,
									border: "1px solid rgba(255,255,255,0.12)",
									background: "rgba(10,10,11,0.7)",
									color: "#f5f5f7",
								}}
							/>
							<select
								value={userRole}
								onChange={(event) =>
									setUserRole(event.target.value as UserRole)
								}
								style={{
									height: 36,
									padding: "0 10px",
									borderRadius: 10,
									border: "1px solid rgba(255,255,255,0.12)",
									background: "rgba(10,10,11,0.7)",
									color: "#f5f5f7",
								}}
							>
								<option value="admin">Admin</option>
								<option value="moderator">Moderator</option>
							</select>
							<input
								type="text"
								value={seedName}
								onChange={(event) => setSeedName(event.target.value)}
								placeholder="Nama awal (opsional)"
								style={{
									height: 36,
									padding: "0 10px",
									borderRadius: 10,
									border: "1px solid rgba(255,255,255,0.12)",
									background: "rgba(10,10,11,0.7)",
									color: "#f5f5f7",
								}}
							/>
							<SmallButton onClick={addPrivilegedUser}>Tambah</SmallButton>
						</div>

						<div className="mt-3 space-y-2">
							{users.map((user) => (
								<div
									key={user.discordId}
									style={{
										display: "flex",
										justifyContent: "space-between",
										gap: 10,
										fontSize: 12,
										padding: "8px 10px",
										borderRadius: 10,
										border: "1px solid rgba(255,255,255,0.08)",
										background: "rgba(255,255,255,0.01)",
									}}
								>
									<span>{user.name}</span>
									<span style={{ opacity: 0.7 }}>{user.discordId}</span>
									<span
										style={{
											fontWeight: 700,
											color: user.role === "admin" ? "#22c55e" : "#60a5fa",
										}}
									>
										{user.role}
									</span>
								</div>
							))}
						</div>
					</div>
				) : null}

				{status ? <p style={{ fontSize: 12, opacity: 0.8 }}>{status}</p> : null}
			</div>
		</SectionCard>
	);
}
