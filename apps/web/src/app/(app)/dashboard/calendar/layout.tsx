"use client";

import { api } from "@igg/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import type { CalendarGroup } from "@/components/event-calendar";
import { CalendarProvider } from "@/components/event-calendar/calendar-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const data = useQuery(api.events.list);

	if (data === undefined) {
		return (
			<div className="space-y-6">
				<div className="space-y-2">
					<Skeleton className="h-9 w-48" />
					<Skeleton className="h-5 w-96" />
				</div>
				<Skeleton className="h-[600px] w-full" />
			</div>
		);
	}

	if (!data.groups) {
		return (
			<div className="flex h-[600px] items-center justify-center rounded-lg border border-dashed">
				<div className="text-center text-muted-foreground">
					No calendar groups found.
				</div>
			</div>
		);
	}

	const groups: CalendarGroup[] = (data.groups as any[]).map((group: any) => ({
		id: group._id as string,
		name: group.name,
		color: group.color as "blue" | "orange" | "violet" | "rose" | "emerald",
		isActive: true,
	}));

	return <CalendarProvider groups={groups}>{children}</CalendarProvider>;
}
