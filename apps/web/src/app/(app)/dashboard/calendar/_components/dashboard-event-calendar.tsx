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
import { goeyToast } from "goey-toast";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	AgendaDaysToShow,
	AgendaView,
	addHoursToDate,
	CalendarDndProvider,
	type CalendarEvent,
	type CalendarView,
	DayView,
	EventDialog,
	EventGap,
	EventHeight,
	MonthView,
	WeekCellsHeight,
	WeekView,
} from "@/components/event-calendar";
import { useCalendarContext } from "@/components/event-calendar/calendar-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardEventCalendarProps {
	events: CalendarEvent[];
	onEventAdd?: (event: CalendarEvent) => void;
	onEventUpdate?: (event: CalendarEvent) => void;
	onEventDelete?: (eventId: string) => void;
	className?: string;
	initialView?: CalendarView;
}

const views: CalendarView[] = ["month", "week", "day", "agenda"];

function viewLabel(view: CalendarView) {
	if (view === "month") return "Monat";
	if (view === "week") return "Woche";
	if (view === "day") return "Tag";
	return "Agenda";
}

export function DashboardEventCalendar({
	events,
	onEventAdd,
	onEventUpdate,
	onEventDelete,
	className,
	initialView = "week",
}: DashboardEventCalendarProps) {
	const { currentDate, setCurrentDate } = useCalendarContext();
	const [view, setView] = useState<CalendarView>(initialView);
	const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
		null,
	);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				isEventDialogOpen ||
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement ||
				(event.target instanceof HTMLElement && event.target.isContentEditable)
			) {
				return;
			}

			switch (event.key.toLowerCase()) {
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
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isEventDialogOpen]);

	const viewTitle = useMemo(() => {
		if (view === "month") {
			return format(currentDate, "MMMM yyyy", { locale: de });
		}
		if (view === "week") {
			const start = startOfWeek(currentDate, { weekStartsOn: 1 });
			const end = endOfWeek(currentDate, { weekStartsOn: 1 });
			if (isSameMonth(start, end)) {
				return format(start, "MMMM yyyy", { locale: de });
			}
			return `${format(start, "MMM", { locale: de })} - ${format(end, "MMM yyyy", { locale: de })}`;
		}
		if (view === "day") {
			return format(currentDate, "EEE, d. MMMM yyyy", { locale: de });
		}
		const end = addDays(currentDate, AgendaDaysToShow - 1);
		if (isSameMonth(currentDate, end)) {
			return format(currentDate, "MMMM yyyy", { locale: de });
		}
		return `${format(currentDate, "MMM", { locale: de })} - ${format(end, "MMM yyyy", { locale: de })}`;
	}, [currentDate, view]);

	const handlePrevious = () => {
		if (view === "month") {
			setCurrentDate(subMonths(currentDate, 1));
			return;
		}
		if (view === "week") {
			setCurrentDate(subWeeks(currentDate, 1));
			return;
		}
		if (view === "day") {
			setCurrentDate(addDays(currentDate, -1));
			return;
		}
		setCurrentDate(addDays(currentDate, -AgendaDaysToShow));
	};

	const handleNext = () => {
		if (view === "month") {
			setCurrentDate(addMonths(currentDate, 1));
			return;
		}
		if (view === "week") {
			setCurrentDate(addWeeks(currentDate, 1));
			return;
		}
		if (view === "day") {
			setCurrentDate(addDays(currentDate, 1));
			return;
		}
		setCurrentDate(addDays(currentDate, AgendaDaysToShow));
	};

	const handleToday = () => setCurrentDate(new Date());

	const handleEventSelect = (event: CalendarEvent) => {
		setSelectedEvent(event);
		setIsEventDialogOpen(true);
	};

	const handleEventCreate = (startTime: Date) => {
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

	const handleCreateNow = () => {
		handleEventCreate(new Date());
	};

	const handleEventSave = (event: CalendarEvent) => {
		if (event.id) {
			onEventUpdate?.(event);
			goeyToast.success(`Termin "${event.title}" aktualisiert`);
		} else {
			onEventAdd?.({
				...event,
				id: Math.random().toString(36).slice(2, 11),
			});
			goeyToast.success(`Termin "${event.title}" erstellt`);
		}
		setIsEventDialogOpen(false);
		setSelectedEvent(null);
	};

	const handleDialogDelete = (eventId: string) => {
		onEventDelete?.(eventId);
		setIsEventDialogOpen(false);
		setSelectedEvent(null);
		goeyToast.success("Termin gelöscht");
	};

	const handleDndUpdate = (event: CalendarEvent) => {
		onEventUpdate?.(event);
		goeyToast.success(`Termin "${event.title}" verschoben`);
	};

	return (
		<div
			className={cn("flex h-full min-h-0 flex-col overflow-hidden", className)}
			style={
				{
					"--event-height": `${EventHeight}px`,
					"--event-gap": `${EventGap}px`,
					"--week-cells-height": `${WeekCellsHeight}px`,
				} as React.CSSProperties
			}
		>
			<CalendarDndProvider onEventUpdate={handleDndUpdate}>
				<style>{`
					.dashboard-calendar-surface [data-slot="month-view"] > .sticky,
					.dashboard-calendar-surface [data-slot="week-view"] > .sticky {
						top: 0 !important;
					}
				`}</style>
				<div className="border border-[#222] bg-[#0b0b0b] p-3">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<h2 className="font-mono text-[#e8e4de] text-sm uppercase tracking-[0.15em]">
							{viewTitle}
						</h2>
						<div className="flex items-center gap-2">
							<div className="flex items-center gap-1">
								<Button
									type="button"
									variant="outline"
									size="icon-sm"
									onClick={handlePrevious}
									className="border-[#333] bg-[#111]"
								>
									<ChevronLeft className="size-3.5" />
								</Button>
								<Button
									type="button"
									variant="outline"
									size="icon-sm"
									onClick={handleNext}
									className="border-[#333] bg-[#111]"
								>
									<ChevronRight className="size-3.5" />
								</Button>
							</div>
							<Button
								type="button"
								variant="outline"
								onClick={handleToday}
								className="border-[#333] bg-[#111] font-mono text-[10px] uppercase tracking-[0.1em]"
							>
								Heute
							</Button>
							<Button
								type="button"
								onClick={handleCreateNow}
								className="bg-[#ff3d00] font-mono text-[10px] text-black uppercase tracking-[0.1em] hover:bg-[#ff3d00]"
							>
								<Plus className="size-3.5" />
								Neuer Termin
							</Button>
						</div>
					</div>
					<div className="mt-3 flex flex-wrap gap-1">
						{views.map((currentView) => (
							<Button
								key={currentView}
								type="button"
								size="sm"
								variant={view === currentView ? "default" : "outline"}
								onClick={() => setView(currentView)}
								className={
									view === currentView
										? "bg-[#ff3d00] font-mono text-[10px] text-black uppercase tracking-[0.1em] hover:bg-[#ff3d00]"
										: "border-[#333] bg-[#111] font-mono text-[10px] uppercase tracking-[0.1em]"
								}
							>
								{viewLabel(currentView)}
							</Button>
						))}
					</div>
				</div>

				<div className="dashboard-calendar-surface mt-2 min-h-0 flex-1 overflow-auto border border-[#222] bg-[#0f0f0f]">
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
					onDelete={handleDialogDelete}
				/>
			</CalendarDndProvider>
		</div>
	);
}
