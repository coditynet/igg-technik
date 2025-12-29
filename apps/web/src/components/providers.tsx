"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { env } from "@igg/env/web";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexReactClient } from "convex/react";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);
const convexQueryClient = new ConvexQueryClient(convex);

export default function Providers({
	children,
	initialToken,
}: {
	children: React.ReactNode;
	initialToken?: string | null;
}) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						queryKeyHashFn: convexQueryClient.hashFn(),
						queryFn: convexQueryClient.queryFn(),
					},
				},
			}),
	);

	convexQueryClient.connect(queryClient);

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<ConvexBetterAuthProvider
				client={convex}
				authClient={authClient}
				initialToken={initialToken}
			>
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			</ConvexBetterAuthProvider>
			<Toaster richColors />
		</ThemeProvider>
	);
}
