import { api } from "@igg/backend/convex/_generated/api";
import type { Id } from "@igg/backend/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { generateICS } from "@/lib/ics";

export const runtime = "edge";

export async function GET(
	_request: NextRequest,
	context: { params: Promise<{ groupId: string }> },
) {
	try {
		const groupId = (await context.params).groupId as Id<"groups">;

		const events = await fetchQuery(api.events.listForCalendarFeedByGroup, {
			groupId,
		});

		if (!events || events.length === 0) {
			const emptyCalendar = generateICS([], "IGG-Technik Events");
			return new NextResponse(emptyCalendar, {
				status: 200,
				headers: {
					"Content-Type": "text/calendar; charset=utf-8",
					"Content-Disposition": 'inline; filename="igg-technik.ics"',
					"Cache-Control": "public, max-age=300",
				},
			});
		}

		const icsEvents = events.map((event) => ({
			uid: `${event.id}@igg-technik.de`,
			title: event.title,
			description: event.description,
			location: event.location,
			start: new Date(event.start),
			end: new Date(event.end),
			allDay: event.allDay,
		}));

		const icsContent = generateICS(icsEvents, "IGG-Technik Events");

		return new NextResponse(icsContent, {
			status: 200,
			headers: {
				"Content-Type": "text/calendar; charset=utf-8",
				"Content-Disposition": 'inline; filename="igg-technik.ics"',
				"Cache-Control": "public, max-age=300",
			},
		});
	} catch (error) {
		console.error("Error generating calendar feed:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
