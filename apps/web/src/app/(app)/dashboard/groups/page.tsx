"use client";

import { api } from "@igg/backend/convex/_generated/api";
import type { Id } from "@igg/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { goeyToast } from "goey-toast";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const groupColors = [
	{
		value: "blue",
		label: "Blau",
		badgeClass: "bg-blue-500 hover:bg-blue-500",
		dotClass: "bg-blue-500",
	},
	{
		value: "orange",
		label: "Orange",
		badgeClass: "bg-orange-500 hover:bg-orange-500",
		dotClass: "bg-orange-500",
	},
	{
		value: "violet",
		label: "Violett",
		badgeClass: "bg-violet-500 hover:bg-violet-500",
		dotClass: "bg-violet-500",
	},
	{
		value: "rose",
		label: "Rose",
		badgeClass: "bg-rose-500 hover:bg-rose-500",
		dotClass: "bg-rose-500",
	},
	{
		value: "emerald",
		label: "Emerald",
		badgeClass: "bg-emerald-500 hover:bg-emerald-500",
		dotClass: "bg-emerald-500",
	},
] as const;

type GroupColor = (typeof groupColors)[number]["value"];

function colorLabel(color: string) {
	return groupColors.find((entry) => entry.value === color)?.label ?? color;
}

function colorBadgeClass(color: string) {
	return (
		groupColors.find((entry) => entry.value === color)?.badgeClass ??
		"bg-gray-500 hover:bg-gray-500"
	);
}

function colorDotClass(color: string) {
	return (
		groupColors.find((entry) => entry.value === color)?.dotClass ??
		"bg-gray-500"
	);
}

export default function GroupsPage() {
	const groups = useQuery(api.groups.list);
	const createGroup = useMutation(api.groups.create);
	const updateGroup = useMutation(api.groups.update);
	const deleteGroup = useMutation(api.groups.remove);

	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [createForm, setCreateForm] = useState<{
		name: string;
		color: GroupColor;
	}>({ name: "", color: "blue" });

	const [editGroupId, setEditGroupId] = useState<Id<"groups"> | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [editForm, setEditForm] = useState<{ name: string; color: GroupColor }>(
		{
			name: "",
			color: "blue",
		},
	);

	const [deleteGroupId, setDeleteGroupId] = useState<Id<"groups"> | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const groupToDelete = useMemo(() => {
		if (!groups || !deleteGroupId) {
			return null;
		}
		return groups.find((group) => group._id === deleteGroupId) ?? null;
	}, [groups, deleteGroupId]);

	const hasDuplicateName = (name: string, ignoreId?: Id<"groups">) => {
		if (!groups) {
			return false;
		}
		const normalizedName = name.trim().toLowerCase();
		return groups.some(
			(group) =>
				group._id !== ignoreId &&
				group.name.trim().toLowerCase() === normalizedName,
		);
	};

	const resetCreateForm = () => {
		setCreateForm({ name: "", color: "blue" });
	};

	const openEditDialog = (group: {
		_id: Id<"groups">;
		name: string;
		color: string;
	}) => {
		setEditGroupId(group._id);
		setEditForm({
			name: group.name,
			color: (group.color as GroupColor) ?? "blue",
		});
	};

	const closeEditDialog = () => {
		setEditGroupId(null);
		setEditForm({ name: "", color: "blue" });
	};

	const handleCreateGroup = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const name = createForm.name.trim();
		if (!name) {
			goeyToast.error("Bitte geben Sie einen Gruppennamen ein.");
			return;
		}
		if (hasDuplicateName(name)) {
			goeyToast.error("Eine Gruppe mit diesem Namen existiert bereits.");
			return;
		}

		setIsCreating(true);
		try {
			await createGroup({
				name,
				color: createForm.color,
			});
			goeyToast.success("Gruppe erstellt");
			resetCreateForm();
			setCreateDialogOpen(false);
		} catch (_error) {
			goeyToast.error("Gruppe konnte nicht erstellt werden");
		} finally {
			setIsCreating(false);
		}
	};

	const handleUpdateGroup = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!editGroupId) {
			return;
		}

		const name = editForm.name.trim();
		if (!name) {
			goeyToast.error("Bitte geben Sie einen Gruppennamen ein.");
			return;
		}
		if (hasDuplicateName(name, editGroupId)) {
			goeyToast.error("Eine Gruppe mit diesem Namen existiert bereits.");
			return;
		}

		setIsUpdating(true);
		try {
			await updateGroup({
				id: editGroupId,
				name,
				color: editForm.color,
			});
			goeyToast.success("Gruppe aktualisiert");
			closeEditDialog();
		} catch (_error) {
			goeyToast.error("Gruppe konnte nicht aktualisiert werden");
		} finally {
			setIsUpdating(false);
		}
	};

	const handleDeleteGroup = async () => {
		if (!deleteGroupId) {
			return;
		}

		setIsDeleting(true);
		try {
			await deleteGroup({ id: deleteGroupId });
			goeyToast.success("Gruppe gelöscht");
			setDeleteGroupId(null);
		} catch (_error) {
			goeyToast.error("Gruppe konnte nicht gelöscht werden");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="max-w-6xl space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<div className="mb-2 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
						Verwaltung
					</div>
					<h1 className="font-black text-3xl uppercase tracking-tight">
						Gruppen
					</h1>
					<p className="mt-1 font-mono text-[#777] text-xs">
						Erstellen, bearbeiten und verwalten Sie alle Gruppen.
					</p>
				</div>

				<Dialog
					open={createDialogOpen}
					onOpenChange={(open) => {
						setCreateDialogOpen(open);
						if (!open) {
							resetCreateForm();
						}
					}}
				>
					<DialogTrigger asChild>
						<Button className="bg-[#ff3d00] font-mono text-black text-xs uppercase tracking-[0.1em] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#ff3d00] hover:shadow-[5px_5px_0_0_rgba(255,61,0,0.3)]">
							<Plus className="mr-1 size-3.5" />
							Neue Gruppe
						</Button>
					</DialogTrigger>
					<DialogContent className="border-[#222] bg-[#0f0f0f] text-[#e8e4de]">
						<DialogHeader>
							<DialogTitle className="font-mono text-[#e8e4de] text-sm uppercase tracking-[0.15em]">
								Neue Gruppe erstellen
							</DialogTitle>
							<DialogDescription className="font-mono text-[#777] text-xs">
								Wählen Sie einen Namen und eine Farbe für die neue Gruppe.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleCreateGroup} className="space-y-4">
							<div className="space-y-2">
								<Label
									htmlFor="group-create-name"
									className="font-mono text-[10px] uppercase tracking-[0.2em]"
								>
									Name
								</Label>
								<Input
									id="group-create-name"
									value={createForm.name}
									onChange={(event) =>
										setCreateForm((prev) => ({
											...prev,
											name: event.target.value,
										}))
									}
									placeholder="z. B. Jahrgang 10"
									className="border-[#222] bg-[#111] font-mono"
									maxLength={80}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="group-create-color"
									className="font-mono text-[10px] uppercase tracking-[0.2em]"
								>
									Farbe
								</Label>
								<Select
									value={createForm.color}
									onValueChange={(value) =>
										setCreateForm((prev) => ({
											...prev,
											color: value as GroupColor,
										}))
									}
								>
									<SelectTrigger
										id="group-create-color"
										className="border-[#222] bg-[#111] font-mono"
									>
										<SelectValue>
											<span className="pointer-events-none flex items-center gap-2">
												<span
													className={`size-2.5 rounded-full ${colorDotClass(createForm.color)}`}
												/>
												<span>{colorLabel(createForm.color)}</span>
											</span>
										</SelectValue>
									</SelectTrigger>
									<SelectContent className="border-[#222] bg-[#111] text-[#e8e4de]">
										{groupColors.map((color) => (
											<SelectItem
												key={color.value}
												value={color.value}
												className="font-mono"
											>
												<div className="flex items-center gap-2">
													<span
														className={`size-2.5 rounded-full ${color.dotClass}`}
													/>
													<span>{color.label}</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setCreateDialogOpen(false)}
									className="border-[#333] bg-[#111] font-mono text-[10px] uppercase tracking-[0.1em]"
								>
									Abbrechen
								</Button>
								<Button
									type="submit"
									disabled={isCreating}
									className="bg-[#ff3d00] font-mono text-[10px] text-black uppercase tracking-[0.1em] hover:bg-[#ff3d00]"
								>
									{isCreating ? "Erstelle..." : "Erstellen"}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{groups === undefined ? (
				<div className="border border-[#222] bg-[#0f0f0f]">
					<Table>
						<TableHeader>
							<TableRow className="border-[#222] hover:bg-transparent">
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Gruppe
								</TableHead>
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Farbe
								</TableHead>
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									ID
								</TableHead>
								<TableHead className="text-right font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Aktionen
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 4 }).map((_, index) => (
								<TableRow
									key={`groups-loading-${index + 1}`}
									className="border-[#1c1c1c] hover:bg-transparent"
								>
									<TableCell>
										<Skeleton className="h-4 w-36 bg-[#111]" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-6 w-20 bg-[#111]" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-44 bg-[#111]" />
									</TableCell>
									<TableCell className="text-right">
										<Skeleton className="ml-auto h-8 w-24 bg-[#111]" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			) : groups.length === 0 ? (
				<div className="flex h-[320px] items-center justify-center border border-[#222] bg-[#0f0f0f]">
					<div className="space-y-3 text-center">
						<p className="font-mono text-[#999] text-xs">
							Noch keine Gruppen vorhanden.
						</p>
						<Button
							onClick={() => setCreateDialogOpen(true)}
							className="bg-[#ff3d00] font-mono text-[10px] text-black uppercase tracking-[0.1em] hover:bg-[#ff3d00]"
						>
							<Plus className="mr-1 size-3.5" />
							Erste Gruppe erstellen
						</Button>
					</div>
				</div>
			) : (
				<div className="border border-[#222] bg-[#0f0f0f]">
					<Table>
						<TableHeader>
							<TableRow className="border-[#222] hover:bg-transparent">
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Gruppe
								</TableHead>
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Farbe
								</TableHead>
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									ID
								</TableHead>
								<TableHead className="text-right font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Aktionen
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{groups.map((group) => (
								<TableRow
									key={group._id}
									className="border-[#1c1c1c] hover:bg-[#ff3d00]/5"
								>
									<TableCell className="font-medium text-[#e8e4de]">
										{group.name}
									</TableCell>
									<TableCell>
										<Badge
											className={`${colorBadgeClass(group.color)} border-none font-mono text-[10px] text-white uppercase tracking-[0.1em]`}
										>
											{colorLabel(group.color)}
										</Badge>
									</TableCell>
									<TableCell className="font-mono text-[#888] text-[11px]">
										{group._id}
									</TableCell>
									<TableCell>
										<div className="flex items-center justify-end gap-2">
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => openEditDialog(group)}
												className="border-[#333] bg-[#111] font-mono text-[10px] uppercase tracking-[0.1em]"
											>
												<Edit3 className="size-3.5" />
												Bearbeiten
											</Button>
											<Button
												type="button"
												variant="destructive"
												size="sm"
												onClick={() => setDeleteGroupId(group._id)}
												className="font-mono text-[10px] uppercase tracking-[0.1em]"
											>
												<Trash2 className="size-3.5" />
												Löschen
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			<Dialog
				open={Boolean(editGroupId)}
				onOpenChange={(open) => !open && closeEditDialog()}
			>
				<DialogContent className="border-[#222] bg-[#0f0f0f] text-[#e8e4de]">
					<DialogHeader>
						<DialogTitle className="font-mono text-[#e8e4de] text-sm uppercase tracking-[0.15em]">
							Gruppe bearbeiten
						</DialogTitle>
						<DialogDescription className="font-mono text-[#777] text-xs">
							Aktualisieren Sie Name und Farbe der ausgewählten Gruppe.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleUpdateGroup} className="space-y-4">
						<div className="space-y-2">
							<Label
								htmlFor="group-edit-name"
								className="font-mono text-[10px] uppercase tracking-[0.2em]"
							>
								Name
							</Label>
							<Input
								id="group-edit-name"
								value={editForm.name}
								onChange={(event) =>
									setEditForm((prev) => ({ ...prev, name: event.target.value }))
								}
								placeholder="Gruppenname"
								className="border-[#222] bg-[#111] font-mono"
								maxLength={80}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="group-edit-color"
								className="font-mono text-[10px] uppercase tracking-[0.2em]"
							>
								Farbe
							</Label>
							<Select
								value={editForm.color}
								onValueChange={(value) =>
									setEditForm((prev) => ({
										...prev,
										color: value as GroupColor,
									}))
								}
							>
								<SelectTrigger
									id="group-edit-color"
									className="border-[#222] bg-[#111] font-mono"
								>
									<SelectValue>
										<span className="pointer-events-none flex items-center gap-2">
											<span
												className={`size-2.5 rounded-full ${colorDotClass(editForm.color)}`}
											/>
											<span>{colorLabel(editForm.color)}</span>
										</span>
									</SelectValue>
								</SelectTrigger>
								<SelectContent className="border-[#222] bg-[#111] text-[#e8e4de]">
									{groupColors.map((color) => (
										<SelectItem
											key={color.value}
											value={color.value}
											className="font-mono"
										>
											<div className="flex items-center gap-2">
												<span
													className={`size-2.5 rounded-full ${color.dotClass}`}
												/>
												<span>{color.label}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={closeEditDialog}
								className="border-[#333] bg-[#111] font-mono text-[10px] uppercase tracking-[0.1em]"
							>
								Abbrechen
							</Button>
							<Button
								type="submit"
								disabled={isUpdating}
								className="bg-[#ff3d00] font-mono text-[10px] text-black uppercase tracking-[0.1em] hover:bg-[#ff3d00]"
							>
								{isUpdating ? "Speichere..." : "Speichern"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={Boolean(deleteGroupId)}
				onOpenChange={(open) => {
					if (!open && !isDeleting) {
						setDeleteGroupId(null);
					}
				}}
			>
				<AlertDialogContent className="border-[#222] bg-[#0f0f0f] text-[#e8e4de]">
					<AlertDialogHeader>
						<AlertDialogTitle className="font-mono text-[#e8e4de] text-sm uppercase tracking-[0.15em]">
							Gruppe löschen
						</AlertDialogTitle>
						<AlertDialogDescription className="font-mono text-[#777] text-xs">
							{groupToDelete
								? `Möchten Sie "${groupToDelete.name}" wirklich löschen? Zugehörige Events werden ebenfalls gelöscht.`
								: "Diese Aktion kann nicht rückgängig gemacht werden."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							disabled={isDeleting}
							className="border-[#333] bg-[#111] font-mono text-[10px] uppercase tracking-[0.1em]"
						>
							Abbrechen
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteGroup}
							disabled={isDeleting}
							variant="destructive"
							className="font-mono text-[10px] uppercase tracking-[0.1em]"
						>
							{isDeleting ? "Lösche..." : "Löschen"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
