import { format } from "date-fns";

type ICSEvent = {
	uid: string;
	title: string;
	description?: string;
	location?: string;
	start: Date;
	end: Date;
	allDay?: boolean;
	created?: Date;
	lastModified?: Date;
};

function escapeICSString(str: string): string {
	return str
		.replace(/\\/g, "\\\\")
		.replace(/;/g, "\\;")
		.replace(/,/g, "\\,")
		.replace(/\n/g, "\\n");
}

function formatICSDate(date: Date, allDay?: boolean): string {
	if (allDay) {
		return format(date, "yyyyMMdd");
	}
	return format(date, "yyyyMMdd'T'HHmmss'Z'");
}

function foldLine(line: string): string {
	if (line.length <= 75) {
		return line;
	}
	const result: string[] = [];
	let currentLine = line;

	while (currentLine.length > 75) {
		result.push(currentLine.substring(0, 75));
		currentLine = " " + currentLine.substring(75);
	}
	result.push(currentLine);

	return result.join("\r\n");
}

function buildVEvent(event: ICSEvent): string {
	const lines: string[] = [
		"BEGIN:VEVENT",
		`UID:${event.uid}`,
		`DTSTAMP:${formatICSDate(new Date())}`,
	];

	if (event.allDay) {
		lines.push(`DTSTART;VALUE=DATE:${formatICSDate(event.start, true)}`);
		lines.push(`DTEND;VALUE=DATE:${formatICSDate(event.end, true)}`);
	} else {
		lines.push(`DTSTART:${formatICSDate(event.start)}`);
		lines.push(`DTEND:${formatICSDate(event.end)}`);
	}

	lines.push(`SUMMARY:${escapeICSString(event.title)}`);

	if (event.description) {
		lines.push(`DESCRIPTION:${escapeICSString(event.description)}`);
	}

	if (event.location) {
		lines.push(`LOCATION:${escapeICSString(event.location)}`);
	}

	if (event.created) {
		lines.push(`CREATED:${formatICSDate(event.created)}`);
	}

	if (event.lastModified) {
		lines.push(`LAST-MODIFIED:${formatICSDate(event.lastModified)}`);
	}

	lines.push("STATUS:CONFIRMED");
	lines.push("SEQUENCE:0");
	lines.push("END:VEVENT");

	return lines.map(foldLine).join("\r\n");
}

export function generateICS(
	events: ICSEvent[],
	calendarName = "IGG-Technik Events",
): string {
	const header = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//IGG-Technik//Calendar//DE",
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		`X-WR-CALNAME:${escapeICSString(calendarName)}`,
		"X-WR-TIMEZONE:Europe/Berlin",
		"X-WR-CALDESC:IGG-Technik Event Calendar",
	].join("\r\n");

	const eventBlocks = events.map(buildVEvent).join("\r\n");

	const footer = "END:VCALENDAR";

	return `${header}\r\n${eventBlocks}\r\n${footer}`;
}

export function generateSingleEventICS(event: ICSEvent): string {
	return generateICS([event], event.title);
}
