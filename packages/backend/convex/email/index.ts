import { components, internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import {
	vEmailId,
	vEmailEvent,
	Resend,
	vOnEmailEventArgs,
} from "@convex-dev/resend";

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

			if (mail?.text) {
				await ctx.scheduler.runAfter(
					0,
					internal.ai.email.createEventFromEmail,
					{
						emailText: mail.text,
					},
				);
			}
		}
	},
});

// Process inbound emails from the separate webhook
export const processInboundEmail = internalMutation({
	args: {
		emailId: v.string(),
		from: v.union(v.string(), v.array(v.string())),
		to: v.union(v.string(), v.array(v.string())),
		subject: v.string(),
		messageId: v.string(),
	},
	handler: async (ctx, args) => {
		// Fetch the full email using the Resend API
		const mail = await resend.get(ctx, args.emailId as any);

		if (mail?.text) {
			await ctx.scheduler.runAfter(0, internal.ai.email.createEventFromEmail, {
				emailText: mail.text,
			});
		}
	},
});
