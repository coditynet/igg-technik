"use client";

import type * as React from "react";
import { useCalendarContext } from "@/components/event-calendar/calendar-context";
import SidebarCalendar from "@/components/sidebar-calendar";
import { Checkbox } from "@/components/ui/checkbox";

export function CalendarSidebar() {
	const { isGroupVisible, toggleGroupVisibility, getAllGroups } =
		useCalendarContext();
	const groups = getAllGroups();

	return (
		<div className="w-64 flex-shrink-0 border-r bg-sidebar p-4 overflow-y-auto">
			<div className="space-y-6">
				<div>
					<h3 className="font-semibold text-lg mb-3">Kalender</h3>
					<SidebarCalendar />
				</div>

				<div className="border-t pt-4">
					<h4 className="text-xs uppercase text-muted-foreground mb-3">
						Gruppen
					</h4>
					<div className="space-y-2">
						{groups.map((group) => (
							<button
								key={group.id}
								type="button"
								className="flex w-full items-center justify-between gap-3 rounded-md p-2 hover:bg-accent cursor-pointer"
								onClick={() => toggleGroupVisibility(group.id)}
							>
								<div className="flex items-center gap-3 flex-1">
									<Checkbox
										id={group.id}
										checked={isGroupVisible(group.id)}
										onCheckedChange={() => toggleGroupVisibility(group.id)}
									/>
									<label
										htmlFor={group.id}
										className={`cursor-pointer ${!isGroupVisible(group.id) ? "text-muted-foreground line-through" : ""}`}
									>
										{group.name}
									</label>
								</div>
								<span
									className="size-2 rounded-full flex-shrink-0"
									style={{
										backgroundColor: `var(--color-${group.color}-400)`,
									}}
								/>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
