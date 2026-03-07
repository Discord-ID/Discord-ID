"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
	// { label: "Tentang", href: "/#tentang" },
	// { label: "Fitur", href: "/#fitur" },
	// { label: "Live", href: "/#live" },
	// { label: "FAQ", href: "/#faq" },
	{ label: "Blog", href: "/blog" },
	{ label: "Staff", href: "/staff" },
];

function UserAvatar({
	name,
	image,
}: {
	name?: string | null;
	image?: string | null;
}) {
	if (image) {
		return (
			<Image
				src={image}
				alt={name ?? "User avatar"}
				width={28}
				height={28}
				className="shrink-0"
				style={{
					width: 28,
					height: 28,
					borderRadius: "9999px",
					border: "1px solid rgba(255,255,255,0.12)",
				}}
			/>
		);
	}

	const initial = (name?.trim()?.charAt(0) ?? "?").toUpperCase();
	return (
		<div
			aria-hidden="true"
			style={{
				width: 28,
				height: 28,
				flexShrink: 0,
				borderRadius: "9999px",
				border: "1px solid rgba(255,255,255,0.12)",
				background: "rgba(255,255,255,0.08)",
				display: "grid",
				placeItems: "center",
				fontSize: 12,
				fontWeight: 700,
				color: "rgba(245,245,247,0.9)",
			}}
		>
			{initial}
		</div>
	);
}

export function Navbar() {
	const { data: session, status } = useSession();
	const isAuthenticated = status === "authenticated";
	const roleLabel = !isAuthenticated
		? "Visitor"
		: session.role === "admin"
			? "Admin"
			: session.role === "moderator"
				? "Moderator"
				: "Visitor";
	const roleColor =
		roleLabel === "Admin"
			? "#22c55e"
			: roleLabel === "Moderator"
				? "#60a5fa"
				: "#f59e0b";

	return (
		<nav
			className="fixed inset-x-0 top-0 z-50 border-b"
			style={{
				borderColor: "rgba(255,255,255,0.06)",
				background: "rgba(10,10,11,0.85)",
				backdropFilter: "blur(16px)",
			}}
		>
			<div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-4 md:px-6 md:py-4">
				<Link
					href="/"
					className="flex shrink-0 items-center gap-1.5 sm:gap-2"
					aria-label="Go to home"
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 127.14 96.36"
						aria-hidden="true"
						className="h-4 w-4 sm:h-5 sm:w-5"
						style={{ fill: "#f5f5f7" }}
					>
						<path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
					</svg>
					<Image
						src="/discord-id.svg"
						alt="Discord ID"
						width={141}
						height={23}
						className="h-[18px] w-auto sm:h-[20px] md:h-[23px]"
					/>
				</Link>

				<div
					className="hidden md:flex items-center gap-7"
					style={{ fontSize: 14 }}
				>
					{navItems.map((item) => (
						<a key={item.label} href={item.href} className="nav-link">
							{item.label}
						</a>
					))}
				</div>

				<div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
					{isAuthenticated ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									className="flex items-center gap-2"
									style={{
										padding: "5px 8px",
										borderRadius: 9999,
										border: "1px solid rgba(255,255,255,0.1)",
										background: "rgba(255,255,255,0.02)",
										cursor: "pointer",
										whiteSpace: "nowrap",
									}}
									aria-label="Open user menu"
								>
									<UserAvatar
										name={session?.user?.name}
										image={session?.user?.image}
									/>
									<div
										className="hidden md:flex flex-col"
										style={{ lineHeight: 1.1 }}
									>
										<span
											style={{
												fontSize: 11,
												color: "rgba(245,245,247,0.6)",
												fontWeight: 600,
											}}
										>
											{session?.user?.name ?? "User"}
										</span>
										<span
											style={{
												fontSize: 11,
												fontWeight: 700,
												color: roleColor,
											}}
										>
											{roleLabel}
										</span>
									</div>
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel>
									<div className="flex flex-col">
										<span
											style={{ fontSize: 12, color: "rgba(245,245,247,0.85)" }}
										>
											{session?.user?.name ?? "User"}
										</span>
										<span
											style={{
												fontSize: 11,
												fontWeight: 700,
												color: roleColor,
											}}
										>
											{roleLabel}
										</span>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{session.role === "admin" || session.role === "moderator" ? (
									<DropdownMenuItem asChild>
										<Link href="/dashboard">Dashboard</Link>
									</DropdownMenuItem>
								) : null}
								{session.role === "admin" || session.role === "moderator" ? (
									<DropdownMenuItem asChild>
										<Link href="/settings">Settings</Link>
									</DropdownMenuItem>
								) : null}
								{session.role === "admin" || session.role === "moderator" ? (
									<DropdownMenuSeparator />
								) : null}
								<DropdownMenuItem
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
								>
									Logout
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<button
							type="button"
							onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
							className="btn-red"
							style={{
								padding: "6px 10px",
								fontSize: 12,
								fontWeight: 700,
								letterSpacing: "-0.01em",
								whiteSpace: "nowrap",
							}}
						>
							Login
						</button>
					)}

					<a
						href="https://discord.gg/HbZEEuj4KJ"
						target="_blank"
						rel="noreferrer"
						className="btn-red"
						style={{
							padding: "6px 11px",
							fontSize: 12,
							fontWeight: 600,
							letterSpacing: "-0.01em",
							whiteSpace: "nowrap",
						}}
					>
						<span className="sm:hidden">Join</span>
						<span className="hidden sm:inline">Join Sekarang</span>
					</a>
				</div>
			</div>

			<div className="mx-auto max-w-6xl border-t border-white/8 px-3 pb-2 md:hidden">
				<div className="-mx-1 flex items-center gap-1 overflow-x-auto px-1 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{navItems.map((item) => (
						<a
							key={item.label}
							href={item.href}
							className="shrink-0"
							style={{
								padding: "4px 10px",
								fontSize: 12,
								fontWeight: 600,
								borderRadius: 9999,
								border: "1px solid rgba(255,255,255,0.12)",
								background: "rgba(255,255,255,0.04)",
								color: "rgba(245,245,247,0.8)",
								textDecoration: "none",
								whiteSpace: "nowrap",
							}}
						>
							{item.label}
						</a>
					))}
				</div>
			</div>
		</nav>
	);
}
