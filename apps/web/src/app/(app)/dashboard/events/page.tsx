"use client";

import { api } from "@igg/backend/convex/_generated/api";
import type { Id } from "@igg/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { goeyToast } from "goey-toast";
import { type FormEvent, useEffect, useMemo, useState } from "react";
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
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";

function toDateTimeLocalValue(date: Date) {
	const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
	return localDate.toISOString().slice(0, 16);
}

function getInitialFormState(selectedGroup?: string) {
	const start = new Date();
	const end = new Date(start.getTime() + 60 * 60 * 1000);

	return {
		title: "",
		description: "",
		start: toDateTimeLocalValue(start),
		end: toDateTimeLocalValue(end),
		allDay: false,
		groupId: selectedGroup && selectedGroup !== "all" ? selectedGroup : "",
		label: "",
		location: "",
		notes: "",
		teacher: "",
	};
}

export default function EventsPage() {
	const [search, setSearch] = useState("");
	const [selectedGroup, setSelectedGroup] = useState<string>("all");
	const [timeFilter, setTimeFilter] = useState<"upcoming" | "past" | "all">(
		"upcoming",
	);
	const [page, setPage] = useState(0);
	const [pageSize] = useState(50);
	const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
	const [isCreatingEvent, setIsCreatingEvent] = useState(false);
	const [form, setForm] = useState(() => getInitialFormState());

	const groups = useQuery(api.groups.list);
	const createEvent = useMutation(api.events.create);

	const todayStart = useMemo(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return today.getTime();
	}, []);

	const queryArgs = useMemo(
		() => ({
			query: search || undefined,
			groupId:
				selectedGroup !== "all" ? (selectedGroup as Id<"groups">) : undefined,
			start: timeFilter === "upcoming" ? todayStart : undefined,
			end: timeFilter === "past" ? todayStart : undefined,
			page,
			pageSize,
		}),
		[search, selectedGroup, timeFilter, todayStart, page, pageSize],
	);

	const eventsResult = useQuery(api.events.search, queryArgs);

	useEffect(() => {
		setPage(0);
	}, [search, selectedGroup, timeFilter]);

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	const resetForm = () => {
		setForm(getInitialFormState(selectedGroup));
	};

	const handleCreateEvent = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!form.groupId) {
			goeyToast.error("Bitte wählen Sie eine Gruppe aus.");
			return;
		}

		if (!form.title.trim()) {
			goeyToast.error("Bitte geben Sie einen Titel ein.");
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

		setIsCreatingEvent(true);
		try {
			await createEvent({
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

			goeyToast.success("Veranstaltung erstellt");
			setIsCreateSheetOpen(false);
			resetForm();
		} catch (_error) {
			goeyToast.error("Veranstaltung konnte nicht erstellt werden");
		} finally {
			setIsCreatingEvent(false);
		}
	};

	return (
		<div className="max-w-6xl space-y-4">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Veranstaltungen</h1>
					<p className="text-muted-foreground">
						Verwalten und anzeigen Sie Veranstaltungen.
					</p>
				</div>
				<Sheet
					open={isCreateSheetOpen}
					onOpenChange={(open) => {
						setIsCreateSheetOpen(open);
						if (open) {
							resetForm();
						}
					}}
				>
					<SheetTrigger asChild>
						<Button>Neue Veranstaltung</Button>
					</SheetTrigger>
					<SheetContent side="right" className="w-full p-0 sm:max-w-xl">
						<SheetHeader>
							<SheetTitle>Veranstaltung erstellen</SheetTitle>
							<SheetDescription>
								Füllen Sie alle notwendigen Felder aus, um eine neue
								Veranstaltung zu erstellen.
							</SheetDescription>
						</SheetHeader>

						<form
							className="flex h-full min-h-0 flex-col"
							onSubmit={handleCreateEvent}
						>
							<div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-4">
								<div className="space-y-2">
									<Label htmlFor="create-event-title">Titel</Label>
									<Input
										id="create-event-title"
										value={form.title}
										onChange={(e) =>
											setForm((prev) => ({ ...prev, title: e.target.value }))
										}
										placeholder="Titel der Veranstaltung"
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="create-event-group">Gruppe</Label>
									<Select
										value={form.groupId}
										onValueChange={(value) =>
											setForm((prev) => ({ ...prev, groupId: value }))
										}
									>
										<SelectTrigger id="create-event-group">
											<SelectValue placeholder="Gruppe auswählen" />
										</SelectTrigger>
										<SelectContent>
											{groups?.map((group) => (
												<SelectItem key={group._id} value={group._id}>
													{group.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="create-event-start">Start</Label>
										<Input
											id="create-event-start"
											type="datetime-local"
											value={form.start}
											onChange={(e) =>
												setForm((prev) => ({ ...prev, start: e.target.value }))
											}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="create-event-end">Ende</Label>
										<Input
											id="create-event-end"
											type="datetime-local"
											value={form.end}
											onChange={(e) =>
												setForm((prev) => ({ ...prev, end: e.target.value }))
											}
											required
										/>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<Checkbox
										id="create-event-all-day"
										checked={form.allDay}
										onCheckedChange={(checked) =>
											setForm((prev) => ({ ...prev, allDay: checked === true }))
										}
									/>
									<Label htmlFor="create-event-all-day">Ganztägig</Label>
								</div>

								<div className="space-y-2">
									<Label htmlFor="create-event-location">Ort</Label>
									<Input
										id="create-event-location"
										value={form.location}
										onChange={(e) =>
											setForm((prev) => ({ ...prev, location: e.target.value }))
										}
										placeholder="z. B. Raum 3.12"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="create-event-teacher">Lehrer</Label>
									<Input
										id="create-event-teacher"
										value={form.teacher}
										onChange={(e) =>
											setForm((prev) => ({ ...prev, teacher: e.target.value }))
										}
										placeholder="Name des Lehrers"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="create-event-label">Label</Label>
									<Input
										id="create-event-label"
										value={form.label}
										onChange={(e) =>
											setForm((prev) => ({ ...prev, label: e.target.value }))
										}
										placeholder="z. B. Prüfung"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="create-event-description">Beschreibung</Label>
									<Textarea
										id="create-event-description"
										value={form.description}
										onChange={(e) =>
											setForm((prev) => ({
												...prev,
												description: e.target.value,
											}))
										}
										placeholder="Beschreibung der Veranstaltung"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="create-event-notes">Notizen</Label>
									<Textarea
										id="create-event-notes"
										value={form.notes}
										onChange={(e) =>
											setForm((prev) => ({ ...prev, notes: e.target.value }))
										}
										placeholder="Interne Notizen"
									/>
								</div>
							</div>

							<SheetFooter className="border-t pt-4">
								<SheetClose asChild>
									<Button
										type="button"
										variant="outline"
										disabled={isCreatingEvent}
									>
										Abbrechen
									</Button>
								</SheetClose>
								<Button type="submit" disabled={isCreatingEvent}>
									{isCreatingEvent
										? "Wird erstellt..."
										: "Veranstaltung erstellen"}
								</Button>
							</SheetFooter>
						</form>
					</SheetContent>
				</Sheet>
			</div>

			<div className="flex flex-wrap items-center gap-4">
				<Input
					placeholder="Veranstaltungen suchen..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="max-w-sm"
				/>

				<Select
					value={timeFilter}
					onValueChange={(value: "upcoming" | "past" | "all") =>
						setTimeFilter(value)
					}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Nach Zeit filtern" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="upcoming">Kommende</SelectItem>
						<SelectItem value="past">Vergangene</SelectItem>
						<SelectItem value="all">Alle</SelectItem>
					</SelectContent>
				</Select>

				<Select value={selectedGroup} onValueChange={setSelectedGroup}>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="Nach Gruppe filtern" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Alle Gruppen</SelectItem>
						{groups?.map((group) => (
							<SelectItem key={group._id} value={group._id}>
								{group.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{eventsResult ? (
				<DataTable
					columns={columns}
					data={eventsResult.events}
					totalCount={eventsResult.totalCount}
					page={page}
					pageSize={pageSize}
					hasMore={eventsResult.hasMore}
					onPageChange={handlePageChange}
				/>
			) : (
				<div className="space-y-2">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-20 w-full" />
				</div>
			)}
		</div>
	);
}
