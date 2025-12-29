import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const tables = {
	user: defineTable({
		name: v.string(),
		email: v.string(),
		emailVerified: v.boolean(),
		image: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
		role: v.optional(v.string()),
		banned: v.optional(v.boolean()),
		banReason: v.optional(v.string()),
		banExpires: v.optional(v.number()),
	}).index("by_email", ["email"]),

	session: defineTable({
		userId: v.id("user"),
		expiresAt: v.number(),
		token: v.string(),
		ipAddress: v.optional(v.string()),
		userAgent: v.optional(v.string()),
		impersonatedBy: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_userId", ["userId"])
		.index("by_token", ["token"]),

	account: defineTable({
		userId: v.id("user"),
		accountId: v.string(),
		providerId: v.string(),
		accessToken: v.optional(v.string()),
		refreshToken: v.optional(v.string()),
		idToken: v.optional(v.string()),
		accessTokenExpiresAt: v.optional(v.number()),
		refreshTokenExpiresAt: v.optional(v.number()),
		scope: v.optional(v.string()),
		password: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_userId", ["userId"]),

	verification: defineTable({
		identifier: v.string(),
		value: v.string(),
		expiresAt: v.number(),
		createdAt: v.optional(v.number()),
		updatedAt: v.optional(v.number()),
	}).index("by_identifier", ["identifier"]),

	jwks: defineTable({
		publicKey: v.string(),
		privateKey: v.string(),
		createdAt: v.number(),
		updatedAt: v.optional(v.number()),
	}),

	passkey: defineTable({
		name: v.optional(v.string()),
		publicKey: v.string(),
		userId: v.id("user"),
		credentialID: v.string(),
		counter: v.number(),
		deviceType: v.string(),
		backedUp: v.boolean(),
		transports: v.optional(v.string()),
		createdAt: v.optional(v.number()),
		aaguid: v.optional(v.string()),
	})
		.index("by_userId", ["userId"])
		.index("by_credentialID", ["credentialID"]),
};

const schema = defineSchema(tables);

export { tables };
export default schema;
