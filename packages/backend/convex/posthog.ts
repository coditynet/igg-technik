"use node"
import { PostHog } from "posthog-node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const phClient = new PostHog(
	process.env.POSTHOG_API_KEY!,
	{ host: process.env.POSTHOG_HOST }
);

export const track = internalAction({
  args: {   
    event: v.string(),
    distinctId: v.optional(v.string()),
    properties: v.any()
  },
  handler: async (ctx, args) => {
    phClient.capture({
        event: args.event,
        distinctId: args.distinctId || undefined,
        properties: {
            ...args.properties,
            convexCloudUrl: process.env.CONVEX_CLOUD_URL
        }
    })
    
    await phClient.shutdown()
  }
});

export const trackEvent = internalAction({
    args: {
      event: v.string(),
      distinctId: v.optional(v.string()),
      properties: v.any(),
    },
    handler: async (ctx, args) => {
      await ctx.scheduler.runAfter(0, internal.posthog.track, {
        event: args.event,
        distinctId: args.distinctId,
        properties: args.properties,
      });
    },
  });