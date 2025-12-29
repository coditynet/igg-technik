"use client";

import { api } from "@igg/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useMemo } from "react";
import type { CalendarEvent } from "@/components/event-calendar";
import { EventCalendar } from "@/components/event-calendar";
import { useCalendarContext } from "@/components/event-calendar/calendar-context";

export default function DashboardCalendarPage() {
	const data = useQuery(api.events.list);
	const { isGroupVisible } = useCalendarContext();
	const createEvent = useMutation(api.events.create);
	const updateEvent = useMutation(api.events.update);
	const deleteEvent = useMutation(api.events.remove);

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
			<div className="flex h-full items-center justify-center">
				<div className="text-muted-foreground">Loading calendar...</div>
			</div>
		);
	}

	if (!data.events) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-muted-foreground">No events found.</div>
			</div>
		);
	}

	return (
		<div className="h-full w-full overflow-auto">
			<EventCalendar
				events={visibleEvents}
				onEventAdd={handleEventAdd}
				onEventUpdate={handleEventUpdate}
				onEventDelete={handleEventDelete}
				initialView="week"
				readOnly={false}
			/>
		</div>
	);
}
