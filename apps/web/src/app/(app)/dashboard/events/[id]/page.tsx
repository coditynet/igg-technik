"use client";

import { api } from "@igg/backend/convex/_generated/api";
import type { Id } from "@igg/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { goeyToast } from "goey-toast";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";

function toDateTimeLocalValue(date: Date) {
	const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
	return localDate.toISOString().slice(0, 16);
}

type EventFormState = {
	title: string;
	description: string;
	start: string;
	end: string;
	allDay: boolean;
	groupId: string;
	label: string;
	location: string;
	notes: string;
	teacher: string;
};

function formFromEvent(event: {
	title: string;
	description?: string;
	start: string;
	end: string;
	allDay?: boolean;
	groupId: Id<"groups">;
	label?: string;
	location?: string;
	notes?: string;
	teacher?: string;
}): EventFormState {
	return {
		title: event.title ?? "",
		description: event.description ?? "",
		start: toDateTimeLocalValue(new Date(event.start)),
		end: toDateTimeLocalValue(new Date(event.end)),
		allDay: event.allDay === true,
		groupId: event.groupId ?? "",
		label: event.label ?? "",
		location: event.location ?? "",
		notes: event.notes ?? "",
		teacher: event.teacher ?? "",
	};
}

export default function EventDetailPage() {
	const params = useParams();
	const router = useRouter();
	const eventId = params.id as Id<"events">;

	const event = useQuery(api.events.getWithGroup, { id: eventId });
	const groups = useQuery(api.groups.list);
	const updateEvent = useMutation(api.events.update);
	const deleteEvent = useMutation(api.events.remove);

	const [form, setForm] = useState<EventFormState | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const initialForm = useMemo(() => {
		if (!event) {
			return null;
		}
		return formFromEvent(event);
	}, [event]);

	useEffect(() => {
		if (initialForm) {
			setForm(initialForm);
		}
	}, [initialForm]);

	const hasChanges = useMemo(() => {
		if (!form || !initialForm) {
			return false;
		}
		return JSON.stringify(form) !== JSON.stringify(initialForm);
	}, [form, initialForm]);

	if (event === undefined) {
		return (
			<div className="max-w-5xl space-y-6">
				<Skeleton className="h-8 w-32 bg-[#111]" />
				<Skeleton className="h-10 w-72 bg-[#111]" />
				<Skeleton className="h-[680px] w-full bg-[#111]" />
			</div>
		);
	}

	if (event == null) {
		return (
			<div className="max-w-5xl space-y-6">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.push("/dashboard/events")}
					className="font-mono text-[10px] uppercase tracking-[0.1em]"
				>
					<ArrowLeft className="mr-2 size-4" />
					Zurück
				</Button>
				<div className="flex h-[340px] items-center justify-center border border-[#222] bg-[#0f0f0f]">
					<div className="text-center font-mono text-[#888] text-xs">
						Veranstaltung nicht gefunden
					</div>
				</div>
			</div>
		);
	}

	const handleReset = () => {
		if (initialForm) {
			setForm(initialForm);
		}
	};

	const handleSave = async (submitEvent: FormEvent<HTMLFormElement>) => {
		submitEvent.preventDefault();
		if (!form) {
			return;
		}
		if (!form.title.trim()) {
			goeyToast.error("Bitte geben Sie einen Titel ein.");
			return;
		}
		if (!form.groupId) {
			goeyToast.error("Bitte wählen Sie eine Gruppe aus.");
			return;
		}

		const startDate = new Date(form.start);
		const endDate = new Date(form.end);
		if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
			goeyToast.error("Bitte geben Sie gültige Start- und Endzeiten ein.");
			return;
		}
		if (endDate < startDate) {
			goeyToast.error("Die Endzeit darf nicht vor der Startzeit liegen.");
			return;
		}

		setIsSaving(true);
		try {
			await updateEvent({
				id: eventId,
				title: form.title.trim(),
				description: form.description.trim() || undefined,
				start: startDate.toISOString(),
				end: endDate.toISOString(),
				allDay: form.allDay,
				groupId: form.groupId as Id<"groups">,
				label: form.label.trim() || undefined,
				location: form.location.trim() || undefined,
				notes: form.notes.trim() || undefined,
				teacher: form.teacher.trim() || undefined,
			});

			goeyToast.success("Veranstaltung aktualisiert");
		} catch (_error) {
			goeyToast.error("Veranstaltung konnte nicht aktualisiert werden");
		} finally {
			setIsSaving(false);
		}
	};

	const handleEventDelete = async () => {
		setIsDeleting(true);
		try {
			await deleteEvent({ id: eventId });
			goeyToast.success("Veranstaltung gelöscht");
			router.push("/dashboard/events");
		} catch (_error) {
			goeyToast.error("Veranstaltung konnte nicht gelöscht werden");
		} finally {
			setIsDeleting(false);
		}
	};

	if (!form) {
		return null;
	}

	return (
		<div className="max-w-5xl space-y-6">
			<div className="flex items-center justify-between gap-4">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.push("/dashboard/events")}
					className="font-mono text-[10px] uppercase tracking-[0.1em]"
				>
					<ArrowLeft className="mr-2 size-4" />
					Zurück
				</Button>
				<div className="font-mono text-[#777] text-[10px] uppercase tracking-[0.2em]">
					Event-ID: {event._id}
				</div>
			</div>

			<div>
				<div className="mb-2 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
					Verwaltung
				</div>
				<h1 className="font-black text-3xl uppercase tracking-tight">
					Veranstaltung bearbeiten
				</h1>
				<p className="mt-1 font-mono text-[#777] text-xs">
					Aktualisieren Sie alle Details dieser Veranstaltung.
				</p>
			</div>

			<form
				onSubmit={handleSave}
				className="border border-[#222] bg-[#0f0f0f] p-5 md:p-6"
			>
				<div className="space-y-5">
					<div className="space-y-2">
						<Label
							htmlFor="event-title"
							className="font-mono text-[10px] uppercase tracking-[0.2em]"
						>
							Titel
						</Label>
						<Input
							id="event-title"
							value={form.title}
							onChange={(event) =>
								setForm((prev) =>
									prev ? { ...prev, title: event.target.value } : prev,
								)
							}
							placeholder="Titel der Veranstaltung"
							className="border-[#222] bg-[#111] font-mono"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="event-description"
							className="font-mono text-[10px] uppercase tracking-[0.2em]"
						>
							Beschreibung
						</Label>
						<Textarea
							id="event-description"
							value={form.description}
							onChange={(event) =>
								setForm((prev) =>
									prev ? { ...prev, description: event.target.value } : prev,
								)
							}
							placeholder="Beschreibung der Veranstaltung"
							className="min-h-[96px] border-[#222] bg-[#111] font-mono"
						/>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label
								htmlFor="event-start"
								className="font-mono text-[10px] uppercase tracking-[0.2em]"
							>
								Start
							</Label>
							<Input
								id="event-start"
								type="datetime-local"
								value={form.start}
								onChange={(event) =>
									setForm((prev) =>
										prev ? { ...prev, start: event.target.value } : prev,
									)
								}
								className="border-[#222] bg-[#111] font-mono"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="event-end"
								className="font-mono text-[10px] uppercase tracking-[0.2em]"
							>
								Ende
							</Label>
							<Input
								id="event-end"
								type="datetime-local"
								value={form.end}
								onChange={(event) =>
									setForm((prev) =>
										prev ? { ...prev, end: event.target.value } : prev,
									)
								}
								className="border-[#222] bg-[#111] font-mono"
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="event-group"
							className="font-mono text-[10px] uppercase tracking-[0.2em]"
						>
							Gruppe
						</Label>
						<Select
							value={form.groupId}
							onValueChange={(value) =>
								setForm((prev) => (prev ? { ...prev, groupId: value } : prev))
							}
						>
							<SelectTrigger
								id="event-group"
								className="border-[#222] bg-[#111] font-mono"
							>
								<SelectValue placeholder="Gruppe auswählen" />
							</SelectTrigger>
							<SelectContent className="border-[#222] bg-[#111] text-[#e8e4de]">
								{groups?.map((group) => (
									<SelectItem
										key={group._id}
										value={group._id}
										className="font-mono"
									>
										<div className="flex items-center gap-2">
											<span
												className={`size-2.5 rounded-full ${
													group.color === "blue"
														? "bg-blue-500"
														: group.color === "orange"
															? "bg-orange-500"
															: group.color === "violet"
																? "bg-violet-500"
																: group.color === "rose"
																	? "bg-rose-500"
																	: "bg-emerald-500"
												}`}
											/>
											<span>{group.name}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label
								htmlFor="event-location"
								className="font-mono text-[10px] uppercase tracking-[0.2em]"
							>
								Ort
							</Label>
							<Input
								id="event-location"
								value={form.location}
								onChange={(event) =>
									setForm((prev) =>
										prev ? { ...prev, location: event.target.value } : prev,
									)
								}
								placeholder="Raum / Ort"
								className="border-[#222] bg-[#111] font-mono"
							/>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="event-teacher"
								className="font-mono text-[10px] uppercase tracking-[0.2em]"
							>
								Lehrkraft
							</Label>
							<Input
								id="event-teacher"
								value={form.teacher}
								onChange={(event) =>
									setForm((prev) =>
										prev ? { ...prev, teacher: event.target.value } : prev,
									)
								}
								placeholder="Name der Lehrkraft"
								className="border-[#222] bg-[#111] font-mono"
							/>
						</div>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label
								htmlFor="event-label"
								className="font-mono text-[10px] uppercase tracking-[0.2em]"
							>
								Label
							</Label>
							<Input
								id="event-label"
								value={form.label}
								onChange={(event) =>
									setForm((prev) =>
										prev ? { ...prev, label: event.target.value } : prev,
									)
								}
								placeholder="z. B. intern"
								className="border-[#222] bg-[#111] font-mono"
							/>
						</div>
						<div className="flex items-end">
							<div className="flex items-center gap-2 border border-[#222] bg-[#111] px-3 py-2.5">
								<Checkbox
									id="event-all-day"
									checked={form.allDay}
									onCheckedChange={(checked) =>
										setForm((prev) =>
											prev ? { ...prev, allDay: checked === true } : prev,
										)
									}
									className="data-[state=checked]:border-[#ff3d00] data-[state=checked]:bg-[#ff3d00]"
								/>
								<Label
									htmlFor="event-all-day"
									className="font-mono text-[10px] uppercase tracking-[0.15em]"
								>
									Ganztägig
								</Label>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="event-notes"
							className="font-mono text-[10px] uppercase tracking-[0.2em]"
						>
							Notizen
						</Label>
						<Textarea
							id="event-notes"
							value={form.notes}
							onChange={(event) =>
								setForm((prev) =>
									prev ? { ...prev, notes: event.target.value } : prev,
								)
							}
							placeholder="Interne Notizen hinzufügen..."
							className="min-h-[150px] border-[#222] bg-[#111] font-mono"
						/>
					</div>

					<div className="flex flex-wrap items-center justify-between gap-3 border-[#222] border-t pt-4">
						<div className="font-mono text-[#777] text-[10px] uppercase tracking-[0.2em]">
							{hasChanges ? "Ungespeicherte Änderungen" : "Keine Änderungen"}
						</div>
						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="outline"
								disabled={!hasChanges || isSaving}
								onClick={handleReset}
								className="border-[#333] bg-[#111] font-mono text-[10px] uppercase tracking-[0.1em]"
							>
								Zurücksetzen
							</Button>
							<Button
								type="submit"
								disabled={!hasChanges || isSaving}
								className="bg-[#ff3d00] font-mono text-[10px] text-black uppercase tracking-[0.1em] hover:bg-[#ff3d00]"
							>
								<Save className="size-3.5" />
								{isSaving ? "Speichere..." : "Änderungen speichern"}
							</Button>
						</div>
					</div>
				</div>
			</form>

			<div className="border border-[#331614] bg-[#130c0b] p-4">
				<div className="flex items-center justify-between gap-4">
					<div>
						<div className="mb-1 font-mono text-[10px] text-red-300 uppercase tracking-[0.2em]">
							Gefahrenzone
						</div>
						<p className="font-mono text-[#b89c97] text-xs">
							Diese Veranstaltung wird dauerhaft gelöscht.
						</p>
					</div>
					<Button
						type="button"
						variant="destructive"
						onClick={() => setIsDeleteDialogOpen(true)}
						className="font-mono text-[10px] uppercase tracking-[0.1em]"
					>
						<Trash2 className="size-3.5" />
						Veranstaltung löschen
					</Button>
				</div>
			</div>

			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={(open) => {
					if (!isDeleting) {
						setIsDeleteDialogOpen(open);
					}
				}}
			>
				<AlertDialogContent className="border-[#222] bg-[#0f0f0f] text-[#e8e4de]">
					<AlertDialogHeader>
						<AlertDialogTitle className="font-mono text-[#e8e4de] text-sm uppercase tracking-[0.15em]">
							Veranstaltung löschen
						</AlertDialogTitle>
						<AlertDialogDescription className="font-mono text-[#777] text-xs">
							Möchten Sie "{event.title}" wirklich löschen? Diese Aktion kann
							nicht rückgängig gemacht werden.
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
							disabled={isDeleting}
							onClick={handleEventDelete}
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
