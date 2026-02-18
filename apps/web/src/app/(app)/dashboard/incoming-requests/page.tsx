"use client";

import { api } from "@igg/backend/convex/_generated/api";
import type { Id } from "@igg/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { goeyToast } from "goey-toast";
import { useState } from "react";
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
			goeyToast.success("Event erstellt");
			window.location.href = `/dashboard/events/${eventId}`;
		} catch (_error) {
			goeyToast.error("Event konnte nicht erstellt werden");
		} finally {
			setProcessingId(null);
		}
	};

	return (
		<div className="max-w-6xl space-y-4">
			<div>
				<div className="mb-2 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
					Verwaltung
				</div>
				<h1 className="font-black text-3xl uppercase tracking-tight">
					Incoming Requests
				</h1>
				<p className="font-mono text-[#777] text-xs">
					Anfragen von Lehrkräften zur Event-Erstellung
				</p>
			</div>

			{requests === undefined ? (
				<div className="border border-[#222] bg-[#0f0f0f]">
					<Table>
						<TableHeader>
							<TableRow className="border-[#222] hover:bg-transparent">
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Veranstaltung
								</TableHead>
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Anfragende Person
								</TableHead>
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Gruppe
								</TableHead>
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Status
								</TableHead>
								<TableHead className="text-right font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Eingegangen
								</TableHead>
								<TableHead className="text-right font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Aktion
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 5 }).map((_, index) => (
								<TableRow
									key={`request-loading-${index + 1}`}
									className="border-[#1c1c1c] hover:bg-transparent"
								>
									<TableCell>
										<Skeleton className="h-4 w-[85%] bg-[#111]" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-[75%] bg-[#111]" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-20 bg-[#111]" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-6 w-24 bg-[#111]" />
									</TableCell>
									<TableCell className="text-right">
										<Skeleton className="ml-auto h-4 w-20 bg-[#111]" />
									</TableCell>
									<TableCell className="text-right">
										<Skeleton className="ml-auto h-8 w-28 bg-[#111]" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			) : !requests || requests.length === 0 ? (
				<div className="flex h-[400px] items-center justify-center border border-[#222] bg-[#0f0f0f]">
					<p className="font-mono text-[#777] text-xs">
						Keine Anfragen vorhanden
					</p>
				</div>
			) : (
				<div className="border border-[#222] bg-[#0f0f0f]">
					<Table>
						<TableHeader>
							<TableRow className="border-[#222] hover:bg-transparent">
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Veranstaltung
								</TableHead>
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Anfragende Person
								</TableHead>
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Gruppe
								</TableHead>
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Status
								</TableHead>
								<TableHead className="text-right font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Eingegangen
								</TableHead>
								<TableHead className="text-right font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Aktion
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{requests.map((request) => {
								const canCreateEvent =
									request.status === "pending" && !request.eventId;
								return (
									<TableRow
										key={request._id}
										className="border-[#1c1c1c] hover:bg-[#ff3d00]/5"
									>
										<TableCell>
											<div className="space-y-1">
												<p className="font-medium text-[#e8e4de]">
													{request.title}
												</p>
												{request.location && (
													<p className="font-mono text-[#888] text-xs">
														Ort: {request.location}
													</p>
												)}
												{request.inventory && request.inventory.length > 0 ? (
													<div className="pt-1">
														<p className="mb-1 font-mono text-[#777] text-[10px] uppercase tracking-[0.15em]">
															Technik
														</p>
														<div className="flex flex-wrap gap-1.5">
															{request.inventory.map((item) => (
																<span
																	key={item.itemId}
																	className="inline-flex items-center gap-1 border border-[#333] bg-[#111] px-2 py-1 font-mono text-[#b9b1a8] text-[10px] uppercase tracking-[0.08em]"
																>
																	{item.name} ({item.count})
																	{item.isDeleted ? (
																		<span className="text-red-300">
																			gelöscht
																		</span>
																	) : null}
																</span>
															))}
														</div>
													</div>
												) : null}
											</div>
										</TableCell>
										<TableCell>
											<div className="space-y-1">
												<p className="font-medium text-[#e8e4de]">
													{request.requesterName}
												</p>
												<p className="font-mono text-[#888] text-xs">
													{request.requesterEmail}
												</p>
											</div>
										</TableCell>
										<TableCell className="font-mono text-[#888] text-xs">
											{request.group?.name ?? "-"}
										</TableCell>
										<TableCell>
											<span
												className={
													request.status === "approved"
														? "inline-flex border border-emerald-500/40 bg-emerald-500/15 px-2 py-1 font-mono text-[10px] text-emerald-300 uppercase tracking-[0.15em]"
														: request.status === "rejected"
															? "inline-flex border border-red-500/40 bg-red-500/15 px-2 py-1 font-mono text-[10px] text-red-300 uppercase tracking-[0.15em]"
															: "inline-flex border border-[#ff3d00]/40 bg-[#ff3d00]/15 px-2 py-1 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.15em]"
												}
											>
												{request.status === "approved"
													? "Genehmigt"
													: request.status === "rejected"
														? "Abgelehnt"
														: "Ausstehend"}
											</span>
										</TableCell>
										<TableCell className="text-right font-mono text-[#888] text-xs">
											{formatDistanceToNow(new Date(request.createdAt), {
												addSuffix: true,
												locale: de,
											})}
										</TableCell>
										<TableCell className="text-right">
											<Button
												size="sm"
												disabled={
													!canCreateEvent || processingId === request._id
												}
												onClick={() => handleCreateEvent(request._id)}
												className="bg-[#ff3d00] font-mono text-[10px] text-black uppercase tracking-[0.1em] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#ff3d00] hover:shadow-[5px_5px_0_0_rgba(255,61,0,0.3)] disabled:opacity-50"
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
			)}
		</div>
	);
}
