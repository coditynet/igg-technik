import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all events and groups
export const list = query({
	args: {},
	handler: async (ctx) => {
		const events = await ctx.db.query("events").collect();
		const groups = await ctx.db.query("groups").collect();

		// Convert timestamps back to ISO strings for frontend
		return {
			events: events.map((event) => ({
				...event,
				start: new Date(event.start).toISOString(),
				end: new Date(event.end).toISOString(),
			})),
			groups,
		};
	},
});

// Get events by group
export const listByGroup = query({
	args: { groupId: v.id("groups") },
	handler: async (ctx, args) => {
		const events = await ctx.db
			.query("events")
			.withIndex("by_group", (q) => q.eq("groupId", args.groupId))
			.collect();

		return events.map((event) => ({
			...event,
			start: new Date(event.start).toISOString(),
			end: new Date(event.end).toISOString(),
		}));
	},
});

// Get a single event by ID
export const get = query({
	args: { id: v.id("events") },
	handler: async (ctx, args) => {
		const event = await ctx.db.get(args.id);
		if (!event) return null;

		return {
			...event,
			start: new Date(event.start).toISOString(),
			end: new Date(event.end).toISOString(),
		};
	},
});

// Create a new event
export const create = mutation({
	args: {
		title: v.string(),
		description: v.optional(v.string()),
		start: v.string(), // ISO string from frontend
		end: v.string(), // ISO string from frontend
		allDay: v.optional(v.boolean()),
		groupId: v.id("groups"),
		label: v.optional(v.string()),
		location: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const eventId = await ctx.db.insert("events", {
			title: args.title,
			description: args.description,
			start: new Date(args.start).getTime(), // Store as timestamp
			end: new Date(args.end).getTime(), // Store as timestamp
			allDay: args.allDay,
			groupId: args.groupId,
			label: args.label,
			location: args.location,
		});
		return eventId;
	},
});

// Update an event
export const update = mutation({
	args: {
		id: v.id("events"),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		start: v.optional(v.string()),
		end: v.optional(v.string()),
		allDay: v.optional(v.boolean()),
		groupId: v.optional(v.id("groups")),
		label: v.optional(v.string()),
		location: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { id, start, end, ...otherUpdates } = args;

		const updates: Record<string, any> = { ...otherUpdates };

		if (start) {
			updates.start = new Date(start).getTime();
		}
		if (end) {
			updates.end = new Date(end).getTime();
		}

		await ctx.db.patch(id, updates);
	},
});

// Delete an event
export const remove = mutation({
	args: { id: v.id("events") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	},
});
