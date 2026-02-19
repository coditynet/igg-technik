"use client";

import { api } from "@igg/backend/convex/_generated/api";
import type { Id } from "@igg/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowLeft, MapPin, Tag, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AddToCalendar } from "@/components/event-calendar/add-to-calendar";
import { PageLoader } from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PublicEventPage() {
	const params = useParams();
	const eventId = params.id as Id<"events">;
	const event = useQuery(api.events.getPublicById, { id: eventId });

	if (event === undefined) {
		return <PageLoader />;
	}

	if (event === null) {
		return (
			<div className="mx-auto max-w-4xl px-6 py-8">
				<div className="mb-6">
					<Button
						asChild
						variant="ghost"
						className="font-mono text-[10px] uppercase tracking-[0.14em]"
					>
						<Link href="/calendar">
							<ArrowLeft className="mr-2 size-3.5" />
							Zurück zum Kalender
						</Link>
					</Button>
				</div>
				<div className="border border-[#222] bg-[#0d0d0d] p-8 text-center">
					<p className="font-mono text-[#888] text-xs uppercase tracking-[0.14em]">
						Event nicht gefunden
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#0a0a0a] text-[#e8e4de]">
			<div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<Button
						asChild
						variant="ghost"
						className="font-mono text-[10px] uppercase tracking-[0.14em]"
					>
						<Link href="/calendar">
							<ArrowLeft className="mr-2 size-3.5" />
							Zurück zum Kalender
						</Link>
					</Button>
					<div className="[&_button]:border-[#222] [&_button]:bg-[#111] [&_button]:font-mono [&_button]:text-[10px] [&_button]:uppercase [&_button]:tracking-[0.12em]">
						<AddToCalendar
							event={{
								title: event.title,
								description: event.description,
								location: event.location,
								start: new Date(event.start),
								end: new Date(event.end),
							}}
						/>
					</div>
				</div>

				<div className="border-[#222] border-b pb-6">
					<div className="mb-4 inline-flex items-center gap-2">
						<div className="flex size-8 items-center justify-center bg-[#ff3d00] font-black font-mono text-black text-xs">
							T
						</div>
						<span className="font-bold font-mono text-[#e8e4de] text-xs uppercase tracking-[0.2em]">
							IGG Technik
						</span>
					</div>
					<h1 className="font-black text-3xl uppercase tracking-tight">
						{event.title}
					</h1>
					<div className="mt-3 flex flex-wrap items-center gap-2">
						{event.group?.name ? (
							<Badge className="border-none bg-[#1f1f1f] font-mono text-[#d0cbc5] text-[10px] uppercase tracking-[0.12em]">
								<Users className="mr-1 size-3" />
								{event.group.name}
							</Badge>
						) : null}
						{event.label ? (
							<Badge className="border-none bg-[#ff3d00]/20 font-mono text-[#ff9a7e] text-[10px] uppercase tracking-[0.12em]">
								<Tag className="mr-1 size-3" />
								{event.label}
							</Badge>
						) : null}
						{event.location ? (
							<Badge className="border-none bg-[#1f1f1f] font-mono text-[#d0cbc5] text-[10px] uppercase tracking-[0.12em]">
								<MapPin className="mr-1 size-3" />
								{event.location}
							</Badge>
						) : null}
					</div>
				</div>

				<div className="space-y-6">
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="border border-[#222] p-3">
							<div className="font-mono text-[#777] text-[10px] uppercase tracking-[0.12em]">
								Start
							</div>
							<div className="mt-1 text-sm">
								{event.allDay
									? format(new Date(event.start), "PPP", { locale: de })
									: format(new Date(event.start), "PPp", { locale: de })}
							</div>
						</div>
						<div className="border border-[#222] p-3">
							<div className="font-mono text-[#777] text-[10px] uppercase tracking-[0.12em]">
								Ende
							</div>
							<div className="mt-1 text-sm">
								{event.allDay
									? format(new Date(event.end), "PPP", { locale: de })
									: format(new Date(event.end), "PPp", { locale: de })}
							</div>
						</div>
					</div>

					{event.teacher ? (
						<div className="border border-[#222] p-3">
							<div className="font-mono text-[#777] text-[10px] uppercase tracking-[0.12em]">
								Lehrkraft
							</div>
							<div className="mt-1 text-sm">{event.teacher}</div>
						</div>
					) : null}

					<div className="border border-[#222] p-3">
						<div className="font-mono text-[#777] text-[10px] uppercase tracking-[0.12em]">
							Beschreibung
						</div>
						<div className="mt-1 whitespace-pre-wrap text-sm">
							{event.description || "Keine Beschreibung"}
						</div>
					</div>

					<div className="space-y-2">
						<div className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
							Inventar
						</div>
						{event.inventory.length === 0 ? (
							<div className="border border-[#222] px-3 py-2.5 font-mono text-[#777] text-xs">
								Kein Inventar zugewiesen
							</div>
						) : (
							<div className="grid gap-2">
								{event.inventory.map((item) => (
									<div
										key={item.itemId}
										className="flex items-center justify-between gap-3 border border-[#222] px-3 py-2.5"
									>
										<div className="flex items-center gap-2">
											<div className="text-sm">
												{item.name ?? "Gelöschtes Item"}
											</div>
											{item.isDeleted ? (
												<Badge className="border-none bg-[#331614] font-mono text-[10px] text-red-300 uppercase tracking-widest">
													Gelöscht
												</Badge>
											) : null}
										</div>
										<div className="font-mono text-[#b9b1a8] text-xs">
											{item.count}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<a href="https://codity.app" target="_blank" className="fixed right-4 bottom-3 font-mono text-[#777] text-[10px] uppercase tracking-[0.14em] hover:text-[#ff3d00]">
					Made by Codity
				</a>
			</div>
		</div>
	);
}
