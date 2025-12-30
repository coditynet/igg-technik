import { createGateway, generateText, Output } from "ai";
import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { z } from "zod";

const gateway = createGateway({
	apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

/**
 * Extract event data from email text using AI
 * Returns the extracted data without saving to database
 */
export const extractEventData = internalAction({
	args: {
		emailText: v.string(),
	},
	handler: async (ctx, args) => {
		const now = new Date();
		const germanTime = new Intl.DateTimeFormat("de-DE", {
			timeZone: "Europe/Berlin",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			weekday: "long",
		}).format(now);

		const result = await generateText({
			model: gateway("openai/gpt-5-nano"),
			system: `You are an AI assistant that extracts event information from email text. Extract the event title, description, start time, end time, location, and any other relevant details. If you cannot find a specific piece of information, leave it as null.

IMPORTANT CONTEXT:
- Current time: ${germanTime} (Europe/Berlin timezone)
- All times in the email are in German time (CET/CEST - Europe/Berlin timezone)
- When parsing times like "13:00", interpret them as German time
- Return dates in ISO 8601 format with timezone information
- If you cannot determine a field with confidence, return null for that field - all fields you leave empty will result in the user beeing asked for confirmation so you can safly leave fields empty if unsure`,
			prompt: `Extract event information from the following email:\n\n${args.emailText}`,
			output: Output.object({
				schema: z.object({
					title: z.string().nullable().describe("The event title or subject"),
					start: z
						.string()
						.nullable()
						.describe("Start date and time in ISO 8601 format"),
					end: z
						.string()
						.nullable()
						.describe("End date and time in ISO 8601 format"),
					description: z
						.string()
						.nullable()
						.describe("Additional details about the event"),
					location: z
						.string()
						.nullable()
						.describe("Event location if mentioned"),
					allDay: z
						.boolean()
						.nullable()
						.describe("Whether this is an all-day event"),
					label: z.string().nullable().describe("Event category or label"),
				}),
			}),
		});

		const eventData = result.output;

		let startTime: number | undefined;
		let endTime: number | undefined;

		if (eventData.start) {
			const startDate = new Date(eventData.start);
			if (eventData.allDay) {
				startDate.setHours(0, 0, 0, 0);
			}
			startTime = startDate.getTime();
		}

		if (eventData.end) {
			const endDate = new Date(eventData.end);
			if (eventData.allDay) {
				endDate.setHours(0, 0, 0, 0);
			}
			endTime = endDate.getTime();
		}

		return {
			title: eventData.title || undefined,
			description: eventData.description || undefined,
			start: startTime,
			end: endTime,
			allDay: eventData.allDay || undefined,
			label: eventData.label || undefined,
			location: eventData.location || undefined,
		};
	},
});
