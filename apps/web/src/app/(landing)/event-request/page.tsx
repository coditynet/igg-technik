"use client";

import { api } from "@igg/backend/convex/_generated/api";
import type { Id } from "@igg/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { goeyToast } from "goey-toast";
import type { Route } from "next";
import Link from "next/link";
import { type FormEvent, useState } from "react";

type FormState = {
	requesterName: string;
	requesterEmail: string;
	title: string;
	date: string;
	startTime: string;
	endTime: string;
	groupId: string;
	location: string;
	description: string;
	notes: string;
	allDay: boolean;
};

function getDefaultDate() {
	return new Date().toISOString().slice(0, 10);
}

function getInitialFormState(): FormState {
	return {
		requesterName: "",
		requesterEmail: "",
		title: "",
		date: getDefaultDate(),
		startTime: "08:00",
		endTime: "09:00",
		groupId: "",
		location: "",
		description: "",
		notes: "",
		allDay: false,
	};
}

export default function EventRequestPage() {
	const groups = useQuery(api.groups.list);
	const inventoryItems = useQuery(api.inventory.list, {});
	const submitRegistration = useMutation(api.events.submitRegistration);

	const [submitted, setSubmitted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [form, setForm] = useState<FormState>(() => getInitialFormState());
	const [requestedInventory, setRequestedInventory] = useState<
		Record<string, number>
	>({});
	const [requestedInventoryInput, setRequestedInventoryInput] = useState<
		Record<string, string>
	>({});

	const setRequestedCount = (itemId: string, max: number, value: number) => {
		const count = Math.max(0, Math.min(max, Math.trunc(value || 0)));
		setRequestedInventory((prev) => ({
			...prev,
			[itemId]: count,
		}));
	};

	const clearRequestedInputDraft = (itemId: string) => {
		setRequestedInventoryInput((prev) => {
			const next = { ...prev };
			delete next[itemId];
			return next;
		});
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!form.requesterName.trim()) {
			goeyToast.error("Bitte geben Sie Ihren Namen ein.");
			return;
		}
		if (!form.requesterEmail.trim()) {
			goeyToast.error("Bitte geben Sie eine E-Mail-Adresse ein.");
			return;
		}
		if (!form.title.trim()) {
			goeyToast.error("Bitte geben Sie einen Eventnamen ein.");
			return;
		}
		if (!form.groupId) {
			goeyToast.error("Bitte wählen Sie eine Gruppe aus.");
			return;
		}
		if (!form.date) {
			goeyToast.error("Bitte wählen Sie ein Datum aus.");
			return;
		}
		if (!form.allDay && (!form.startTime || !form.endTime)) {
			goeyToast.error("Bitte geben Sie Start- und Endzeit an.");
			return;
		}

		const startIso = form.allDay
			? new Date(`${form.date}T00:00:00`).toISOString()
			: new Date(`${form.date}T${form.startTime}:00`).toISOString();
		const endIso = form.allDay
			? new Date(`${form.date}T23:59:00`).toISOString()
			: new Date(`${form.date}T${form.endTime}:00`).toISOString();

		const startDate = new Date(startIso);
		const endDate = new Date(endIso);
		if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
			goeyToast.error(
				"Bitte geben Sie ein gültiges Datum und gültige Uhrzeiten ein.",
			);
			return;
		}
		if (endDate <= startDate) {
			goeyToast.error("Die Endzeit muss nach der Startzeit liegen.");
			return;
		}

		const requestedInventoryList = Object.entries(requestedInventory)
			.filter(([, count]) => Number.isInteger(count) && count > 0)
			.map(([itemId, count]) => ({
				itemId: itemId as Id<"inventoryItems">,
				count,
			}));

		setIsSubmitting(true);
		try {
			await submitRegistration({
				requesterName: form.requesterName.trim(),
				requesterEmail: form.requesterEmail.trim(),
				title: form.title.trim(),
				description: form.description.trim() || undefined,
				start: startIso,
				end: endIso,
				allDay: form.allDay,
				groupId: form.groupId as Id<"groups">,
				location: form.location.trim() || undefined,
				notes: form.notes.trim() || undefined,
				inventory:
					requestedInventoryList.length > 0
						? requestedInventoryList
						: undefined,
			});

			setSubmitted(true);
			setForm(getInitialFormState());
			setRequestedInventory({});
			setRequestedInventoryInput({});
			goeyToast.success("Anfrage erfolgreich gesendet.");
		} catch (_error) {
			goeyToast.error("Anfrage konnte nicht gesendet werden.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] text-[#e8e4de] selection:bg-[#ff3d00] selection:text-black">
			<div
				className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
				}}
			/>

			<nav className="fixed top-0 right-0 left-0 z-40 border-[#222] border-b bg-[#0a0a0a]/90 backdrop-blur-sm">
				<div className="mx-auto flex max-w-[900px] items-center justify-between px-6 py-4">
					<Link
						href={"/" as Route}
						className="group flex items-center gap-3 font-mono text-[#666] text-xs uppercase tracking-[0.2em] transition-colors hover:text-[#e8e4de]"
					>
						<svg
							aria-hidden="true"
							className="h-4 w-4 transition-transform group-hover:-translate-x-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path d="M19 12H5M12 19l-7-7 7-7" />
						</svg>
						Zurück
					</Link>
					<span className="font-mono text-sm uppercase tracking-[0.3em]">
						IGG Technik
					</span>
				</div>
			</nav>

			<div className="mx-auto max-w-[900px] px-6 pt-32 pb-20">
				<div className="mb-4 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
					Neue Anfrage
				</div>
				<h1
					className="mb-12 font-black text-[clamp(2rem,5vw,4rem)] uppercase leading-[0.9] tracking-[-0.03em]"
					style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif" }}
				>
					Event
					<br />
					<span className="text-[#ff3d00]">anfragen.</span>
				</h1>

				{submitted ? (
					<div className="border border-[#ff3d00]/30 bg-[#ff3d00]/5 p-10">
						<div className="mb-4 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
							Gesendet
						</div>
						<h2 className="mb-4 font-black text-3xl uppercase tracking-tight">
							Anfrage erhalten.
						</h2>
						<p className="mb-8 text-[#888] text-sm leading-relaxed">
							Wir melden uns bald bei Ihnen.
						</p>
						<Link
							href={"/" as Route}
							className="inline-flex items-center gap-3 bg-[#ff3d00] px-6 py-3 font-mono text-black text-sm uppercase tracking-[0.1em] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_rgba(255,61,0,0.3)]"
						>
							Zurück zur Startseite
						</Link>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-0">
						<div className="border-[#222] border-t py-6">
							<label
								htmlFor="requester-name"
								className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]"
							>
								Name
							</label>
							<input
								id="requester-name"
								type="text"
								required
								value={form.requesterName}
								onChange={(event) =>
									setForm((prev) => ({
										...prev,
										requesterName: event.target.value,
									}))
								}
								placeholder="Max Mustermann"
								className="w-full border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none placeholder:text-[#444] focus:border-[#ff3d00]/50"
							/>
						</div>

						<div className="border-[#222] border-t py-6">
							<label
								htmlFor="requester-email"
								className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]"
							>
								E-Mail Adresse
							</label>
							<input
								id="requester-email"
								type="email"
								required
								value={form.requesterEmail}
								onChange={(event) =>
									setForm((prev) => ({
										...prev,
										requesterEmail: event.target.value,
									}))
								}
								placeholder="max@beispiel.de"
								className="w-full border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none placeholder:text-[#444] focus:border-[#ff3d00]/50"
							/>
						</div>

						<div className="border-[#222] border-t py-6">
							<label
								htmlFor="event-title"
								className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]"
							>
								Name des Events
							</label>
							<input
								id="event-title"
								type="text"
								required
								value={form.title}
								onChange={(event) =>
									setForm((prev) => ({ ...prev, title: event.target.value }))
								}
								placeholder="Weihnachtskonzert 2026"
								className="w-full border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none placeholder:text-[#444] focus:border-[#ff3d00]/50"
							/>
						</div>

						<div className="border-[#222] border-t py-6">
							<label
								htmlFor="group-id"
								className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]"
							>
								Gruppe
							</label>
							<select
								id="group-id"
								required
								value={form.groupId}
								onChange={(event) =>
									setForm((prev) => ({ ...prev, groupId: event.target.value }))
								}
								className="w-full border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none focus:border-[#ff3d00]/50"
							>
								<option value="" disabled>
									Gruppe auswählen
								</option>
								{groups?.map((group) => (
									<option key={group._id} value={group._id}>
										{group.name}
									</option>
								))}
							</select>
						</div>

						<div className="grid grid-cols-1 gap-0 border-[#222] border-t md:grid-cols-3">
							<div className="py-6 md:border-[#222] md:border-r md:pr-6">
								<label
									htmlFor="event-date"
									className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]"
								>
									Datum
								</label>
								<input
									id="event-date"
									type="date"
									required
									value={form.date}
									onChange={(event) =>
										setForm((prev) => ({ ...prev, date: event.target.value }))
									}
									className="w-full border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none [color-scheme:dark] focus:border-[#ff3d00]/50"
								/>
							</div>
							<div className="border-[#222] border-t py-6 md:border-t-0 md:border-r md:px-6">
								<label
									htmlFor="event-start-time"
									className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]"
								>
									Startzeit
								</label>
								<input
									id="event-start-time"
									type="time"
									required
									disabled={form.allDay}
									value={form.startTime}
									onChange={(event) =>
										setForm((prev) => ({
											...prev,
											startTime: event.target.value,
										}))
									}
									className="w-full border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none [color-scheme:dark] focus:border-[#ff3d00]/50 disabled:opacity-50"
								/>
							</div>
							<div className="border-[#222] border-t py-6 md:border-t-0 md:pl-6">
								<label
									htmlFor="event-end-time"
									className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]"
								>
									Endzeit
								</label>
								<input
									id="event-end-time"
									type="time"
									required
									disabled={form.allDay}
									value={form.endTime}
									onChange={(event) =>
										setForm((prev) => ({
											...prev,
											endTime: event.target.value,
										}))
									}
									className="w-full border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none [color-scheme:dark] focus:border-[#ff3d00]/50 disabled:opacity-50"
								/>
							</div>
						</div>

						<div className="border-[#222] border-t py-6">
							<label
								htmlFor="all-day"
								className="group inline-flex cursor-pointer items-center gap-3 font-mono text-[#e8e4de] text-xs uppercase tracking-[0.2em]"
							>
								<input
									id="all-day"
									type="checkbox"
									checked={form.allDay}
									onChange={(event) =>
										setForm((prev) => ({
											...prev,
											allDay: event.target.checked,
										}))
									}
									className="h-4 w-4 accent-[#ff3d00]"
								/>
								Ganztägig
							</label>
						</div>

						<div className="border-[#222] border-t py-6">
							<label
								htmlFor="event-location"
								className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]"
							>
								Veranstaltungsort
							</label>
							<input
								id="event-location"
								type="text"
								value={form.location}
								onChange={(event) =>
									setForm((prev) => ({ ...prev, location: event.target.value }))
								}
								placeholder="Aula, Sporthalle, Pausenhof..."
								className="w-full border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none placeholder:text-[#444] focus:border-[#ff3d00]/50"
							/>
						</div>

						<div className="border-[#222] border-t py-6">
							<label
								htmlFor="requested-inventory"
								className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]"
							>
								Benötigte Technik
							</label>
							<div id="requested-inventory" className="sr-only">
								Technik Auswahl
							</div>
							{inventoryItems === undefined ? (
								<div className="font-mono text-[#777] text-xs">
									Lade Technik...
								</div>
							) : inventoryItems.length === 0 ? (
								<div className="font-mono text-[#777] text-xs">
									Keine Technik-Items verfügbar.
								</div>
							) : (
								<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
									{inventoryItems.map((item) => {
										const count = requestedInventory[item._id] ?? 0;
										const checked = count > 0;
										const draftInput = requestedInventoryInput[item._id];
										const amountInputValue = draftInput ?? String(count);
										return (
											<div
												key={item._id}
												className="border border-[#222] bg-[#111] px-4 py-3"
											>
												<label
													htmlFor={`inventory-item-${item._id}`}
													className="flex cursor-pointer items-center justify-between gap-3"
												>
													<div>
														<div className="font-mono text-[#e8e4de] text-xs uppercase tracking-[0.12em]">
															{item.name}
														</div>
														<div className="mt-1 font-mono text-[#777] text-[10px] uppercase tracking-[0.12em]">
															Verfügbar: {item.count}
														</div>
													</div>
													<input
														id={`inventory-item-${item._id}`}
														type="checkbox"
														checked={checked}
														onChange={(event) => {
															if (event.target.checked) {
																setRequestedCount(
																	item._id,
																	item.count,
																	Math.max(1, count),
																);
																clearRequestedInputDraft(item._id);
																return;
															}

															setRequestedCount(item._id, item.count, 0);
															clearRequestedInputDraft(item._id);
														}}
														className="h-4 w-4 accent-[#ff3d00]"
													/>
												</label>
												{checked ? (
													<div className="mt-3 flex items-center justify-between gap-2">
														<span className="font-mono text-[#777] text-[10px] uppercase tracking-[0.12em]">
															Menge
														</span>
														<input
															type="number"
															min={1}
															max={item.count}
															step={1}
															value={amountInputValue}
															onChange={(event) => {
																const raw = event.target.value;
																setRequestedInventoryInput((prev) => ({
																	...prev,
																	[item._id]: raw,
																}));

																const parsed = Number(raw);
																if (
																	raw !== "" &&
																	Number.isFinite(parsed) &&
																	parsed > 0
																) {
																	setRequestedCount(item._id, item.count, parsed);
																}
															}}
															onBlur={() => {
																const raw = requestedInventoryInput[item._id];
																if (raw === undefined) {
																	return;
																}

																const parsed = Number(raw);
																if (
																	raw === "" ||
																	!Number.isFinite(parsed) ||
																	parsed <= 0
																) {
																	setRequestedCount(item._id, item.count, 0);
																	clearRequestedInputDraft(item._id);
																	return;
																}

																setRequestedCount(item._id, item.count, parsed);
																clearRequestedInputDraft(item._id);
															}}
															className="w-20 border border-[#222] bg-[#0d0d0d] px-2 py-1 text-center font-mono text-xs"
														/>
													</div>
												) : null}
											</div>
										);
									})}
								</div>
							)}
						</div>

						<div className="border-[#222] border-t py-6">
							<label
								htmlFor="event-description"
								className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]"
							>
								Zusätzliche Infos
							</label>
							<textarea
								id="event-description"
								rows={4}
								value={form.description}
								onChange={(event) =>
									setForm((prev) => ({
										...prev,
										description: event.target.value,
									}))
								}
								placeholder="Erwartete Teilnehmerzahl, besondere Anforderungen..."
								className="w-full resize-none border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none placeholder:text-[#444] focus:border-[#ff3d00]/50"
							/>
						</div>

						<div className="border-[#222] border-t py-6">
							<label
								htmlFor="event-notes"
								className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]"
							>
								Interne Hinweise
							</label>
							<textarea
								id="event-notes"
								rows={3}
								value={form.notes}
								onChange={(event) =>
									setForm((prev) => ({ ...prev, notes: event.target.value }))
								}
								placeholder="Zusätzliche Hinweise für das Technik-Team"
								className="w-full resize-none border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none placeholder:text-[#444] focus:border-[#ff3d00]/50"
							/>
						</div>

						<div className="border-[#222] border-t pt-8">
							<button
								type="submit"
								disabled={isSubmitting}
								className="group inline-flex items-center gap-3 bg-[#ff3d00] px-8 py-4 font-mono text-black text-sm uppercase tracking-[0.1em] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_rgba(255,61,0,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
							>
								{isSubmitting ? "Wird gesendet..." : "Anfrage senden"}
								<svg
									aria-hidden="true"
									className="h-4 w-4 transition-transform group-hover:translate-x-1"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path d="M5 12h14M12 5l7 7-7 7" />
								</svg>
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
