"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
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
import { authClient } from "@/lib/auth-client";
import { UserAvatar } from "@/components/auth/user-avatar";
import type { User } from "better-auth";
import { Separator } from "@/components/ui/separator";

interface ProfileFrameProps {
	user?: User;
}

export function ProfileFrame({ user }: ProfileFrameProps) {
	const [currentName, setCurrentName] = useState(user?.name || "");
	const [nameDialogOpen, setNameDialogOpen] = useState(false);
	const [newName, setNewName] = useState("");
	const [isUpdatingName, setIsUpdatingName] = useState(false);

	useEffect(() => {
		if (user?.name) {
			setCurrentName(user.name);
		}
	}, [user?.name]);

	const handleUpdateName = async () => {
		if (!newName.trim()) {
			toast.error("Name darf nicht leer sein");
			return;
		}

		setIsUpdatingName(true);

		try {
			const { error } = await authClient.updateUser({
				name: newName.trim(),
			});

			if (error) {
				toast.error(error.message || "Name konnte nicht aktualisiert werden");
			} else {
				toast.success("Name erfolgreich aktualisiert");
				setCurrentName(newName.trim());
				setNameDialogOpen(false);
				setNewName("");
			}
		} catch (error) {
			toast.error("Name konnte nicht aktualisiert werden");
			console.error(error);
		} finally {
			setIsUpdatingName(false);
		}
	};

	if (!user) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Profil</CardTitle>
					<CardDescription>
						Persönliche Informationen und Einstellungen.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<Skeleton className="h-16 w-16 rounded-full" />
						<div className="space-y-2">
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-4 w-48" />
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Profil</CardTitle>
					<CardDescription>
						Verwalte deine persönlichen Informationen.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex flex-col sm:flex-row sm:items-center gap-6">
						<UserAvatar user={user} className="h-16 w-16 rounded-full" />
						<div className="space-y-1">
							<div className="flex items-center gap-3">
								<h3 className="text-xl font-semibold">{currentName}</h3>
								<span className="inline-flex items-center rounded-md bg-muted px-2 py-1 font-medium text-xs ring-1 ring-inset ring-gray-500/10">
									{user.role || "User"}
								</span>
							</div>
							<p className="text-muted-foreground text-sm">{user.email}</p>
						</div>
					</div>
					
					<Separator />

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-1">
							<Label className="text-base">Anzeigename</Label>
							<p className="text-muted-foreground text-sm">
								Dieser Name wird anderen Benutzern angezeigt.
							</p>
						</div>
						<div className="flex items-center justify-between sm:justify-end gap-4 rounded-lg border p-3 sm:border-0 sm:p-0">
							<span className="font-medium">{currentName}</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setNewName(currentName);
									setNameDialogOpen(true);
								}}
							>
								Bearbeiten
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Anzeigenamen ändern</DialogTitle>
						<DialogDescription>
							Aktualisiere deinen Anzeigenamen, der in der Anwendung erscheint.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="name">Anzeigename</Label>
							<Input
								id="name"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								placeholder="Gib deinen Namen ein"
								autoFocus
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setNameDialogOpen(false)}
							disabled={isUpdatingName}
						>
							Abbrechen
						</Button>
						<Button
							onClick={handleUpdateName}
							disabled={
								isUpdatingName ||
								!newName.trim() ||
								newName.trim() === currentName
							}
						>
							{isUpdatingName ? (
								<>
									<Loader2 className="mr-2 size-4 animate-spin" />
									Wird gespeichert...
								</>
							) : (
								"Speichern"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
