"use client";

import { RiArrowDownSLine } from "@remixicon/react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

const LS_PREFIX = "dashboard-acc:";

export function DashboardPanel({
	id: anchorId,
	defaultOpen = false,
	kicker,
	title,
	description,
	children,
}: {
	id?: string;
	/** Expanded on first load when nothing is saved in browser. */
	defaultOpen?: boolean;
	kicker: string;
	title: string;
	description?: ReactNode;
	children: ReactNode;
}) {
	const storageKey = anchorId !== undefined ? `${LS_PREFIX}${anchorId}` : null;
	const [open, setOpenState] = useState(defaultOpen);

	useEffect(() => {
		if (!storageKey) return;
		queueMicrotask(() => {
			try {
				const raw = localStorage.getItem(storageKey);
				if (raw === "1") setOpenState(true);
				else if (raw === "0") setOpenState(false);
				else setOpenState(defaultOpen);
			} catch {
				setOpenState(defaultOpen);
			}
		});
	}, [storageKey, defaultOpen]);

	const setOpen = useCallback(
		(next: boolean) => {
			setOpenState(next);
			if (storageKey) {
				try {
					localStorage.setItem(storageKey, next ? "1" : "0");
				} catch {
					// ignore quota / private mode
				}
			}
		},
		[storageKey],
	);

	function toggle() {
		setOpen(!open);
	}

	const baseId = anchorId ?? "dashboard-section";
	const kickerId = `${baseId}-kicker`;
	const titleId = `${baseId}-title-main`;
	const regionId = `${baseId}-body`;

	return (
		<section id={anchorId} className="scroll-mt-6">
			<button
				type="button"
				className="flex w-full items-start gap-3 rounded-xl border border-[rgba(255,255,255,0.1)] px-4 py-3.5 text-left outline-none ring-offset-2 ring-offset-[#0a0a0b] transition-colors hover:bg-[rgba(255,255,255,0.05)] focus-visible:ring-2 focus-visible:ring-[rgba(239,68,68,0.45)]"
				style={{
					background: "rgba(255,255,255,0.025)",
					color: "#f5f5f7",
				}}
				aria-expanded={open}
				aria-controls={regionId}
				aria-labelledby={`${kickerId} ${titleId}`}
				onClick={toggle}
			>
				<RiArrowDownSLine
					className={`mt-0.5 h-5 w-5 shrink-0 text-[rgba(239,68,68,0.92)] transition-transform duration-200 ${
						open ? "rotate-180" : "rotate-0"
					}`}
					aria-hidden
				/>
				<span className="min-w-0 flex-1">
					<p
						id={kickerId}
						className="text-[11px] font-bold uppercase tracking-[0.12em]"
						style={{ color: "#ef4444" }}
					>
						{kicker}
					</p>
					<span
						id={titleId}
						className="mt-1 block text-[1.05rem] font-extrabold tracking-tight sm:text-[1.2rem]"
					>
						{title}
					</span>
					{description ? (
						<span className="mt-1.5 block text-[13px] leading-snug text-[rgba(245,245,247,0.52)] sm:leading-relaxed">
							{description}
						</span>
					) : null}
				</span>
			</button>

			<section
				id={regionId}
				aria-labelledby={`${kickerId} ${titleId}`}
				aria-hidden={!open}
				className={open ? "mt-4 block" : "hidden"}
			>
				{children}
			</section>
		</section>
	);
}
