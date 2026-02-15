"use client";

import { api } from "@igg/backend/convex/_generated/api";
import type { Id } from "@igg/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export default function IncomingRequestsPage() {
	const requests = useQuery(api.events.listRegistrations, {});
	const createEventFromRegistration = useMutation(
		api.events.createEventFromRegistration,
	);
	const [processingId, setProcessingId] = useState<string | null>(null);

	const handleCreateEvent = async (
		registrationId: Id<"eventRegistrations">,
	) => {
		setProcessingId(registrationId);
		try {
			const eventId = await createEventFromRegistration({
				registrationId,
			});
			toast.success("Event aus Anfrage erstellt");
			window.location.href = `/dashboard/events/${eventId}`;
		} catch (_error) {
			toast.error("Event konnte nicht erstellt werden");
		} finally {
			setProcessingId(null);
		}
	};

	if (requests === undefined) {
		return (
			<div className="space-y-4">
				<div className="space-y-2">
					<Skeleton className="h-9 w-80" />
					<Skeleton className="h-5 w-96" />
				</div>
				<Skeleton className="h-[420px] w-full" />
			</div>
		);
	}

	if (!requests || requests.length === 0) {
		return (
			<div className="space-y-4">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">
						Incoming Requests
					</h1>
					<p className="text-muted-foreground">
						Anfragen von Lehrkräften zur Event-Erstellung
					</p>
				</div>
				<div className="flex h-[400px] items-center justify-center rounded-lg border">
					<p className="text-muted-foreground">Keine Anfragen vorhanden</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-6xl space-y-4">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Incoming Requests</h1>
				<p className="text-muted-foreground">
					Anfragen von Lehrkräften zur Event-Erstellung
				</p>
			</div>

			<div className="rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Veranstaltung</TableHead>
							<TableHead>Anfragende Person</TableHead>
							<TableHead>Gruppe</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Eingegangen</TableHead>
							<TableHead className="text-right">Aktion</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{requests.map((request) => {
							const canCreateEvent =
								request.status === "pending" && !request.eventId;
							return (
								<TableRow key={request._id}>
									<TableCell>
										<div className="space-y-1">
											<p className="font-medium">{request.title}</p>
											{request.location && (
												<p className="text-muted-foreground text-xs">
													Ort: {request.location}
												</p>
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className="space-y-1">
											<p className="font-medium">{request.requesterName}</p>
											<p className="text-muted-foreground text-xs">
												{request.requesterEmail}
											</p>
										</div>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{request.group?.name ?? "-"}
									</TableCell>
									<TableCell>
										{request.status === "approved" ? (
											<Badge className="bg-emerald-500">Genehmigt</Badge>
										) : request.status === "rejected" ? (
											<Badge variant="destructive">Abgelehnt</Badge>
										) : (
											<Badge variant="secondary">Ausstehend</Badge>
										)}
									</TableCell>
									<TableCell className="text-right text-muted-foreground">
										{formatDistanceToNow(new Date(request.createdAt), {
											addSuffix: true,
											locale: de,
										})}
									</TableCell>
									<TableCell className="text-right">
										<Button
											size="sm"
											disabled={!canCreateEvent || processingId === request._id}
											onClick={() => handleCreateEvent(request._id)}
										>
											{processingId === request._id
												? "Erstelle..."
												: request.eventId
													? "Erstellt"
													: "Event erstellen"}
										</Button>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
