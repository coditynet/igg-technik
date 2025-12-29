"use client";

import { api } from "@igg/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import type { CalendarEvent, CalendarGroup } from "@/components/event-calendar";
import { CalendarProvider } from "@/components/event-calendar/calendar-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import Calendar from "@/app/calendar/_components/calendar";

export function CalendarView() {
	const data = useQuery(api.events.list);

	if (data === undefined) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-muted-foreground">Loading calendar...</div>
			</div>
		);
	}

	if (!data.groups) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-muted-foreground">No calendar groups found.</div>
			</div>
		);
	}

	const groups: CalendarGroup[] = (data.groups as any[]).map((group: any) => ({
		id: group._id as string,
		name: group.name,
		color: group.color as "blue" | "orange" | "violet" | "rose" | "emerald",
		isActive: true,
	}));

	const events: CalendarEvent[] = (data.events as any[]).map((event: any) => ({
		id: event._id as string,
		title: event.title,
		description: event.description,
		start: new Date(event.start),
		end: new Date(event.end),
		groupId: event.groupId as string,
		location: event.location,
		allDay: event.allDay,
	}));

	return (
		<CalendarProvider groups={groups}>
			<SidebarProvider>
				<div className="h-full w-full overflow-auto p-4">
					<Calendar events={events} readOnly />
				</div>
			</SidebarProvider>
		</CalendarProvider>
	);
}
