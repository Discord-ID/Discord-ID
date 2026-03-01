import type {
	ButtonHTMLAttributes,
	InputHTMLAttributes,
	ReactNode,
	TextareaHTMLAttributes,
} from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			{...props}
			style={{
				width: "100%",
				height: 38,
				padding: "0 12px",
				borderRadius: 10,
				border: "1px solid rgba(255,255,255,0.1)",
				background: "rgba(10,10,11,0.7)",
				color: "#f5f5f7",
				fontSize: 13,
				...props.style,
			}}
		/>
	);
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return (
		<textarea
			{...props}
			style={{
				width: "100%",
				padding: 12,
				borderRadius: 10,
				border: "1px solid rgba(255,255,255,0.1)",
				background: "rgba(10,10,11,0.7)",
				color: "#f5f5f7",
				fontSize: 13,
				lineHeight: 1.5,
				...props.style,
			}}
		/>
	);
}

export function SmallButton({
	children,
	variant = "default",
	...props
}: {
	children: ReactNode;
	variant?: "default" | "danger";
} & ButtonHTMLAttributes<HTMLButtonElement>) {
	const danger = variant === "danger";
	return (
		<button
			type="button"
			{...props}
			style={{
				height: 32,
				padding: "0 10px",
				borderRadius: 10,
				border: danger
					? "1px solid rgba(239,68,68,0.3)"
					: "1px solid rgba(255,255,255,0.12)",
				background: danger ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.06)",
				color: "#f5f5f7",
				fontSize: 12,
				fontWeight: 700,
				cursor: "pointer",
				...props.style,
			}}
		>
			{children}
		</button>
	);
}

export function SectionCard({
	title,
	actions,
	children,
}: {
	title: string;
	actions?: ReactNode;
	children: ReactNode;
}) {
	return (
		<section
			style={{
				border: "1px solid rgba(255,255,255,0.08)",
				borderRadius: 16,
				padding: 20,
				background: "rgba(255,255,255,0.03)",
			}}
		>
			<div className="mb-3 flex flex-wrap items-center gap-2">
				<h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
				{actions}
			</div>
			{children}
		</section>
	);
}
