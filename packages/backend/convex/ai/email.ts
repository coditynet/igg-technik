import { createGateway, generateText, Output } from "ai";
import { internalAction, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "../_generated/api";

const gateway = createGateway({
	apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

export const createEventFromEmail = internalAction({
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
			system: `You are an AI assistant that extracts event information from email text. Extract the event title, description, start time, end time, location, and any other relevant details.

IMPORTANT CONTEXT:
- Current time: ${germanTime} (Europe/Berlin timezone)
- All times in the email are in German time (CET/CEST - Europe/Berlin timezone)
- When parsing times like "13:00", interpret them as German time
- Return dates in ISO 8601 format with timezone information
- If only a time is mentioned without a date, assume it's for today or the next occurrence of that time`,
			prompt: `Extract event information from the following email:\n\n${args.emailText}`,
			output: Output.object({
				schema: z.object({
					title: z.string().describe("The event title or subject"),
					start: z.string().describe("Start date and time in ISO 8601 format"),
					end: z.string().describe("End date and time in ISO 8601 format"),
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

		const startDate = new Date(eventData.start);
		const endDate = new Date(eventData.end);

		if (eventData.allDay) {
			startDate.setHours(0, 0, 0, 0);
			endDate.setHours(0, 0, 0, 0);
		}

		await ctx.runMutation(internal.ai.email.insertEvent, {
			title: eventData.title,
			description: eventData.description || undefined,
			start: startDate.getTime(),
			end: endDate.getTime(),
			allDay: eventData.allDay || undefined,
			label: eventData.label || undefined,
			location: eventData.location || undefined,
		});

		return "success";
	},
});

export const insertEvent = internalMutation({
	args: {
		title: v.string(),
		description: v.optional(v.string()),
		start: v.number(),
		end: v.number(),
		allDay: v.optional(v.boolean()),
		label: v.optional(v.string()),
		location: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const firstGroup = await ctx.db.query("groups").first();
		if (!firstGroup) {
			throw new Error("No groups found. Please create a group first.");
		}

		return await ctx.db.insert("events", {
			title: args.title,
			description: args.description,
			start: args.start,
			end: args.end,
			allDay: args.allDay,
			groupId: firstGroup._id,
			label: args.label,
			location: args.location,
		});
	},
});
