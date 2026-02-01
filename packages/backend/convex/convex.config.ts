import { defineApp } from "convex/server";
import betterAuth from "./betterAuth/convex.config";
import resend from "@convex-dev/resend/convex.config.js";
import workflow from "@convex-dev/workflow/convex.config.js";
import posthog from "@samhoque/convex-posthog/convex.config";

const app = defineApp();
app.use(betterAuth);
app.use(resend);
app.use(workflow);
app.use(posthog);  

export default app;
