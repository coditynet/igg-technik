"use client";

import { api } from "@igg/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useMemo } from "react";
import type { CalendarEvent } from "@/components/event-calendar";
import { EventCalendar } from "@/components/event-calendar";
import { useCalendarContext } from "@/components/event-calendar/calendar-context";
import SidebarCalendar from "@/components/sidebar-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardCalendarPage() {
	const data = useQuery(api.events.list);
	const { isGroupVisible, toggleGroupVisibility, getAllGroups } =
		useCalendarContext();
	const createEvent = useMutation(api.events.create);
	const updateEvent = useMutation(api.events.update);
	const deleteEvent = useMutation(api.events.remove);

	const groups = getAllGroups();

	const events: CalendarEvent[] = useMemo(() => {
		if (!data?.events) return [];

		return (data.events as any[]).map((event: any) => ({
			id: event._id as string,
			title: event.title,
			description: event.description,
			start: new Date(event.start),
			end: new Date(event.end),
			groupId: event.groupId as string,
			location: event.location,
			allDay: event.allDay,
		}));
	}, [data?.events]);

	// Filter events based on visible groups
	const visibleEvents = useMemo(() => {
		return events.filter((event) => isGroupVisible(event.groupId));
	}, [events, isGroupVisible]);

	const handleEventAdd = async (event: CalendarEvent) => {
		await createEvent({
			title: event.title,
			description: event.description,
			start: event.start.toISOString(),
			end: event.end.toISOString(),
			groupId: event.groupId as any,
			location: event.location,
			allDay: event.allDay ?? false,
		});
	};

	const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
		await updateEvent({
			id: updatedEvent.id as any,
			title: updatedEvent.title,
			description: updatedEvent.description,
			start: updatedEvent.start.toISOString(),
			end: updatedEvent.end.toISOString(),
			groupId: updatedEvent.groupId as any,
			location: updatedEvent.location,
			allDay: updatedEvent.allDay ?? false,
		});
	};

	const handleEventDelete = async (eventId: string) => {
		await deleteEvent({ id: eventId as any });
	};

	if (data === undefined) {
		return (
			<div className="space-y-6">
				<div className="space-y-2">
					<Skeleton className="h-9 w-48" />
					<Skeleton className="h-5 w-96" />
				</div>
				<div className="grid gap-6 lg:grid-cols-[280px_1fr]">
					<div className="space-y-4">
						<Skeleton className="h-[300px] w-full" />
						<Skeleton className="h-[200px] w-full" />
					</div>
					<Skeleton className="h-[600px] w-full" />
				</div>
			</div>
		);
	}

	if (!data.events) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Kalender</h1>
					<p className="text-muted-foreground">
						Verwalten Sie Ihre Termine und Veranstaltungen
					</p>
				</div>
				<div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
					<div className="text-center text-muted-foreground">
						No events found.
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Kalender</h1>
				<p className="text-muted-foreground">
					Verwalten Sie Ihre Termine und Veranstaltungen
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-[280px_1fr]">
				{/* Sidebar */}
				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Kalender</CardTitle>
						</CardHeader>
						<CardContent>
							<SidebarCalendar />
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-base">Gruppen</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{groups.map((group) => (
									<button
										key={group.id}
										type="button"
										className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md p-2 transition-colors hover:bg-accent"
										onClick={() => toggleGroupVisibility(group.id)}
									>
										<div className="flex flex-1 items-center gap-3">
											<Checkbox
												id={group.id}
												checked={isGroupVisible(group.id)}
												onCheckedChange={() => toggleGroupVisibility(group.id)}
											/>
											<label
												htmlFor={group.id}
												className={`cursor-pointer text-sm ${!isGroupVisible(group.id) ? "text-muted-foreground line-through" : ""}`}
											>
												{group.name}
											</label>
										</div>
										<span
											className="size-3 flex-shrink-0 rounded-full"
											style={{
												backgroundColor: `var(--color-${group.color}-400)`,
											}}
										/>
									</button>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Main Calendar - No Card wrapper */}
				<div className="h-[800px]">
					<EventCalendar
						events={visibleEvents}
						onEventAdd={handleEventAdd}
						onEventUpdate={handleEventUpdate}
						onEventDelete={handleEventDelete}
						initialView="week"
						readOnly={false}
					/>
				</div>
			</div>
		</div>
	);
}
