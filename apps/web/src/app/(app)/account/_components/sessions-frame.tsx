"use client";

import { Laptop, Loader2, Monitor, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
	currentSessionId: string;
}) {
	const [sessions, setSessions] = useState<Session[]>([]);
	const [isPending, setIsPending] = useState(true);
	const [isRevokingAll, setIsRevokingAll] = useState(false);
	const [includeCurrentDevice, setIncludeCurrentDevice] = useState(false);

	const fetchSessions = useCallback(async () => {
		try {
			const { data, error } = await authClient.listSessions();
			if (error) {
				toast.error("Failed to load sessions");
				return;
			}
			if (data) {
				const mapped = data.map((s: any) => ({
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
			toast.error("Failed to load sessions");
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
					toast.error(error.message || "Failed to revoke session");
					return;
				}
				toast.success("Session revoked!");
				await fetchSessions();
			} catch {
				toast.error("Something went wrong");
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
					toast.error(error.message || "Failed to revoke sessions");
				} else {
					toast.success("All sessions revoked. Signing out...");
				}
			} else {
				const { error } = await authClient.revokeOtherSessions();
				if (error) {
					toast.error(error.message || "Failed to revoke sessions");
				} else {
					toast.success("All other sessions revoked successfully");
					await fetchSessions();
				}
			}
		} catch {
			toast.error("Failed to revoke sessions");
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
			<Card>
				<CardHeader>
					<CardTitle>Active Sessions</CardTitle>
					<CardDescription>
						Manage your active sessions across different devices.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-12">
						<Loader2 className="size-6 animate-spin text-muted-foreground" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Password</CardTitle>
					<CardDescription>
						Change your password to keep your account secure.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div>
							<p className="mb-1 font-medium text-muted-foreground text-sm">
								Current Password
							</p>
							<p className="text-base">••••••••</p>
						</div>
						<ChangePasswordDialog />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Active Sessions</CardTitle>
					<CardDescription>
						Manage your active sessions across different devices. Revoke access
						from any device.
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
														This Device
													</Badge>
												)}
											</div>
											<p className="text-muted-foreground text-xs">
												{ipDisplay} •{" "}
												{isCurrent ? (
													<span className="font-medium">Active now</span>
												) : (
													<>
														Last active{" "}
														{lastActiveDate.toLocaleDateString(undefined, {
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
													Revoke
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Revoke Session</AlertDialogTitle>
													<AlertDialogDescription>
														Are you sure you want to revoke this session? This
														device will need to sign in again.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => handleRevokeSession(sessionItem)}
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
													>
														Revoke Session
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
								Revoke All Sessions
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Revoke All Sessions</AlertDialogTitle>
								<AlertDialogDescription>
									Choose whether to sign out from all devices or only other
									devices.
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
											Include this device
										</Label>
										<p className="text-muted-foreground text-xs">
											If checked, you will be signed out from this device as
											well.
										</p>
									</div>
								</div>
							</div>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleRevokeAllSessions}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									{includeCurrentDevice
										? "Revoke All & Sign Out"
										: "Revoke Other Sessions"}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</CardFooter>
			</Card>
		</>
	);
}
