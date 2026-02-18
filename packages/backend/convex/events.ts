import { PostHog } from "@samhoque/convex-posthog";
import { ConvexError, v } from "convex/values";
import { components } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

const posthog = new PostHog(components.posthog, {});

type EventInventoryInput = {
	itemId: Id<"inventoryItems">;
	count: number;
};

async function normalizeInventory(
	ctx: MutationCtx,
	inventory: EventInventoryInput[] | undefined,
) {
	if (!inventory) {
		return undefined;
	}

	const normalized = inventory
		.map((item) => ({
			itemId: item.itemId,
			count: Math.trunc(item.count),
		}))
		.filter((item) => Number.isInteger(item.count) && item.count > 0);

	if (normalized.length === 0) {
		return undefined;
	}

	const uniqueItemIds = new Set<Id<"inventoryItems">>();
	for (const item of normalized) {
		if (uniqueItemIds.has(item.itemId)) {
			throw new ConvexError("Duplicate inventory item");
		}
		uniqueItemIds.add(item.itemId);
	}

	const inventoryItems = await Promise.all(
		normalized.map(async (item) => {
			const inventoryItem = await ctx.db.get(item.itemId);
			return { item, inventoryItem };
		}),
	);

	for (const { item, inventoryItem } of inventoryItems) {
		if (!inventoryItem) {
			throw new ConvexError("Inventory item not found");
		}
		if (item.count > inventoryItem.count) {
			throw new ConvexError("Inventory count exceeds available inventory");
		}
	}

	return normalized;
}

async function normalizeRegistrationInventory(
	ctx: MutationCtx,
	inventory: EventInventoryInput[] | undefined,
) {
	if (!inventory) {
		return undefined;
	}

	const normalized = inventory
		.map((item) => ({
			itemId: item.itemId,
			count: Math.trunc(item.count),
		}))
		.filter((item) => Number.isInteger(item.count) && item.count > 0);

	if (normalized.length === 0) {
		return undefined;
	}

	const uniqueItemIds = new Set<Id<"inventoryItems">>();
	for (const item of normalized) {
		if (uniqueItemIds.has(item.itemId)) {
			throw new ConvexError("Duplicate inventory item");
		}
		uniqueItemIds.add(item.itemId);
	}

	const inventoryItems = await Promise.all(
		normalized.map(async (item) => {
			const inventoryItem = await ctx.db.get(item.itemId);
			return { item, inventoryItem };
		}),
	);

	for (const { item, inventoryItem } of inventoryItems) {
		if (!inventoryItem) {
			throw new ConvexError("Inventory item not found");
		}
		if (item.count > inventoryItem.count) {
			throw new ConvexError("Requested inventory exceeds available inventory");
		}
	}

	return normalized;
}

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
		const inventory = await Promise.all(
			(event.inventory ?? []).map(async (item) => {
				const inventoryItem = await ctx.db.get(item.itemId);
				return {
					...item,
					name: inventoryItem?.name ?? "Gelöschtes Item",
					isDeleted: !inventoryItem,
				};
			}),
		);

		return {
			...event,
			start: new Date(event.start).toISOString(),
			end: new Date(event.end).toISOString(),
			group,
			inventory,
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
		inventory: v.optional(
			v.array(
				v.object({
					itemId: v.id("inventoryItems"),
					count: v.number(),
				}),
			),
		),
	},
	handler: async (ctx, args) => {
		const authUser = await authComponent.safeGetAuthUser(ctx);
		if (!authUser) {
			throw new ConvexError("Not authenticated");
		}
		const normalizedInventory = await normalizeInventory(ctx, args.inventory);

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
			inventory: normalizedInventory,
		});
		await posthog.trackUserEvent(ctx, {
			userId: authUser._id,
			event: "event_created",
			properties: {
				eventId: eventId,
				title: args.title,
				convexCloudUrl: process.env.CONVEX_CLOUD_URL,
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
		inventory: v.optional(
			v.array(
				v.object({
					itemId: v.id("inventoryItems"),
					count: v.number(),
				}),
			),
		),
	},
	handler: async (ctx, args) => {
		const authUser = await authComponent.safeGetAuthUser(ctx);
		if (!authUser) {
			return {
				message: "Not authenticated",
			};
		}
		const { id, start, end, inventory, ...otherUpdates } = args;

		const updates: Record<string, unknown> = { ...otherUpdates };

		if (start) {
			updates.start = new Date(start).getTime();
		}
		if (end) {
			updates.end = new Date(end).getTime();
		}
		if (inventory !== undefined) {
			updates.inventory = await normalizeInventory(ctx, inventory);
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
			inventory: event.inventory,
		}));
	},
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
			inventory: event.inventory,
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
					e.description?.toLowerCase().includes(q) ||
					e.location?.toLowerCase().includes(q),
			);
		}

		if (args.start !== undefined) {
			const start = args.start;
			events = events.filter((e) => e.start >= start);
		}

		if (args.end !== undefined) {
			const end = args.end;
			events = events.filter((e) => e.end <= end);
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

const eventRegistrationStatus = v.union(
	v.literal("pending"),
	v.literal("approved"),
	v.literal("rejected"),
);

export const submitRegistration = mutation({
	args: {
		requesterName: v.string(),
		requesterEmail: v.string(),
		title: v.string(),
		description: v.optional(v.string()),
		start: v.string(),
		end: v.string(),
		allDay: v.optional(v.boolean()),
		groupId: v.id("groups"),
		label: v.optional(v.string()),
		location: v.optional(v.string()),
		teacher: v.optional(v.string()),
		notes: v.optional(v.string()),
		inventory: v.optional(
			v.array(
				v.object({
					itemId: v.id("inventoryItems"),
					count: v.number(),
				}),
			),
		),
	},
	handler: async (ctx, args) => {
		const start = new Date(args.start).getTime();
		const end = new Date(args.end).getTime();
		if (Number.isNaN(start) || Number.isNaN(end)) {
			throw new ConvexError("Invalid event date");
		}
		if (end < start) {
			throw new ConvexError("Event end must be after start");
		}

		const normalizedInventory = await normalizeRegistrationInventory(
			ctx,
			args.inventory,
		);

		const now = Date.now();
		return await ctx.db.insert("eventRegistrations", {
			requesterName: args.requesterName,
			requesterEmail: args.requesterEmail,
			title: args.title,
			description: args.description,
			start,
			end,
			allDay: args.allDay,
			groupId: args.groupId,
			label: args.label,
			location: args.location,
			teacher: args.teacher,
			notes: args.notes,
			inventory: normalizedInventory,
			status: "pending",
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const listRegistrations = query({
	args: {
		status: v.optional(eventRegistrationStatus),
	},
	handler: async (ctx, args) => {
		const authUser = await authComponent.safeGetAuthUser(ctx);
		if (!authUser) {
			return [];
		}

		const status = args.status;
		const registrations =
			status === undefined
				? await ctx.db.query("eventRegistrations").collect()
				: await ctx.db
						.query("eventRegistrations")
						.withIndex("by_status", (q) => q.eq("status", status))
						.collect();

		const groups = await ctx.db.query("groups").collect();
		const groupsById = new Map(groups.map((group) => [group._id, group]));

		return await Promise.all(
			registrations
				.sort((a, b) => b.createdAt - a.createdAt)
				.map(async (registration) => {
					const inventory = await Promise.all(
						(registration.inventory ?? []).map(async (item) => {
							const inventoryItem = await ctx.db.get(item.itemId);
							return {
								...item,
								name: inventoryItem?.name ?? "Gelöschtes Item",
								isDeleted: !inventoryItem,
							};
						}),
					);

					return {
						...registration,
						start: new Date(registration.start).toISOString(),
						end: new Date(registration.end).toISOString(),
						group: groupsById.get(registration.groupId),
						inventory,
					};
				}),
		);
	},
});

export const createEventFromRegistration = mutation({
	args: {
		registrationId: v.id("eventRegistrations"),
	},
	handler: async (ctx, args) => {
		const authUser = await authComponent.safeGetAuthUser(ctx);
		if (!authUser) {
			throw new ConvexError("Not authenticated");
		}

		const registration = await ctx.db.get(args.registrationId);
		if (!registration) {
			throw new ConvexError("Registration not found");
		}

		if (registration.eventId) {
			return registration.eventId;
		}

		const eventId = await ctx.db.insert("events", {
			title: registration.title,
			description: registration.description,
			start: registration.start,
			end: registration.end,
			allDay: registration.allDay,
			groupId: registration.groupId,
			label: registration.label,
			location: registration.location,
			notes: registration.notes,
			teacher: registration.teacher,
			inventory: registration.inventory,
		});

		await ctx.db.patch(registration._id, {
			status: "approved",
			eventId,
			updatedAt: Date.now(),
		});

		return eventId;
	},
});
