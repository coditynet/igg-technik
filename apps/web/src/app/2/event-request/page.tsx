"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

export default function EventRequest2() {
	const [submitted, setSubmitted] = useState(false);

	return (
		<div className="min-h-screen overflow-x-hidden bg-[#FAFAF8] text-[#111] selection:bg-[#4D96FF]/20">
			{/* Subtle grid background */}
			<div
				className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]"
				style={{
					backgroundImage:
						"linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
					backgroundSize: "80px 80px",
				}}
			/>

			<div className="relative z-10">
				{/* Nav */}
				<nav className="sticky top-0 z-40 border-[#e8e8e8] border-b bg-[#FAFAF8]/90 backdrop-blur-xl">
					<div className="mx-auto flex h-[52px] max-w-[700px] items-center justify-between px-8">
						<Link
							href={"/2" as Route}
							className="group flex items-center gap-2 text-[#999] text-[13px] transition-colors hover:text-[#111]"
						>
							<svg
								className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path d="M19 12H5M12 19l-7-7 7-7" />
							</svg>
							Zurück
						</Link>
						<span className="font-semibold text-[14px] tracking-[-0.02em]">
							IGG Technik
						</span>
					</div>
				</nav>

				{/* Form */}
				<div className="mx-auto max-w-[700px] px-8 pt-20 pb-20">
					<span className="mb-4 block text-[#bbb] text-[12px] uppercase tracking-[0.2em]">
						Neue Anfrage
					</span>
					<h1 className="mb-3 font-bold text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] tracking-[-0.04em]">
						Event{" "}
						<span className="relative inline-block">
							anfragen.
							<svg
								className="absolute -bottom-1 left-0 w-[60%]"
								height="8"
								viewBox="0 0 200 10"
								preserveAspectRatio="none"
							>
								<path
									d="M0 6 Q50 1 100 6 Q150 11 200 5"
									fill="none"
									stroke="#FF6B6B"
									strokeWidth="3"
									strokeLinecap="round"
								/>
							</svg>
						</span>
					</h1>
					<p className="mb-12 max-w-sm text-[#888] text-[14px] leading-relaxed">
						Füllen Sie das Formular aus und wir melden uns innerhalb von 48
						Stunden.
					</p>

					{submitted ? (
						<div className="rounded-xl border border-[#e8e8e8] bg-white p-10">
							<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#6BCB77]/10">
								<svg
									className="h-6 w-6 text-[#6BCB77]"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path d="M5 13l4 4L19 7" />
								</svg>
							</div>
							<span className="mb-2 block text-[#bbb] text-[12px] uppercase tracking-[0.2em]">
								Gesendet
							</span>
							<h2 className="mb-3 font-bold text-[1.75rem] tracking-[-0.03em]">
								Anfrage erhalten.
							</h2>
							<p className="mb-8 text-[#888] text-[14px] leading-relaxed">
								Wir melden uns innerhalb von 48 Stunden bei Ihnen.
							</p>
							<Link
								href={"/2" as Route}
								className="group inline-flex items-center gap-2.5 rounded-xl bg-[#111] px-6 py-3 font-medium text-[14px] text-white transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#FF6B6B]"
							>
								Zurück zur Startseite
								<svg
									className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path d="M5 12h14M12 5l7 7-7 7" />
								</svg>
							</Link>
						</div>
					) : (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								setSubmitted(true);
							}}
							className="space-y-0"
						>
							{/* Name */}
							<div className="border-[#eee] border-t py-6">
								<label className="mb-2 block text-[#bbb] text-[11px] uppercase tracking-[0.15em]">
									Name
								</label>
								<input
									type="text"
									required
									placeholder="Max Mustermann"
									className="w-full rounded-lg border border-[#e8e8e8] bg-white px-4 py-3 text-[14px] outline-none placeholder:text-[#ccc] focus:border-[#4D96FF] focus:ring-1 focus:ring-[#4D96FF]/20"
								/>
							</div>

							{/* Email */}
							<div className="border-[#eee] border-t py-6">
								<label className="mb-2 block text-[#bbb] text-[11px] uppercase tracking-[0.15em]">
									E-Mail Adresse
								</label>
								<input
									type="email"
									required
									placeholder="max@beispiel.de"
									className="w-full rounded-lg border border-[#e8e8e8] bg-white px-4 py-3 text-[14px] outline-none placeholder:text-[#ccc] focus:border-[#4D96FF] focus:ring-1 focus:ring-[#4D96FF]/20"
								/>
							</div>

							{/* Event Name */}
							<div className="border-[#eee] border-t py-6">
								<label className="mb-2 block text-[#bbb] text-[11px] uppercase tracking-[0.15em]">
									Name des Events
								</label>
								<input
									type="text"
									required
									placeholder="Weihnachtskonzert 2026"
									className="w-full rounded-lg border border-[#e8e8e8] bg-white px-4 py-3 text-[14px] outline-none placeholder:text-[#ccc] focus:border-[#4D96FF] focus:ring-1 focus:ring-[#4D96FF]/20"
								/>
							</div>

							{/* Date + Time */}
							<div className="grid grid-cols-1 gap-0 border-[#eee] border-t md:grid-cols-2 md:gap-6">
								<div className="py-6">
									<label className="mb-2 block text-[#bbb] text-[11px] uppercase tracking-[0.15em]">
										Datum
									</label>
									<input
										type="date"
										required
										className="w-full rounded-lg border border-[#e8e8e8] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#4D96FF] focus:ring-1 focus:ring-[#4D96FF]/20"
									/>
								</div>
								<div className="border-[#eee] border-t py-6 md:border-t-0">
									<label className="mb-2 block text-[#bbb] text-[11px] uppercase tracking-[0.15em]">
										Uhrzeit
									</label>
									<input
										type="time"
										required
										className="w-full rounded-lg border border-[#e8e8e8] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#4D96FF] focus:ring-1 focus:ring-[#4D96FF]/20"
									/>
								</div>
							</div>

							{/* Location */}
							<div className="border-[#eee] border-t py-6">
								<label className="mb-2 block text-[#bbb] text-[11px] uppercase tracking-[0.15em]">
									Veranstaltungsort
								</label>
								<input
									type="text"
									required
									placeholder="Aula, Sporthalle, Pausenhof..."
									className="w-full rounded-lg border border-[#e8e8e8] bg-white px-4 py-3 text-[14px] outline-none placeholder:text-[#ccc] focus:border-[#4D96FF] focus:ring-1 focus:ring-[#4D96FF]/20"
								/>
							</div>

							{/* Equipment */}
							<div className="border-[#eee] border-t py-6">
								<label className="mb-2 block text-[#bbb] text-[11px] uppercase tracking-[0.15em]">
									Benötigte Technik
								</label>
								<div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
									{[
										{ name: "Mikrofone", color: "#FF6B6B" },
										{ name: "Lautsprecher", color: "#4D96FF" },
										{ name: "Mischpult", color: "#FFD93D" },
										{ name: "Beamer", color: "#6BCB77" },
										{ name: "Bühnenbeleuchtung", color: "#FF6B6B" },
										{ name: "Kamera", color: "#4D96FF" },
									].map((item) => (
										<label
											key={item.name}
											className="group flex cursor-pointer items-center gap-3 rounded-lg border border-[#e8e8e8] bg-white px-4 py-3 transition-all hover:border-[#ccc] has-[:checked]:border-transparent has-[:checked]:shadow-[inset_0_0_0_2px_var(--check-color)]"
											style={
												{
													"--check-color": item.color,
												} as React.CSSProperties
											}
										>
											<input type="checkbox" className="sr-only" />
											<div
												className="flex h-4 w-4 items-center justify-center rounded border border-[#ddd] transition-all group-has-[:checked]:border-transparent group-has-[:checked]:bg-[var(--check-color)]"
												style={
													{
														"--check-color": item.color,
													} as React.CSSProperties
												}
											>
												<svg
													className="h-3 w-3 text-white opacity-0 group-has-[:checked]:opacity-100"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
													strokeWidth={3}
												>
													<path d="M5 13l4 4L19 7" />
												</svg>
											</div>
											<span className="text-[#666] text-[13px] transition-colors group-has-[:checked]:font-medium group-has-[:checked]:text-[#111]">
												{item.name}
											</span>
										</label>
									))}
								</div>
							</div>

							{/* Additional Info */}
							<div className="border-[#eee] border-t py-6">
								<label className="mb-2 block text-[#bbb] text-[11px] uppercase tracking-[0.15em]">
									Zusätzliche Infos
								</label>
								<textarea
									rows={4}
									placeholder="Erwartete Teilnehmerzahl, besondere Anforderungen..."
									className="w-full resize-none rounded-lg border border-[#e8e8e8] bg-white px-4 py-3 text-[14px] outline-none placeholder:text-[#ccc] focus:border-[#4D96FF] focus:ring-1 focus:ring-[#4D96FF]/20"
								/>
							</div>

							{/* Submit */}
							<div className="border-[#eee] border-t pt-8">
								<button
									type="submit"
									className="group inline-flex items-center gap-2.5 rounded-xl bg-[#111] px-7 py-3.5 font-medium text-[14px] text-white transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#FF6B6B]"
								>
									Anfrage senden
									<svg
										className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
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
		</div>
	);
}
