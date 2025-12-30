import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { resend } from "./mail";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

http.route({
	path: "/resend-inbound-webhook",
	method: "POST",
	handler: httpAction(async (ctx, req) => {
		const body = await req.json();

		if (body.type === "email.received") {
			await ctx.runAction(internal.mail.index.processInboundEmail, {
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
		} else {
			resend.handleResendEventWebhook(ctx, req);
		}

		return new Response(JSON.stringify({ success: true, ignored: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	}),
});

export default http;
