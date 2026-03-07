"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type StaffStatus = "online" | "idle" | "dnd" | "offline";

type StaffItem = {
	memberId: string;
	user: {
		id: string;
		username: string;
		tag: string;
		globalName: string | null;
		avatarURL: string | null;
	};
	member: {
		nick: string | null;
		displayName: string;
		joinedTimestamp: number;
		roles: string[];
		hasAdmin: boolean;
		hasTeam: boolean;
	};
	presence: {
		status: StaffStatus;
	};
};

type StaffPayload = {
	ok: boolean;
	guild: {
		id: string;
		name: string;
		memberCount: number;
	};
	summary: {
		total: number;
		online: number;
		idle: number;
		dnd: number;
		offline: number;
		admin: number;
		team: number;
		both: number;
	};
	staff: StaffItem[];
};

const STATUS_STYLES: Record<
	StaffStatus,
	{ label: string; text: string; border: string; bg: string; dot: string }
> = {
	online: {
		label: "Online",
		text: "#22c55e",
		border: "rgba(34,197,94,0.35)",
		bg: "rgba(34,197,94,0.12)",
		dot: "#22c55e",
	},
	idle: {
		label: "Idle",
		text: "#f59e0b",
		border: "rgba(245,158,11,0.35)",
		bg: "rgba(245,158,11,0.12)",
		dot: "#f59e0b",
	},
	dnd: {
		label: "DND",
		text: "#ef4444",
		border: "rgba(239,68,68,0.35)",
		bg: "rgba(239,68,68,0.12)",
		dot: "#ef4444",
	},
	offline: {
		label: "Offline",
		text: "rgba(245,245,247,0.62)",
		border: "rgba(255,255,255,0.14)",
		bg: "rgba(255,255,255,0.07)",
		dot: "rgba(245,245,247,0.45)",
	},
};

const STAFF_ROLE_DEFINITIONS = [
	{ id: "1419304702713266196", label: "Admin" },
	{ id: "1447875381221920848", label: "Team" },
	{ id: "1439631442589122662", label: "Moderator" },
	{ id: "1456199702834970908", label: "Developer" },
	{ id: "1447281658461163580", label: "Event Organizer" },
	{ id: "1439631530321514527", label: "Partner Manager" },
	{ id: "1444565132314279996", label: "Marketing Moderator" },
	{ id: "1447281451103162502", label: "Team Creativity" },
] as const;

function getMatchedRoleLabels(staff: StaffItem) {
	const roleIds = new Set(staff.member.roles ?? []);
	return STAFF_ROLE_DEFINITIONS.filter((role) => roleIds.has(role.id)).map(
		(role) => role.label,
	);
}

function getPrimaryGroupLabel(staff: StaffItem) {
	const matchedLabels = getMatchedRoleLabels(staff);
	return matchedLabels[0] ?? "Lainnya";
}

function roleBadgeStyle(label: string) {
	if (label === "Admin") {
		return {
			color: "#fca5a5",
			border: "1px solid rgba(239,68,68,0.35)",
			background: "rgba(239,68,68,0.12)",
		};
	}

	if (label === "Team") {
		return {
			color: "#93c5fd",
			border: "1px solid rgba(96,165,250,0.35)",
			background: "rgba(96,165,250,0.12)",
		};
	}

	if (label === "Moderator" || label === "Marketing Moderator") {
		return {
			color: "#fcd34d",
			border: "1px solid rgba(245,158,11,0.35)",
			background: "rgba(245,158,11,0.12)",
		};
	}

	return {
		color: "rgba(245,245,247,0.78)",
		border: "1px solid rgba(255,255,255,0.2)",
		background: "rgba(255,255,255,0.08)",
	};
}

function statusLabel(status: StaffStatus) {
	return STATUS_STYLES[status].label;
}

function summaryLabelStyle(label: string) {
	if (label === "Online") return "#22c55e";
	if (label === "Idle") return "#f59e0b";
	if (label === "DND") return "#ef4444";
	if (label === "Offline") return "rgba(245,245,247,0.65)";
	if (label === "Admin") return "#ef4444";
	if (label === "Team") return "#60a5fa";
	if (label === "Admin + Team") return "#a78bfa";
	return "rgba(245,245,247,0.72)";
}

function formatJoinedAt(timestamp: number) {
	return new Date(timestamp).toLocaleDateString("id-ID", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

export default function StaffPage() {
	const [data, setData] = useState<StaffPayload | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		fetch("/api/public/staff", { cache: "no-store" })
			.then(async (response) => {
				if (!response.ok) {
					throw new Error("Gagal memuat data staff");
				}
				const payload = (await response.json()) as StaffPayload;
				if (!payload?.ok) {
					throw new Error("Response endpoint staff tidak valid");
				}
				if (isMounted) {
					setData(payload);
					setError(null);
				}
			})
			.catch(() => {
				if (isMounted) {
					setError("Data staff belum bisa dimuat sekarang.");
				}
			})
			.finally(() => {
				if (isMounted) {
					setIsLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

	const summaryItems = useMemo(() => {
		if (!data) return [];
		return [
			{ label: "Total Staff", value: data.summary.total },
			{ label: "Online", value: data.summary.online },
			{ label: "Idle", value: data.summary.idle },
			{ label: "DND", value: data.summary.dnd },
			{ label: "Offline", value: data.summary.offline },
			{ label: "Admin", value: data.summary.admin },
			{ label: "Team", value: data.summary.team },
			{ label: "Admin + Team", value: data.summary.both },
		];
	}, [data]);

	const loadingSummaryKeys = [
		"total",
		"online",
		"idle",
		"dnd",
		"offline",
		"admin",
		"team",
		"both",
	];

	const groupedStaff = useMemo(() => {
		if (!data) return [] as Array<{ label: string; members: StaffItem[] }>;

		const groups = new Map<string, StaffItem[]>();

		for (const staff of data.staff) {
			const groupLabel = getPrimaryGroupLabel(staff);
			const currentMembers = groups.get(groupLabel) ?? [];
			currentMembers.push(staff);
			groups.set(groupLabel, currentMembers);
		}

		const orderedGroups: Array<{ label: string; members: StaffItem[] }> = [];
		for (const role of STAFF_ROLE_DEFINITIONS) {
			const members = groups.get(role.label);
			if (members && members.length > 0) {
				orderedGroups.push({ label: role.label, members });
			}
		}

		const otherMembers = groups.get("Lainnya");
		if (otherMembers && otherMembers.length > 0) {
			orderedGroups.push({ label: "Lainnya", members: otherMembers });
		}

		return orderedGroups;
	}, [data]);

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
						Discord ID Staff
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
						Daftar Tim Staff
					</h1>
					<p
						style={{
							color: "rgba(245,245,247,0.62)",
							fontSize: 14,
							maxWidth: 700,
						}}
					>
						{data
							? `${data.guild.name} • ${data.guild.memberCount.toLocaleString("id-ID")} member • Data realtime status staff`
							: "Memuat data staff komunitas..."}
					</p>
				</div>

				{isLoading ? (
					<section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{loadingSummaryKeys.map((key) => (
							<div
								key={`loading-summary-${key}`}
								style={{
									height: 84,
									borderRadius: 14,
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

				{data ? (
					<>
						<section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
							{summaryItems.map((item) => (
								<div
									key={item.label}
									style={{
										border: "1px solid rgba(255,255,255,0.08)",
										background: "rgba(255,255,255,0.04)",
										borderRadius: 14,
										padding: "12px 14px",
									}}
								>
									<p
										style={{
											fontSize: 11,
											fontWeight: 600,
											letterSpacing: "0.06em",
											textTransform: "uppercase",
											color: summaryLabelStyle(item.label),
										}}
									>
										{item.label}
									</p>
									<p
										style={{
											marginTop: 4,
											fontSize: 28,
											lineHeight: 1.1,
											fontWeight: 700,
											letterSpacing: "-0.03em",
										}}
									>
										{item.value}
									</p>
								</div>
							))}
						</section>

						{groupedStaff.map((group) => (
							<section key={group.label} className="space-y-3">
								<div
									className="flex items-center gap-2"
									style={{
										paddingBottom: 8,
										borderBottom: "1px solid rgba(255,255,255,0.08)",
									}}
								>
									<p
										style={{
											fontSize: 14,
											fontWeight: 700,
											letterSpacing: "-0.01em",
										}}
									>
										{group.label}
									</p>
									<span
										style={{
											padding: "2px 8px",
											borderRadius: 9999,
											fontSize: 11,
											fontWeight: 600,
											color: "rgba(245,245,247,0.74)",
											border: "1px solid rgba(255,255,255,0.16)",
											background: "rgba(255,255,255,0.07)",
										}}
									>
										{group.members.length} orang
									</span>
								</div>

								<div className="grid gap-4 md:grid-cols-2">
									{group.members.map((staff) => {
										const matchedRoleLabels = getMatchedRoleLabels(staff);

										return (
											<div
												key={staff.memberId}
												style={{
													border: "1px solid rgba(255,255,255,0.08)",
													background: "rgba(255,255,255,0.04)",
													borderRadius: 14,
													padding: "14px 15px",
												}}
											>
												<div className="flex gap-3.5">
													{staff.user.avatarURL ? (
														<div
															style={{
																position: "relative",
																height: 54,
																width: 54,
																flexShrink: 0,
																overflow: "hidden",
																borderRadius: 9999,
																border: "1px solid rgba(255,255,255,0.14)",
															}}
														>
															<Image
																src={staff.user.avatarURL}
																alt={staff.member.displayName}
																fill
																sizes="54px"
																style={{ objectFit: "cover" }}
															/>
														</div>
													) : (
														<div
															style={{
																height: 54,
																width: 54,
																flexShrink: 0,
																borderRadius: 9999,
																border: "1px solid rgba(255,255,255,0.14)",
																background: "rgba(255,255,255,0.08)",
															}}
														/>
													)}

													<div className="min-w-0 flex-1">
														<p
															className="truncate"
															style={{
																fontSize: 15,
																fontWeight: 700,
																letterSpacing: "-0.01em",
															}}
														>
															{staff.member.displayName}
														</p>
														<p
															className="truncate"
															style={{
																fontSize: 12,
																color: "rgba(245,245,247,0.52)",
																marginTop: 1,
															}}
														>
															{staff.user.tag}
														</p>
														{staff.member.nick ? (
															<p
																className="truncate"
																style={{
																	fontSize: 11.5,
																	color: "rgba(245,245,247,0.4)",
																	marginTop: 1,
																}}
															>
																Nick: {staff.member.nick}
															</p>
														) : null}

														<div className="mt-2.5 flex flex-wrap items-center gap-1.5">
															<span
																style={{
																	display: "inline-flex",
																	alignItems: "center",
																	gap: 6,
																	padding: "3px 8px",
																	borderRadius: 9999,
																	fontSize: 11,
																	fontWeight: 600,
																	border: `1px solid ${STATUS_STYLES[staff.presence.status].border}`,
																	background:
																		STATUS_STYLES[staff.presence.status].bg,
																	color:
																		STATUS_STYLES[staff.presence.status].text,
																}}
															>
																<span
																	style={{
																		width: 6,
																		height: 6,
																		borderRadius: 9999,
																		background:
																			STATUS_STYLES[staff.presence.status].dot,
																	}}
																/>
																{statusLabel(staff.presence.status)}
															</span>

															{matchedRoleLabels.map((roleLabel) => {
																const style = roleBadgeStyle(roleLabel);
																return (
																	<span
																		key={`${staff.memberId}-${roleLabel}`}
																		style={{
																			padding: "3px 8px",
																			borderRadius: 9999,
																			fontSize: 11,
																			fontWeight: 600,
																			color: style.color,
																			border: style.border,
																			background: style.background,
																		}}
																	>
																		{roleLabel}
																	</span>
																);
															})}
														</div>

														<p
															style={{
																fontSize: 11.5,
																color: "rgba(245,245,247,0.42)",
																marginTop: 7,
															}}
														>
															Join:{" "}
															{formatJoinedAt(staff.member.joinedTimestamp)}
														</p>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</section>
						))}
					</>
				) : null}
			</div>
		</main>
	);
}
