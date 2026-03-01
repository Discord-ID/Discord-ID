"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LiveFeedItem } from "@/lib/content-types";

const pillars = [
	{
		label: "Discord Updates",
		icon: "🔔",
		desc: "Fitur baru, patch notes, dan feature rollout Discord terkini.",
	},
	{
		label: "Leaks & Datamining",
		icon: "🔬",
		desc: "Eksperimen tersembunyi & insight eksklusif dari build terbaru.",
	},
	{
		label: "Discord Quests",
		icon: "🎯",
		desc: "Tips klaim reward, orbs, dan panduan quest bulan ini.",
	},
	{
		label: "Mabar Games",
		icon: "🎮",
		desc: "Party bareng anggota komunitas kapan saja, gratis.",
	},
	{
		label: "Bot Development",
		icon: "🤖",
		desc: "Belajar & berbagi ilmu membuat bot Discord bersama developer ID.",
	},
];

const initialFeed: LiveFeedItem[] = [
	{
		tag: "UPDATE",
		color: "#ef4444",
		text: "Discord UI experiment rollout terdeteksi pada 5% user",
	},
	{
		tag: "QUEST",
		color: "#f97316",
		text: "Info reward terbaru + panduan klaim orbs bulan ini",
	},
	{
		tag: "DEV",
		color: "#8b5cf6",
		text: "Sharing arsitektur bot skala besar dari developer ID",
	},
	{
		tag: "MABAR",
		color: "#10b981",
		text: "Open party Valorant malam ini — cek #gaming-chat",
	},
	{
		tag: "LEAK",
		color: "#3b82f6",
		text: "Datamining: fitur voice channel baru ditemukan di build",
	},
];

const stats = [
	{ value: "10.000+", label: "Member Aktif" },
	{ value: "24/7", label: "Community Chat" },
	{ value: "100+", label: "Developer Indonesia" },
	{ value: "50+", label: "Bot Dibuat" },
];

const faqs = [
	{
		q: "Apakah server ini gratis?",
		a: "Ya, 100% gratis. Tidak ada biaya apapun untuk bergabung dan mengakses semua channel di Discord ID.",
	},
	{
		q: "Apa saja bot yang tersedia di server ini?",
		a: "Kami punya berbagai bot mulai dari musik (Jockie Music, Jokowee Music), stat tracking (Statbot), sampai bot buatan member komunitas sendiri.",
	},
	{
		q: "Bagaimana cara klaim Discord Quest?",
		a: "Setelah join, cek channel #discord-quests untuk panduan step-by-step klaim orbs dan reward Quest terbaru yang diupdate rutin oleh tim kami.",
	},
	{
		q: "Apakah ada channel khusus untuk developer bot?",
		a: "Ada! Channel #bot-dev dan #sharing-code tersedia untuk diskusi, review kode, dan berbagi project bot Discord buatan kamu.",
	},
];

type WidgetMember = {
	id: string;
	username: string;
	status: "online" | "idle" | "dnd";
	avatar_url: string;
	channel_id?: string;
};
type WidgetData = {
	presence_count: number;
	members: WidgetMember[];
	instant_invite: string;
	channels: { id: string; name: string; position: number }[];
};

const STATUS_COLOR: Record<string, string> = {
	online: "#23d18b",
	idle: "#f0b232",
	dnd: "#ed4245",
};
const STATUS_LABEL: Record<string, string> = {
	online: "Online",
	idle: "Idle",
	dnd: "Sibuk",
};

const fadeUp = {
	hidden: { opacity: 0, y: 28 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const },
	},
};
const stagger = {
	hidden: {},
	show: { transition: { staggerChildren: 0.09 } },
};
const fadeIn = {
	hidden: { opacity: 0 },
	show: { opacity: 1, transition: { duration: 0.4 } },
};

function useCountUp(target: number, duration = 1200) {
	const [count, setCount] = useState(0);
	const prevTarget = useRef(0);
	useEffect(() => {
		if (target === prevTarget.current) return;
		const start = prevTarget.current;
		prevTarget.current = target;
		const startTime = performance.now();
		const tick = (now: number) => {
			const progress = Math.min((now - startTime) / duration, 1);
			const eased = 1 - (1 - progress) ** 3;
			setCount(Math.round(start + (target - start) * eased));
			if (progress < 1) requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	}, [target, duration]);
	return count;
}

function FaqItem({ q, a }: { q: string; a: string }) {
	const [open, setOpen] = useState(false);
	return (
		<div
			style={{
				background: "rgba(255,255,255,0.03)",
				border: "1px solid rgba(255,255,255,0.07)",
				borderRadius: 14,
				overflow: "hidden",
			}}
		>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				style={{
					width: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 12,
					padding: "16px 20px",
					background: "transparent",
					border: "none",
					cursor: "pointer",
					textAlign: "left",
					color: "#f5f5f7",
					fontSize: 14,
					fontWeight: 600,
				}}
			>
				{q}
				<motion.span
					animate={{ rotate: open ? 45 : 0 }}
					transition={{ duration: 0.2 }}
					style={{
						flexShrink: 0,
						fontSize: 18,
						color: "rgba(245,245,247,0.4)",
						lineHeight: 1,
					}}
				>
					+
				</motion.span>
			</button>
			<AnimatePresence initial={false}>
				{open && (
					<motion.div
						key="body"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.28, ease: "easeInOut" }}
						style={{ overflow: "hidden" }}
					>
						<p
							style={{
								padding: "0 20px 16px",
								fontSize: 13.5,
								color: "rgba(245,245,247,0.5)",
								lineHeight: 1.7,
							}}
						>
							{a}
						</p>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default function Page() {
	const [widget, setWidget] = useState<WidgetData | null>(null);
	const [liveFeed, setLiveFeed] = useState<LiveFeedItem[]>(initialFeed);
	const presenceCount = useCountUp(widget?.presence_count ?? 0);

	useEffect(() => {
		fetch("/api/public/site-content")
			.then((response) => response.json())
			.then((payload) => {
				if (Array.isArray(payload?.liveCommunityFeed)) {
					setLiveFeed(payload.liveCommunityFeed);
				}
			})
			.catch(() => {});

		const fetchWidget = () =>
			fetch("https://discord.com/api/guilds/1419245943999692854/widget.json")
				.then((r) => r.json())
				.then(setWidget)
				.catch(() => {});
		fetchWidget();
		const id = setInterval(fetchWidget, 60_000);
		return () => clearInterval(id);
	}, []);

	const inviteUrl = widget?.instant_invite ?? "https://discord.gg/HbZEEuj4KJ";
	const statusCounts = widget
		? (["online", "idle", "dnd"] as const).map((s) => ({
				status: s,
				count: widget.members.filter((m) => m.status === s).length,
			}))
		: [];

	return (
		<main
			className="min-h-screen overflow-x-hidden"
			style={{ background: "#0a0a0b", color: "#f5f5f7" }}
		>
			{/* BG LAYERS */}
			<div
				className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 z-0"
				style={{
					width: 900,
					height: 600,
					background:
						"radial-gradient(ellipse at 50% 0%, rgba(185,28,28,0.18) 0%, transparent 70%)",
				}}
			/>
			<div
				className="pointer-events-none fixed bottom-0 left-0 z-0"
				style={{
					width: 500,
					height: 400,
					background:
						"radial-gradient(ellipse at 0% 100%, rgba(127,29,29,0.22) 0%, transparent 70%)",
				}}
			/>
			<div
				className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
				style={{
					backgroundImage:
						"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
					backgroundRepeat: "repeat",
					backgroundSize: "180px 180px",
				}}
			/>
			<div
				className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
				style={{
					backgroundImage:
						"repeating-linear-gradient(0deg, rgba(255,255,255,0.15) 0px, transparent 1px, transparent 64px)",
				}}
			/>

			{/* HERO */}
			<section id="tentang" className="relative z-10 px-6 py-24 md:py-36">
				<div className="mx-auto max-w-6xl">
					<motion.div
						variants={stagger}
						initial="hidden"
						animate="show"
						className="flex flex-wrap gap-2 mb-8"
					>
						<motion.div variants={fadeUp}>
							<Badge
								variant="outline"
								style={{
									borderColor: "rgba(239,68,68,0.35)",
									color: "#ef4444",
									background: "rgba(239,68,68,0.07)",
									fontSize: 12,
								}}
							>
								🇮🇩 Komunitas Discord Indonesia
							</Badge>
						</motion.div>
						<motion.div variants={fadeUp}>
							<Badge
								variant="outline"
								style={{
									borderColor: "rgba(255,255,255,0.12)",
									color: "rgba(245,245,247,0.55)",
									background: "transparent",
									fontSize: 12,
								}}
							>
								discord.my.id
							</Badge>
						</motion.div>
					</motion.div>

					<div className="grid gap-16 md:grid-cols-[1fr_360px] md:items-start">
						<motion.div
							className="space-y-8"
							variants={stagger}
							initial="hidden"
							animate="show"
						>
							<motion.h1
								variants={fadeUp}
								style={{
									fontSize: "clamp(2.6rem, 6vw, 5rem)",
									fontWeight: 800,
									lineHeight: 1.07,
									letterSpacing: "-0.03em",
								}}
							>
								Pusat Intel
								<br />
								<span
									style={{ color: "rgba(245,245,247,0.35)", fontWeight: 300 }}
								>
									Discord Indonesia
								</span>
							</motion.h1>
							<motion.div
								variants={fadeUp}
								style={{
									width: 48,
									height: 3,
									background: "#ef4444",
									borderRadius: 99,
								}}
							/>
							<motion.p
								variants={fadeUp}
								style={{
									color: "rgba(245,245,247,0.55)",
									fontSize: 17,
									lineHeight: 1.75,
									maxWidth: 520,
								}}
							>
								Komunitas aktif untuk diskusi{" "}
								<span style={{ color: "#f5f5f7", fontWeight: 500 }}>
									Discord Updates
								</span>
								,{" "}
								<span style={{ color: "#f5f5f7", fontWeight: 500 }}>
									Leaks & Datamining
								</span>
								,{" "}
								<span style={{ color: "#f5f5f7", fontWeight: 500 }}>
									Latest Quests
								</span>
								, mabar games, dan tempat berkumpulnya Discord Developer
								Indonesia.
							</motion.p>
							<motion.div variants={fadeUp} className="flex flex-wrap gap-3">
								<Button
									size="lg"
									style={{
										background: "#ef4444",
										color: "#fff",
										fontWeight: 700,
										boxShadow: "0 0 30px rgba(239,68,68,0.3)",
									}}
									asChild
								>
									<motion.a
										href={inviteUrl}
										target="_blank"
										rel="noreferrer"
										whileHover={{
											scale: 1.04,
											boxShadow: "0 0 40px rgba(239,68,68,0.45)",
										}}
										whileTap={{ scale: 0.97 }}
									>
										Join Discord
									</motion.a>
								</Button>
								<Button
									size="lg"
									variant="outline"
									style={{
										borderColor: "rgba(255,255,255,0.12)",
										color: "rgba(245,245,247,0.65)",
										background: "rgba(255,255,255,0.04)",
									}}
									asChild
								>
									<a
										href="https://discord.my.id"
										target="_blank"
										rel="noreferrer"
									>
										Kunjungi Website ↗
									</a>
								</Button>
							</motion.div>
						</motion.div>

						{/* Feed card */}
						<motion.div
							id="feed"
							initial={{ opacity: 0, y: 24 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								delay: 0.25,
								duration: 0.6,
								ease: [0.25, 0.1, 0.25, 1],
							}}
							style={{
								background: "rgba(255,255,255,0.035)",
								border: "1px solid rgba(255,255,255,0.08)",
								borderRadius: 20,
								padding: 20,
								backdropFilter: "blur(12px)",
								boxShadow:
									"0 0 0 1px rgba(239,68,68,0.08) inset, 0 24px 48px rgba(0,0,0,0.4)",
							}}
						>
							<div className="flex items-center justify-between mb-4">
								<span
									style={{ fontSize: 13, fontWeight: 600, color: "#f5f5f7" }}
								>
									Live Community Feed
								</span>
								<span
									className="flex items-center gap-1.5"
									style={{ fontSize: 11, color: "rgba(245,245,247,0.4)" }}
								>
									<span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
									Live
								</span>
							</div>
							<motion.div
								variants={stagger}
								initial="hidden"
								animate="show"
								className="space-y-2.5"
							>
								{liveFeed.map((item) => (
									<motion.div
										key={item.text}
										variants={fadeUp}
										style={{
											display: "flex",
											gap: 10,
											alignItems: "flex-start",
											background: "rgba(255,255,255,0.04)",
											border: "1px solid rgba(255,255,255,0.06)",
											borderRadius: 12,
											padding: "10px 12px",
										}}
									>
										<span
											style={{
												flexShrink: 0,
												marginTop: 1,
												fontSize: 10,
												fontWeight: 700,
												letterSpacing: "0.06em",
												padding: "2px 7px",
												borderRadius: 6,
												background: `${item.color}22`,
												color: item.color,
												border: `1px solid ${item.color}44`,
											}}
										>
											{item.tag}
										</span>
										<span
											style={{
												fontSize: 12.5,
												color: "rgba(245,245,247,0.7)",
												lineHeight: 1.6,
											}}
										>
											{item.text}
										</span>
									</motion.div>
								))}
							</motion.div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* STATS STRIP */}
			<div
				style={{
					borderTop: "1px solid rgba(255,255,255,0.06)",
					borderBottom: "1px solid rgba(255,255,255,0.06)",
					background: "rgba(255,255,255,0.02)",
				}}
			>
				<motion.div
					className="mx-auto max-w-6xl px-6 py-7 grid grid-cols-2 gap-6 md:grid-cols-4"
					variants={stagger}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, margin: "-60px" }}
				>
					{stats.map((s, i) => (
						<motion.div key={s.label} variants={fadeUp} className="text-center">
							<p
								style={{
									fontSize: "1.85rem",
									fontWeight: 800,
									letterSpacing: "-0.03em",
									color: "#f5f5f7",
								}}
							>
								{i === 0 && widget ? presenceCount.toLocaleString() : s.value}
							</p>
							<p
								style={{
									fontSize: 12,
									color: "rgba(245,245,247,0.4)",
									marginTop: 3,
									letterSpacing: "0.04em",
									textTransform: "uppercase",
								}}
							>
								{i === 0 && widget ? "Online Sekarang" : s.label}
							</p>
						</motion.div>
					))}
				</motion.div>
			</div>

			{/* LIVE MEMBERS */}
			<AnimatePresence>
				{widget && (
					<motion.div
						id="live"
						key="live-section"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="relative z-10 px-6 py-8"
						style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
					>
						<div className="mx-auto max-w-6xl space-y-5">
							{/* Header + status breakdown */}
							<div className="flex flex-wrap items-center gap-3">
								<span
									style={{
										fontSize: 12,
										fontWeight: 600,
										letterSpacing: "0.1em",
										textTransform: "uppercase",
										color: "#ef4444",
									}}
								>
									Live
								</span>
								<span
									className="inline-flex items-center gap-1.5"
									style={{ fontSize: 13, color: "rgba(245,245,247,0.55)" }}
								>
									<span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
									<strong style={{ color: "#f5f5f7" }}>
										{presenceCount.toLocaleString()}
									</strong>{" "}
									anggota online
								</span>
								<div className="flex gap-2 ml-1">
									{statusCounts.map(({ status, count }) => (
										<motion.span
											key={status}
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											style={{
												display: "inline-flex",
												alignItems: "center",
												gap: 5,
												fontSize: 11,
												fontWeight: 600,
												padding: "3px 9px",
												borderRadius: 9999,
												background: `${STATUS_COLOR[status]}18`,
												border: `1px solid ${STATUS_COLOR[status]}33`,
												color: STATUS_COLOR[status],
											}}
										>
											<span
												style={{
													width: 6,
													height: 6,
													borderRadius: "50%",
													background: STATUS_COLOR[status],
													display: "inline-block",
												}}
											/>
											{count} {STATUS_LABEL[status]}
										</motion.span>
									))}
								</div>
							</div>

							{/* Avatar row */}
							<motion.div
								className="flex flex-wrap gap-2"
								variants={stagger}
								initial="hidden"
								animate="show"
							>
								{widget.members.slice(0, 32).map((m) => (
									<motion.div
										key={m.id}
										variants={fadeIn}
										title={m.username}
										style={{
											position: "relative",
											width: 36,
											height: 36,
											flexShrink: 0,
										}}
										whileHover={{ scale: 1.15, zIndex: 10 }}
									>
										<Image
											src={m.avatar_url}
											alt={m.username}
											width={36}
											height={36}
											style={{
												width: 36,
												height: 36,
												borderRadius: "50%",
												border: "2px solid rgba(255,255,255,0.08)",
												objectFit: "cover",
												display: "block",
											}}
										/>
										<span
											style={{
												position: "absolute",
												bottom: 0,
												right: 0,
												width: 10,
												height: 10,
												borderRadius: "50%",
												background: STATUS_COLOR[m.status] ?? "#23d18b",
												border: "2px solid #0a0a0b",
											}}
										/>
									</motion.div>
								))}
								{widget.members.length > 32 && (
									<motion.div
										variants={fadeIn}
										style={{
											width: 36,
											height: 36,
											borderRadius: "50%",
											background: "rgba(255,255,255,0.06)",
											border: "2px solid rgba(255,255,255,0.1)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: 10,
											fontWeight: 600,
											color: "rgba(245,245,247,0.5)",
											flexShrink: 0,
										}}
									>
										+{widget.members.length - 32}
									</motion.div>
								)}
							</motion.div>

							{/* Active voice channels — expanded with names */}
							{(() => {
								const activeChannels = widget.channels.filter((ch) =>
									widget.members.some((m) => m.channel_id === ch.id),
								);
								if (activeChannels.length === 0) return null;
								return (
									<div className="space-y-2 pt-1">
										<p
											style={{
												fontSize: 11,
												fontWeight: 600,
												letterSpacing: "0.08em",
												textTransform: "uppercase",
												color: "rgba(245,245,247,0.3)",
											}}
										>
											Voice — Sedang Aktif
										</p>
										{activeChannels.map((ch) => {
											const inCh = widget.members.filter(
												(m) => m.channel_id === ch.id,
											);
											return (
												<motion.div
													key={ch.id}
													initial={{ opacity: 0, x: -8 }}
													animate={{ opacity: 1, x: 0 }}
													style={{
														background: "rgba(255,255,255,0.03)",
														border: "1px solid rgba(255,255,255,0.07)",
														borderRadius: 12,
														padding: "10px 14px",
													}}
												>
													<div className="flex items-center gap-2 mb-2.5">
														<svg
															width="12"
															height="12"
															viewBox="0 0 24 24"
															fill="#23d18b"
															aria-hidden="true"
														>
															<path d="M11 4a1 1 0 0 1 2 0v16a1 1 0 0 1-2 0V4zm-6 4a1 1 0 0 1 2 0v8a1 1 0 0 1-2 0V8zm12 2a1 1 0 0 1 2 0v4a1 1 0 0 1-2 0v-4z" />
														</svg>
														<span
															style={{
																fontSize: 12.5,
																fontWeight: 600,
																color: "rgba(245,245,247,0.8)",
															}}
														>
															{ch.name}
														</span>
														<span
															style={{
																fontSize: 11,
																fontWeight: 700,
																color: "#23d18b",
																marginLeft: 2,
															}}
														>
															{inCh.length} orang
														</span>
													</div>
													<div className="flex flex-wrap gap-2">
														{inCh.map((m) => (
															<div
																key={m.id}
																className="flex items-center gap-1.5"
																style={{
																	background: "rgba(255,255,255,0.05)",
																	border: "1px solid rgba(255,255,255,0.08)",
																	borderRadius: 9999,
																	padding: "3px 10px 3px 4px",
																}}
															>
																<div
																	style={{
																		position: "relative",
																		flexShrink: 0,
																	}}
																>
																	<Image
																		src={m.avatar_url}
																		alt={m.username}
																		width={20}
																		height={20}
																		style={{
																			width: 20,
																			height: 20,
																			borderRadius: "50%",
																			objectFit: "cover",
																		}}
																	/>
																	<span
																		style={{
																			position: "absolute",
																			bottom: -1,
																			right: -1,
																			width: 7,
																			height: 7,
																			borderRadius: "50%",
																			background:
																				STATUS_COLOR[m.status] ?? "#23d18b",
																			border: "1.5px solid #0a0a0b",
																		}}
																	/>
																</div>
																<span
																	style={{
																		fontSize: 11.5,
																		color: "rgba(245,245,247,0.7)",
																		maxWidth: 120,
																		overflow: "hidden",
																		textOverflow: "ellipsis",
																		whiteSpace: "nowrap",
																	}}
																>
																	{m.username}
																</span>
															</div>
														))}
													</div>
												</motion.div>
											);
										})}
									</div>
								);
							})()}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* PILLARS */}
			<section id="fitur" className="relative z-10 px-6 py-20 md:py-24">
				<div className="mx-auto max-w-6xl space-y-10">
					<motion.div
						variants={stagger}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
					>
						<motion.p
							variants={fadeUp}
							style={{
								fontSize: 12,
								fontWeight: 600,
								letterSpacing: "0.1em",
								textTransform: "uppercase",
								color: "#ef4444",
								marginBottom: 10,
							}}
						>
							Apa yang ada di sini?
						</motion.p>
						<motion.h2
							variants={fadeUp}
							style={{
								fontSize: "clamp(1.7rem, 3vw, 2.5rem)",
								fontWeight: 700,
								letterSpacing: "-0.025em",
								color: "#f5f5f7",
							}}
						>
							Channel & Fokus Komunitas
						</motion.h2>
					</motion.div>

					<style>{`
.pillar-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px 22px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.2s, background 0.2s; }
.pillar-card:hover { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05); }
.nav-link { color: rgba(245,245,247,0.5); text-decoration: none; transition: color 0.2s; }
.nav-link:hover { color: #f5f5f7; }
.btn-red { background: #ef4444; color: #fff; border-radius: 9999px; text-decoration: none; transition: background 0.2s; display: inline-block; }
.btn-red:hover { background: #dc2626; }
.btn-ghost { color: rgba(245,245,247,0.55); text-decoration: none; transition: color 0.2s; }
.btn-ghost:hover { color: #f5f5f7; }
`}</style>

					<motion.div
						className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
						variants={stagger}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-60px" }}
					>
						{pillars.map((item) => (
							<motion.div
								key={item.label}
								variants={fadeUp}
								className="pillar-card"
							>
								<span style={{ fontSize: 26 }}>{item.icon}</span>
								<p style={{ fontWeight: 600, fontSize: 14, color: "#f5f5f7" }}>
									{item.label}
								</p>
								<p
									style={{
										fontSize: 13,
										color: "rgba(245,245,247,0.45)",
										lineHeight: 1.65,
									}}
								>
									{item.desc}
								</p>
							</motion.div>
						))}
						<motion.div
							variants={fadeUp}
							style={{
								background: "rgba(239,68,68,0.07)",
								border: "1px solid rgba(239,68,68,0.2)",
								borderRadius: 16,
								padding: "22px",
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
								gap: 14,
							}}
						>
							<div className="space-y-2">
								<p style={{ fontWeight: 700, fontSize: 15, color: "#f5f5f7" }}>
									🤝 Bergabung Sekarang
								</p>
								<p
									style={{
										fontSize: 13,
										color: "rgba(245,245,247,0.5)",
										lineHeight: 1.65,
									}}
								>
									Discord ID Community — komunitas paling aktif untuk update
									Discord, klaim quest, dan mabar bareng.
								</p>
							</div>
							<motion.a
								href={inviteUrl}
								target="_blank"
								rel="noreferrer"
								className="btn-red"
								style={{
									padding: "8px 16px",
									fontSize: 13,
									fontWeight: 600,
									width: "fit-content",
								}}
								whileHover={{ scale: 1.04 }}
								whileTap={{ scale: 0.96 }}
							>
								Join Discord →
							</motion.a>
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* FAQ */}
			<section id="faq" className="relative z-10 px-6 pb-20">
				<div className="mx-auto max-w-6xl">
					<motion.div
						className="space-y-10"
						variants={stagger}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-60px" }}
					>
						<motion.div variants={fadeUp}>
							<p
								style={{
									fontSize: 12,
									fontWeight: 600,
									letterSpacing: "0.1em",
									textTransform: "uppercase",
									color: "#ef4444",
									marginBottom: 10,
								}}
							>
								FAQ
							</p>
							<h2
								style={{
									fontSize: "clamp(1.7rem, 3vw, 2.5rem)",
									fontWeight: 700,
									letterSpacing: "-0.025em",
									color: "#f5f5f7",
								}}
							>
								Pertanyaan Umum
							</h2>
						</motion.div>
						<motion.div variants={fadeUp} className="space-y-3 max-w-2xl">
							{faqs.map((item) => (
								<FaqItem key={item.q} q={item.q} a={item.a} />
							))}
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* PARTNER / CTA BANNER */}
			<section id="partner" className="relative z-10 px-6 pb-20">
				<div className="mx-auto max-w-6xl">
					<motion.div
						initial={{ opacity: 0, y: 32 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-60px" }}
						transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
						style={{
							background: "rgba(255,255,255,0.025)",
							border: "1px solid rgba(255,255,255,0.07)",
							borderRadius: 20,
							padding: "32px 36px",
							display: "flex",
							flexDirection: "column",
							gap: 20,
						}}
					>
						<p
							style={{
								fontSize: 12,
								fontWeight: 600,
								letterSpacing: "0.08em",
								textTransform: "uppercase",
								color: "rgba(245,245,247,0.35)",
							}}
						>
							Discord ID · Community Area
						</p>
						<p
							style={{
								fontSize: "clamp(1.3rem, 2.5vw, 1.9rem)",
								fontWeight: 700,
								color: "#f5f5f7",
								lineHeight: 1.3,
								letterSpacing: "-0.02em",
								maxWidth: 560,
							}}
						>
							Tempat paling pas buat kamu yang mau tetap{" "}
							<span style={{ color: "#ef4444" }}>up-to-date</span> soal Discord.
						</p>
						<p
							style={{
								fontSize: 14,
								color: "rgba(245,245,247,0.45)",
								lineHeight: 1.7,
								maxWidth: 520,
							}}
						>
							Fitur Discord terbaru, klaim orbs & reward Discord Quest, dan
							mabar santai — semuanya ada di sini.
						</p>
						<div className="flex flex-wrap gap-3">
							<motion.a
								href={inviteUrl}
								target="_blank"
								rel="noreferrer"
								className="btn-red"
								style={{
									padding: "9px 22px",
									fontSize: 14,
									fontWeight: 700,
									boxShadow: "0 0 24px rgba(239,68,68,0.3)",
								}}
								whileHover={{
									scale: 1.04,
									boxShadow: "0 0 36px rgba(239,68,68,0.45)",
								}}
								whileTap={{ scale: 0.97 }}
							>
								Join Community
							</motion.a>
							<a
								href="https://discord.my.id"
								target="_blank"
								rel="noreferrer"
								className="btn-ghost"
								style={{
									border: "1px solid rgba(255,255,255,0.12)",
									borderRadius: 9999,
									padding: "9px 22px",
									fontSize: 14,
									fontWeight: 500,
									background: "rgba(255,255,255,0.04)",
								}}
							>
								discord.my.id ↗
							</a>
						</div>
					</motion.div>
				</div>
			</section>
		</main>
	);
}
