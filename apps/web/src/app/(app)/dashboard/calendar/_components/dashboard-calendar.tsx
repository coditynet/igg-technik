"use client";

import { api } from "@igg/backend/convex/_generated/api";
import type { Id } from "@igg/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { goeyToast } from "goey-toast";
import { useMemo } from "react";
import type { CalendarEvent } from "@/components/event-calendar";
import { useCalendarContext } from "@/components/event-calendar/calendar-context";
import SidebarCalendar from "@/components/sidebar-calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardEventCalendar } from "./dashboard-event-calendar";

const groupDotClass: Record<string, string> = {
	blue: "bg-blue-500",
	orange: "bg-orange-500",
	violet: "bg-violet-500",
	rose: "bg-rose-500",
	emerald: "bg-emerald-500",
};

export function DashboardCalendar() {
	const data = useQuery(api.events.list);
	const createEvent = useMutation(api.events.create);
	const updateEvent = useMutation(api.events.update);
	const deleteEvent = useMutation(api.events.remove);
	const { isGroupVisible, toggleGroupVisibility, getAllGroups } =
		useCalendarContext();

	const groups = getAllGroups();

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
			notes: event.notes,
			teacher: event.teacher,
		}));
	}, [data?.events]);

	const visibleEvents = useMemo(() => {
		return events.filter((event) => isGroupVisible(event.groupId));
	}, [events, isGroupVisible]);

	const handleEventAdd = async (event: CalendarEvent) => {
		try {
			await createEvent({
				title: event.title,
				description: event.description,
				start: event.start.toISOString(),
				end: event.end.toISOString(),
				groupId: event.groupId as Id<"groups">,
				location: event.location,
				allDay: event.allDay ?? false,
				label: event.label,
				notes: event.notes,
				teacher: event.teacher,
			});
		} catch (_error) {
			goeyToast.error("Termin konnte nicht erstellt werden");
		}
	};

	const handleEventUpdate = async (event: CalendarEvent) => {
		try {
			await updateEvent({
				id: event.id as Id<"events">,
				title: event.title,
				description: event.description,
				start: event.start.toISOString(),
				end: event.end.toISOString(),
				groupId: event.groupId as Id<"groups">,
				location: event.location,
				allDay: event.allDay ?? false,
				label: event.label,
				notes: event.notes,
				teacher: event.teacher,
			});
		} catch (_error) {
			goeyToast.error("Termin konnte nicht aktualisiert werden");
		}
	};

	const handleEventDelete = async (eventId: string) => {
		try {
			await deleteEvent({ id: eventId as Id<"events"> });
		} catch (_error) {
			goeyToast.error("Termin konnte nicht gelöscht werden");
		}
	};

	if (data === undefined) {
		return (
			<div className="flex h-full flex-col gap-4 overflow-hidden">
				<div className="space-y-2">
					<Skeleton className="h-4 w-24 bg-[#111]" />
					<Skeleton className="h-10 w-64 bg-[#111]" />
					<Skeleton className="h-4 w-80 bg-[#111]" />
				</div>
				<div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[320px_1fr]">
					<div className="space-y-4">
						<Skeleton className="h-[300px] w-full bg-[#111]" />
						<Skeleton className="h-[280px] w-full bg-[#111]" />
					</div>
					<Skeleton className="h-[760px] w-full bg-[#111]" />
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col gap-4 overflow-hidden">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<div className="mb-2 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
						Verwaltung
					</div>
					<h1 className="font-black text-3xl uppercase tracking-tight">
						Kalender
					</h1>
					<p className="mt-1 font-mono text-[#777] text-xs">
						Planen, verschieben und organisieren Sie Veranstaltungen im Team.
					</p>
				</div>
			</div>

			<div className="grid min-h-0 flex-1 gap-5 overflow-hidden xl:grid-cols-[320px_1fr]">
				<aside className="min-h-0">
					<section className="flex h-full min-h-0 flex-col border border-[#222] bg-[#0f0f0f] p-4">
						<div className="mb-3 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
							Navigation und Gruppen
						</div>
						<div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
							<div className="rounded-none border border-[#222] bg-[#0b0b0b] p-2">
								<SidebarCalendar className="justify-start" />
							</div>
							<div className="h-px bg-[#222]" />
							<div className="space-y-1.5">
								{groups.map((group) => {
									const isVisible = isGroupVisible(group.id);
									return (
										<button
											key={group.id}
											type="button"
											className="flex w-full items-center justify-between border border-[#1f1f1f] bg-[#0b0b0b] px-2.5 py-2 text-left transition-colors hover:bg-[#121212]"
											onClick={() => toggleGroupVisibility(group.id)}
										>
											<div className="flex items-center gap-2.5">
												<Checkbox
													id={`calendar-group-${group.id}`}
													checked={isVisible}
													className="border-[#444] data-[state=checked]:border-[#ff3d00] data-[state=checked]:bg-[#ff3d00]"
												/>
												<label
													htmlFor={`calendar-group-${group.id}`}
													className={`cursor-pointer font-mono text-xs ${
														isVisible
															? "text-[#ddd]"
															: "text-[#666] line-through"
													}`}
												>
													{group.name}
												</label>
											</div>
											<span
												className={`size-2.5 rounded-full ${
													groupDotClass[group.color] ?? "bg-gray-500"
												}`}
											/>
										</button>
									);
								})}
							</div>
						</div>
					</section>
				</aside>

				<div className="min-h-0 overflow-hidden">
					<DashboardEventCalendar
						events={visibleEvents}
						onEventAdd={handleEventAdd}
						onEventUpdate={handleEventUpdate}
						onEventDelete={handleEventDelete}
						initialView="week"
					/>
				</div>
			</div>
		</div>
	);
}
