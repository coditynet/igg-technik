"use client";

import { RiCalendarLine, RiDeleteBinLine } from "@remixicon/react";
import { format, isBefore } from "date-fns";
import { de } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";

import type { CalendarEvent } from "@/components/event-calendar";
import { useCalendarContext } from "@/components/event-calendar/calendar-context";
import {
	DefaultEndHour,
	DefaultStartHour,
	EndHour,
	StartHour,
} from "@/components/event-calendar/constants";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface EventDialogProps {
	event: CalendarEvent | null;
	isOpen: boolean;
	onClose: () => void;
	onSave: (event: CalendarEvent) => void;
	onDelete: (eventId: string) => void;
	readOnly?: boolean;
}

export function EventDialog({
	event,
	isOpen,
	onClose,
	onSave,
	onDelete,
	readOnly = false,
}: EventDialogProps) {
	const { getAllGroups } = useCalendarContext();
	const allGroups = getAllGroups();

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [startDate, setStartDate] = useState<Date>(new Date());
	const [endDate, setEndDate] = useState<Date>(new Date());
	const [startTime, setStartTime] = useState(`${DefaultStartHour}:00`);
	const [endTime, setEndTime] = useState(`${DefaultEndHour}:00`);
	const [allDay, setAllDay] = useState(false);
	const [location, setLocation] = useState("");
	const [groupId, setGroupId] = useState<string>(allGroups[0]?.id || "");
	const [error, setError] = useState<string | null>(null);
	const [startDateOpen, setStartDateOpen] = useState(false);
	const [endDateOpen, setEndDateOpen] = useState(false);

	useEffect(() => {
		if (event) {
			setTitle(event.title || "");
			setDescription(event.description || "");

			const start = new Date(event.start);
			const end = new Date(event.end);

			setStartDate(start);
			setEndDate(end);
			setStartTime(formatTimeForInput(start));
			setEndTime(formatTimeForInput(end));
			setAllDay(event.allDay || false);
			setLocation(event.location || "");
			setGroupId(event.groupId || allGroups[0]?.id || "");
			setError(null);
		} else {
			resetForm();
		}
	}, [event]);

	const resetForm = () => {
		setTitle("");
		setDescription("");
		setStartDate(new Date());
		setEndDate(new Date());
		setStartTime(`${DefaultStartHour}:00`);
		setEndTime(`${DefaultEndHour}:00`);
		setAllDay(false);
		setLocation("");
		setGroupId(allGroups[0]?.id || "");
		setError(null);
	};

	const formatTimeForInput = (date: Date) => {
		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = Math.floor(date.getMinutes() / 15) * 15;
		return `${hours}:${minutes.toString().padStart(2, "0")}`;
	};

	// Memoize time options so they're only calculated once
	const timeOptions = useMemo(() => {
		const options = [];
		for (let hour = StartHour; hour <= EndHour; hour++) {
			for (let minute = 0; minute < 60; minute += 15) {
				const formattedHour = hour.toString().padStart(2, "0");
				const formattedMinute = minute.toString().padStart(2, "0");
				const value = `${formattedHour}:${formattedMinute}`;
				// Use 24-hour format for German locale
				const label = `${formattedHour}:${formattedMinute}`;
				options.push({ value, label });
			}
		}
		return options;
	}, []);

	const handleSave = () => {
		// Validate groupId
		if (!groupId) {
			setError("Bitte wählen Sie eine Gruppe für diesen Termin");
			return;
		}

		const start = new Date(startDate);
		const end = new Date(endDate);

		if (!allDay) {
			const [startHours = 0, startMinutes = 0] = startTime
				.split(":")
				.map(Number);
			const [endHours = 0, endMinutes = 0] = endTime.split(":").map(Number);

			if (
				startHours < StartHour ||
				startHours > EndHour ||
				endHours < StartHour ||
				endHours > EndHour
			) {
				setError(
					`Die gewählte Zeit muss zwischen ${StartHour}:00 und ${EndHour}:00 liegen`,
				);
				return;
			}

			start.setHours(startHours, startMinutes, 0);
			end.setHours(endHours, endMinutes, 0);
		} else {
			start.setHours(0, 0, 0, 0);
			end.setHours(23, 59, 59, 999);
		}

		// Validate that end date is not before start date
		if (isBefore(end, start)) {
			setError("Das Enddatum darf nicht vor dem Startdatum liegen");
			return;
		}

		// Use generic title if empty
		const eventTitle = title.trim() ? title : "(kein Titel)";

		onSave({
			id: event?.id || "",
			title: eventTitle,
			description,
			start,
			end,
			allDay,
			location,
			groupId,
		});
	};

	const handleDelete = () => {
		if (event?.id) {
			onDelete(event.id);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{readOnly
							? "Termindetails"
							: event?.id
								? "Termin bearbeiten"
								: "Termin erstellen"}
					</DialogTitle>
					<DialogDescription className="sr-only">
						{readOnly
							? "Termindetails anzeigen"
							: event?.id
								? "Bearbeiten Sie die Details dieses Termins"
								: "Fügen Sie einen neuen Termin zu Ihrem Kalender hinzu"}
					</DialogDescription>
				</DialogHeader>
				{error && (
					<div className="rounded-md bg-destructive/15 px-3 py-2 text-destructive text-sm">
						{error}
					</div>
				)}
				<div className="grid gap-4 py-4">
					<div className="*:not-first:mt-1.5">
						<Label htmlFor="title">Titel</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							disabled={readOnly}
						/>
					</div>

					<div className="*:not-first:mt-1.5">
						<Label htmlFor="description">Beschreibung</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							disabled={readOnly}
						/>
					</div>

					<div className="flex gap-4">
						<div className="flex-1 *:not-first:mt-1.5">
							<Label htmlFor="start-date">Startdatum</Label>
							<Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
								<PopoverTrigger asChild>
									<Button
										id="start-date"
										variant={"outline"}
										className={cn(
											"group w-full justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background focus-visible:outline-[3px]",
											!startDate && "text-muted-foreground",
										)}
										disabled={readOnly}
									>
										<span
											className={cn(
												"truncate",
												!startDate && "text-muted-foreground",
											)}
										>
											{startDate
												? format(startDate, "PPP", { locale: de })
												: "Datum wählen"}
										</span>
										<RiCalendarLine
											size={16}
											className="shrink-0 text-muted-foreground/80"
											aria-hidden="true"
										/>
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-2" align="start">
									<Calendar
										mode="single"
										selected={startDate}
										defaultMonth={startDate}
										onSelect={(date) => {
											if (date) {
												setStartDate(date);
												// If end date is before the new start date, update it to match the start date
												if (isBefore(endDate, date)) {
													setEndDate(date);
												}
												setError(null);
												setStartDateOpen(false);
											}
										}}
									/>
								</PopoverContent>
							</Popover>
						</div>

						{!allDay && (
							<div className="min-w-28 *:not-first:mt-1.5">
								<Label htmlFor="start-time">Startzeit</Label>
								<Select
									value={startTime}
									onValueChange={setStartTime}
									disabled={readOnly}
								>
									<SelectTrigger id="start-time">
										<SelectValue placeholder="Zeit wählen" />
									</SelectTrigger>
									<SelectContent>
										{timeOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>

					<div className="flex gap-4">
						<div className="flex-1 *:not-first:mt-1.5">
							<Label htmlFor="end-date">Enddatum</Label>
							<Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
								<PopoverTrigger asChild>
									<Button
										id="end-date"
										variant={"outline"}
										className={cn(
											"group w-full justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background focus-visible:outline-[3px]",
											!endDate && "text-muted-foreground",
										)}
										disabled={readOnly}
									>
										<span
											className={cn(
												"truncate",
												!endDate && "text-muted-foreground",
											)}
										>
											{endDate
												? format(endDate, "PPP", { locale: de })
												: "Datum wählen"}
										</span>
										<RiCalendarLine
											size={16}
											className="shrink-0 text-muted-foreground/80"
											aria-hidden="true"
										/>
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-2" align="start">
									<Calendar
										mode="single"
										selected={endDate}
										defaultMonth={endDate}
										onSelect={(date) => {
											if (date) {
												setEndDate(date);
												setError(null);
												setEndDateOpen(false);
											}
										}}
									/>
								</PopoverContent>
							</Popover>
						</div>

						{!allDay && (
							<div className="min-w-28 *:not-first:mt-1.5">
								<Label htmlFor="end-time">Endzeit</Label>
								<Select
									value={endTime}
									onValueChange={setEndTime}
									disabled={readOnly}
								>
									<SelectTrigger id="end-time">
										<SelectValue placeholder="Zeit wählen" />
									</SelectTrigger>
									<SelectContent>
										{timeOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2">
						<Checkbox
							id="all-day"
							checked={allDay}
							onCheckedChange={(checked) => setAllDay(checked === true)}
							disabled={readOnly}
						/>
						<Label htmlFor="all-day">Ganztägig</Label>
					</div>

					<div className="*:not-first:mt-1.5">
						<Label htmlFor="location">Ort</Label>
						<Input
							id="location"
							value={location}
							onChange={(e) => setLocation(e.target.value)}
							disabled={readOnly}
						/>
					</div>
					<div className="*:not-first:mt-1.5">
						<Label htmlFor="group">Gruppe</Label>
						<Select
							value={groupId}
							onValueChange={setGroupId}
							disabled={readOnly}
						>
							<SelectTrigger id="group">
								<SelectValue placeholder="Gruppe wählen" />
							</SelectTrigger>
							<SelectContent>
								{allGroups.map((group) => (
									<SelectItem key={group.id} value={group.id}>
										<div className="flex items-center gap-2">
											<span
												className="size-2 rounded-full"
												style={{
													backgroundColor: `var(--color-${group.color}-400)`,
												}}
											/>
											{group.name}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter className="flex-row sm:justify-between">
					{!readOnly && event?.id && (
						<Button
							variant="outline"
							className="text-destructive hover:text-destructive"
							size="icon"
							onClick={handleDelete}
							aria-label="Delete event"
						>
							<RiDeleteBinLine size={16} aria-hidden="true" />
						</Button>
					)}
					<div className="flex flex-1 justify-end gap-2">
						<Button variant="outline" onClick={onClose}>
							{readOnly ? "Schließen" : "Abbrechen"}
						</Button>
						{!readOnly && <Button onClick={handleSave}>Speichern</Button>}
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
