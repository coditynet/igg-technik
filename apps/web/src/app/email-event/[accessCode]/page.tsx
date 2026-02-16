"use client";

import { api } from "@igg/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { goeyToast } from "goey-toast";
import { AlertCircle, Mail } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type FormState = {
	title: string;
	description: string;
	location: string;
	label: string;
	startDate: string;
	startTime: string;
	endDate: string;
	endTime: string;
	allDay: boolean;
};

function getDefaultFormState(): FormState {
	return {
		title: "",
		description: "",
		location: "",
		label: "",
		startDate: "",
		startTime: "",
		endDate: "",
		endTime: "",
		allDay: false,
	};
}

function BrutalistLoader() {
	return (
		<div className="relative h-[2px] w-16 overflow-hidden bg-[#222]">
			<div
				className="absolute inset-y-0 left-0 w-1/2 bg-[#ff3d00]"
				style={{ animation: "scanBar 0.8s ease-in-out infinite" }}
			/>
			<style>{`
				@keyframes scanBar {
					0% { left: -50%; }
					100% { left: 100%; }
				}
			`}</style>
		</div>
	);
}

export default function EmailEventPage() {
	const params = useParams();
	const accessId = params.accessCode as string;

	const registration = useQuery(api.mail.publicAccess.getByAccessCode, {
		accessId,
	});
	const updateRegistration = useMutation(
		api.mail.publicAccess.updateByAccessCode,
	);

	const [isSaving, setIsSaving] = useState(false);
	const [form, setForm] = useState<FormState>(getDefaultFormState);

	useEffect(() => {
		if (!registration) return;
		const source = registration.event || registration;

		setForm({
			title: source.title || "",
			description: source.description || "",
			location: source.location || "",
			label: source.label || "",
			startDate: source.start
				? format(new Date(source.start), "yyyy-MM-dd")
				: "",
			startTime: source.start ? format(new Date(source.start), "HH:mm") : "",
			endDate: source.end ? format(new Date(source.end), "yyyy-MM-dd") : "",
			endTime: source.end ? format(new Date(source.end), "HH:mm") : "",
			allDay: source.allDay || false,
		});
	}, [registration]);

	const isEventCreated = !!registration?.eventId;

	const missingFields = useMemo(() => {
		const missing: string[] = [];
		if (!form.title.trim()) missing.push("Titel");
		if (!form.description.trim()) missing.push("Beschreibung");
		if (!form.location.trim()) missing.push("Ort");
		if (!form.startDate) missing.push("Startdatum");
		if (!form.endDate) missing.push("Enddatum");
		if (!form.allDay && !form.startTime) missing.push("Startzeit");
		if (!form.allDay && !form.endTime) missing.push("Endzeit");
		return missing;
	}, [form]);

	const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isEventCreated) return;

		const start = form.startDate
			? form.allDay
				? new Date(form.startDate).getTime()
				: form.startTime
					? new Date(`${form.startDate}T${form.startTime}`).getTime()
					: undefined
			: undefined;

		const end = form.endDate
			? form.allDay
				? new Date(form.endDate).getTime()
				: form.endTime
					? new Date(`${form.endDate}T${form.endTime}`).getTime()
					: undefined
			: undefined;

		if (
			start === undefined ||
			end === undefined ||
			Number.isNaN(start) ||
			Number.isNaN(end)
		) {
			goeyToast.error("Bitte geben Sie gültige Start- und Enddaten an.");
			return;
		}

		if (end < start) {
			goeyToast.error("Das Enddatum darf nicht vor dem Startdatum liegen.");
			return;
		}

		setIsSaving(true);
		try {
			await updateRegistration({
				accessId,
				title: form.title.trim() || undefined,
				description: form.description.trim() || undefined,
				location: form.location.trim() || undefined,
				label: form.label.trim() || undefined,
				start,
				end,
				allDay: form.allDay || undefined,
			});
			goeyToast.success("Event-Informationen erfolgreich gespeichert");
		} catch (_error) {
			goeyToast.error("Fehler beim Speichern der Informationen");
		} finally {
			setIsSaving(false);
		}
	};

	if (registration === undefined) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
				<BrutalistLoader />
			</div>
		);
	}

	if (!registration) {
		return (
			<div className="min-h-screen bg-[#0a0a0a] px-6 py-20 text-[#e8e4de]">
				<div className="mx-auto max-w-[900px] border border-[#222] bg-[#0f0f0f] p-8">
					<div className="mb-2 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
						Ungültig
					</div>
					<h1 className="font-black text-3xl uppercase tracking-tight">
						Event Registrierung nicht gefunden
					</h1>
					<p className="mt-3 font-mono text-[#777] text-xs">
						Der Link ist ungültig oder bereits abgelaufen.
					</p>
					<div className="mt-8">
						<Link
							href={"/" as Route}
							className="inline-flex bg-[#ff3d00] px-4 py-2 font-mono text-[10px] text-black uppercase tracking-[0.2em]"
						>
							Zur Startseite
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] text-[#e8e4de] selection:bg-[#ff3d00] selection:text-black">
			<div
				className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
				style={{
					backgroundImage:
						"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
				}}
			/>

			<nav className="fixed top-0 right-0 left-0 z-40 border-[#222] border-b">
				<div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
					<Link
						href={"/" as Route}
						className="font-mono text-[#666] text-xs uppercase tracking-[0.2em] transition-colors hover:text-[#e8e4de]"
					>
						Zurück
					</Link>
					<span className="font-mono text-sm uppercase tracking-[0.3em]">
						IGG Technik
					</span>
				</div>
			</nav>

			<div className="relative z-10 mx-auto max-w-[1100px] px-6 pt-28 pb-16">
				<div className="mb-8">
					<div className="mb-2 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
						Event Request
					</div>
					<h1 className="font-black text-[clamp(2rem,5vw,3.5rem)] uppercase leading-[0.9] tracking-[-0.03em]">
						{isEventCreated ? "Event bestätigt" : "Event Angaben prüfen"}
					</h1>
					<p className="mt-3 max-w-3xl font-mono text-[#777] text-xs leading-relaxed">
						{isEventCreated
							? "Dieses Event wurde bereits übernommen und ist nicht mehr bearbeitbar."
							: "Die Daten wurden aus Ihrer E-Mail übernommen. Bitte prüfen und korrigieren Sie alle Angaben vor dem Speichern."}
					</p>
				</div>

				<div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
					<div className="border border-[#222] bg-[#0f0f0f] p-6">
						<form onSubmit={handleSave} className="space-y-5">
							{!isEventCreated && missingFields.length > 0 && (
								<div className="border border-[#ff3d00]/40 bg-[#ff3d00]/10 p-3 font-mono text-[#ff3d00] text-xs">
									<AlertCircle className="mr-2 inline h-4 w-4 align-text-top" />
									Fehlende Felder: {missingFields.join(", ")}
								</div>
							)}

							<div className="space-y-2">
								<Label
									htmlFor="title"
									className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]"
								>
									Titel
								</Label>
								<Input
									id="title"
									value={form.title}
									onChange={(e) =>
										setForm((prev) => ({ ...prev, title: e.target.value }))
									}
									className="border-[#222] bg-[#111] font-mono"
									disabled={isEventCreated || isSaving}
								/>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="description"
									className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]"
								>
									Beschreibung
								</Label>
								<Textarea
									id="description"
									value={form.description}
									onChange={(e) =>
										setForm((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
									className="border-[#222] bg-[#111] font-mono"
									disabled={isEventCreated || isSaving}
								/>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label
										htmlFor="location"
										className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]"
									>
										Ort
									</Label>
									<Input
										id="location"
										value={form.location}
										onChange={(e) =>
											setForm((prev) => ({ ...prev, location: e.target.value }))
										}
										className="border-[#222] bg-[#111] font-mono"
										disabled={isEventCreated || isSaving}
									/>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="label"
										className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]"
									>
										Label
									</Label>
									<Input
										id="label"
										value={form.label}
										onChange={(e) =>
											setForm((prev) => ({ ...prev, label: e.target.value }))
										}
										className="border-[#222] bg-[#111] font-mono"
										disabled={isEventCreated || isSaving}
									/>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<Checkbox
									id="all-day"
									checked={form.allDay}
									onCheckedChange={(checked) =>
										setForm((prev) => ({ ...prev, allDay: checked === true }))
									}
									disabled={isEventCreated || isSaving}
								/>
								<Label
									htmlFor="all-day"
									className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]"
								>
									Ganztägig
								</Label>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label
										htmlFor="start-date"
										className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]"
									>
										Startdatum
									</Label>
									<Input
										id="start-date"
										type="date"
										value={form.startDate}
										onChange={(e) =>
											setForm((prev) => ({
												...prev,
												startDate: e.target.value,
											}))
										}
										className="border-[#222] bg-[#111] font-mono"
										disabled={isEventCreated || isSaving}
									/>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="end-date"
										className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]"
									>
										Enddatum
									</Label>
									<Input
										id="end-date"
										type="date"
										value={form.endDate}
										onChange={(e) =>
											setForm((prev) => ({ ...prev, endDate: e.target.value }))
										}
										className="border-[#222] bg-[#111] font-mono"
										disabled={isEventCreated || isSaving}
									/>
								</div>
							</div>

							{!form.allDay && (
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label
											htmlFor="start-time"
											className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]"
										>
											Startzeit
										</Label>
										<Input
											id="start-time"
											type="time"
											value={form.startTime}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													startTime: e.target.value,
												}))
											}
											className="border-[#222] bg-[#111] font-mono"
											disabled={isEventCreated || isSaving}
										/>
									</div>
									<div className="space-y-2">
										<Label
											htmlFor="end-time"
											className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]"
										>
											Endzeit
										</Label>
										<Input
											id="end-time"
											type="time"
											value={form.endTime}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													endTime: e.target.value,
												}))
											}
											className="border-[#222] bg-[#111] font-mono"
											disabled={isEventCreated || isSaving}
										/>
									</div>
								</div>
							)}

							<div className="flex items-center justify-end gap-2 border-[#222] border-t pt-5">
								{registration.eventId && (
									<span className="inline-flex border border-emerald-500/40 bg-emerald-500/15 px-2 py-1 font-mono text-[10px] text-emerald-300 uppercase tracking-[0.15em]">
										Event erstellt
									</span>
								)}
								{!isEventCreated && (
									<Button
										type="submit"
										disabled={isSaving}
										className="bg-[#ff3d00] font-mono text-[10px] text-black uppercase tracking-[0.2em] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#ff3d00] hover:shadow-[5px_5px_0_0_rgba(255,61,0,0.3)]"
									>
										{isSaving ? "Speichert..." : "Speichern"}
									</Button>
								)}
							</div>
						</form>
					</div>

					<div className="space-y-6">
						<div className="border border-[#222] bg-[#0f0f0f] p-5">
							<div className="mb-3 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
								E-Mail Quelle
							</div>
							{registration.email ? (
								<div className="space-y-3 font-mono text-[#888] text-xs">
									<div className="flex items-start gap-2">
										<Mail className="mt-0.5 h-4 w-4 text-[#ff3d00]" />
										<div>
											<p className="text-[#666]">Von</p>
											<p className="text-[#e8e4de]">
												{registration.email.from}
											</p>
										</div>
									</div>
									<div>
										<p className="text-[#666]">Betreff</p>
										<p className="text-[#e8e4de]">
											{registration.email.subject}
										</p>
									</div>
									<div>
										<p className="text-[#666]">Empfangen</p>
										<p className="text-[#e8e4de]">
											{format(new Date(registration.email.receivedAt), "PPp", {
												locale: de,
											})}
										</p>
									</div>
								</div>
							) : (
								<Skeleton className="h-20 w-full bg-[#111]" />
							)}
						</div>

						<div className="border border-[#222] bg-[#0f0f0f] p-5">
							<div className="mb-3 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
								Hinweis
							</div>
							<p className="font-mono text-[#777] text-xs leading-relaxed">
								Wenn Ihr Event bereits erstellt wurde, sind Änderungen hier
								nicht mehr möglich. Kontaktieren Sie in diesem Fall direkt das
								IGG Technik Team.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
