"use client";

import { api } from "@igg/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import type { CalendarEvent, CalendarGroup } from "@/components/event-calendar";
import { CalendarProvider } from "@/components/event-calendar/calendar-context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Calendar from "./_components/calendar";
import { AppSidebar } from "./_components/sidebar";

export default function Page() {
	const data = useQuery(api.events.list);

	if (data === undefined) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="text-muted-foreground">Loading calendar...</div>
			</div>
		);
	}

	if (!data.groups) {
		return (
			<div className="flex h-screen items-center justify-center">
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
				<AppSidebar />
				<SidebarInset className="flex h-screen flex-col overflow-hidden">
					<div className="flex-1 overflow-auto p-4">
						<Calendar events={events} />
					</div>
				</SidebarInset>
			</SidebarProvider>
		</CalendarProvider>
	);
}
