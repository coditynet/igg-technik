import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	groups: defineTable({
		name: v.string(),
		color: v.union(
			v.literal("blue"),
			v.literal("orange"),
			v.literal("violet"),
			v.literal("rose"),
			v.literal("emerald"),
		),
	}),

	events: defineTable({
		title: v.string(),
		description: v.optional(v.string()),
		start: v.number(),
		end: v.number(),
		allDay: v.optional(v.boolean()),
		groupId: v.id("groups"),
		label: v.optional(v.string()),
		location: v.optional(v.string()),
	}).index("by_group", ["groupId"]),
});
