"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
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
import { authClient } from "@/lib/auth-client";

interface ProfileFrameProps {
	initialName: string;
}

export function ProfileFrame({ initialName }: ProfileFrameProps) {
	const [currentName, setCurrentName] = useState(initialName);
	const [nameDialogOpen, setNameDialogOpen] = useState(false);
	const [newName, setNewName] = useState("");
	const [isUpdatingName, setIsUpdatingName] = useState(false);

	const handleUpdateName = async () => {
		if (!newName.trim()) {
			toast.error("Name cannot be empty");
			return;
		}

		setIsUpdatingName(true);

		try {
			const { error } = await authClient.updateUser({
				name: newName.trim(),
			});

			if (error) {
				toast.error(error.message || "Failed to update name");
			} else {
				toast.success("Name updated successfully");
				setCurrentName(newName.trim());
				setNameDialogOpen(false);
				setNewName("");
			}
		} catch (error) {
			toast.error("Failed to update name");
			console.error(error);
		} finally {
			setIsUpdatingName(false);
		}
	};

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Profile Information</CardTitle>
					<CardDescription>
						Update your display name that appears across the application.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div>
							<p className="mb-1 font-medium text-muted-foreground text-sm">
								Display Name
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
							Change
						</Button>
					</div>
				</CardContent>
			</Card>

			<Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Change Display Name</DialogTitle>
						<DialogDescription>
							Update your display name that appears across the application.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="name">Display Name</Label>
							<Input
								id="name"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								placeholder="Enter your name"
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
							Cancel
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
									Saving...
								</>
							) : (
								"Save Changes"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
