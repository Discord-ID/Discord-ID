import Image from "next/image";

export function Footer() {
	return (
		<footer
			style={{
				borderTop: "1px solid rgba(255,255,255,0.06)",
				background: "rgba(255,255,255,0.01)",
				padding: "24px 24px",
			}}
		>
			<div className="mx-auto max-w-6xl flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-2.5">
					<Image
						src="/icon.svg"
						alt="Discord ID"
						width={24}
						height={24}
						style={{ height: 24, width: "auto", opacity: 0.82 }}
					/>
					<Image
						src="/discord-id.svg"
						alt="Discord ID"
						width={122}
						height={20}
						style={{ height: 20, width: "auto", opacity: 0.82 }}
					/>
					<span
						style={{
							fontSize: 13,
							fontWeight: 600,
							color: "rgba(245,245,247,0.45)",
						}}
					>
						· discord.my.id
					</span>
				</div>
				<div
					style={{
						fontSize: 12,
						color: "rgba(245,245,247,0.2)",
						textAlign: "right",
					}}
				>
					<p>
						© {new Date().getFullYear()} Discord ID Community — Komunitas
						Discord Indonesia
					</p>
					<p style={{ fontSize: 11, color: "rgba(245,245,247,0.35)" }}>
						This community server is not affiliated with Discord Inc.
					</p>
				</div>
			</div>
		</footer>
	);
}
