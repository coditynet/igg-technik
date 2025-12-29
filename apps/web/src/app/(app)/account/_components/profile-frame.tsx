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

interface ProfileFrameProps {
	initialName?: string;
}

export function ProfileFrame({ initialName }: ProfileFrameProps) {
	const [currentName, setCurrentName] = useState(initialName || "");
	const [nameDialogOpen, setNameDialogOpen] = useState(false);
	const [newName, setNewName] = useState("");
	const [isUpdatingName, setIsUpdatingName] = useState(false);

	useEffect(() => {
		if (initialName) {
			setCurrentName(initialName);
		}
	}, [initialName]);

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

	if (!initialName) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Profilinformationen</CardTitle>
					<CardDescription>
						Aktualisiere deinen Anzeigenamen, der in der Anwendung erscheint.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-5 w-32" />
						</div>
						<Skeleton className="h-9 w-16 rounded-md" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Profilinformationen</CardTitle>
					<CardDescription>
						Aktualisiere deinen Anzeigenamen, der in der Anwendung erscheint.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div>
							<p className="mb-1 font-medium text-muted-foreground text-sm">
								Anzeigename
							</p>
							<p className="text-base">{currentName}</p>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setNewName(currentName);
								setNameDialogOpen(true);
							}}
						>
							Ändern
						</Button>
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
							variant="ghost"
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
								"Änderungen speichern"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
