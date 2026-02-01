import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { authComponent } from "./auth";

export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("groups").collect();
	},
});

export const get = query({
	args: { id: v.id("groups") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		color: v.union(
			v.literal("blue"),
			v.literal("orange"),
			v.literal("violet"),
			v.literal("rose"),
			v.literal("emerald"),
		),
	},
	handler: async (ctx, args) => {
		const authUser = await authComponent.safeGetAuthUser(ctx);
		if (!authUser) {
			throw new ConvexError("Not authenticated");
		}
		const groupId = await ctx.db.insert("groups", {
			name: args.name,
			color: args.color,
		});
		await ctx.scheduler.runAfter(0, internal.posthog.track, {
			event: "group_created",
			distinctId: authUser._id,
			properties: {
				groupId,
				name: args.name,
				color: args.color,
			},
		});
		return groupId;
	},
});

export const update = mutation({
	args: {
		id: v.id("groups"),
		name: v.optional(v.string()),
		color: v.optional(
			v.union(
				v.literal("blue"),
				v.literal("orange"),
				v.literal("violet"),
				v.literal("rose"),
				v.literal("emerald"),
			),
		),
	},
	handler: async (ctx, args) => {
		const authUser = await authComponent.safeGetAuthUser(ctx);
		if (!authUser) {
			throw new ConvexError("Not authenticated");
		}
		const { id, ...updates } = args;
		await ctx.db.patch(id, updates);
		await ctx.scheduler.runAfter(0, internal.posthog.track, {
			event: "group_updated",
			distinctId: authUser._id,
			properties: {
				groupId: args.id,
				name: args.name,
				color: args.color
			},
		});
	},
});

export const remove = mutation({
	args: { id: v.id("groups") },
	handler: async (ctx, args) => {
		const authUser = await authComponent.safeGetAuthUser(ctx);
		if (!authUser) {
			throw new ConvexError("Not authenticated");
		}
		const eventsInGroup = await ctx.db
			.query("events")
			.withIndex("by_group", (q) => q.eq("groupId", args.id))
			.collect();

		for (const event of eventsInGroup) {
			await ctx.db.delete(event._id);
		}

		await ctx.db.delete(args.id);
		await ctx.scheduler.runAfter(0, internal.posthog.track, {
			event: "group_deleted",
			distinctId: authUser._id,
			properties: {
				groupId: args.id,
			},
		});
	},
});
