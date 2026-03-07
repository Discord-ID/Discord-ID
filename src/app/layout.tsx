import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { AppSessionProvider } from "@/components/session-provider";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL("https://discord.my.id"),
	title: {
		default: "Discord ID Community",
		template: "%s | Discord ID",
	},
	description:
		"Komunitas Discord Indonesia untuk update, quests, mabar, dan developer discussion.",
	icons: {
		icon: "/discord-id.svg",
		shortcut: "/discord-id.svg",
		apple: "/discord-id.svg",
	},
	openGraph: {
		title: "Discord ID Community",
		description:
			"Komunitas Discord Indonesia untuk update, quests, mabar, dan developer discussion.",
		type: "website",
		url: "https://discord.my.id",
		siteName: "Discord ID",
		images: [
			{
				url: "/discord-id.svg",
				width: 1200,
				height: 630,
				alt: "Discord ID logo",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Discord ID Community",
		description:
			"Komunitas Discord Indonesia untuk update, quests, mabar, dan developer discussion.",
		images: ["/discord-id.svg"],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={outfit.variable}>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				style={{
					background: "#0a0a0b",
					color: "#f5f5f7",
					minHeight: "100vh",
				}}
			>
				<AppSessionProvider>
					<Navbar />
					<div className="pt-[116px] md:pt-[84px]">{children}</div>
					<Footer />
					<Analytics />
				</AppSessionProvider>
			</body>
		</html>
	);
}
