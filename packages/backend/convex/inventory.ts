import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const list = query({
	args: {},
	handler: async (ctx) => {
		const inventoryItems = await ctx.db.query("inventoryItems").collect();
		return inventoryItems.sort((a, b) => a.name.localeCompare(b.name));
	},
});

export const create = mutation({
	args: { name: v.string(), count: v.number() },
	handler: async (ctx, args) => {
		const authUser = await authComponent.safeGetAuthUser(ctx);
		if (!authUser) {
			throw new ConvexError("Not authenticated");
		}

		const name = args.name.trim();
		if (!name) {
			throw new ConvexError("Item name is required");
		}

		if (!Number.isInteger(args.count) || args.count < 0) {
			throw new ConvexError("Count must be a non-negative integer");
		}

		const allItems = await ctx.db.query("inventoryItems").collect();
		const duplicate = allItems.some(
			(item) => item.name.toLowerCase() === name.toLowerCase(),
		);

		if (duplicate) {
			throw new ConvexError("Item already exists");
		}

		return await ctx.db.insert("inventoryItems", {
			name,
			count: args.count,
		});
	},
});

export const remove = mutation({
	args: { id: v.id("inventoryItems") },
	handler: async (ctx, args) => {
		const authUser = await authComponent.safeGetAuthUser(ctx);
		if (!authUser) {
			throw new ConvexError("Not authenticated");
		}

		await ctx.db.delete(args.id);
	},
});

export const update = mutation({
	args: {
		id: v.id("inventoryItems"),
		name: v.optional(v.string()),
		count: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const authUser = await authComponent.safeGetAuthUser(ctx);
		if (!authUser) {
			throw new ConvexError("Not authenticated");
		}

		if (args.name === undefined && args.count === undefined) {
			throw new ConvexError("No updates provided");
		}

		const existing = await ctx.db.get(args.id);
		if (!existing) {
			throw new ConvexError("Item not found");
		}

		const updates: { name?: string; count?: number } = {};

		if (args.name !== undefined) {
			const name = args.name.trim();
			if (!name) {
				throw new ConvexError("Item name is required");
			}

			const allItems = await ctx.db.query("inventoryItems").collect();
			const duplicate = allItems.some(
				(item) =>
					item._id !== args.id &&
					item.name.toLowerCase() === name.toLowerCase(),
			);

			if (duplicate) {
				throw new ConvexError("Item already exists");
			}

			updates.name = name;
		}

		if (args.count !== undefined) {
			if (!Number.isInteger(args.count) || args.count < 0) {
				throw new ConvexError("Count must be a non-negative integer");
			}
			updates.count = args.count;
		}

		await ctx.db.patch(args.id, updates);
	},
});
