import Link from "next/link";

export default function NotFoundPage() {
	return (
		<main
			className="min-h-screen px-6 py-16"
			style={{ background: "#0a0a0b", color: "#f5f5f7" }}
		>
			<div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-5 text-center">
				<p
					style={{
						fontSize: 12,
						fontWeight: 700,
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						color: "#ef4444",
					}}
				>
					Error 404
				</p>
				<h1 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", fontWeight: 800 }}>
					Halaman tidak ditemukan
				</h1>
				<p style={{ color: "rgba(245,245,247,0.72)", maxWidth: 620 }}>
					Sepertinya link yang kamu buka sudah dipindahkan atau memang tidak
					ada. Coba balik ke beranda atau lihat artikel terbaru.
				</p>

				<div className="mt-3 flex flex-wrap items-center justify-center gap-3">
					<Link
						href="/"
						className="btn-red"
						style={{ padding: "9px 14px", fontSize: 13, fontWeight: 700 }}
					>
						Kembali ke Beranda
					</Link>
				</div>
			</div>
		</main>
	);
}
