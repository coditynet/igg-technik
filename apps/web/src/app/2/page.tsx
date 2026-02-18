"use client";

import type { Route } from "next";
import Link from "next/link";
import { useMemo } from "react";

const WEEKDAYS = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"];

const MOCK_EVENTS: Record<number, { title: string; color: string }> = {
	3: { title: "Theaterprobe", color: "#4D96FF" },
	7: { title: "Aufbau", color: "#FFD93D" },
	8: { title: "Konzert", color: "#FF6B6B" },
	12: { title: "Technik AG", color: "#6BCB77" },
	15: { title: "Elternabend", color: "#FF6B6B" },
	19: { title: "Technik AG", color: "#6BCB77" },
	22: { title: "Aufführung", color: "#4D96FF" },
	23: { title: "Aufführung", color: "#4D96FF" },
	26: { title: "Technik AG", color: "#6BCB77" },
	28: { title: "Wartung", color: "#FFD93D" },
};

export default function Design2() {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();
	const today = now.getDate();
	const monthName = now.toLocaleDateString("de-DE", {
		month: "long",
		year: "numeric",
	});

	const days = useMemo(() => {
		const firstDay = new Date(year, month, 1);
		let startDay = firstDay.getDay() - 1;
		if (startDay < 0) startDay = 6;
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const daysInPrevMonth = new Date(year, month, 0).getDate();
		const cells: { day: number; current: boolean; today: boolean }[] = [];
		for (let i = startDay - 1; i >= 0; i--)
			cells.push({ day: daysInPrevMonth - i, current: false, today: false });
		for (let i = 1; i <= daysInMonth; i++)
			cells.push({ day: i, current: true, today: i === today });
		const remaining = 42 - cells.length;
		for (let i = 1; i <= remaining; i++)
			cells.push({ day: i, current: false, today: false });
		return cells;
	}, [year, month, today]);

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
					<div className="mx-auto flex h-[52px] max-w-[1100px] items-center justify-between px-8">
						<Link href={"/2" as Route} className="flex items-center">
							<span className="font-semibold text-[14px] tracking-[-0.02em]">
								IGG Technik
							</span>
						</Link>
						<div className="flex items-center gap-1">
							<Link
								href="/calendar"
								className="rounded-lg px-3 py-1.5 text-[#777] text-[13px] transition-colors hover:bg-[#111]/5 hover:text-[#111]"
							>
								Kalender
							</Link>
							<Link
								href={"/sign-in" as Route}
								className="rounded-lg px-3 py-1.5 text-[#777] text-[13px] transition-colors hover:bg-[#111]/5 hover:text-[#111]"
							>
								Anmelden
							</Link>
							<Link
								href={"/2/event-request" as Route}
								className="ml-2 rounded-lg bg-[#111] px-4 py-1.5 font-medium text-[13px] text-white transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#FF6B6B]"
							>
								Event anfragen
							</Link>
						</div>
					</div>
				</nav>

				{/* Hero */}
				<section className="mx-auto max-w-[1100px] px-8 pt-24 pb-20">
					<div className="max-w-3xl">
						<span className="mb-6 block text-[#bbb] text-[12px] uppercase tracking-[0.2em]">
							Veranstaltungstechnik
						</span>
						<h1 className="font-bold text-[clamp(3rem,7.5vw,6.5rem)] leading-[0.9] tracking-[-0.045em]">
							Technik für
							<br />
							<span className="relative inline-block">
								euer Event.
								<svg
									className="absolute -bottom-2 left-0 w-[50%]"
									height="10"
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
						<p className="mt-8 max-w-md text-[#888] text-[16px] leading-relaxed">
							Licht, Ton und Video — professionell betreut vom Technik-Team des
							IGG.
						</p>
						<div className="mt-10 flex items-center gap-4">
							<Link
								href={"/2/event-request" as Route}
								className="group inline-flex items-center gap-2.5 rounded-xl bg-[#111] px-6 py-3 font-medium text-[14px] text-white transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#FF6B6B]"
							>
								Event anfragen
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
							<a
								href="#anleitung"
								className="rounded-xl px-6 py-3 text-[#999] text-[14px] transition-colors hover:text-[#555]"
							>
								Per E-Mail anfragen
							</a>
						</div>
					</div>
				</section>

				{/* Divider */}
				<div className="mx-auto max-w-[1100px] px-8">
					<div className="h-px bg-[#ddd]" />
				</div>

				{/* Calendar */}
				<section className="mx-auto max-w-[1100px] px-8 py-20">
					<div className="grid grid-cols-12 gap-10">
						<div className="col-span-12 lg:col-span-4">
							<div className="sticky top-20">
								<span className="mb-4 block text-[#bbb] text-[12px] uppercase tracking-[0.2em]">
									Kalender
								</span>
								<h2 className="mb-4 font-bold text-[2rem] leading-tight tracking-[-0.03em]">
									Geplante Events.
								</h2>
								<p className="mb-8 text-[#888] text-[14px] leading-relaxed">
									Alle anstehenden Veranstaltungen auf einen Blick.
								</p>
								<Link
									href={"/calendar" as Route}
									className="group inline-flex items-center gap-2 rounded-xl bg-[#111] px-5 py-2.5 font-medium text-[13px] text-white transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#4D96FF]"
								>
									Kalender öffnen
									<svg
										className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2}
									>
										<path d="M5 12h14M12 5l7 7-7 7" />
									</svg>
								</Link>
							</div>
						</div>
						<div className="col-span-12 lg:col-span-8">
							<div className="overflow-hidden rounded-xl border border-[#e8e8e8] bg-white">
								{/* Calendar header */}
								<div className="flex items-center justify-between border-[#f0f0f0] border-b px-5 py-3">
									<span className="font-semibold text-[14px] capitalize">
										{monthName}
									</span>
									<div className="flex gap-1">
										<div className="flex h-7 w-7 items-center justify-center rounded-md text-[#ccc] transition-colors hover:bg-[#f5f5f5] hover:text-[#888]">
											<svg
												width="14"
												height="14"
												viewBox="0 0 16 16"
												fill="none"
											>
												<path
													d="M10 12L6 8L10 4"
													stroke="currentColor"
													strokeWidth="1.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
										</div>
										<div className="flex h-7 w-7 items-center justify-center rounded-md text-[#ccc] transition-colors hover:bg-[#f5f5f5] hover:text-[#888]">
											<svg
												width="14"
												height="14"
												viewBox="0 0 16 16"
												fill="none"
											>
												<path
													d="M6 4L10 8L6 12"
													stroke="currentColor"
													strokeWidth="1.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
										</div>
									</div>
								</div>

								{/* Weekday headers */}
								<div className="grid grid-cols-7 border-[#f0f0f0] border-b">
									{WEEKDAYS.map((d) => (
										<div
											key={d}
											className="py-2 text-center font-semibold text-[#ccc] text-[10px] tracking-[0.1em]"
										>
											{d}
										</div>
									))}
								</div>

								{/* Days grid */}
								<div className="grid grid-cols-7">
									{days.map((cell, i) => {
										const event = cell.current ? MOCK_EVENTS[cell.day] : null;
										const isLastRow = i >= 35;
										const isLastCol = i % 7 === 6;
										return (
											<div
												key={i}
												className={`relative flex flex-col p-1.5 ${!isLastRow ? "border-[#f5f5f5] border-b" : ""} ${!isLastCol ? "border-[#f5f5f5] border-r" : ""}`}
												style={{ minHeight: "52px" }}
											>
												<span
													className={`self-end text-[11px] leading-none ${
														cell.today
															? "inline-flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#111] font-semibold text-white"
															: cell.current
																? "pt-0.5 pr-1 text-[#555]"
																: "pt-0.5 pr-1 text-[#ddd]"
													}`}
												>
													{cell.day}
												</span>
												{event && (
													<div
														className="mt-auto rounded px-1 py-px"
														style={{ backgroundColor: `${event.color}14` }}
													>
														<span
															className="block truncate font-semibold text-[8px] leading-tight"
															style={{ color: event.color }}
														>
															{event.title}
														</span>
													</div>
												)}
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Divider */}
				<div className="mx-auto max-w-[1100px] px-8">
					<div className="h-px bg-[#ddd]" />
				</div>

				{/* About / Behind the Scenes */}
				<section className="mx-auto max-w-[1100px] px-8 py-20">
					<div className="grid grid-cols-12 gap-10">
						<div className="col-span-12 lg:col-span-4">
							<span className="mb-4 block text-[#bbb] text-[12px] uppercase tracking-[0.2em]">
								Behind the Scenes
							</span>
							<h2 className="font-bold text-[2rem] leading-tight tracking-[-0.03em]">
								Das Team
								<br />
								dahinter.
							</h2>
						</div>
						<div className="col-span-12 lg:col-span-8">
							<div className="space-y-6">
								<p className="text-[#555] text-[15px] leading-[1.7]">
									Wir sind das Technik-Team am IGG — eine Gruppe von
									Schülerinnen und Schülern, die sich für Licht, Ton und
									Veranstaltungstechnik begeistern. In den letzten Monaten haben
									wir unter anderem diese Website entwickelt, um Events
									einfacher zu planen und zu verwalten.
								</p>
								<p className="text-[#555] text-[15px] leading-[1.7]">
									Von Schulkonzerten über Theateraufführungen bis hin zu
									Sportevents — wir sorgen dafür, dass die Technik steht.
									Planung, Aufbau, Durchführung, Abbau — alles aus einer Hand.
								</p>
								<div className="rounded-xl bg-[#111] p-6">
									<p className="text-[15px] text-white/90 leading-relaxed">
										Bist du an Technik interessiert? Schau doch einfach mal
										vorbei — wir freuen uns immer über neue Mitglieder.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Divider */}
				<div className="mx-auto max-w-[1100px] px-8">
					<div className="h-px bg-[#ddd]" />
				</div>

				{/* E-Mail Tutorial */}
				<section id="anleitung" className="mx-auto max-w-[1100px] px-8 py-20">
					<div className="grid grid-cols-12 gap-10">
						<div className="col-span-12 lg:col-span-4">
							<span className="mb-4 block text-[#bbb] text-[12px] uppercase tracking-[0.2em]">
								Anleitung
							</span>
							<h2 className="font-bold text-[2rem] leading-tight tracking-[-0.03em]">
								Event per
								<br />
								E-Mail.
							</h2>
						</div>
						<div className="col-span-12 lg:col-span-8">
							<div className="space-y-0">
								{[
									{
										num: 1,
										color: "#FF6B6B",
										title: "E-Mail verfassen",
										desc: "Schreiben Sie an event@igg.codity.app. Der Betreff ist der Name Ihres Events.",
									},
									{
										num: 2,
										color: "#FFD93D",
										title: "Alle Details nennen",
										desc: "Wann, wo und welche Technik benötigt wird: Mikrofone, Beamer, Bühnenbeleuchtung etc.",
									},
									{
										num: 3,
										color: "#6BCB77",
										title: "Bestätigung abwarten",
										desc: "Das Technik-Team prüft Ihre Anfrage und meldet sich innerhalb von 48 Stunden.",
									},
								].map((step, i) => (
									<div
										key={step.num}
										className={`flex gap-5 py-6 ${i > 0 ? "border-[#eee] border-t" : ""}`}
									>
										<div
											className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-[13px] text-white"
											style={{ backgroundColor: step.color }}
										>
											{step.num}
										</div>
										<div>
											<h3 className="mb-1 font-semibold text-[15px]">
												{step.title}
											</h3>
											<p className="text-[#888] text-[14px] leading-relaxed">
												{step.desc}
											</p>
										</div>
									</div>
								))}
							</div>

							<div className="mt-6 rounded-xl border border-[#eee] bg-[#fafaf8] p-5">
								<div className="flex items-center justify-between">
									<div>
										<div className="mb-1 text-[#bbb] text-[10px] uppercase tracking-[0.15em]">
											E-Mail Adresse
										</div>
										<a
											href="mailto:event@igg.codity.app"
											className="font-semibold text-[15px] transition-colors hover:text-[#4D96FF]"
										>
											event@igg.codity.app
										</a>
									</div>
									<a
										href="mailto:event@igg.codity.app"
										className="rounded-lg bg-[#111] px-5 py-2.5 font-medium text-[13px] text-white transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#4D96FF]"
									>
										E-Mail senden
									</a>
								</div>
							</div>

							<div className="mt-4 flex items-center gap-3 pt-2">
								<span className="text-[#bbb] text-[13px]">
									Keine Lust auf E-Mails?
								</span>
								<Link
									href={"/2/event-request" as Route}
									className="group inline-flex items-center gap-1.5 font-medium text-[#111] text-[13px] underline decoration-[#ddd] underline-offset-4 transition-colors hover:decoration-[#111]"
								>
									Formular ausfüllen
									<svg
										className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2}
									>
										<path d="M5 12h14M12 5l7 7-7 7" />
									</svg>
								</Link>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
