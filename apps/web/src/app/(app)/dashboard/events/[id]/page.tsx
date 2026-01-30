"use client";

import { api } from "@igg/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import type { Id } from "@igg/backend/convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";

export default function EventDetailPage() {
	const params = useParams();
	const router = useRouter();
	const eventId = params.id as Id<"events">;

	const event = useQuery(api.events.getWithGroup, { id: eventId });
	const updateEvent = useMutation(api.events.update);
	const deleteEvent = useMutation(api.events.remove);

	const [isEditingNotes, setIsEditingNotes] = useState(false);
	const [notes, setNotes] = useState("");

	if (event === undefined) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-9 w-48" />
				<Skeleton className="h-[600px] w-full" />
			</div>
		);
	}

	if (event == null) {
		return (
			<div className="space-y-6">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.push("/dashboard/events" as any)}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Zurück
				</Button>
				<div className="flex h-[400px] items-center justify-center rounded-lg border">
					<div className="text-center text-muted-foreground">
						Veranstaltung nicht gefunden
					</div>
				</div>
			</div>
		);
	}

	const colorMap: Record<string, string> = {
		blue: "bg-blue-500 hover:bg-blue-500",
		orange: "bg-orange-500 hover:bg-orange-500",
		violet: "bg-violet-500 hover:bg-violet-500",
		rose: "bg-rose-500 hover:bg-rose-500",
		emerald: "bg-emerald-500 hover:bg-emerald-500",
	};

	const handleEditNotes = () => {
		setNotes(event.notes || "");
		setIsEditingNotes(true);
	};

	const handleSaveNotes = async () => {
		try {
			await updateEvent({
				id: eventId,
				notes: notes,
			});
			setIsEditingNotes(false);
			toast.success("Notizen gespeichert");
		} catch (error) {
			toast.error("Die Notizen konnten nicht gespeichert werden");
		}
	};

	const handleCancelEdit = () => {
		setIsEditingNotes(false);
		setNotes("");
	};
	
	//TODO: add confirm dialog
	const handleEventDelete = async () => {
		try {
			await deleteEvent({ id: eventId });
			toast.success("Veranstaltung gelöscht");
			router.push("/dashboard/events" as any);
		} catch (error) {
			toast.error("Veranstaltung konnte nicht gelöscht werden");
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.push("/dashboard/events" as any)}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Zurück
				</Button>
			</div>

			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<h1 className="font-bold text-3xl tracking-tight">
						{event.title}
					</h1>
					{event.group && (
						<Badge
							className={`${colorMap[event.group.color] || "bg-gray-500 hover:bg-gray-500"} border-none text-white`}
						>
							{event.group.name}
						</Badge>
					)}
					{event.allDay && (
						<Badge variant="secondary">Ganztägig</Badge>
					)}
				</div>
				{event.description && (
					<p className="text-muted-foreground">
						{event.description}
					</p>
				)}
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<div className="space-y-1">
					<p className="font-medium text-sm">Start</p>
					<p className="text-muted-foreground text-sm">
						{format(new Date(event.start), "PPpp", { locale: de })}
					</p>
				</div>

				<div className="space-y-1">
					<p className="font-medium text-sm">Ende</p>
					<p className="text-muted-foreground text-sm">
						{format(new Date(event.end), "PPpp", { locale: de })}
					</p>
				</div>

				{event.location && (
					<div className="space-y-1">
						<p className="font-medium text-sm">Ort</p>
						<p className="text-muted-foreground text-sm">{event.location}</p>
					</div>
				)}

				{event.teacher && (
					<div className="space-y-1">
						<p className="font-medium text-sm">Lehrer</p>
						<p className="text-muted-foreground text-sm">{event.teacher}</p>
					</div>
				)}

				{event.label && (
					<div className="space-y-1">
						<p className="font-medium text-sm">Label</p>
						<Badge variant="outline">{event.label}</Badge>
					</div>
				)}
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<p className="font-medium text-sm">Notizen</p>
					{!isEditingNotes && (
						<Button variant="ghost" size="sm" onClick={handleEditNotes}>
							Bearbeiten
						</Button>
					)}
				</div>
				{isEditingNotes ? (
					<div className="space-y-2">
						<Textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Notizen hinzufügen..."
							className="min-h-[150px]"
							autoFocus
						/>
						<div className="flex items-center gap-2">
							<Button size="sm" onClick={handleSaveNotes}>
								Speichern
							</Button>
							<Button size="sm" variant="outline" onClick={handleCancelEdit}>
								Abbrechen
							</Button>
						</div>
					</div>
				) : (
					<button
						type="button"
						className="w-full rounded-lg border bg-muted/30 p-4 hover:bg-muted/50 transition-colors text-left"
						onClick={handleEditNotes}
					>
						<p className="text-sm whitespace-pre-wrap text-muted-foreground">
							{event.notes || "Klicken zum Hinzufügen von Notizen..."}
						</p>
					</button>
				)}
			</div>

			<div className="flex items-center gap-2 pt-4">
				<Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={handleEventDelete}>
					Löschen
				</Button>
			</div>
		</div>
	);
}
