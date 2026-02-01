import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { components } from "./_generated/api";
import { PostHog } from "@samhoque/convex-posthog";

const posthog = new PostHog(components.posthog, {
  });
  
export const list = query({
	args: {},
	handler: async (ctx) => {
		const events = await ctx.db.query("events").collect();
		const groups = await ctx.db.query("groups").collect();

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

export const listByGroup = query({
	args: { groupId: v.id("groups") },
	handler: async (ctx, args) => {
		const authUser = await authComponent.safeGetAuthUser(ctx);
		if (!authUser) {
			return {
				message: "Not authenticated",
			};
		}
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

export const get = query({
	args: { id: v.id("events") },
	handler: async (ctx, args) => {
		const authUser = await authComponent.safeGetAuthUser(ctx);
		if (!authUser) {
			return {
				message: "Not authenticated",
			};
		}

		const event = await ctx.db.get(args.id);
		if (!event) return null;

		return {
			...event,
			start: new Date(event.start).toISOString(),
			end: new Date(event.end).toISOString(),
		};
	},
});

export const getWithGroup = query({
	args: { id: v.id("events") },
	handler: async (ctx, args) => {
		const authUser = await authComponent.safeGetAuthUser(ctx);
		if (!authUser) {
			return null;
		}

		const event = await ctx.db.get(args.id);
		if (!event) return null;

		const group = event.groupId ? await ctx.db.get(event.groupId) : undefined;

		return {
			...event,
			start: new Date(event.start).toISOString(),
			end: new Date(event.end).toISOString(),
			group,
		};
	},
});

export const create = mutation({
	args: {
		title: v.string(),
		description: v.optional(v.string()),
		start: v.string(),
		end: v.string(),
		allDay: v.optional(v.boolean()),
		groupId: v.id("groups"),
		label: v.optional(v.string()),
		location: v.optional(v.string()),
		assignees: v.optional(v.array(v.id("user"))),
		notes: v.optional(v.string()),
		teacher: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const authUser = await authComponent.safeGetAuthUser(ctx);
		if (!authUser) {
			throw new ConvexError("Not authenticated");
		}
		const eventId = await ctx.db.insert("events", {
			title: args.title,
			description: args.description,
			start: new Date(args.start).getTime(),
			end: new Date(args.end).getTime(),
			allDay: args.allDay,
			groupId: args.groupId,
			label: args.label,
			location: args.location,
			assignees: args.assignees,
			notes: args.notes,
			teacher: args.teacher,
		});
		await posthog.trackUserEvent(ctx, {
			userId: authUser._id,
			event: "event_created",
			properties: {
				eventId: eventId,
				title: args.title,
				convexCloudUrl: process.env.CONVEX_CLOUD_URL
			},
		  });
	  
		return eventId;
	},
});

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
		assignees: v.optional(v.array(v.id("user"))),
		notes: v.optional(v.string()),
		teacher: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const authUser = await authComponent.safeGetAuthUser(ctx);
		if (!authUser) {
			return {
				message: "Not authenticated",
			};
		}
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

export const remove = mutation({
	args: { id: v.id("events") },
	handler: async (ctx, args) => {
		const authUser = await authComponent.safeGetAuthUser(ctx);
		if (!authUser) {
			return {
				message: "Not authenticated",
			};
		}
		await ctx.db.delete(args.id);
	},
});

export const listForCalendarFeed = query({
	args: {},
	handler: async (ctx) => {
		        const events = await ctx.db.query("events").collect();
		
		        return events.map((event) => ({
		            id: event._id,
		            title: event.title,
		            description: event.description,
		            location: event.location,
		            start: event.start,
		            end: event.end,
		            allDay: event.allDay,
		            label: event.label,
		            			assignees: event.assignees,
		            			teacher: event.teacher,
		            		}));	},
});

export const listForCalendarFeedByGroup = query({
	args: { groupId: v.id("groups") },
	handler: async (ctx, args) => {
		const events = await ctx.db
			.query("events")
			.withIndex("by_group", (q) => q.eq("groupId", args.groupId))
			.collect();

		return events.map((event) => ({
			id: event._id,
			title: event.title,
			description: event.description,
			location: event.location,
			start: event.start,
			end: event.end,
			allDay: event.allDay,
			label: event.label,
			assignees: event.assignees,
			teacher: event.teacher,
		}));
	},
});

export const search = query({
	args: {
		query: v.optional(v.string()),
		groupId: v.optional(v.id("groups")),
		start: v.optional(v.number()),
		end: v.optional(v.number()),
		page: v.optional(v.number()),
		pageSize: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const authUser = await authComponent.safeGetAuthUser(ctx);
		if (!authUser) {
			return {
				events: [],
				totalCount: 0,
				hasMore: false,
			};
		}

		const groupId = args.groupId;
		const allEvents = groupId
			? await ctx.db
					.query("events")
					.withIndex("by_group", (q) => q.eq("groupId", groupId))
					.collect()
			: await ctx.db.query("events").collect();

		let events = allEvents;

		if (args.query) {
			const q = args.query.toLowerCase();
			events = events.filter(
				(e) =>
					e.title.toLowerCase().includes(q) ||
					(e.description && e.description.toLowerCase().includes(q)) ||
					(e.location && e.location.toLowerCase().includes(q)),
			);
		}

		if (args.start) {
			events = events.filter((e) => e.start >= args.start!);
		}

		if (args.end) {
			events = events.filter((e) => e.end <= args.end!);
		}

		events.sort((a, b) => a.start - b.start);

		const page = args.page ?? 0;
		const pageSize = args.pageSize ?? 50;
		const totalCount = events.length;
		const startIndex = page * pageSize;
		const endIndex = startIndex + pageSize;
		const paginatedEvents = events.slice(startIndex, endIndex);
		const hasMore = endIndex < totalCount;

		const groups = await ctx.db.query("groups").collect();
		const groupsMap = new Map(groups.map((g) => [g._id, g]));

		return {
			events: paginatedEvents.map((event) => {
				const group = event.groupId ? groupsMap.get(event.groupId) : undefined;
				return {
					...event,
					start: new Date(event.start).toISOString(),
					end: new Date(event.end).toISOString(),
					group,
				};
			}),
			totalCount,
			hasMore,
		};
	},
});
