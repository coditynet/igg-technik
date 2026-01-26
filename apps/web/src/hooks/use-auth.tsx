"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { AuthContext } from "@/components/auth/provider";
import { authClient } from "@/lib/auth-client";

export function useAuth() {
	const context = use(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	const router = useRouter();

	const refetchSession = async () => {
		await context.refetchSession();
		router.refresh();
	};

	const signOut = async () => {
		const { error } = await authClient.signOut();

		if (error) {
			throw new Error(error.message || "Failed to sign out");
		}

		router.push("/sign-in");
	};

	return {
		session: context.session,
		refetchSession,
		signOut,
	};
}
