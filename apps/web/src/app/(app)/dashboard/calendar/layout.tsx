"use client";

import { api } from "@igg/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import type { CalendarGroup } from "@/components/event-calendar";
import { CalendarProvider } from "@/components/event-calendar/calendar-context";
import { CalendarSidebar } from "./_components/calendar-sidebar";

export default function CalendarLayout({
	children,
}: {
	children: React.ReactNode;
}) {
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

	return (
		<CalendarProvider groups={groups}>
			<div className="flex h-full w-full gap-4">
				<CalendarSidebar />
				<div className="flex-1 overflow-hidden">{children}</div>
			</div>
		</CalendarProvider>
	);
}
