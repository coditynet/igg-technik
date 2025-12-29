import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"

export const authClient = createAuthClient({
  plugins: [convexClient(), adminClient(), passkeyClient()],
});
