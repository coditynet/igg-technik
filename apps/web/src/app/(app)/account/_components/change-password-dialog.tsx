"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function ChangePasswordDialog() {
	const [open, setOpen] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isChanging, setIsChanging] = useState(false);

	const handleChangePassword = async () => {
		if (!currentPassword || !newPassword || !confirmPassword) {
			toast.error("Bitte fülle alle Felder aus");
			return;
		}

		if (newPassword !== confirmPassword) {
			toast.error("Die neuen Passwörter stimmen nicht überein");
			return;
		}

		if (newPassword.length < 8) {
			toast.error("Passwort muss mindestens 8 Zeichen lang sein");
			return;
		}

		setIsChanging(true);

		try {
			const { error } = await authClient.changePassword({
				currentPassword,
				newPassword,
				revokeOtherSessions: true,
			});

			if (error) {
				toast.error(error.message || "Passwort konnte nicht geändert werden");
			} else {
				toast.success("Passwort erfolgreich geändert");
				setOpen(false);
				setCurrentPassword("");
				setNewPassword("");
				setConfirmPassword("");
			}
		} catch (error) {
			toast.error("Passwort konnte nicht geändert werden");
			console.error(error);
		} finally {
			setIsChanging(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm">
					Ändern
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Passwort ändern</DialogTitle>
					<DialogDescription>
						Gib dein aktuelles Passwort ein und wähle ein neues.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="current-password">Aktuelles Passwort</Label>
						<Input
							id="current-password"
							type="password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							placeholder="Aktuelles Passwort eingeben"
							autoFocus
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="new-password">Neues Passwort</Label>
						<Input
							id="new-password"
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							placeholder="Neues Passwort eingeben"
						/>
						<p className="text-muted-foreground text-xs">
							Passwort muss mindestens 8 Zeichen lang sein
						</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="confirm-password">Neues Passwort bestätigen</Label>
						<Input
							id="confirm-password"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="Neues Passwort bestätigen"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant="ghost"
						onClick={() => {
							setOpen(false);
							setCurrentPassword("");
							setNewPassword("");
							setConfirmPassword("");
						}}
						disabled={isChanging}
					>
						Abbrechen
					</Button>
					<Button
						onClick={handleChangePassword}
						disabled={
							isChanging || !currentPassword || !newPassword || !confirmPassword
						}
					>
						{isChanging ? (
							<>
								<Loader2 className="mr-2 size-4 animate-spin" />
								Wird geändert...
							</>
						) : (
							"Passwort ändern"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
