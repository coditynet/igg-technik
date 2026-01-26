"use client";

import { createContext, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { SystemBanner } from "../ui/system-banner";

type Session = Awaited<ReturnType<typeof authClient.useSession>>["data"];

interface AuthContextValue {
	session: Session;
	refetchSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
	undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
	const { data: session, refetch } = authClient.useSession();

	const refetchSession = async () => {
		await refetch();
	};

	return (
		<AuthContext.Provider value={{ session, refetchSession }}>
			<SystemBanner
				text={`Eingeloggt als ${session?.user?.name ?? ""}`}
				color="bg-orange-500"
				size="sm"
				show={!!session?.session?.impersonatedBy}
			/>
			{children}
		</AuthContext.Provider>
	);
}
