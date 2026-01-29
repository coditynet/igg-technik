export type CalendarView = "month" | "week" | "day" | "agenda";

export type EventColor = "blue" | "orange" | "violet" | "rose" | "emerald";

export interface CalendarGroup {
	id: string;
	name: string;
	color: EventColor;
	isActive: boolean;
}

export interface CalendarEvent {
	id: string;
	title: string;
	description?: string;
	start: Date;
	end: Date;
	allDay?: boolean;
	groupId: string;
	label?: string;
	location?: string;
	notes?: string;
	teacher?: string;
}
