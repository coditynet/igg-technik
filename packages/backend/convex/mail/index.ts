import { components, internal } from "../_generated/api";
import { internalAction, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { vEmailId, Resend } from "@convex-dev/resend";
import { workflow } from "../workflow";

export const resend: Resend = new Resend(components.resend, {
	onEmailEvent: internal.mail.index.handleEmailEvent as any,
	testMode: false,
	webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
	apiKey: process.env.RESEND_API_KEY,
});

export const handleEmailEvent = internalMutation({
	args: {
		id: vEmailId,
		event: v.any(),
		req: v.any(),
	},
	handler: async (ctx, args) => {
		if (args.event.type === "email.received") {
			// Start the workflow with onComplete handler for failure tracking
			await workflow.start(
				ctx,
				internal.mail.incomingEmailWorkflow.processIncomingEmail,
				{
					emailId: args.id,
				},
				{
					onComplete:
						internal.mail.incomingEmailWorkflow.handleWorkflowComplete,
					context: { emailId: args.id },
				},
			);
		} else {
			resend.handleResendEventWebhook(ctx, args.req);
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
		// Start the workflow with onComplete handler for failure tracking
		await workflow.start(
			ctx,
			internal.mail.incomingEmailWorkflow.processIncomingEmail,
			{
				emailId: args.emailId,
			},
			{
				onComplete: internal.mail.incomingEmailWorkflow.handleWorkflowComplete,
				context: { emailId: args.emailId },
			},
		);
	},
});

export const sendViaResend = internalMutation({
	args: {
		to: v.string(),
		subject: v.string(),
		text: v.optional(v.string()),
		html: v.optional(v.string()),
		emailRegistrationId: v.id("emailRegistrations"),
	},
	handler: async (ctx, args) => {
		// Use the resend component to send email
		await resend.sendEmail(ctx, {
			from: "IGG Technik Events <events@igg.codity.app>",
			to: [args.to],
			subject: args.subject,
			text: args.text,
			html: args.html,
		});

		await ctx.db.patch(args.emailRegistrationId, {
			responseSent: true,
		});
	},
});
