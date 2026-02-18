"use client";

import type { User } from "better-auth";
import { goeyToast as toast } from "goey-toast";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/auth/user-avatar";
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
			<Card className="rounded-none border-[#222] bg-[#0f0f0f] text-[#e8e4de] shadow-none">
				<CardHeader className="border-[#222] border-b">
					<CardTitle className="font-mono text-[10px] uppercase tracking-[0.3em]">
						Profil
					</CardTitle>
					<CardDescription>
						Persönliche Informationen und Einstellungen.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<Skeleton className="h-16 w-16 rounded-full bg-[#1b1b1b]" />
						<div className="space-y-2">
							<Skeleton className="h-5 w-32 bg-[#1b1b1b]" />
							<Skeleton className="h-4 w-48 bg-[#1b1b1b]" />
						</div>
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
						Profil
					</CardTitle>
					<CardDescription className="text-[#8a8a8a]">
						Verwalte deine persönlichen Informationen.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex flex-col gap-6 sm:flex-row sm:items-center">
						<UserAvatar user={user} className="h-16 w-16 rounded-full" />
						<div className="space-y-1">
							<div className="flex items-center gap-3">
								<h3 className="font-black text-2xl uppercase tracking-tight">
									{currentName}
								</h3>
								<span className="inline-flex items-center border border-[#222] bg-[#111] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em]">
									{user.role || "User"}
								</span>
							</div>
							<p className="font-mono text-[#8a8a8a] text-xs">{user.email}</p>
						</div>
					</div>

					<div className="h-px w-full bg-[#222]" />

					<div className="grid gap-4 border border-[#222] bg-[#111] p-4 sm:grid-cols-2">
						<div className="space-y-1">
							<Label className="font-mono text-[10px] uppercase tracking-[0.2em]">
								Anzeigename
							</Label>
							<p className="text-[#8a8a8a] text-sm">
								Dieser Name wird anderen Benutzern angezeigt.
							</p>
						</div>
						<div className="flex items-center justify-between gap-4 sm:justify-end">
							<span className="font-semibold">{currentName}</span>
							<Button
								size="sm"
								className="rounded-none border border-[#4a4a4a] bg-[#1a1a1a] font-mono text-[#f3efe8] text-[10px] uppercase tracking-[0.2em] hover:border-[#ff3d00] hover:bg-[#22150f]"
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
				<DialogContent className="rounded-none border-[#222] bg-[#0f0f0f] text-[#e8e4de]">
					<DialogHeader>
						<DialogTitle className="font-mono text-[11px] uppercase tracking-[0.25em]">
							Anzeigenamen ändern
						</DialogTitle>
						<DialogDescription className="text-[#8a8a8a]">
							Aktualisiere deinen Anzeigenamen, der in der Anwendung erscheint.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label
								htmlFor="name"
								className="font-mono text-[10px] uppercase tracking-[0.2em]"
							>
								Anzeigename
							</Label>
							<Input
								id="name"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								placeholder="Gib deinen Namen ein"
								className="rounded-none border-[#222] bg-[#111]"
								autoFocus
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							className="rounded-none border border-[#222] bg-[#111] font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-[#181818]"
							onClick={() => setNameDialogOpen(false)}
							disabled={isUpdatingName}
						>
							Abbrechen
						</Button>
						<Button
							className="rounded-none border border-[#ff3d00] bg-[#ff3d00] font-mono text-[10px] text-black uppercase tracking-[0.2em] hover:bg-[#ff521f]"
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
