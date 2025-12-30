import { createGateway, generateText, Output } from "ai";
import {
	internalAction,
	internalMutation,
	internalQuery,
} from "../_generated/server";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "../_generated/api";

const gateway = createGateway({
	apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

export const createEventFromEmail = internalAction({
	args: {
		emailText: v.string(),
		emailRecordId: v.id("emails"),
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
- If only a time is mentioned without a date, assume it's for today or the next occurrence of that time
- If the user provides a start time but without an end time, make it last 1 hour
- If you cannot determine a field with confidence, return null for that field`,
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

		const emailRegistrationId = await ctx.runMutation(
			internal.ai.email.insertEmailRegistration,
			{
				title: eventData.title || undefined,
				description: eventData.description || undefined,
				start: startTime,
				end: endTime,
				allDay: eventData.allDay || undefined,
				label: eventData.label || undefined,
				location: eventData.location || undefined,
				emailRecordId: args.emailRecordId,
			},
		);

		await ctx.runAction(internal.ai.email.sendConfirmationEmail, {
			emailRegistrationId,
		});

		return "success";
	},
});

export const insertEmailRegistration = internalMutation({
	args: {
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		start: v.optional(v.number()),
		end: v.optional(v.number()),
		allDay: v.optional(v.boolean()),
		label: v.optional(v.string()),
		location: v.optional(v.string()),
		emailRecordId: v.id("emails"),
	},
	handler: async (ctx, args) => {
		const accessId = crypto.randomUUID();

		const emailRegistrationId = await ctx.db.insert("emailRegistrations", {
			accessId,
			emailId: args.emailRecordId,
			title: args.title,
			description: args.description,
			start: args.start,
			end: args.end,
			allDay: args.allDay,
			label: args.label,
			location: args.location,
			responseSent: false,
		});

		await ctx.db.patch(args.emailRecordId, {
			processed: true,
			emailRegistrationId: emailRegistrationId,
		});

		return emailRegistrationId;
	},
});

export const sendConfirmationEmail = internalAction({
	args: {
		emailRegistrationId: v.id("emailRegistrations"),
	},
	handler: async (ctx, args) => {
		const registration = await ctx.runQuery(
			internal.ai.email.getEmailRegistration,
			{
				emailRegistrationId: args.emailRegistrationId,
			},
		);

		if (!registration) {
			throw new Error("Email registration not found");
		}

		const email = await ctx.runQuery(internal.ai.email.getEmail, {
			emailId: registration.emailId,
		});

		if (!email) {
			throw new Error("Email not found");
		}

		const missingFields: string[] = [];
		if (!registration.title) missingFields.push("Title");
		if (!registration.start) missingFields.push("Start date/time");
		if (!registration.end) missingFields.push("End date/time");

		const eventUrl = `${process.env.SITE_URL}/email-event/${registration.accessId}`;

		const formatDate = (timestamp: number | undefined) => {
			if (!timestamp) return "Not provided";
			return new Intl.DateTimeFormat("de-DE", {
				timeZone: "Europe/Berlin",
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			}).format(new Date(timestamp));
		};

		const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .event-details { background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .detail-row { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { font-weight: bold; color: #6b7280; }
    .missing-fields { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Event Registration Received</h1>
    </div>
    <div class="content">
      <p>Thank you for your email! We've processed your event registration.</p>
      
      <div class="event-details">
        <h2>Event Details</h2>
        <div class="detail-row">
          <span class="detail-label">Title:</span> ${registration.title || "Not provided"}
        </div>
        <div class="detail-row">
          <span class="detail-label">Start:</span> ${formatDate(registration.start)}
        </div>
        <div class="detail-row">
          <span class="detail-label">End:</span> ${formatDate(registration.end)}
        </div>
        ${registration.location ? `<div class="detail-row"><span class="detail-label">Location:</span> ${registration.location}</div>` : ""}
        ${registration.description ? `<div class="detail-row"><span class="detail-label">Description:</span> ${registration.description}</div>` : ""}
        ${registration.label ? `<div class="detail-row"><span class="detail-label">Label:</span> ${registration.label}</div>` : ""}
      </div>
      
      ${
				missingFields.length > 0
					? `
      <div class="missing-fields">
        <h3>⚠️ Missing Information</h3>
        <p>We couldn't determine the following details from your email:</p>
        <ul>
          ${missingFields.map((field) => `<li>${field}</li>`).join("")}
        </ul>
        <p>Please click the link below to provide the missing information.</p>
      </div>
      `
					: `<p style="color: #059669; font-weight: bold;">✓ All required information has been captured!</p>`
			}
      
      <a href="${eventUrl}" class="button">View and Edit Event</a>
      
      <p style="color: #6b7280; font-size: 14px;">You can use this link to view and edit your event details at any time.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

		const textContent = `
Event Registration Received

Thank you for your email! We've processed your event registration.

EVENT DETAILS:
- Title: ${registration.title || "Not provided"}
- Start: ${formatDate(registration.start)}
- End: ${formatDate(registration.end)}
${registration.location ? `- Location: ${registration.location}` : ""}
${registration.description ? `- Description: ${registration.description}` : ""}
${registration.label ? `- Label: ${registration.label}` : ""}

${
	missingFields.length > 0
		? `
MISSING INFORMATION:
We couldn't determine the following details from your email:
${missingFields.map((field) => `- ${field}`).join("\n")}

Please visit the link below to provide the missing information.
`
		: "✓ All required information has been captured!"
}

View and edit your event here: ${eventUrl}
    `.trim();

		await ctx.runMutation(internal.email.index.sendViaResend, {
			to: email.from,
			subject: "Event Registration Confirmed",
			html: htmlContent,
			emailRegistrationId: args.emailRegistrationId,
		});
	},
});

export const getEmailRegistration = internalQuery({
	args: {
		emailRegistrationId: v.id("emailRegistrations"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.emailRegistrationId);
	},
});

export const getEmail = internalQuery({
	args: {
		emailId: v.id("emails"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.emailId);
	},
});
