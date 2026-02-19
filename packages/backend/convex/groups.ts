import { internal } from "./_generated/api";
import { v } from "convex/values";
import { convex } from "./fluent";
import { authMiddleware } from "./middleware/auth";

export const list = convex
  .query()
  .handler(async (ctx) => {
    return await ctx.db.query("groups").collect();
  }).public();

export const getByI = convex
  .query()
  .input({ id: v.id("groups") })
  .handler(async (ctx, args) => {
    return await ctx.db.get(args.id);
  })
  .public();

export const create = convex
  .mutation()
  .use(authMiddleware)
  .input({
    name: v.string(),
    color: v.union(
      v.literal("blue"),
      v.literal("orange"),
      v.literal("violet"),
      v.literal("rose"),
      v.literal("emerald"),
    ),
  })
  .handler(async (ctx, args) => {
    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      color: args.color,
    });

    await ctx.scheduler.runAfter(0, internal.posthog.track, {
      event: "group_created",
      distinctId: ctx.userId,
      properties: {
        groupId,
        name: args.name,
        color: args.color,
      },
    });
    return groupId;
  })
  .public();

export const update = convex.
  mutation()
  .use(authMiddleware)
  .input({
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
  })
	.handler(async (ctx, args) => {
		const { id, ...updates } = args;
		await ctx.db.patch(id, updates);
		await ctx.scheduler.runAfter(0, internal.posthog.track, {
			event: "group_updated",
			distinctId: ctx.userId,
			properties: {
				groupId: args.id,
				name: args.name,
				color: args.color
			},
		});
	}).public();

export const remove = convex.mutation()
  .use(authMiddleware)
  .input({ id: v.id("groups") })
  .handler(async (ctx, args) => {
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
			distinctId: ctx.userId,
			properties: {
				groupId: args.id,
			},
		});
  }).public();
