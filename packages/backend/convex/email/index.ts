import { components, internal } from "../_generated/api";
import { internalAction, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { vEmailId, Resend } from "@convex-dev/resend";

export const resend: Resend = new Resend(components.resend, {
	onEmailEvent: internal.email.index.handleEmailEvent as any,
	testMode: false,
	webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
	apiKey: process.env.RESEND_API_KEY,
});

export const handleEmailEvent = internalMutation({
	args: {
		id: vEmailId,
		event: v.any(),
	},
	handler: async (ctx, args) => {
		if (args.event.type === "email.received") {
			const mail = await resend.get(ctx, args.id);

			if (mail) {
				const emailRecord = await ctx.db.insert("emails", {
					emailId: args.id,
					from: mail.from,
					to: Array.isArray(mail.to) ? mail.to : [mail.to],
					subject: mail.subject || "",
					text: mail.text,
					html: mail.html,
					messageId: (mail.headers as any)?.["message-id"],
					receivedAt: Date.now(),
					processed: false,
				});

				if (mail.text) {
					await ctx.scheduler.runAfter(
						0,
						internal.ai.email.createEventFromEmail,
						{
							emailText: mail.text,
							emailRecordId: emailRecord,
						},
					);
				}
			}
		}
	},
});

export const processInboundEmail = internalAction({
	args: {
		emailId: v.string(),
		from: v.union(v.string(), v.array(v.string())),
		to: v.union(v.string(), v.array(v.string())),
		subject: v.string(),
		messageId: v.string(),
	},
	handler: async (ctx, args) => {
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
				`Failed to fetch email (${response.status}): ${errorText}`,
			);
		}

		const mail = await response.json();
		const fromString = Array.isArray(args.from) ? args.from[0] : args.from;
		const toArray = Array.isArray(args.to) ? args.to : [args.to];

		const emailRecord = await ctx.runMutation(internal.email.index.saveEmail, {
			emailId: args.emailId,
			from: fromString,
			to: toArray,
			subject: args.subject,
			text: mail.text,
			html: mail.html,
			messageId: args.messageId,
		});

		if (mail.text) {
			await ctx.scheduler.runAfter(0, internal.ai.email.createEventFromEmail, {
				emailText: mail.text,
				emailRecordId: emailRecord,
			});
		}
	},
});

export const saveEmail = internalMutation({
	args: {
		emailId: v.string(),
		from: v.string(),
		to: v.array(v.string()),
		subject: v.string(),
		text: v.optional(v.string()),
		html: v.optional(v.string()),
		messageId: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("emails", {
			emailId: args.emailId,
			from: args.from,
			to: args.to,
			subject: args.subject,
			text: args.text,
			html: args.html,
			messageId: args.messageId,
			receivedAt: Date.now(),
			processed: false,
		});
	},
});

export const sendViaResend = internalMutation({
	args: {
		to: v.string(),
		subject: v.string(),
		html: v.string(),
		emailRegistrationId: v.id("emailRegistrations"),
	},
	handler: async (ctx, args) => {
		await ctx.runMutation(components.resend.lib.sendEmail, {
			from: "events@resend.dev",
			to: [args.to],
			subject: args.subject,
			html: args.html,
			options: {
				apiKey: process.env.RESEND_API_KEY!,
				initialBackoffMs: 1000,
				retryAttempts: 3,
				testMode: false,
			},
		});

		await ctx.db.patch(args.emailRegistrationId, {
			responseSent: true,
		});
	},
});
