"use client";

import { api } from "@igg/backend/convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { goeyToast } from "goey-toast";
import { AlertCircle, Mail } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export default function EmailEventPage() {
	const params = useParams();
	const accessId = params.accessCode as string;

	const registration = useQuery(api.mail.publicAccess.getByAccessCode, {
		accessId,
	});

	const updateRegistration = useMutation(
		api.mail.publicAccess.updateByAccessCode,
	);

	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
			location: "",
			startDate: "",
			startTime: "",
			endDate: "",
			endTime: "",
			allDay: false,
		},
		onSubmit: async ({ value }) => {
			try {
				const start =
					value.startDate && value.startTime
						? new Date(`${value.startDate}T${value.startTime}`).getTime()
						: value.startDate
							? new Date(value.startDate).getTime()
							: undefined;
				const end =
					value.endDate && value.endTime
						? new Date(`${value.endDate}T${value.endTime}`).getTime()
						: value.endDate
							? new Date(value.endDate).getTime()
							: undefined;

				await updateRegistration({
					accessId,
					title: value.title.trim() || undefined,
					description: value.description.trim() || undefined,
					location: value.location.trim() || undefined,
					start,
					end,
					allDay: value.allDay || undefined,
				});

				goeyToast.success("Event-Informationen erfolgreich gespeichert");
			} catch (error) {
				console.error("Failed to update registration:", error);
				goeyToast.error("Fehler beim Speichern der Informationen");
			}
		},
	});

	useEffect(() => {
		if (registration) {
			// Use event data if it exists, otherwise use registration data
			const data = registration.event || registration;

			form.setFieldValue("title", data.title || "");
			form.setFieldValue("description", data.description || "");
			form.setFieldValue("location", data.location || "");
			form.setFieldValue("allDay", data.allDay || false);

			if (data.start) {
				const startDateTime = new Date(data.start);
				form.setFieldValue("startDate", format(startDateTime, "yyyy-MM-dd"));
				form.setFieldValue("startTime", format(startDateTime, "HH:mm"));
			}

			if (data.end) {
				const endDateTime = new Date(data.end);
				form.setFieldValue("endDate", format(endDateTime, "yyyy-MM-dd"));
				form.setFieldValue("endTime", format(endDateTime, "HH:mm"));
			}
		}
	}, [registration, form]);

	const missingFields = useMemo(() => {
		const fields: string[] = [];
		const values = form.state.values;

		if (!values.title) fields.push("Titel");
		if (!values.description) fields.push("Beschreibung");
		if (!values.location) fields.push("Ort");
		if (!values.startDate) fields.push("Startdatum");
		if (!values.endDate) fields.push("Enddatum");

		return fields;
	}, [form.state.values]);

	if (registration === undefined) {
		return (
			<div className="min-h-screen bg-background p-4 md:p-8">
				<div className="mx-auto max-w-3xl space-y-6">
					<Skeleton className="h-9 w-48" />
					<Skeleton className="h-[600px] w-full" />
				</div>
			</div>
		);
	}

	if (!registration) {
		return (
			<div className="min-h-screen bg-background p-4 md:p-8">
				<div className="mx-auto max-w-3xl">
					<Card>
						<CardContent className="flex h-[400px] items-center justify-center">
							<div className="text-center">
								<p className="text-muted-foreground">
									Event Registrierung nicht gefunden
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	const isEventCreated = !!registration.eventId;

	return (
		<div className="min-h-screen bg-background p-4 md:p-8">
			<div className="mx-auto max-w-3xl space-y-6">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">
						{isEventCreated ? "Event-Details" : "Event-Details bearbeiten"}
					</h1>
					<p className="mt-2 text-muted-foreground">
						{isEventCreated
							? "Dieses Event wurde bereits akzeptiert und erstellt"
							: "Vervollständigen oder korrigieren Sie die Event-Informationen"}
					</p>
					{!isEventCreated && (
						<p className="mt-2 text-muted-foreground text-sm">
							<span className="font-medium">Hinweis:</span> Die vorausgefüllten
							Daten wurden automatisch aus Ihrer E-Mail extrahiert und können
							fehlerhaft sein. Bitte überprüfen Sie alle Angaben sorgfältig.
						</p>
					)}
				</div>

				{isEventCreated ? (
					<Alert variant="info">
						<AlertCircle />
						<AlertTitle>Event bereits erstellt</AlertTitle>
						<AlertDescription>
							Dieses Event wurde bereits vom IGG Technik Teams akzeptiert und
							kann nicht mehr bearbeitet werden. Falls Sie Änderungen vornehmen
							möchten, wenden Sie sich bitte direkt an das IGG Technik Team.
						</AlertDescription>
					</Alert>
				) : (
					missingFields.length > 0 && (
						<Alert variant="warning">
							<AlertCircle />
							<AlertTitle>Fehlende Informationen!</AlertTitle>
							<AlertDescription>
								Bitte vervollständigen Sie die folgenden Felder:{" "}
								<strong>
									{missingFields.map((field, idx) => (
										<span key={field}>
											{field}
											{idx < missingFields.length - 1 ? ", " : ""}
										</span>
									))}
								</strong>
							</AlertDescription>
						</Alert>
					)
				)}

				{registration.email && (
					<Card>
						<CardHeader>
							<CardTitle className="text-base">E-Mail Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex items-center gap-2 text-sm">
								<Mail className="h-4 w-4 text-muted-foreground" />
								<span className="text-muted-foreground">Von:</span>
								<span>{registration.email.from}</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<span className="text-muted-foreground">Betreff:</span>
								<span>{registration.email.subject}</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<span className="text-muted-foreground">Empfangen:</span>
								<span>
									{format(new Date(registration.email.receivedAt), "PPp", {
										locale: de,
									})}
								</span>
							</div>
						</CardContent>
					</Card>
				)}

				<Card>
					<CardHeader>
						<CardTitle>Event-Informationen</CardTitle>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								form.handleSubmit();
							}}
							className="space-y-6"
						>
							<form.Field name="title">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Titel *</Label>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Event-Titel"
											disabled={isEventCreated}
										/>
									</div>
								)}
							</form.Field>

							<form.Field name="description">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Beschreibung</Label>
										<Textarea
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Event-Beschreibung"
											rows={4}
											disabled={isEventCreated}
										/>
									</div>
								)}
							</form.Field>

							<form.Field name="location">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Ort</Label>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Veranstaltungsort"
											disabled={isEventCreated}
										/>
									</div>
								)}
							</form.Field>

							<Separator />

							<form.Field name="allDay">
								{(field) => (
									<div className="flex items-center space-x-2">
										<Checkbox
											id={field.name}
											checked={field.state.value}
											onCheckedChange={(checked) =>
												field.handleChange(checked as boolean)
											}
											disabled={isEventCreated}
										/>
										<Label
											htmlFor={field.name}
											className={`font-normal text-sm ${!isEventCreated && "cursor-pointer"}`}
										>
											Ganztägiges Event
										</Label>
									</div>
								)}
							</form.Field>

							<div className="grid gap-4 sm:grid-cols-2">
								<form.Field name="startDate">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Startdatum *</Label>
											<Input
												id={field.name}
												name={field.name}
												type="date"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												disabled={isEventCreated}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="allDay">
									{(allDayField) =>
										!allDayField.state.value ? (
											<form.Field name="startTime">
												{(field) => (
													<div className="space-y-2">
														<Label htmlFor={field.name}>Startzeit</Label>
														<Input
															id={field.name}
															name={field.name}
															type="time"
															value={field.state.value}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
															disabled={isEventCreated}
														/>
													</div>
												)}
											</form.Field>
										) : null
									}
								</form.Field>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<form.Field name="endDate">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Enddatum *</Label>
											<Input
												id={field.name}
												name={field.name}
												type="date"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												disabled={isEventCreated}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="allDay">
									{(allDayField) =>
										!allDayField.state.value ? (
											<form.Field name="endTime">
												{(field) => (
													<div className="space-y-2">
														<Label htmlFor={field.name}>Endzeit</Label>
														<Input
															id={field.name}
															name={field.name}
															type="time"
															value={field.state.value}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
															disabled={isEventCreated}
														/>
													</div>
												)}
											</form.Field>
										) : null
									}
								</form.Field>
							</div>

							<Separator />

							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									{registration.responseSent && (
										<Badge variant="outline">Antwort versendet</Badge>
									)}
									{registration.eventId && (
										<Badge variant="default" className="bg-emerald-500">
											Event erstellt
										</Badge>
									)}
								</div>
								{!isEventCreated && (
									<form.Subscribe>
										{(state) => (
											<Button type="submit" disabled={state.isSubmitting}>
												{state.isSubmitting
													? "Wird gespeichert..."
													: "Speichern"}
											</Button>
										)}
									</form.Subscribe>
								)}
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
