import {
	internalAction,
	internalMutation,
	internalQuery,
} from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

/**
 * Fetch email from Resend API and save to database
 */
export const fetchAndSaveEmail = internalAction({
	args: {
		emailId: v.string(),
	},
	handler: async (ctx, args): Promise<string> => {
		// Fetch email directly from Resend API
		const response = await fetch(
			`https://api.resend.com/emails/receiving/${args.emailId}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
				},
			},
		);

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Failed to fetch email from Resend (${response.status}): ${errorText}`,
			);
		}

		const mail = await response.json();

		// Save to database
		const emailRecordId: string = await ctx.runMutation(
			internal.mail.processEmail.saveEmailToDb,
			{
				emailId: args.emailId,
				from: mail.from || "unknown@sender.com",
				to: Array.isArray(mail.to)
					? mail.to
					: [mail.to || "unknown@recipient.com"],
				subject: mail.subject || "",
				text: mail.text,
				html: mail.html,
				messageId: mail.headers?.["message-id"],
			},
		);

		return emailRecordId;
	},
});

/**
 * Save email to database
 */
export const saveEmailToDb = internalMutation({
	args: {
		emailId: v.string(),
		from: v.string(),
		to: v.union(v.array(v.string()), v.string()),
		subject: v.string(),
		text: v.optional(v.string()),
		html: v.optional(v.string()),
		messageId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const toArray = Array.isArray(args.to) ? args.to : [args.to];

		return await ctx.db.insert("emails", {
			emailId: args.emailId,
			from: args.from,
			to: toArray,
			subject: args.subject,
			text: args.text,
			html: args.html,
			messageId: args.messageId,
			receivedAt: Date.now(),
			processed: false,
		});
	},
});

/**
 * Create empty event registration without AI processing
 */
export const createEmptyRegistration = internalMutation({
	args: {
		emailRecordId: v.id("emails"),
	},
	handler: async (ctx, args) => {
		const accessId = crypto.randomUUID();

		const emailRegistrationId = await ctx.db.insert("emailRegistrations", {
			accessId,
			emailId: args.emailRecordId,
			responseSent: false,
		});

		await ctx.db.patch(args.emailRecordId, {
			processed: true,
			emailRegistrationId: emailRegistrationId,
		});

		return emailRegistrationId;
	},
});

/**
 * Update event registration with AI-extracted data
 */
export const updateRegistrationWithAI = internalMutation({
	args: {
		emailRegistrationId: v.id("emailRegistrations"),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		start: v.optional(v.number()),
		end: v.optional(v.number()),
		allDay: v.optional(v.boolean()),
		label: v.optional(v.string()),
		location: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { emailRegistrationId, ...updates } = args;

		await ctx.db.patch(emailRegistrationId, updates);

		return emailRegistrationId;
	},
});

/**
 * Send confirmation email after registration is complete
 */
export const sendConfirmationEmail = internalAction({
	args: {
		emailRegistrationId: v.id("emailRegistrations"),
		aiFailed: v.optional(v.boolean()),
		errorMessage: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const registration = await ctx.runQuery(
			internal.mail.processEmail.getEmailRegistration,
			{
				emailRegistrationId: args.emailRegistrationId,
			},
		);

		if (!registration) {
			throw new Error("Email registration not found");
		}

		const email = await ctx.runQuery(internal.mail.processEmail.getEmail, {
			emailId: registration.emailId,
		});

		if (!email) {
			throw new Error("Email not found");
		}

		const eventUrl = `${process.env.SITE_URL}/email-event/${registration.accessId}`;

		const formatDate = (timestamp: number | undefined) => {
			if (!timestamp) return undefined;
			return new Intl.DateTimeFormat("de-DE", {
				timeZone: "Europe/Berlin",
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			}).format(new Date(timestamp));
		};

		// Determine email content based on AI success/failure and missing fields
		let subject: string;
		let html: string;

		if (args.aiFailed) {
			// AI processing failed completely
			subject = "Veranstaltung - Manuelle Eingabe erforderlich";
			html = await ctx.runAction(
				internal.mail.emailTemplates.renderFailedEmail,
				{
					eventUrl,
					errorMessage: args.errorMessage || "AI processing failed",
				},
			);
		} else {
			// AI processing succeeded - check for missing fields
			const missingFields: string[] = [];
			if (!registration.title) missingFields.push("Titel");
			if (!registration.description) missingFields.push("Beschreibung");
			if (!registration.location) missingFields.push("Ort");
			if (!registration.start) missingFields.push("Startdatum");
			if (!registration.end) missingFields.push("Enddatum");

			if (missingFields.length > 0) {
				// Some fields are missing
				subject = "Veranstaltung - Fehlende Details";
				html = await ctx.runAction(
					internal.mail.emailTemplates.renderMissingDataEmail,
					{
						eventUrl,
						title: registration.title,
						description: registration.description,
						location: registration.location,
						startDate: formatDate(registration.start),
						endDate: formatDate(registration.end),
						missingFields,
					},
				);
			} else {
				// All fields present
				subject = "Veranstaltung bestätigt";
				html = await ctx.runAction(
					internal.mail.emailTemplates.renderSuccessEmail,
					{
						eventUrl,
						title: registration.title,
						description: registration.description,
						location: registration.location,
						startDate: formatDate(registration.start),
						endDate: formatDate(registration.end),
					},
				);
			}
		}

		await ctx.runMutation(internal.mail.index.sendViaResend, {
			to: email.from,
			subject,
			html,
			emailRegistrationId: args.emailRegistrationId,
		});
	},
});

/**
 * Query helpers
 */
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
