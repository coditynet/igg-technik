"use client";

import { api } from "@igg/backend/convex/_generated/api";
import type { Id } from "@igg/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner"
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function toDateTimeLocalValue(date: Date) {
	const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
	return localDate.toISOString().slice(0, 16);
}

function getDefaultForm() {
	const start = new Date();
	const end = new Date(start.getTime() + 60 * 60 * 1000);

	return {
		requesterName: "",
		requesterEmail: "",
		title: "",
		description: "",
		start: toDateTimeLocalValue(start),
		end: toDateTimeLocalValue(end),
		allDay: false,
		groupId: "",
		label: "",
		location: "",
		teacher: "",
		notes: "",
	};
}

export default function EventRequestPage() {
	const groups = useQuery(api.groups.list);
	const submitRegistration = useMutation(api.events.submitRegistration);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [form, setForm] = useState(getDefaultForm);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!form.requesterName.trim()) {
			toast.error("Bitte geben Sie Ihren Namen ein.");
			return;
		}
		if (!form.requesterEmail.trim()) {
			toast.error("Bitte geben Sie Ihre E-Mail-Adresse ein.");
			return;
		}
		if (!form.title.trim()) {
			toast.error("Bitte geben Sie einen Titel ein.");
			return;
		}
		if (!form.groupId) {
			toast.error("Bitte wählen Sie eine Gruppe aus.");
			return;
		}

		const startDate = new Date(form.start);
		const endDate = new Date(form.end);
		if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
			toast.error("Bitte geben Sie gültige Start- und Endzeiten ein.");
			return;
		}
		if (endDate < startDate) {
			toast.error("Die Endzeit darf nicht vor der Startzeit liegen.");
			return;
		}

		setIsSubmitting(true);
		try {
			await submitRegistration({
				requesterName: form.requesterName.trim(),
				requesterEmail: form.requesterEmail.trim(),
				title: form.title.trim(),
				description: form.description.trim() || undefined,
				start: startDate.toISOString(),
				end: endDate.toISOString(),
				allDay: form.allDay,
				groupId: form.groupId as Id<"groups">,
				label: form.label.trim() || undefined,
				location: form.location.trim() || undefined,
				teacher: form.teacher.trim() || undefined,
				notes: form.notes.trim() || undefined,
			});
			setSubmitted(true);
			setForm(getDefaultForm());
			toast.success("Anfrage gesendet");
		} catch (_error) {
			toast.error("Anfrage konnte nicht gesendet werden");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6">
			<div className="space-y-2">
				<h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
					Veranstaltung einreichen
				</h1>
				<p className="max-w-2xl text-muted-foreground">
					Lehrkräfte und Teams können hier neue Veranstaltungen anfragen. Die
					Anfrage landet direkt im Dashboard unter Incoming Requests.
				</p>
			</div>

			{submitted && (
				<div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-700 text-sm">
					Ihre Anfrage wurde gespeichert und wird zeitnah geprüft.
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="grid gap-8 rounded-2xl border bg-card p-6 sm:p-8"
			>
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="requesterName">Name</Label>
						<Input
							id="requesterName"
							value={form.requesterName}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, requesterName: e.target.value }))
							}
							placeholder="Max Mustermann"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="requesterEmail">E-Mail</Label>
						<Input
							id="requesterEmail"
							type="email"
							value={form.requesterEmail}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, requesterEmail: e.target.value }))
							}
							placeholder="max@schule.de"
							required
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="title">Titel</Label>
					<Input
						id="title"
						value={form.title}
						onChange={(e) =>
							setForm((prev) => ({ ...prev, title: e.target.value }))
						}
						placeholder="z. B. Elternabend Informatik"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="groupId">Gruppe</Label>
					<Select
						value={form.groupId}
						onValueChange={(value) =>
							setForm((prev) => ({ ...prev, groupId: value }))
						}
					>
						<SelectTrigger id="groupId">
							<SelectValue placeholder="Gruppe auswählen" />
						</SelectTrigger>
						<SelectContent>
							{groups?.map((group) => (
								<SelectItem key={group._id} value={group._id}>
									{group.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="start">Start</Label>
						<Input
							id="start"
							type="datetime-local"
							value={form.start}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, start: e.target.value }))
							}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="end">Ende</Label>
						<Input
							id="end"
							type="datetime-local"
							value={form.end}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, end: e.target.value }))
							}
							required
						/>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Checkbox
						id="allDay"
						checked={form.allDay}
						onCheckedChange={(checked) =>
							setForm((prev) => ({ ...prev, allDay: checked === true }))
						}
					/>
					<Label htmlFor="allDay">Ganztägig</Label>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="location">Ort</Label>
						<Input
							id="location"
							value={form.location}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, location: e.target.value }))
							}
							placeholder="Aula"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="teacher">Lehrkraft</Label>
						<Input
							id="teacher"
							value={form.teacher}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, teacher: e.target.value }))
							}
							placeholder="Herr Beispiel"
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="label">Label</Label>
					<Input
						id="label"
						value={form.label}
						onChange={(e) =>
							setForm((prev) => ({ ...prev, label: e.target.value }))
						}
						placeholder="Prüfung, Projekt, Vortrag ..."
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="description">Beschreibung</Label>
					<Textarea
						id="description"
						value={form.description}
						onChange={(e) =>
							setForm((prev) => ({ ...prev, description: e.target.value }))
						}
						placeholder="Worum geht es bei der Veranstaltung?"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="notes">Interne Hinweise</Label>
					<Textarea
						id="notes"
						value={form.notes}
						onChange={(e) =>
							setForm((prev) => ({ ...prev, notes: e.target.value }))
						}
						placeholder="Zusätzliche Informationen für das Orga-Team"
					/>
				</div>

				<div className="flex flex-wrap items-center justify-end gap-2">
					<Button variant="ghost" asChild>
						<Link href="/dashboard">Zum Dashboard</Link>
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Wird gesendet..." : "Anfrage senden"}
					</Button>
				</div>
			</form>
		</div>
	);
}
