import { ConvexError } from "convex/values";
import { authComponent } from "../auth";
import { convex } from "../fluent";
import { Auth } from "convex/server";

export const authMiddleware = convex
  .$context<{ auth: Auth}>()
  .createMiddleware(async (context, next) => {
    const identity = await context.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError("Not authenticated");
    }

    return next({
      ...context,
      user: identity,
      userId: identity.subject,
    });
  });
