import Link from "next/link";
import { useEffect, useState } from "react";
import type { AdminProfile, UserRole } from "@/lib/content-types";
import { SectionCard, SmallButton } from "./ui";

export function UserAccessManager({
	role,
	currentUserId,
}: {
	role?: UserRole;
	currentUserId?: string;
}) {
	const [users, setUsers] = useState<AdminProfile[]>([]);
	const [discordId, setDiscordId] = useState("");
	const [userRole, setUserRole] = useState<UserRole>("moderator");
	const [seedName, setSeedName] = useState("");
	const [status, setStatus] = useState("");
	const canManageUsers = role === "dev" || role === "admin";

	function allowedRoleOptionsForActor(): UserRole[] {
		if (role === "dev") return ["dev", "admin", "moderator"];
		if (role === "admin") return ["admin", "moderator"];
		return ["moderator"];
	}

	function canChangeUserRole(targetDiscordId: string, targetRole: UserRole) {
		if (!canManageUsers) return false;
		if (!targetDiscordId) return false;
		if (currentUserId && targetDiscordId === currentUserId) return false;
		if (role === "dev") return true;
		if (role === "admin") return targetRole !== "dev";
		return false;
	}

	function canDeleteUser(targetRole: UserRole, targetDiscordId: string) {
		if (!canManageUsers) return false;
		if (!targetDiscordId) return false;
		if (currentUserId && targetDiscordId === currentUserId) return false;
		if (role === "dev") return true;
		if (role === "admin") return targetRole !== "dev";
		return false;
	}

	useEffect(() => {
		if (!canManageUsers) return;
		(async () => {
			try {
				const response = await fetch("/api/admin/users");
				if (!response.ok) return;
				const payload = await response.json();
				setUsers(Array.isArray(payload) ? payload : []);
			} catch {}
		})();
	}, [canManageUsers]);

	async function addPrivilegedUser() {
		if (!canManageUsers) {
			setStatus("Kamu tidak punya izin kelola user");
			return;
		}

		if (role === "admin" && userRole === "dev") {
			setStatus("Admin tidak bisa menambahkan role dev");
			return;
		}

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

	async function removePrivilegedUser(discordIdToRemove: string) {
		try {
			setStatus("Menghapus user...");
			const response = await fetch("/api/admin/users", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ discordId: discordIdToRemove }),
			});
			if (!response.ok) throw new Error();
			setUsers((current) =>
				current.filter((user) => user.discordId !== discordIdToRemove),
			);
			setStatus("User berhasil dihapus ✅");
		} catch {
			setStatus("Gagal menghapus user ❌");
		}
	}

	async function updateUserRole(discordIdToUpdate: string, nextRole: UserRole) {
		try {
			setStatus("Mengubah role...");
			const response = await fetch("/api/admin/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					discordId: discordIdToUpdate,
					role: nextRole,
				}),
			});
			if (!response.ok) throw new Error();
			const updated = (await response.json()) as AdminProfile;
			setUsers((current) =>
				current.map((u) => (u.discordId === updated.discordId ? updated : u)),
			);
			setStatus("Role berhasil diupdate ✅");
		} catch {
			setStatus("Gagal update role ❌");
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

				{canManageUsers ? (
					<div
						style={{
							border: "1px solid rgba(255,255,255,0.08)",
							borderRadius: 12,
							padding: 12,
							background: "rgba(255,255,255,0.02)",
						}}
					>
						<p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
							Tambah Dev / Admin / Moderator
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
								{role === "dev" ? <option value="dev">Dev</option> : null}
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
							<SmallButton
								onClick={addPrivilegedUser}
								className="w-full md:w-auto"
							>
								Tambah
							</SmallButton>
						</div>

						<div className="mt-3 space-y-2">
							{users.map((user) => (
								<div
									key={user.discordId}
									style={{
										display: "grid",
										gap: 6,
										fontSize: 12,
										padding: "8px 10px",
										borderRadius: 10,
										border: "1px solid rgba(255,255,255,0.08)",
										background: "rgba(255,255,255,0.01)",
									}}
								>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											gap: 10,
										}}
									>
										<span style={{ fontWeight: 700 }}>{user.name}</span>
										<div className="flex items-center gap-2">
											{canChangeUserRole(user.discordId, user.role) ? (
												<select
													value={user.role}
													onChange={(event) =>
														updateUserRole(
															user.discordId,
															event.target.value as UserRole,
														)
													}
													style={{
														height: 24,
														padding: "0 8px",
														borderRadius: 8,
														border: "1px solid rgba(255,255,255,0.12)",
														background: "rgba(10,10,11,0.7)",
														color: "#f5f5f7",
														fontSize: 11,
														fontWeight: 700,
														textTransform: "lowercase",
													}}
												>
													{allowedRoleOptionsForActor().map((opt) => (
														<option key={opt} value={opt}>
															{opt}
														</option>
													))}
												</select>
											) : (
												<span
													style={{
														fontWeight: 700,
														color:
															user.role === "dev"
																? "#f97316"
																: user.role === "admin"
																	? "#22c55e"
																	: "#60a5fa",
														textTransform: "lowercase",
														flexShrink: 0,
													}}
												>
													{user.role}
												</span>
											)}
											{canDeleteUser(user.role, user.discordId) ? (
												<SmallButton
													variant="danger"
													style={{ height: 24, padding: "0 8px", fontSize: 11 }}
													onClick={() => removePrivilegedUser(user.discordId)}
												>
													Hapus
												</SmallButton>
											) : null}
										</div>
									</div>
									<span
										style={{
											opacity: 0.72,
											overflowWrap: "anywhere",
											wordBreak: "break-word",
											lineHeight: 1.45,
										}}
									>
										{user.discordId}
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
