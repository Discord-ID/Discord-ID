type LoginPageProps = {
	searchParams: Promise<{
		callbackUrl?: string;
		error?: string;
	}>;
};

function getErrorMessage(error?: string) {
	if (error === "AccessDenied" || error === "NotAdmin") {
		return "Akun Discord kamu belum terdaftar sebagai admin.";
	}

	if (error) {
		return "Login gagal, silakan coba lagi.";
	}

	return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const params = await searchParams;
	const callbackUrl = params.callbackUrl || "/dashboard";
	const errorMessage = getErrorMessage(params.error);

	return (
		<main
			className="min-h-screen px-6 py-20"
			style={{ background: "#0a0a0b", color: "#f5f5f7" }}
		>
			<div
				className="mx-auto max-w-md"
				style={{
					border: "1px solid rgba(255,255,255,0.08)",
					borderRadius: 16,
					padding: 24,
					background: "rgba(255,255,255,0.03)",
				}}
			>
				<p
					style={{
						fontSize: 12,
						color: "#ef4444",
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						fontWeight: 700,
					}}
				>
					Admin Access
				</p>
				<h1
					style={{
						fontSize: "clamp(1.7rem, 3vw, 2.2rem)",
						fontWeight: 800,
						letterSpacing: "-0.02em",
						marginTop: 8,
					}}
				>
					Login Admin Discord
				</h1>
				<p
					style={{ color: "rgba(245,245,247,0.6)", marginTop: 8, fontSize: 14 }}
				>
					Gunakan akun Discord admin untuk mengakses dashboard editor.
				</p>

				{errorMessage ? (
					<p style={{ color: "#fca5a5", marginTop: 14, fontSize: 13 }}>
						{errorMessage}
					</p>
				) : null}

				<a
					href={`/api/auth/signin/discord?callbackUrl=${encodeURIComponent(callbackUrl)}`}
					className="btn-red"
					style={{
						display: "inline-block",
						marginTop: 18,
						padding: "10px 16px",
						fontSize: 14,
						fontWeight: 700,
						textDecoration: "none",
					}}
				>
					Login dengan Discord
				</a>
			</div>
		</main>
	);
}
