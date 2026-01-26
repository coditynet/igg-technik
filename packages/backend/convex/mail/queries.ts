import { query } from "../_generated/server";
import { v } from "convex/values";

export const listEmails = query({
	args: {},
	handler: async (ctx) => {
		const emails = await ctx.db.query("emails").order("desc").collect();

		const emailsWithRegistrations = await Promise.all(
			emails.map(async (email) => {
				let registration = null;
				if (email.emailRegistrationId) {
					registration = await ctx.db.get(email.emailRegistrationId);
				}
				return {
					...email,
					registration,
				};
			}),
		);

		return emailsWithRegistrations;
	},
});

export const getEmailById = query({
	args: {
		emailId: v.string(),
	},
	handler: async (ctx, args) => {

		
		const emailId = ctx.db.normalizeId("emails", args.emailId);
		if (emailId === null) {
			return null
		}

		const email = await ctx.db.get(emailId);
		if (!email) {
			return null;
		}

		let registration = null;
		if (email.emailRegistrationId) {
			registration = await ctx.db.get(email.emailRegistrationId);
		}

		return {
			...email,
			registration,
		};
	},
});
