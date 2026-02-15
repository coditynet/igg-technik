"use client";

import {
	addDays,
	addMonths,
	addWeeks,
	endOfWeek,
	format,
	isSameMonth,
	startOfWeek,
	subMonths,
	subWeeks,
} from "date-fns";
import { de } from "date-fns/locale";
import { goeyToast as toast } from "goey-toast";
import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	AgendaDaysToShow,
	AgendaView,
	addHoursToDate,
	CalendarDndProvider,
	type CalendarEvent,
	CalendarSubscribeButton,
	type CalendarView,
	DayView,
	EventDialog,
	EventGap,
	EventHeight,
	MonthView,
	WeekCellsHeight,
	WeekView,
} from "@/components/event-calendar";
import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useCalendarContext } from "./calendar-context";

export interface EventCalendarProps {
	events?: CalendarEvent[];
	onEventAdd?: (event: CalendarEvent) => void;
	onEventUpdate?: (event: CalendarEvent) => void;
	onEventDelete?: (eventId: string) => void;
	className?: string;
	initialView?: CalendarView;
	readOnly?: boolean;
}

export function EventCalendar({
	events = [],
	onEventAdd,
	onEventUpdate,
	onEventDelete,
	className,
	initialView = "month",
	readOnly = false,
}: EventCalendarProps) {
	// Use the shared calendar context instead of local state
	const { currentDate, setCurrentDate } = useCalendarContext();
	const [view, setView] = useState<CalendarView>(initialView);
	const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
		null,
	);
	const { open } = useSidebar();

	// Add keyboard shortcuts for view switching
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Skip if user is typing in an input, textarea or contentEditable element
			// or if the event dialog is open
			if (
				isEventDialogOpen ||
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement ||
				(e.target instanceof HTMLElement && e.target.isContentEditable)
			) {
				return;
			}

			switch (e.key.toLowerCase()) {
				case "m":
					setView("month");
					break;
				case "w":
					setView("week");
					break;
				case "d":
					setView("day");
					break;
				case "a":
					setView("agenda");
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isEventDialogOpen]);

	const handlePrevious = () => {
		if (view === "month") {
			setCurrentDate(subMonths(currentDate, 1));
		} else if (view === "week") {
			setCurrentDate(subWeeks(currentDate, 1));
		} else if (view === "day") {
			setCurrentDate(addDays(currentDate, -1));
		} else if (view === "agenda") {
			// For agenda view, go back 30 days (a full month)
			setCurrentDate(addDays(currentDate, -AgendaDaysToShow));
		}
	};

	const handleNext = () => {
		if (view === "month") {
			setCurrentDate(addMonths(currentDate, 1));
		} else if (view === "week") {
			setCurrentDate(addWeeks(currentDate, 1));
		} else if (view === "day") {
			setCurrentDate(addDays(currentDate, 1));
		} else if (view === "agenda") {
			// For agenda view, go forward 30 days (a full month)
			setCurrentDate(addDays(currentDate, AgendaDaysToShow));
		}
	};

	const handleToday = () => {
		setCurrentDate(new Date());
	};

	const handleEventSelect = (event: CalendarEvent) => {
		setSelectedEvent(event);
		setIsEventDialogOpen(true);
	};

	const handleEventCreate = (startTime: Date) => {
		if (readOnly) return;

		// Snap to 15-minute intervals
		const minutes = startTime.getMinutes();
		const remainder = minutes % 15;
		if (remainder !== 0) {
			if (remainder < 7.5) {
				// Round down to nearest 15 min
				startTime.setMinutes(minutes - remainder);
			} else {
				// Round up to nearest 15 min
				startTime.setMinutes(minutes + (15 - remainder));
			}
			startTime.setSeconds(0);
			startTime.setMilliseconds(0);
		}

		const newEvent: CalendarEvent = {
			id: "",
			title: "",
			start: startTime,
			end: addHoursToDate(startTime, 1),
			allDay: false,
			groupId: "",
		};
		setSelectedEvent(newEvent);
		setIsEventDialogOpen(true);
	};

	const handleEventSave = (event: CalendarEvent) => {
		if (event.id) {
			onEventUpdate?.(event);
			// Show toast notification when an event is updated
			toast(`Termin "${event.title}" aktualisiert`, {
				description: format(new Date(event.start), "d. MMM yyyy", {
					locale: de,
				}),
			});
		} else {
			onEventAdd?.({
				...event,
				id: Math.random().toString(36).substring(2, 11),
			});
			// Show toast notification when an event is added
			toast(`Termin "${event.title}" hinzugefügt`, {
				description: format(new Date(event.start), "d. MMM yyyy", {
					locale: de,
				}),
			});
		}
		setIsEventDialogOpen(false);
		setSelectedEvent(null);
	};

	const handleEventDelete = (eventId: string) => {
		const deletedEvent = events.find((e) => e.id === eventId);
		onEventDelete?.(eventId);
		setIsEventDialogOpen(false);
		setSelectedEvent(null);

		// Show toast notification when an event is deleted
		if (deletedEvent) {
			toast(`Termin "${deletedEvent.title}" gelöscht`, {
				description: format(new Date(deletedEvent.start), "d. MMM yyyy", {
					locale: de,
				}),
			});
		}
	};

	const handleEventUpdate = (updatedEvent: CalendarEvent) => {
		if (readOnly) return; // Disable event updates in read-only mode

		onEventUpdate?.(updatedEvent);

		// Show toast notification when an event is updated via drag and drop
		toast(`Termin "${updatedEvent.title}" verschoben`, {
			description: format(new Date(updatedEvent.start), "d. MMM yyyy", {
				locale: de,
			}),
		});
	};

	const getViewLabel = (view: CalendarView) => {
		switch (view) {
			case "month":
				return "Monat";
			case "week":
				return "Woche";
			case "day":
				return "Tag";
			case "agenda":
				return "Agenda";
			default:
				return view;
		}
	};

	const viewTitle = useMemo(() => {
		if (view === "month") {
			return format(currentDate, "MMMM yyyy", { locale: de });
		}
		if (view === "week") {
			const start = startOfWeek(currentDate, { weekStartsOn: 0 });
			const end = endOfWeek(currentDate, { weekStartsOn: 0 });
			if (isSameMonth(start, end)) {
				return format(start, "MMMM yyyy", { locale: de });
			}
			return `${format(start, "MMM", { locale: de })} - ${format(end, "MMM yyyy", { locale: de })}`;
		}
		if (view === "day") {
			return (
				<>
					<span className="min-sm:hidden" aria-hidden="true">
						{format(currentDate, "MMM d, yyyy", { locale: de })}
					</span>
					<span className="max-sm:hidden min-md:hidden" aria-hidden="true">
						{format(currentDate, "MMMM d, yyyy", { locale: de })}
					</span>
					<span className="max-md:hidden">
						{format(currentDate, "EEE MMMM d, yyyy", { locale: de })}
					</span>
				</>
			);
		}
		if (view === "agenda") {
			// Show the month range for agenda view
			const start = currentDate;
			const end = addDays(currentDate, AgendaDaysToShow - 1);

			if (isSameMonth(start, end)) {
				return format(start, "MMMM yyyy", { locale: de });
			}
			return `${format(start, "MMM", { locale: de })} - ${format(end, "MMM yyyy", { locale: de })}`;
		}
		return format(currentDate, "MMMM yyyy", { locale: de });
	}, [currentDate, view]);

	return (
		<div
			className="flex flex-col has-data-[slot=month-view]:flex-1"
			style={
				{
					"--event-height": `${EventHeight}px`,
					"--event-gap": `${EventGap}px`,
					"--week-cells-height": `${WeekCellsHeight}px`,
				} as React.CSSProperties
			}
		>
			<CalendarDndProvider onEventUpdate={handleEventUpdate}>
				<div
					className={cn(
						"sticky top-0 z-30 flex flex-col justify-between gap-2 bg-background px-4 pt-4 pb-4 sm:flex-row sm:items-center",
						className,
					)}
				>
					<div className="flex justify-between gap-1.5 max-sm:items-center sm:flex-col">
						<div className="flex items-center gap-1.5">
							<SidebarTrigger
								data-state={open ? "invisible" : "visible"}
								className="peer size-7 text-muted-foreground/80 transition-opacity duration-200 ease-in-out hover:bg-transparent! hover:text-foreground/80 sm:-ms-1.5 lg:data-[state=invisible]:pointer-events-none lg:data-[state=invisible]:opacity-0"
								isOutsideSidebar
							/>
							<h2 className="font-semibold text-xl transition-transform duration-300 ease-in-out lg:peer-data-[state=invisible]:-translate-x-7.5">
								{viewTitle}
							</h2>
						</div>
					</div>
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center max-sm:order-1 sm:gap-2">
								<Button
									variant="ghost"
									size="icon"
									className="max-sm:size-8"
									onClick={handlePrevious}
									aria-label="Previous"
								>
									<ChevronLeftIcon size={16} aria-hidden="true" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="max-sm:size-8"
									onClick={handleNext}
									aria-label="Next"
								>
									<ChevronRightIcon size={16} aria-hidden="true" />
								</Button>
							</div>
							<Button
								className="max-sm:h-8 max-sm:px-2.5!"
								onClick={handleToday}
							>
								Heute
							</Button>
						</div>
						<div className="flex items-center justify-between gap-2">
							{!readOnly && (
								<Button
									variant="outline"
									className="max-sm:h-8 max-sm:px-2.5!"
									onClick={() => {
										setSelectedEvent(null); // Ensure we're creating a new event
										setIsEventDialogOpen(true);
									}}
								>
									Neuer Termin
								</Button>
							)}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="gap-1.5 max-sm:h-8 max-sm:gap-1 max-sm:px-2!"
									>
										<span className="capitalize">{getViewLabel(view)}</span>
										<ChevronDownIcon
											className="-me-1 opacity-60"
											size={16}
											aria-hidden="true"
										/>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="min-w-32">
									<DropdownMenuItem onClick={() => setView("month")}>
										Monat <DropdownMenuShortcut>M</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setView("week")}>
										Woche <DropdownMenuShortcut>W</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setView("day")}>
										Tag <DropdownMenuShortcut>D</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setView("agenda")}>
										Agenda <DropdownMenuShortcut>A</DropdownMenuShortcut>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
							<CalendarSubscribeButton />
							<ThemeToggle />
						</div>
					</div>
				</div>

				<div className="flex flex-1 flex-col">
					{view === "month" && (
						<MonthView
							currentDate={currentDate}
							events={events}
							onEventSelect={handleEventSelect}
							onEventCreate={handleEventCreate}
						/>
					)}
					{view === "week" && (
						<WeekView
							currentDate={currentDate}
							events={events}
							onEventSelect={handleEventSelect}
							onEventCreate={handleEventCreate}
						/>
					)}
					{view === "day" && (
						<DayView
							currentDate={currentDate}
							events={events}
							onEventSelect={handleEventSelect}
							onEventCreate={handleEventCreate}
						/>
					)}
					{view === "agenda" && (
						<AgendaView
							currentDate={currentDate}
							events={events}
							onEventSelect={handleEventSelect}
						/>
					)}
				</div>

				<EventDialog
					event={selectedEvent}
					isOpen={isEventDialogOpen}
					onClose={() => {
						setIsEventDialogOpen(false);
						setSelectedEvent(null);
					}}
					onSave={handleEventSave}
					onDelete={handleEventDelete}
					readOnly={readOnly}
				/>
			</CalendarDndProvider>
		</div>
	);
}
