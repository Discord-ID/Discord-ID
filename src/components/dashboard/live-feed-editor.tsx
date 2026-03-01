import type { LiveFeedItem } from "@/lib/content-types";
import { emptyFeedItem, reorderArray } from "./helpers";
import { Input, SectionCard, SmallButton, Textarea } from "./ui";

export function LiveFeedEditor({
	feedItems,
	onChange,
	onSave,
}: {
	feedItems: LiveFeedItem[];
	onChange: (items: LiveFeedItem[]) => void;
	onSave: () => void;
}) {
	function updateFeed(index: number, patch: Partial<LiveFeedItem>) {
		const next = [...feedItems];
		next[index] = { ...next[index], ...patch };
		onChange(next);
	}

	function moveFeed(fromIndex: number, toIndex: number) {
		if (fromIndex === toIndex) return;
		onChange(reorderArray(feedItems, fromIndex, toIndex));
	}

	return (
		<SectionCard
			title="Live Community Feed"
			actions={
				<>
					<SmallButton
						onClick={() => onChange([...feedItems, emptyFeedItem()])}
					>
						+ Feed
					</SmallButton>
					<button
						type="button"
						onClick={onSave}
						className="btn-red"
						style={{ padding: "8px 14px", fontSize: 13, fontWeight: 700 }}
					>
						Simpan Feed
					</button>
				</>
			}
		>
			<div className="space-y-3">
				{feedItems.map((item, index) => (
					<div
						key={`feed-${item.tag}-${item.text}-${item.color}`}
						style={{
							border: "1px solid rgba(255,255,255,0.08)",
							borderRadius: 12,
							padding: 12,
							background: "rgba(255,255,255,0.02)",
						}}
					>
						<div className="mb-2 flex flex-wrap gap-2">
							<SmallButton
								onClick={() => index > 0 && moveFeed(index, index - 1)}
							>
								↑
							</SmallButton>
							<SmallButton
								onClick={() =>
									index < feedItems.length - 1 && moveFeed(index, index + 1)
								}
							>
								↓
							</SmallButton>
							<SmallButton
								variant="danger"
								onClick={() =>
									onChange(
										feedItems.filter(
											(_, currentIndex) => currentIndex !== index,
										),
									)
								}
							>
								Hapus
							</SmallButton>
						</div>
						<div className="grid gap-2 md:grid-cols-3">
							<Input
								placeholder="TAG"
								value={item.tag}
								onChange={(event) =>
									updateFeed(index, { tag: event.target.value })
								}
							/>
							<Input
								placeholder="#ef4444"
								value={item.color}
								onChange={(event) =>
									updateFeed(index, { color: event.target.value })
								}
							/>
							<Textarea
								rows={2}
								placeholder="Text"
								value={item.text}
								onChange={(event) =>
									updateFeed(index, { text: event.target.value })
								}
								style={{ minHeight: 38 }}
							/>
						</div>
					</div>
				))}
			</div>
		</SectionCard>
	);
}
