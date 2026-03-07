type DiscordWebhookPayload = {
	content?: string;
	embeds?: Array<{
		title?: string;
		description?: string;
		color?: number;
		fields?: Array<{
			name: string;
			value: string;
			inline?: boolean;
		}>;
		timestamp?: string;
	}>;
	username?: string;
	avatar_url?: string;
	allowed_mentions?: {
		parse?: string[];
	};
};

const DEFAULT_ACCENT_COLOR = 9225410;

function asPayload(
	input: string | DiscordWebhookPayload,
): DiscordWebhookPayload {
	if (typeof input !== "string") {
		return {
			...input,
			allowed_mentions: input.allowed_mentions ?? { parse: [] },
		};
	}

	return {
		embeds: [
			{
				description: input,
				color: DEFAULT_ACCENT_COLOR,
				timestamp: new Date().toISOString(),
			},
		],
		allowed_mentions: { parse: [] },
	};
}

export async function discordLog(
	messageOrPayload: string | DiscordWebhookPayload,
) {
	const webhook = process.env.DISCORD_LOG_WEBHOOK_URL;
	if (!webhook) return;

	const payload = asPayload(messageOrPayload);

	try {
		await fetch(webhook, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
	} catch {
		// ignore failures
	}
}

export function buildDiscordEmbedLogPayload(input: {
	action: string;
	actor: string;
	details?: unknown;
	color?: number;
}): DiscordWebhookPayload {
	const detailsText = input.details
		? JSON.stringify(input.details, null, 2).slice(0, 3500)
		: null;

	return {
		embeds: [
			{
				title: `🔔 ${input.action}`,
				color: input.color ?? DEFAULT_ACCENT_COLOR,
				fields: [
					{ name: "Actor", value: input.actor, inline: false },
					...(detailsText
						? [
								{
									name: "Details",
									value: `\`\`\`json\n${detailsText}\n\`\`\``,
									inline: false,
								},
							]
						: []),
				],
				timestamp: new Date().toISOString(),
			},
		],
		allowed_mentions: { parse: [] },
	};
}
