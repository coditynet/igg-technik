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
	}).index("by_group", ["groupId"]),

	emails: defineTable({
		emailId: v.string(),
		from: v.string(),
		to: v.array(v.string()),
		subject: v.string(),
		text: v.optional(v.string()),
		html: v.optional(v.string()),
		messageId: v.optional(v.string()),
		receivedAt: v.number(),
		processed: v.boolean(),
		emailRegistrationId: v.optional(v.id("emailRegistrations")),
	})
		.index("by_emailId", ["emailId"])
		.index("by_processed", ["processed"]),

	emailRegistrations: defineTable({
		accessId: v.string(),
		emailId: v.id("emails"),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		start: v.optional(v.number()),
		end: v.optional(v.number()),
		allDay: v.optional(v.boolean()),
		label: v.optional(v.string()),
		location: v.optional(v.string()),
		eventId: v.optional(v.id("events")),
		responseSent: v.boolean(),
	})
		.index("by_accessId", ["accessId"])
		.index("by_emailId", ["emailId"]),

	eventRegistrations: defineTable({
		requesterName: v.string(),
		requesterEmail: v.string(),
		title: v.string(),
		description: v.optional(v.string()),
		start: v.number(),
		end: v.number(),
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
		status: v.union(
			v.literal("pending"),
			v.literal("approved"),
			v.literal("rejected"),
		),
		eventId: v.optional(v.id("events")),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_status", ["status"])
		.index("by_createdAt", ["createdAt"])
		.index("by_eventId", ["eventId"]),

	inventoryItems: defineTable({
		name: v.string(),
		count: v.number(),
	}),
});
