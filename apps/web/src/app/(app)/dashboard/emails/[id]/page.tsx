"use client";

import { api } from "@igg/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, MapPin, Clock, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Id } from "@igg/backend/convex/_generated/dataModel";
import {
	CopyButton,
	type CopyButtonProps,
} from '@/components/animate-ui/components/buttons/copy';

export default function EmailDetailPage() {
	const params = useParams();
	const router = useRouter();
	const emailId = params.id as Id<"emails">;
	const [copied, setCopied] = useState(false);

	const email = useQuery(api.mail.queries.getEmailById, {
		emailId,
	});
	if (email === undefined) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-9 w-48" />
				<Skeleton className="h-[600px] w-full" />
			</div>
		);
	}

	if (!email) {
		return (
			<div className="space-y-6">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.push("/dashboard/emails" as any)}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Zurück
				</Button>
				<div className="flex h-[400px] items-center justify-center rounded-lg border">
					<div className="text-center text-muted-foreground">
						E-Mail nicht gefunden
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.push("/dashboard/emails" as any)}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Zurück
				</Button>
				<div className="flex items-center gap-2">
					{email.processed ? (
						<Badge variant="default" className="bg-emerald-500">
							Verarbeitet
						</Badge>
					) : (
						<Badge variant="secondary">Ausstehend</Badge>
					)}
					{email.registration?.responseSent && (
						<Badge variant="outline">Antwort gesendet</Badge>
					)}
				</div>
			</div>

			<div className="grid gap-8 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-8">
					<div>
						<h2 className="font-semibold text-xl mb-4">
							{email.subject || "(Kein Betreff)"}
						</h2>

						<div className="space-y-3 text-sm">
							<div className="flex items-center gap-2">
								<span className="text-muted-foreground w-24">Von:</span>
								<span>{email.from}</span>
								<CopyButton variant="ghost" size="sm" content={email.from} />
							</div>

							<div className="flex items-center gap-2">
								<span className="text-muted-foreground w-24">An:</span>
								<span>{email.to.join(", ")}</span>
							</div>

							<div className="flex items-center gap-2">
								<span className="text-muted-foreground w-24">Empfangen:</span>
								<span>
									{format(new Date(email.receivedAt), "PPpp", { locale: de })}
								</span>
							</div>
						</div>
					</div>

					<Separator />

					<div>
						<h3 className="font-medium text-sm text-muted-foreground mb-3">
							Inhalt
						</h3>
						<div className="rounded-lg border bg-muted/30 p-4">
							<pre className="whitespace-pre-wrap text-sm font-mono text-foreground/90">
								{email.text || "Kein Textinhalt verfügbar"}
							</pre>
						</div>
					</div>
				</div>

				<div className="lg:col-span-1">
					<Card>
						<CardContent className="pt-6">
							{email.registration ? (
								<div className="space-y-4">
									<div className="flex items-center justify-between mb-4">
										<h3 className="font-semibold">Event-Registrierung</h3>
									</div>

									<div className="space-y-3 text-sm">
										{email.registration.title && (
											<div>
												<p className="text-muted-foreground mb-1">Titel</p>
												<p className="font-medium">
													{email.registration.title}
												</p>
											</div>
										)}

										{email.registration.description && (
											<div>
												<p className="text-muted-foreground mb-1">
													Beschreibung
												</p>
												<p>{email.registration.description}</p>
											</div>
										)}

										{email.registration.start && (
											<div>
												<p className="text-muted-foreground mb-1 flex items-center gap-1">
													<Calendar className="h-3 w-3" />
													Start
												</p>
												<p>
													{format(new Date(email.registration.start), "PPpp", {
														locale: de,
													})}
												</p>
											</div>
										)}

										{email.registration.end && (
											<div>
												<p className="text-muted-foreground mb-1 flex items-center gap-1">
													<Clock className="h-3 w-3" />
													Ende
												</p>
												<p>
													{format(new Date(email.registration.end), "PPpp", {
														locale: de,
													})}
												</p>
											</div>
										)}

										{email.registration.location && (
											<div>
												<p className="text-muted-foreground mb-1 flex items-center gap-1">
													<MapPin className="h-3 w-3" />
													Ort
												</p>
												<p>{email.registration.location}</p>
											</div>
										)}

										{email.registration.allDay && (
											<div>
												<Badge variant="secondary" className="text-xs">
													Ganztägig
												</Badge>
											</div>
										)}
									</div>

									<div className="flex flex-col gap-2 pt-4">
										<Button variant="outline" size="sm" disabled>
											Bearbeiten
										</Button>
										{!email.registration.eventId && (
											<Button size="sm" disabled>
												Event erstellen
											</Button>
										)}
										{email.registration.eventId && (
											<Badge
												variant="default"
												className="bg-emerald-500 justify-center"
											>
												Event erstellt
											</Badge>
										)}
									</div>
								</div>
							) : (
								<div className="text-center py-8">
									<p className="text-sm text-muted-foreground">
										Keine Registrierung vorhanden
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
