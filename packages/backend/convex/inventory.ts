import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { convex } from "./fluent";
import { authMiddleware } from "./middleware/auth";

export const list = convex
  .query()
  .handler(async (ctx) => {
    return await ctx.db.query("inventoryItems").collect();
  }).public();

export const create = convex.mutation()
  .input({ name: v.string(), count: v.number() })
	.use(authMiddleware)
	.handler( async (ctx, args) => {
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
	}).public();

export const remove = convex
  .mutation()
  .input(  { id: v.id("inventoryItems") })
	.handler( async (ctx, args) => {
		const authUser = await authComponent.safeGetAuthUser(ctx);
		if (!authUser) {
			throw new ConvexError("Not authenticated");
		}

		await ctx.db.delete(args.id);
	},
	).public();

	export const update = convex
    .mutation()
    .use(authMiddleware)
		.input({
				id: v.id("inventoryItems"),
				name: v.optional(v.string()),
				count: v.optional(v.number()),
		})
		.handler(async (ctx, args) => {
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
		})
		.public();
