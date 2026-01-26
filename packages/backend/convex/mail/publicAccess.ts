import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const getByAccessCode = query({
	args: {
		accessId: v.string(),
	},
	handler: async (ctx, args) => {
		const registration = await ctx.db
			.query("emailRegistrations")
			.withIndex("by_accessId", (q) => q.eq("accessId", args.accessId))
			.first();

		if (!registration) {
			return null;
		}

		const email = await ctx.db.get(registration.emailId);

		// If an event has been created, fetch the actual event details
		let event = null;
		if (registration.eventId) {
			const fullEvent = await ctx.db.get(registration.eventId);
			if (fullEvent) {
				event = {
					title: fullEvent.title,
					description: fullEvent.description,
					location: fullEvent.location,
					start: fullEvent.start,
					end: fullEvent.end,
					allDay: fullEvent.allDay,
					label: fullEvent.label,
				};
			}
		}

		return {
			...registration,
			email: email
				? {
						from: email.from,
						subject: email.subject,
						receivedAt: email.receivedAt,
					}
				: null,
			event,
		};
	},
});

export const updateByAccessCode = mutation({
	args: {
		accessId: v.string(),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		start: v.optional(v.number()),
		end: v.optional(v.number()),
		allDay: v.optional(v.boolean()),
		label: v.optional(v.string()),
		location: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { accessId, ...updates } = args;

		const registration = await ctx.db
			.query("emailRegistrations")
			.withIndex("by_accessId", (q) => q.eq("accessId", accessId))
			.first();

		if (!registration) {
			throw new Error("Registration not found");
		}

		await ctx.db.patch(registration._id, updates);

		return { success: true };
	},
});
