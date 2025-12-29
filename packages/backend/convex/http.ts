import { httpRouter } from "convex/server";

import { authComponent, createAuth } from "./auth";
import { httpAction } from "./_generated/server";
import { resend } from "./email";
import { internal } from "./_generated/api";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

http.route({
	path: "/resend-webhook",
	method: "POST",
	handler: httpAction(async (ctx, req) => {
		return await resend.handleResendEventWebhook(ctx, req);
	}),
});

// Separate webhook endpoint for email.received events
http.route({
	path: "/resend-inbound-webhook",
	method: "POST",
	handler: httpAction(async (ctx, req) => {
		const body = await req.json();

		// Verify webhook signature if needed
		const signature = req.headers.get("svix-signature");

		if (body.type === "email.received") {
			// Schedule the email processing
			await ctx.runMutation(internal.email.index.processInboundEmail, {
				emailId: body.data.email_id,
				from: body.data.from,
				to: body.data.to,
				subject: body.data.subject,
				messageId: body.data.message_id,
			});

			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		return new Response(JSON.stringify({ success: true, ignored: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	}),
});

export default http;
