"use client";

import { Edit, Fingerprint, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAAGUIDInfo } from "@/lib/aaguid-data";
import { authClient } from "@/lib/auth-client";

type Passkey = {
	id: string;
	name: string | null | undefined;
	createdAt: Date | string | null;
	deviceType: string;
	aaguid?: string | null;
};

export function PasskeyFrame() {
	const router = useRouter();
	const [passkeys, setPasskeys] = useState<Passkey[]>([]);
	const [isPending, setIsPending] = useState(true);
	const [isAddingPasskey, setIsAddingPasskey] = useState(false);
	const [editingPasskey, setEditingPasskey] = useState<Passkey | null>(null);
	const [newPasskeyName, setNewPasskeyName] = useState("");
	const [isUpdatingName, setIsUpdatingName] = useState(false);

	const fetchPasskeys = useCallback(async () => {
		try {
			const { data, error } = await authClient.passkey.listUserPasskeys();
			if (error) {
				toast.error("Passkeys konnten nicht geladen werden");
				return;
			}
			if (data) {
				setPasskeys(data as Passkey[]);
			}
		} catch (_err) {
			toast.error("Passkeys konnten nicht geladen werden");
		} finally {
			setIsPending(false);
		}
	}, []);

	useEffect(() => {
		fetchPasskeys();
	}, [fetchPasskeys]);

	const handleAddPasskey = useCallback(async () => {
		setIsAddingPasskey(true);
		try {
			const { error } = await authClient.passkey.addPasskey();
			if (error) {
				toast.error("Passkey konnte nicht hinzugefügt werden");
			} else {
				toast.success("Passkey erfolgreich hinzugefügt");
				await fetchPasskeys();
				router.refresh();
			}
		} catch {
			toast.error("Passkey konnte nicht hinzugefügt werden");
		} finally {
			setIsAddingPasskey(false);
		}
	}, [fetchPasskeys, router]);

	const handleDeletePasskey = useCallback(
		async (passkeyId: string) => {
			try {
				const { error } = await authClient.passkey.deletePasskey({
					id: passkeyId,
				});
				if (error) {
					toast.error("Passkey konnte nicht gelöscht werden");
				} else {
					toast.success("Passkey erfolgreich gelöscht");
					await fetchPasskeys();
					router.refresh();
				}
			} catch {
				toast.error("Passkey konnte nicht gelöscht werden");
			}
		},
		[fetchPasskeys, router],
	);

	const handleUpdatePasskeyName = useCallback(async () => {
		if (!editingPasskey || !newPasskeyName.trim()) {
			toast.error("Bitte gib einen Namen für den Passkey ein");
			return;
		}
		setIsUpdatingName(true);
		try {
			const { error } = await authClient.passkey.updatePasskey({
				id: editingPasskey.id,
				name: newPasskeyName.trim(),
			});
			if (error) {
				toast.error("Passkey-Name konnte nicht aktualisiert werden");
			} else {
				toast.success("Passkey-Name erfolgreich aktualisiert");
				await fetchPasskeys();
				setEditingPasskey(null);
				setNewPasskeyName("");
				router.refresh();
			}
		} catch {
			toast.error("Passkey-Name konnte nicht aktualisiert werden");
		} finally {
			setIsUpdatingName(false);
		}
	}, [editingPasskey, newPasskeyName, fetchPasskeys, router]);

	const openEditDialog = useCallback((passkey: Passkey) => {
		setEditingPasskey(passkey);
		setNewPasskeyName(passkey.name || "");
	}, []);

	if (isPending) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Passkeys</CardTitle>
					<CardDescription>
						Use your fingerprint, face, or device PIN for secure passwordless
						authentication.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="flex items-center justify-between rounded-lg border p-4"
							>
								<div className="flex items-center gap-4">
									<Skeleton className="size-[58px] rounded-lg" />
									<div className="space-y-2">
										<Skeleton className="h-5 w-32" />
										<Skeleton className="h-4 w-24" />
									</div>
								</div>
								<div className="flex items-center gap-1">
									<Skeleton className="size-10 rounded-md" />
									<Skeleton className="size-10 rounded-md" />
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!passkeys || passkeys.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Passkeys</CardTitle>
					<CardDescription>
						Verwende deinen Fingerabdruck, Gesichtserkennung oder Gerät-PIN für
						sichere passwortlose Authentifizierung.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Fingerprint />
							</EmptyMedia>
							<EmptyTitle>Keine Passkeys hinzugefügt</EmptyTitle>
							<EmptyDescription>
								Füge einen Passkey hinzu für schnellere und sicherere Anmeldung
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button
								onClick={handleAddPasskey}
								disabled={isAddingPasskey}
								size="sm"
							>
								{isAddingPasskey ? (
									<>
										<Loader2 className="mr-2 size-4 animate-spin" />
										Wird hinzugefügt...
									</>
								) : (
									<>
										<Plus className="mr-2 size-4" />
										Passkey hinzufügen
									</>
								)}
							</Button>
						</EmptyContent>
					</Empty>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Passkeys</CardTitle>
					<CardDescription>
						Verwende deinen Fingerabdruck, Gesichtserkennung oder Gerät-PIN für
						sichere passwortlose Authentifizierung.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{passkeys.map((passkey) => (
							<div
								key={passkey.id}
								className="flex items-center justify-between rounded-lg border p-4"
							>
								<div className="flex items-center gap-4">
									<PasskeyIcon aaguid={passkey.aaguid} />
									<div>
										<p className="font-medium text-sm">
											{passkey.name || "Unbenannter Passkey"}
										</p>
										<p className="text-muted-foreground text-xs">
											Hinzugefügt am{" "}
											{passkey.createdAt
												? new Date(passkey.createdAt).toLocaleDateString(
														"de-DE",
														{
															year: "numeric",
															month: "long",
															day: "numeric",
														},
													)
												: "kürzlich"}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-1">
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												onClick={() =>
													openEditDialog({
														...passkey,
														name: passkey.name ?? null,
													})
												}
											>
												<Edit className="size-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p className="text-xs">Passkey umbenennen</p>
										</TooltipContent>
									</Tooltip>
									<AlertDialog>
										<Tooltip>
											<TooltipTrigger asChild>
												<AlertDialogTrigger asChild>
													<Button variant="ghost" size="icon">
														<Trash2 className="size-4 text-destructive" />
													</Button>
												</AlertDialogTrigger>
											</TooltipTrigger>
											<TooltipContent>
												<p className="text-xs">Passkey löschen</p>
											</TooltipContent>
										</Tooltip>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Passkey löschen</AlertDialogTitle>
												<AlertDialogDescription>
													Bist du sicher, dass du diesen Passkey löschen
													möchtest? Du kannst ihn danach nicht mehr zur
													Anmeldung verwenden.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Abbrechen</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => handleDeletePasskey(passkey.id)}
													className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
												>
													Passkey löschen
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</div>
						))}
					</div>
				</CardContent>

				<CardFooter className="flex justify-end border-t pt-6">
					<Button
						onClick={handleAddPasskey}
						disabled={isAddingPasskey}
						variant="outline"
						size="sm"
					>
						{isAddingPasskey ? (
							<>
								<Loader2 className="mr-2 size-4 animate-spin" />
								Wird hinzugefügt...
							</>
						) : (
							<>
								<Plus className="mr-2 size-4" />
								Passkey hinzufügen
							</>
						)}
					</Button>
				</CardFooter>
			</Card>

			<Dialog
				open={!!editingPasskey}
				onOpenChange={(open) => !open && setEditingPasskey(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Passkey-Name bearbeiten</DialogTitle>
						<DialogDescription>
							Gib deinem Passkey einen einprägsamen Namen zur einfachen
							Identifizierung.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="passkey-name">Passkey-Name</Label>
							<Input
								id="passkey-name"
								value={newPasskeyName}
								onChange={(e) => setNewPasskeyName(e.target.value)}
								placeholder="z.B. Mein iPhone, Arbeits-Laptop"
								autoFocus
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="ghost"
							onClick={() => setEditingPasskey(null)}
							disabled={isUpdatingName}
						>
							Abbrechen
						</Button>
						<Button
							onClick={handleUpdatePasskeyName}
							disabled={isUpdatingName || !newPasskeyName.trim()}
						>
							{isUpdatingName ? (
								<>
									<Loader2 className="mr-2 size-4 animate-spin" />
									Wird gespeichert...
								</>
							) : (
								"Änderungen speichern"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

function PasskeyIcon({ aaguid }: { aaguid?: string | null }) {
	const { resolvedTheme } = useTheme();
	const { iconComponent: IconComponent, name } = getAAGUIDInfo(aaguid);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="cursor-help rounded-lg bg-secondary p-2.5">
					{IconComponent ? (
						<IconComponent
							className="size-6"
							theme={resolvedTheme === "dark" ? "dark" : "light"}
						/>
					) : (
						<Fingerprint className="size-6 text-muted-foreground" />
					)}
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<p className="text-xs">{name}</p>
			</TooltipContent>
		</Tooltip>
	);
}
