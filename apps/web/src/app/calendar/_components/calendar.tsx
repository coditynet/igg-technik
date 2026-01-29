"use client";

import { api } from "@igg/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useMemo } from "react";
import { type CalendarEvent, EventCalendar } from "@/components/event-calendar";
import { useCalendarContext } from "@/components/event-calendar/calendar-context";

interface CalendarProps {
	events: CalendarEvent[];
	readOnly?: boolean;
}

export default function Calendar({ events, readOnly = false }: CalendarProps) {
	const { isGroupVisible } = useCalendarContext();
	const createEvent = useMutation(api.events.create);
	const updateEvent = useMutation(api.events.update);
	const deleteEvent = useMutation(api.events.remove);

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
			teacher: event.teacher,
			notes: event.notes,
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
			teacher: updatedEvent.teacher,
			notes: updatedEvent.notes,
		});
	};

	const handleEventDelete = async (eventId: string) => {
		await deleteEvent({ id: eventId as any });
	};

	return (
		<EventCalendar
			events={visibleEvents}
			onEventAdd={handleEventAdd}
			onEventUpdate={handleEventUpdate}
			onEventDelete={handleEventDelete}
			initialView="week"
			readOnly={readOnly}
		/>
	);
}
