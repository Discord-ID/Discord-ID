import type { Components } from "react-markdown";

export const markdownComponents: Components = {
	h1: ({ children }) => (
		<h1
			style={{
				fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)",
				fontWeight: 700,
				letterSpacing: "-0.02em",
				marginTop: 28,
				marginBottom: 10,
				color: "#f5f5f7",
				lineHeight: 1.25,
			}}
		>
			{children}
		</h1>
	),
	h2: ({ children }) => (
		<h2
			style={{
				fontSize: "clamp(1.15rem, 2vw, 1.5rem)",
				fontWeight: 700,
				letterSpacing: "-0.02em",
				marginTop: 24,
				marginBottom: 8,
				color: "#f5f5f7",
				lineHeight: 1.3,
			}}
		>
			{children}
		</h2>
	),
	h3: ({ children }) => (
		<h3
			style={{
				fontSize: "1.1rem",
				fontWeight: 700,
				marginTop: 20,
				marginBottom: 6,
				color: "#f5f5f7",
			}}
		>
			{children}
		</h3>
	),
	h4: ({ children }) => (
		<h4
			style={{
				fontSize: "1rem",
				fontWeight: 700,
				marginTop: 16,
				marginBottom: 4,
				color: "#f5f5f7",
			}}
		>
			{children}
		</h4>
	),
	h5: ({ children }) => (
		<h5
			style={{
				fontSize: "0.95rem",
				fontWeight: 600,
				marginTop: 14,
				marginBottom: 4,
				color: "#f5f5f7",
			}}
		>
			{children}
		</h5>
	),
	h6: ({ children }) => (
		<h6
			style={{
				fontSize: "0.9rem",
				fontWeight: 600,
				marginTop: 12,
				marginBottom: 4,
				color: "rgba(245,245,247,0.7)",
			}}
		>
			{children}
		</h6>
	),
	p: ({ children }) => (
		<p
			style={{
				fontSize: 15,
				lineHeight: 1.8,
				color: "rgba(245,245,247,0.75)",
				margin: "0 0 14px",
			}}
		>
			{children}
		</p>
	),
	a: ({ href, children }) => (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			style={{ color: "#ef4444", textDecoration: "underline", textUnderlineOffset: 3 }}
		>
			{children}
		</a>
	),
	strong: ({ children }) => (
		<strong style={{ color: "#f5f5f7", fontWeight: 700 }}>{children}</strong>
	),
	em: ({ children }) => (
		<em style={{ color: "rgba(245,245,247,0.88)", fontStyle: "italic" }}>{children}</em>
	),
	del: ({ children }) => (
		<del style={{ color: "rgba(245,245,247,0.45)", textDecoration: "line-through" }}>{children}</del>
	),
	blockquote: ({ children }) => (
		<blockquote
			style={{
				margin: "16px 0",
				padding: "12px 16px",
				borderLeft: "3px solid #ef4444",
				background: "rgba(239,68,68,0.08)",
				borderRadius: "0 10px 10px 0",
				color: "rgba(245,245,247,0.85)",
				fontSize: 14,
				lineHeight: 1.75,
			}}
		>
			{children}
		</blockquote>
	),
	pre: ({ children }) => {
		const child = children as React.ReactElement<{ className?: string; children?: string }>;
		const className = child?.props?.className ?? "";
		const lang = className.replace("language-", "") || "text";
		const code = child?.props?.children ?? "";
		return (
			<div
				style={{
					borderRadius: 12,
					border: "1px solid rgba(255,255,255,0.1)",
					background: "rgba(0,0,0,0.4)",
					overflow: "hidden",
					margin: "14px 0",
				}}
			>
				<div
					style={{
						padding: "5px 12px",
						fontSize: 11,
						fontWeight: 700,
						color: "rgba(245,245,247,0.4)",
						borderBottom: "1px solid rgba(255,255,255,0.07)",
						textTransform: "lowercase",
						letterSpacing: "0.05em",
					}}
				>
					{lang}
				</div>
				<pre
					style={{
						margin: 0,
						padding: "14px 16px",
						fontSize: 13,
						lineHeight: 1.65,
						color: "#f5f5f7",
						whiteSpace: "pre-wrap",
						overflowX: "auto",
						fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Mono', monospace",
					}}
				>
					<code>{code}</code>
				</pre>
			</div>
		);
	},
	code: ({ children }) => (
		<code
			style={{
				background: "rgba(255,255,255,0.1)",
				padding: "2px 6px",
				borderRadius: 5,
				fontSize: "0.88em",
				fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Mono', monospace",
				color: "#f5f5f7",
			}}
		>
			{children}
		</code>
	),
	ul: ({ children }) => (
		<ul
			style={{
				paddingLeft: 22,
				margin: "6px 0 14px",
				color: "rgba(245,245,247,0.75)",
				lineHeight: 1.8,
				fontSize: 15,
				listStyleType: "disc",
			}}
		>
			{children}
		</ul>
	),
	ol: ({ children }) => (
		<ol
			style={{
				paddingLeft: 22,
				margin: "6px 0 14px",
				color: "rgba(245,245,247,0.75)",
				lineHeight: 1.8,
				fontSize: 15,
				listStyleType: "decimal",
			}}
		>
			{children}
		</ol>
	),
	li: ({ children }) => (
		<li style={{ marginBottom: 5, paddingLeft: 2 }}>{children}</li>
	),
	hr: () => (
		<hr
			style={{
				border: "none",
				borderTop: "1px solid rgba(255,255,255,0.1)",
				margin: "24px 0",
			}}
		/>
	),
	img: ({ src, alt }) => (
		<figure style={{ margin: "18px 0" }}>
			<img
				src={src}
				alt={alt ?? ""}
				style={{
					display: "block",
					width: "100%",
					height: "auto",
					borderRadius: 12,
					border: "1px solid rgba(255,255,255,0.08)",
				}}
			/>
			{alt ? (
				<figcaption
					style={{
						fontSize: 12,
						color: "rgba(245,245,247,0.45)",
						marginTop: 8,
						textAlign: "center",
					}}
				>
					{alt}
				</figcaption>
			) : null}
		</figure>
	),
	table: ({ children }) => (
		<div style={{ overflowX: "auto", margin: "16px 0" }}>
			<table
				style={{
					width: "100%",
					borderCollapse: "collapse",
					fontSize: 14,
					color: "rgba(245,245,247,0.75)",
				}}
			>
				{children}
			</table>
		</div>
	),
	thead: ({ children }) => (
		<thead style={{ borderBottom: "2px solid rgba(255,255,255,0.12)" }}>
			{children}
		</thead>
	),
	th: ({ children }) => (
		<th
			style={{
				padding: "8px 12px",
				textAlign: "left",
				fontWeight: 700,
				color: "#f5f5f7",
				whiteSpace: "nowrap",
			}}
		>
			{children}
		</th>
	),
	td: ({ children }) => (
		<td
			style={{
				padding: "8px 12px",
				borderBottom: "1px solid rgba(255,255,255,0.06)",
				verticalAlign: "top",
			}}
		>
			{children}
		</td>
	),
	input: ({ checked }) => (
		<input
			type="checkbox"
			checked={checked}
			readOnly
			style={{ marginRight: 6, accentColor: "#ef4444" }}
		/>
	),
};

export const previewMarkdownComponents: Components = {
	...markdownComponents,
	h1: ({ children }) => <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: "#f5f5f7" }}>{children}</h1>,
	h2: ({ children }) => <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 5, color: "#f5f5f7" }}>{children}</h2>,
	h3: ({ children }) => <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: "#f5f5f7" }}>{children}</h3>,
	p: ({ children }) => <p style={{ fontSize: 13, lineHeight: 1.75, color: "rgba(245,245,247,0.75)", margin: "0 0 10px" }}>{children}</p>,
	ul: ({ children }) => <ul style={{ paddingLeft: 18, margin: "4px 0 10px", color: "rgba(245,245,247,0.75)", fontSize: 13, listStyleType: "disc" }}>{children}</ul>,
	ol: ({ children }) => <ol style={{ paddingLeft: 18, margin: "4px 0 10px", color: "rgba(245,245,247,0.75)", fontSize: 13, listStyleType: "decimal" }}>{children}</ol>,
	li: ({ children }) => <li style={{ marginBottom: 3 }}>{children}</li>,
	pre: ({ children }) => {
		const child = children as React.ReactElement<{ className?: string; children?: string }>;
		const lang = (child?.props?.className ?? "").replace("language-", "") || "text";
		const code = child?.props?.children ?? "";
		return (
			<pre
				style={{
					background: "rgba(0,0,0,0.3)",
					border: "1px solid rgba(255,255,255,0.08)",
					borderRadius: 8,
					padding: "10px 12px",
					fontSize: 12,
					fontFamily: "ui-monospace, monospace",
					overflowX: "auto",
					margin: "8px 0",
					color: "#f5f5f7",
					whiteSpace: "pre-wrap",
				}}
			>
				<span style={{ fontSize: 10, color: "rgba(245,245,247,0.35)", display: "block", marginBottom: 4 }}>{lang}</span>
				<code>{code}</code>
			</pre>
		);
	},
};
