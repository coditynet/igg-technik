"use client";

import { api } from "@igg/backend/convex/_generated/api";
import { useQuery } from "convex/react";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
	AgendaDaysToShow,
	AgendaView,
	CalendarDndProvider,
	type CalendarEvent,
	type CalendarGroup,
	type CalendarView,
	DayView,
	EventDialog,
	EventGap,
	EventHeight,
	MonthView,
	WeekCellsHeight,
	WeekView,
} from "@/components/event-calendar";
import {
	CalendarProvider,
	useCalendarContext,
} from "@/components/event-calendar/calendar-context";
import SidebarCalendar from "@/components/sidebar-calendar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const groupDotClass: Record<string, string> = {
	blue: "bg-blue-500",
	orange: "bg-orange-500",
	violet: "bg-violet-500",
	rose: "bg-rose-500",
	emerald: "bg-emerald-500",
};

const views: CalendarView[] = ["month", "week", "day", "agenda"];

function viewLabel(view: CalendarView) {
	if (view === "month") return "Monat";
	if (view === "week") return "Woche";
	if (view === "day") return "Tag";
	return "Agenda";
}

function CalendarSidebarV2() {
	const { isGroupVisible, toggleGroupVisibility, getAllGroups } =
		useCalendarContext();
	const groups = getAllGroups();

	return (
		<Sidebar variant="inset" className="scheme-only-dark max-lg:p-3 lg:pe-1">
			<SidebarHeader className="border-[#222] border-b pb-4">
				<div className="flex items-center justify-between gap-2">
					<Link href="/" className="inline-flex items-center gap-2">
						<div className="flex size-8 items-center justify-center bg-[#ff3d00] font-black font-mono text-black text-xs">
							T
						</div>
						<span className="font-bold font-mono text-[#e8e4de] text-xs uppercase tracking-[0.2em]">
							IGG Technik
						</span>
					</Link>
					<SidebarTrigger className="text-[#777] hover:bg-transparent! hover:text-[#e8e4de]" />
				</div>
				<Link
					href="/"
					className="mt-2 inline-flex items-center gap-2 font-mono text-[#777] text-[10px] uppercase tracking-[0.12em] hover:text-[#ff3d00]"
				>
					← Zurück
				</Link>
			</SidebarHeader>
			<SidebarContent className="mt-3 gap-0 border-[#222] border-t pt-3">
				<div className="mx-1 border border-[#222] bg-[#0b0b0b] p-2">
					<SidebarCalendar className="justify-start" />
				</div>
				<div className="mx-1 mt-3 border-[#222] border-t pt-4">
					<div className="mb-2 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
						Gruppen
					</div>
					<div className="space-y-1.5">
						{groups.map((group) => {
							const isVisible = isGroupVisible(group.id);
							return (
								<button
									key={group.id}
									type="button"
									onClick={() => toggleGroupVisibility(group.id)}
									className="flex w-full items-center justify-between border border-[#1f1f1f] bg-[#0b0b0b] px-2.5 py-2 text-left transition-colors hover:bg-[#121212]"
								>
									<div className="flex items-center gap-2.5">
										<Checkbox
											id={`calendar-v2-group-${group.id}`}
											checked={isVisible}
											className="pointer-events-none border-[#444] data-[state=checked]:border-[#ff3d00] data-[state=checked]:bg-[#ff3d00]"
										/>
										<label
											htmlFor={`calendar-v2-group-${group.id}`}
											className={cn(
												"cursor-pointer font-mono text-xs",
												isVisible ? "text-[#ddd]" : "text-[#666] line-through",
											)}
										>
											{group.name}
										</label>
									</div>
									<span
										className={`size-2.5 rounded-full ${groupDotClass[group.color] ?? "bg-gray-500"}`}
									/>
								</button>
							);
						})}
					</div>
				</div>
			</SidebarContent>
		</Sidebar>
	);
}

function CalendarMainV2({ events }: { events: CalendarEvent[] }) {
	const { currentDate, setCurrentDate, isGroupVisible } = useCalendarContext();
	const [view, setView] = useState<CalendarView>("month");
	const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
		null,
	);

	const visibleEvents = useMemo(() => {
		return events.filter((event) => isGroupVisible(event.groupId));
	}, [events, isGroupVisible]);

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

	const handleEventSelect = (event: CalendarEvent) => {
		setSelectedEvent(event);
		setIsEventDialogOpen(true);
	};

	return (
		<div
			className="flex h-full min-h-0 flex-col overflow-hidden"
			style={
				{
					"--event-height": `${EventHeight}px`,
					"--event-gap": `${EventGap}px`,
					"--week-cells-height": `${WeekCellsHeight}px`,
				} as React.CSSProperties
			}
		>
			<CalendarDndProvider onEventUpdate={() => undefined}>
				<style>{`
					.calendar-v2-surface [data-slot="month-view"] > .sticky,
					.calendar-v2-surface [data-slot="week-view"] > .sticky {
						top: 0 !important;
						border-color: #222 !important;
						background: #0d0d0d !important;
						text-transform: uppercase;
						letter-spacing: 0.1em;
					}

					.calendar-v2-surface [data-slot="month-view"] .group {
						border-color: #191919 !important;
					}

					.calendar-v2-surface [data-slot="month-view"] [data-outside-cell] {
						background: #0b0b0b !important;
						color: #3a3a3a !important;
					}

					.calendar-v2-surface [data-slot="month-view"] [data-today] .rounded-full {
						border-radius: 0 !important;
						background: #ff3d00 !important;
						color: #0a0a0a !important;
						font-weight: 700;
					}

					.calendar-v2-surface [data-slot="week-view"] [data-today] {
						background: rgba(255, 61, 0, 0.08);
					}
				`}</style>
				<div className="border border-[#222] bg-[#0d0d0d]">
					<div className="flex flex-wrap items-center justify-between gap-3 border-[#222] border-b px-4 py-3">
						<div className="flex items-center gap-2">
							<SidebarTrigger className="text-[#777] hover:bg-transparent! hover:text-[#e8e4de]" />
							<div>
								<div className="font-mono text-[#e8e4de] text-sm uppercase tracking-[0.15em]">
									{viewTitle}
								</div>
								<p className="font-mono text-[#777] text-[10px] uppercase tracking-[0.15em]">
									{visibleEvents.length} Termine sichtbar
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="flex items-center gap-1">
								<Button
									type="button"
									variant="outline"
									size="icon-sm"
									onClick={handlePrevious}
									className="border-[#222] bg-[#151515]"
								>
									<ChevronLeft className="size-3.5" />
								</Button>
								<Button
									type="button"
									variant="outline"
									size="icon-sm"
									onClick={handleNext}
									className="border-[#222] bg-[#151515]"
								>
									<ChevronRight className="size-3.5" />
								</Button>
							</div>
							<Button
								type="button"
								variant="outline"
								onClick={() => setCurrentDate(new Date())}
								className="border-[#222] bg-[#151515] font-mono text-[10px] uppercase tracking-[0.1em]"
							>
								Heute
							</Button>
						</div>
					</div>

					<div className="flex flex-wrap gap-px bg-[#222] p-1">
						{views.map((currentView) => (
							<Button
								key={currentView}
								type="button"
								size="sm"
								variant={view === currentView ? "default" : "outline"}
								onClick={() => setView(currentView)}
								className={
									view === currentView
										? "rounded-none border-[#ff3d00] bg-[#ff3d00] font-mono text-[10px] text-black uppercase tracking-[0.1em] hover:bg-[#ff3d00]"
										: "rounded-none border-[#222] bg-[#111] font-mono text-[10px] uppercase tracking-[0.1em] hover:bg-[#171717]"
								}
							>
								{viewLabel(currentView)}
							</Button>
						))}
					</div>
				</div>

				<div className="calendar-v2-surface mt-2 min-h-0 flex-1 overflow-auto border border-[#222] bg-[#0d0d0d]">
					{view === "month" && (
						<MonthView
							currentDate={currentDate}
							events={visibleEvents}
							onEventSelect={handleEventSelect}
							onEventCreate={() => undefined}
						/>
					)}
					{view === "week" && (
						<WeekView
							currentDate={currentDate}
							events={visibleEvents}
							onEventSelect={handleEventSelect}
							onEventCreate={() => undefined}
						/>
					)}
					{view === "day" && (
						<DayView
							currentDate={currentDate}
							events={visibleEvents}
							onEventSelect={handleEventSelect}
							onEventCreate={() => undefined}
						/>
					)}
					{view === "agenda" && (
						<AgendaView
							currentDate={currentDate}
							events={visibleEvents}
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
					onSave={() => undefined}
					onDelete={() => undefined}
					readOnly
				/>
			</CalendarDndProvider>
		</div>
	);
}

export function PublicCalendarV2() {
	const data = useQuery(api.events.list);

	const groups: CalendarGroup[] = useMemo(() => {
		if (!data?.groups) {
			return [];
		}
		return data.groups.map((group) => ({
			id: String(group._id),
			name: group.name,
			color: group.color,
			isActive: true,
		}));
	}, [data?.groups]);

	const events: CalendarEvent[] = useMemo(() => {
		if (!data?.events) {
			return [];
		}
		return data.events.map((event) => ({
			id: String(event._id),
			title: event.title,
			description: event.description,
			start: new Date(event.start),
			end: new Date(event.end),
			groupId: String(event.groupId),
			location: event.location,
			allDay: event.allDay,
			label: event.label,
			teacher: event.teacher,
			notes: event.notes,
		}));
	}, [data?.events]);

	if (data === undefined) {
		return (
			<div className="mx-auto w-full max-w-[1400px] space-y-5 px-6 py-8">
				<div className="space-y-2">
					<Skeleton className="h-4 w-24 bg-[#111]" />
					<Skeleton className="h-10 w-72 bg-[#111]" />
					<Skeleton className="h-4 w-96 bg-[#111]" />
				</div>
				<div className="grid gap-5 xl:grid-cols-[320px_1fr]">
					<Skeleton className="h-[720px] w-full bg-[#111]" />
					<Skeleton className="h-[720px] w-full bg-[#111]" />
				</div>
			</div>
		);
	}

	if (groups.length === 0) {
		return (
			<div className="mx-auto w-full max-w-[1400px] px-6 py-8">
				<div className="flex h-[60vh] items-center justify-center border border-[#222] bg-[#0f0f0f]">
					<p className="font-mono text-[#777] text-xs uppercase tracking-[0.15em]">
						Keine Gruppen gefunden
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-[#e8e4de]">
			<div className="relative flex h-[calc(100vh-4rem)] min-h-[720px] w-full flex-col">
				<CalendarProvider groups={groups}>
					<SidebarProvider>
						<CalendarSidebarV2 />
						<SidebarInset className="flex min-h-0 flex-1 flex-col overflow-hidden">
							<div className="flex min-h-0 flex-1 flex-col p-4">
								<CalendarMainV2 events={events} />
							</div>
						</SidebarInset>
					</SidebarProvider>
				</CalendarProvider>
			</div>
		</div>
	);
}
