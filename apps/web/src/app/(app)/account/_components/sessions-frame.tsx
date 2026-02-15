"use client";

import { goeyToast as toast } from "goey-toast";
import { Laptop, Loader2, Monitor, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UAParser } from "ua-parser-js";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ChangePasswordDialog } from "./change-password-dialog";

type Session = {
	id: string;
	userAgent: string | null;
	ipAddress: string | null;
	createdAt: Date;
	updatedAt?: Date | null;
	token: string;
};

export function SessionsFrame({
	currentSessionId,
}: {
	currentSessionId?: string;
}) {
	const [sessions, setSessions] = useState<Session[]>([]);
	const [isPending, setIsPending] = useState(true);
	const [isRevokingAll, setIsRevokingAll] = useState(false);
	const [includeCurrentDevice, setIncludeCurrentDevice] = useState(false);

	const fetchSessions = useCallback(async () => {
		try {
			const { data, error } = await authClient.listSessions();
			if (error) {
				toast.error("Sitzungen konnten nicht geladen werden");
				return;
			}
			if (data) {
				const mapped = data.map((s) => ({
					id: s.id,
					userAgent: s.userAgent ?? null,
					ipAddress: s.ipAddress ?? null,
					createdAt: new Date(s.createdAt),
					updatedAt: s.updatedAt ? new Date(s.updatedAt) : null,
					token: s.token,
				}));
				setSessions(mapped);
			}
		} catch (_err) {
			toast.error("Sitzungen konnten nicht geladen werden");
		} finally {
			setIsPending(false);
		}
	}, []);

	useEffect(() => {
		fetchSessions();
	}, [fetchSessions]);

	const sortedSessions = useMemo(() => {
		return [...sessions].sort((a, b) => {
			const aIsCurrent = currentSessionId === a.id;
			const bIsCurrent = currentSessionId === b.id;
			if (aIsCurrent && !bIsCurrent) return -1;
			if (bIsCurrent && !aIsCurrent) return 1;
			return b.createdAt.getTime() - a.createdAt.getTime();
		});
	}, [sessions, currentSessionId]);

	const handleRevokeSession = useCallback(
		async (session: Session) => {
			try {
				const { error } = await authClient.revokeSession({
					token: session.token,
				});
				if (error) {
					toast.error(
						error.message || "Sitzung konnte nicht widerrufen werden",
					);
					return;
				}
				toast.success("Sitzung wurde widerrufen");
				await fetchSessions();
			} catch {
				toast.error("Etwas ist schiefgelaufen");
			}
		},
		[fetchSessions],
	);

	const handleRevokeAllSessions = useCallback(async () => {
		setIsRevokingAll(true);
		try {
			if (includeCurrentDevice) {
				const { error } = await authClient.revokeSessions();
				if (error) {
					toast.error(
						error.message || "Sitzungen konnten nicht widerrufen werden",
					);
				} else {
					toast.success("Alle Sitzungen wurden widerrufen. Abmeldung läuft...");
				}
			} else {
				const { error } = await authClient.revokeOtherSessions();
				if (error) {
					toast.error(
						error.message || "Sitzungen konnten nicht widerrufen werden",
					);
				} else {
					toast.success("Alle anderen Sitzungen wurden erfolgreich widerrufen");
					await fetchSessions();
				}
			}
		} catch {
			toast.error("Sitzungen konnten nicht widerrufen werden");
		} finally {
			if (!includeCurrentDevice) setIsRevokingAll(false);
			setIncludeCurrentDevice(false);
		}
	}, [includeCurrentDevice, fetchSessions]);

	const getBrowserIcon = (userAgent: string | null) => {
		if (!userAgent) return <Laptop className="size-6" />;
		return <Monitor className="size-6" />;
	};

	if (isPending) {
		return (
			<>
				<Card>
					<CardHeader>
						<CardTitle>Passwort</CardTitle>
						<CardDescription>
							Ändere dein Passwort, um dein Konto sicher zu halten.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div>
								<p className="mb-1 font-medium text-muted-foreground text-sm">
									Aktuelles Passwort
								</p>
								<p className="text-base">••••••••</p>
							</div>
							<ChangePasswordDialog />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Aktive Sitzungen</CardTitle>
						<CardDescription>
							Verwalte deine aktiven Sitzungen auf verschiedenen Geräten.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{[1, 2].map((i) => (
								<div
									key={i}
									className="flex items-center justify-between rounded-lg border p-4"
								>
									<div className="flex flex-1 items-center gap-4">
										<Skeleton className="size-12 rounded-lg" />
										<div className="min-w-0 flex-1 space-y-2">
											<Skeleton className="h-5 w-40" />
											<Skeleton className="h-4 w-48" />
										</div>
									</div>
									<Skeleton className="h-9 w-16 rounded-md" />
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</>
		);
	}

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Passwort</CardTitle>
					<CardDescription>
						Ändere dein Passwort, um dein Konto sicher zu halten.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div>
							<p className="mb-1 font-medium text-muted-foreground text-sm">
								Aktuelles Passwort
							</p>
							<p className="text-base">••••••••</p>
						</div>
						<ChangePasswordDialog />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Aktive Sitzungen</CardTitle>
					<CardDescription>
						Verwalte deine aktiven Sitzungen auf verschiedenen Geräten.
						Widerrufe den Zugriff von jedem Gerät.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{sortedSessions.map((sessionItem) => {
							const isCurrent = currentSessionId === sessionItem.id;
							const parser = new UAParser(sessionItem.userAgent || "");
							const browserInfo = parser.getBrowser();
							const osInfo = parser.getOS();
							const browser = browserInfo.name || "Unknown Browser";
							const os = osInfo.name || "Unknown OS";
							const ipDisplay = sessionItem.ipAddress || "Unknown IP";
							const lastActiveDate =
								sessionItem.updatedAt ?? sessionItem.createdAt;

							return (
								<div
									key={sessionItem.id}
									className={cn(
										"flex items-center justify-between rounded-lg border p-4",
										isCurrent ? "border-primary bg-primary/5 shadow-sm" : "",
									)}
								>
									<div className="flex flex-1 items-center gap-4">
										<div
											className={cn(
												"rounded-lg p-2.5",
												isCurrent ? "bg-primary/10" : "bg-secondary",
											)}
										>
											{getBrowserIcon(sessionItem.userAgent)}
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-2">
												<p className="font-medium text-sm">
													{browser} on {os}
												</p>
												{isCurrent && (
													<Badge variant="default" className="text-xs">
														Dieses Gerät
													</Badge>
												)}
											</div>
											<p className="text-muted-foreground text-xs">
												{ipDisplay} •{" "}
												{isCurrent ? (
													<span className="font-medium">Jetzt aktiv</span>
												) : (
													<>
														Zuletzt aktiv{" "}
														{lastActiveDate.toLocaleDateString("de-DE", {
															month: "short",
															day: "numeric",
															year: "numeric",
														})}
													</>
												)}
											</p>
										</div>
									</div>

									{!isCurrent && (
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button variant="ghost" size="sm">
													Widerrufen
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>
														Sitzung widerrufen
													</AlertDialogTitle>
													<AlertDialogDescription>
														Bist du sicher, dass du diese Sitzung widerrufen
														möchtest? Dieses Gerät muss sich erneut anmelden.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Abbrechen</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => handleRevokeSession(sessionItem)}
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
													>
														Sitzung widerrufen
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									)}
								</div>
							);
						})}
					</div>
				</CardContent>

				<CardFooter className="flex justify-end border-t pt-6">
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="destructive" size="sm" disabled={isRevokingAll}>
								{isRevokingAll ? (
									<Loader2 className="mr-2 size-4 animate-spin" />
								) : (
									<Trash2 className="mr-2 size-4" />
								)}
								Alle Sitzungen widerrufen
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Alle Sitzungen widerrufen</AlertDialogTitle>
								<AlertDialogDescription>
									Wähle, ob du dich von allen Geräten oder nur von anderen
									Geräten abmelden möchtest.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<div className="px-6 py-4">
								<div className="flex items-start gap-3">
									<Checkbox
										checked={includeCurrentDevice}
										onCheckedChange={(checked) =>
											setIncludeCurrentDevice(!!checked)
										}
										id="include-current"
									/>
									<div className="flex flex-col gap-1">
										<Label
											htmlFor="include-current"
											className="cursor-pointer font-medium text-sm leading-none"
										>
											Dieses Gerät einschließen
										</Label>
										<p className="text-muted-foreground text-xs">
											Falls aktiviert, wirst du auch von diesem Gerät
											abgemeldet.
										</p>
									</div>
								</div>
							</div>
							<AlertDialogFooter>
								<AlertDialogCancel>Abbrechen</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleRevokeAllSessions}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									{includeCurrentDevice
										? "Alle widerrufen & Abmelden"
										: "Andere Sitzungen widerrufen"}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</CardFooter>
			</Card>
		</>
	);
}
