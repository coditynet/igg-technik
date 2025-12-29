import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
		const groupId = await ctx.db.insert("groups", {
			name: args.name,
			color: args.color,
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
		const { id, ...updates } = args;
		await ctx.db.patch(id, updates);
	},
});

export const remove = mutation({
	args: { id: v.id("groups") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	},
});
