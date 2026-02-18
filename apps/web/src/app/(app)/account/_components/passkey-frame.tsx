"use client";

import { goeyToast as toast } from "goey-toast";
import { Edit, Fingerprint, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
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
			<Card className="rounded-none border-[#222] bg-[#0f0f0f] text-[#e8e4de] shadow-none">
				<CardHeader className="border-[#222] border-b">
					<CardTitle className="font-mono text-[10px] uppercase tracking-[0.3em]">
						Passkeys
					</CardTitle>
					<CardDescription className="text-[#8a8a8a]">
						Use your fingerprint, face, or device PIN for secure passwordless
						authentication.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="flex items-center justify-between border border-[#222] bg-[#111] p-4"
							>
								<div className="flex items-center gap-4">
									<Skeleton className="size-[58px] rounded-none bg-[#1b1b1b]" />
									<div className="space-y-2">
										<Skeleton className="h-5 w-32 bg-[#1b1b1b]" />
										<Skeleton className="h-4 w-24 bg-[#1b1b1b]" />
									</div>
								</div>
								<div className="flex items-center gap-1">
									<Skeleton className="size-10 rounded-none bg-[#1b1b1b]" />
									<Skeleton className="size-10 rounded-none bg-[#1b1b1b]" />
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
			<Card className="rounded-none border-[#222] bg-[#0f0f0f] text-[#e8e4de] shadow-none">
				<CardHeader className="border-[#222] border-b">
					<CardTitle className="font-mono text-[10px] uppercase tracking-[0.3em]">
						Passkeys
					</CardTitle>
					<CardDescription className="text-[#8a8a8a]">
						Verwende deinen Fingerabdruck, Gesichtserkennung oder Gerät-PIN für
						sichere passwortlose Authentifizierung.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid place-items-center border border-[#2a2a2a] border-dashed bg-[#111] px-6 py-10 text-center">
						<Fingerprint className="mb-3 size-7 text-[#ff3d00]" />
						<p className="font-black text-xl uppercase tracking-tight">
							Keine Passkeys hinterlegt
						</p>
						<p className="mt-2 max-w-md font-mono text-[#8a8a8a] text-xs">
							Füge einen Passkey hinzu, um dich schneller und sicherer
							anzumelden.
						</p>
						<Button
							onClick={handleAddPasskey}
							disabled={isAddingPasskey}
							size="sm"
							className="mt-5 rounded-none border border-[#ff3d00] bg-[#ff3d00] font-mono text-[10px] text-black uppercase tracking-[0.2em] hover:bg-[#ff521f]"
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
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card className="rounded-none border-[#222] bg-[#0f0f0f] text-[#e8e4de] shadow-none">
				<CardHeader className="border-[#222] border-b">
					<CardTitle className="font-mono text-[10px] uppercase tracking-[0.3em]">
						Passkeys
					</CardTitle>
					<CardDescription className="text-[#8a8a8a]">
						Verwende deinen Fingerabdruck, Gesichtserkennung oder Gerät-PIN für
						sichere passwortlose Authentifizierung.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{passkeys.map((passkey) => (
							<div
								key={passkey.id}
								className="flex items-center justify-between border border-[#222] bg-[#111] p-4"
							>
								<div className="flex items-center gap-4">
									<PasskeyIcon aaguid={passkey.aaguid} />
									<div>
										<p className="font-medium text-sm">
											{passkey.name || "Unbenannter Passkey"}
										</p>
										<p className="font-mono text-[#8a8a8a] text-xs">
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
												size="icon"
												className="rounded-none border border-[#4a4a4a] bg-[#1a1a1a] text-[#f3efe8] hover:border-[#ff3d00] hover:bg-[#22150f]"
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
													<Button
														size="icon"
														className="rounded-none border border-[#3a1f1f] bg-[#181010] hover:bg-[#261515]"
													>
														<Trash2 className="size-4 text-[#ff6b6b]" />
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

				<CardFooter className="flex justify-end border-[#222] border-t pt-6">
					<Button
						onClick={handleAddPasskey}
						disabled={isAddingPasskey}
						size="sm"
						className="rounded-none border border-[#ff3d00] bg-[#ff3d00] font-mono text-[10px] text-black uppercase tracking-[0.2em] hover:bg-[#ff521f]"
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
				<DialogContent className="rounded-none border-[#222] bg-[#0f0f0f] text-[#e8e4de]">
					<DialogHeader>
						<DialogTitle className="font-mono text-[11px] uppercase tracking-[0.25em]">
							Passkey-Name bearbeiten
						</DialogTitle>
						<DialogDescription className="text-[#8a8a8a]">
							Gib deinem Passkey einen einprägsamen Namen zur einfachen
							Identifizierung.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label
								htmlFor="passkey-name"
								className="font-mono text-[10px] uppercase tracking-[0.2em]"
							>
								Passkey-Name
							</Label>
							<Input
								id="passkey-name"
								value={newPasskeyName}
								onChange={(e) => setNewPasskeyName(e.target.value)}
								placeholder="z.B. Mein iPhone, Arbeits-Laptop"
								className="rounded-none border-[#222] bg-[#111]"
								autoFocus
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							className="rounded-none border border-[#222] bg-[#111] font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-[#181818]"
							onClick={() => setEditingPasskey(null)}
							disabled={isUpdatingName}
						>
							Abbrechen
						</Button>
						<Button
							className="rounded-none border border-[#ff3d00] bg-[#ff3d00] font-mono text-[10px] text-black uppercase tracking-[0.2em] hover:bg-[#ff521f]"
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
				<div className="cursor-help border border-[#222] bg-[#0f0f0f] p-2.5">
					{IconComponent ? (
						<IconComponent
							className="size-6"
							theme={resolvedTheme === "dark" ? "dark" : "light"}
						/>
					) : (
						<Fingerprint className="size-6 text-[#8a8a8a]" />
					)}
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<p className="text-xs">{name}</p>
			</TooltipContent>
		</Tooltip>
	);
}
