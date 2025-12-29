import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { admin } from "better-auth/plugins";
import { v } from "convex/values";
import { passkey } from "@better-auth/passkey"


import type { DataModel } from "./_generated/dataModel";
import authSchema from "./betterAuth/schema";

import { components } from "./_generated/api";
import { internalMutation, query } from "./_generated/server";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;

export const authComponent = createClient<DataModel, typeof authSchema>(
	components.betterAuth,
	{
		local: {
			schema: authSchema,
		},
	},
);

export function createAuthOptions(ctx: GenericCtx<DataModel>) {
	return {
		baseURL: siteUrl,
		trustedOrigins: [siteUrl],
		database: authComponent.adapter(ctx),
		emailAndPassword: {
			enabled: true,
      disableSignUp: true,
			requireEmailVerification: false,
		},
		plugins: [
			convex({
				authConfig,
				jwksRotateOnTokenGenerationError: true,
			}),
			admin(),
			passkey()
		],
	} satisfies BetterAuthOptions;
}

export function createAuth(ctx: GenericCtx<DataModel>) {
	return betterAuth(createAuthOptions(ctx));
}

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		return await authComponent.safeGetAuthUser(ctx);
	},
});

export const createUser = internalMutation({
	args: {
		name: v.string(),
		password: v.string(),
		email: v.string(),
	},
	handler: async (ctx, args) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
		await auth.api.createUser({
			body: {
				name: args.name,
				password: args.password,
				email: args.email,
			},
		});
	},
});
