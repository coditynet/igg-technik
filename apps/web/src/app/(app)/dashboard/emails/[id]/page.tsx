"use client";

import { api } from "@igg/backend/convex/_generated/api";
import type { Id } from "@igg/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";
import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { CopyButton } from "@/components/animate-ui/components/buttons/copy";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmailDetailPage() {
	const params = useParams();
	const router = useRouter();
	const emailId = params.id as Id<"emails">;

	const email = useQuery(api.mail.queries.getEmailById, {
		emailId,
	});

	if (email === undefined) {
		return (
			<div className="max-w-6xl space-y-4">
				<div className="mb-2 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
					Verwaltung
				</div>
				<div className="flex items-center justify-between border border-[#222] bg-[#0f0f0f] px-4 py-3">
					<Skeleton className="h-8 w-28 bg-[#111]" />
					<div className="flex items-center gap-2">
						<Skeleton className="h-6 w-24 bg-[#111]" />
						<Skeleton className="h-6 w-32 bg-[#111]" />
					</div>
				</div>
				<div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
					<div className="space-y-4 border border-[#222] bg-[#0f0f0f] p-5">
						<Skeleton className="h-8 w-2/3 bg-[#111]" />
						<Skeleton className="h-4 w-1/2 bg-[#111]" />
						<Skeleton className="h-4 w-2/3 bg-[#111]" />
						<Skeleton className="h-4 w-1/3 bg-[#111]" />
						<Skeleton className="h-px w-full bg-[#222]" />
						<Skeleton className="h-52 w-full bg-[#111]" />
					</div>
					<div className="border border-[#222] bg-[#0f0f0f] p-5">
						<Skeleton className="h-6 w-44 bg-[#111]" />
						<div className="mt-4 space-y-3">
							<Skeleton className="h-4 w-full bg-[#111]" />
							<Skeleton className="h-4 w-full bg-[#111]" />
							<Skeleton className="h-4 w-2/3 bg-[#111]" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!email) {
		return (
			<div className="max-w-6xl space-y-4">
				<div className="mb-2 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
					Verwaltung
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.push("/dashboard/emails" as Route)}
					className="w-fit border border-[#222] bg-[#111] font-mono text-[#e8e4de] text-[10px] uppercase tracking-[0.2em] hover:bg-[#151515]"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Zurück
				</Button>
				<div className="flex h-[320px] items-center justify-center border border-[#222] bg-[#0f0f0f]">
					<p className="font-mono text-[#777] text-xs uppercase tracking-[0.15em]">
						E-Mail nicht gefunden
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-6xl space-y-4">
			<div className="mb-2 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
				Verwaltung
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3 border border-[#222] bg-[#0f0f0f] px-4 py-3">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.push("/dashboard/emails" as Route)}
					className="w-fit border border-[#222] bg-[#111] font-mono text-[#e8e4de] text-[10px] uppercase tracking-[0.2em] hover:bg-[#151515]"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Zurück
				</Button>

				<div className="flex items-center gap-2">
					<span
						className={
							email.processed
								? "inline-flex border border-emerald-500/40 bg-emerald-500/15 px-2 py-1 font-mono text-[10px] text-emerald-300 uppercase tracking-[0.15em]"
								: "inline-flex border border-[#ff3d00]/40 bg-[#ff3d00]/15 px-2 py-1 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.15em]"
						}
					>
						{email.processed ? "Verarbeitet" : "Ausstehend"}
					</span>

					{email.registration?.responseSent && (
						<span className="inline-flex border border-emerald-500/40 bg-emerald-500/15 px-2 py-1 font-mono text-[10px] text-emerald-300 uppercase tracking-[0.15em]">
							Antwort gesendet
						</span>
					)}
				</div>
			</div>

			<div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
				<div className="space-y-6 border border-[#222] bg-[#0f0f0f] p-5">
					<div>
						<h2 className="mb-4 font-black text-2xl text-[#e8e4de] uppercase tracking-tight">
							{email.subject || "(Kein Betreff)"}
						</h2>
						<div className="space-y-3 font-mono text-[#888] text-xs">
							<div className="flex items-center gap-2">
								<span className="w-24 text-[#666]">Von:</span>
								<span className="text-[#e8e4de]">{email.from}</span>
								<CopyButton variant="ghost" size="sm" content={email.from} />
							</div>
							<div className="flex items-center gap-2">
								<span className="w-24 text-[#666]">An:</span>
								<span className="text-[#e8e4de]">{email.to.join(", ")}</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="w-24 text-[#666]">Empfangen:</span>
								<span className="text-[#e8e4de]">
									{format(new Date(email.receivedAt), "PPpp", { locale: de })}
								</span>
							</div>
						</div>
					</div>

					<div className="h-px bg-[#222]" />

					<div>
						<div className="mb-3 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
							Inhalt
						</div>
						<div className="border border-[#222] bg-[#111] p-4">
							<pre className="whitespace-pre-wrap font-mono text-[#e8e4de] text-sm">
								{email.text || "Kein Textinhalt verfügbar"}
							</pre>
						</div>
					</div>
				</div>

				<div className="border border-[#222] bg-[#0f0f0f] p-5">
					<div className="mb-4 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
						Event-Registrierung
					</div>
					{email.registration ? (
						<div className="space-y-4 font-mono text-[#888] text-xs">
							<div>
								<p className="text-[#666]">Titel</p>
								<p className="mt-1 text-[#e8e4de]">
									{email.registration.title || "—"}
								</p>
							</div>

							<div>
								<p className="text-[#666]">Beschreibung</p>
								<p className="mt-1 text-[#e8e4de]">
									{email.registration.description || "—"}
								</p>
							</div>

							<div className="flex items-start gap-2">
								<Calendar className="mt-0.5 h-4 w-4 text-[#ff3d00]" />
								<div>
									<p className="text-[#666]">Start</p>
									<p className="mt-1 text-[#e8e4de]">
										{email.registration.start
											? format(new Date(email.registration.start), "PPpp", {
													locale: de,
												})
											: "—"}
									</p>
								</div>
							</div>

							<div className="flex items-start gap-2">
								<Clock className="mt-0.5 h-4 w-4 text-[#ff3d00]" />
								<div>
									<p className="text-[#666]">Ende</p>
									<p className="mt-1 text-[#e8e4de]">
										{email.registration.end
											? format(new Date(email.registration.end), "PPpp", {
													locale: de,
												})
											: "—"}
									</p>
								</div>
							</div>

							<div className="flex items-start gap-2">
								<MapPin className="mt-0.5 h-4 w-4 text-[#ff3d00]" />
								<div>
									<p className="text-[#666]">Ort</p>
									<p className="mt-1 text-[#e8e4de]">
										{email.registration.location || "—"}
									</p>
								</div>
							</div>

							<div>
								<p className="text-[#666]">Label</p>
								<p className="mt-1 text-[#e8e4de]">
									{email.registration.label || "—"}
								</p>
							</div>

							<div>
								<p className="text-[#666]">Ganztägig</p>
								<p className="mt-1 text-[#e8e4de]">
									{email.registration.allDay ? "Ja" : "Nein"}
								</p>
							</div>

							<div>
								<p className="text-[#666]">Access Code</p>
								<p className="mt-1 break-all text-[#e8e4de]">
									{email.registration.accessId}
								</p>
							</div>

							<div>
								<p className="text-[#666]">Antwort versendet</p>
								<p className="mt-1 text-[#e8e4de]">
									{email.registration.responseSent ? "Ja" : "Nein"}
								</p>
							</div>

							<div className="border-[#222] border-t pt-4">
								{email.registration.eventId ? (
									<div className="space-y-2">
										<span className="inline-flex w-full justify-center border border-emerald-500/40 bg-emerald-500/15 px-2 py-2 font-mono text-[10px] text-emerald-300 uppercase tracking-[0.15em]">
											Event erstellt
										</span>
										<p className="break-all text-center text-[#888] text-[10px]">
											{email.registration.eventId}
										</p>
									</div>
								) : (
									<span className="inline-flex w-full justify-center border border-[#ff3d00]/40 bg-[#ff3d00]/15 px-2 py-2 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.15em]">
										Ausstehende Erstellung
									</span>
								)}
							</div>
						</div>
					) : (
						<p className="font-mono text-[#777] text-xs uppercase tracking-[0.15em]">
							Keine Registrierung vorhanden
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
