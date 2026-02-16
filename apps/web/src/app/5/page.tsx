"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { MockCalendar } from "@/components/mock-calendar";

export default function Design5() {
	const [expandedStep, setExpandedStep] = useState<number | null>(null);

	return (
		<div className="min-h-screen overflow-x-hidden bg-[#FFF8ED] text-[#1a1a2e] selection:bg-[#FF6B6B]/30">
			{/* Background shapes - more refined, fewer, bigger */}
			<div className="pointer-events-none fixed inset-0 z-0">
				<svg
					className="absolute top-[-5%] right-[-8%] h-[500px] w-[500px] opacity-[0.06]"
					viewBox="0 0 100 100"
				>
					<circle
						cx="50"
						cy="50"
						r="48"
						fill="none"
						stroke="#FF6B6B"
						strokeWidth="0.5"
					/>
					<circle
						cx="50"
						cy="50"
						r="35"
						fill="none"
						stroke="#FF6B6B"
						strokeWidth="0.5"
					/>
					<circle
						cx="50"
						cy="50"
						r="22"
						fill="none"
						stroke="#FF6B6B"
						strokeWidth="0.5"
					/>
				</svg>
				<svg
					className="absolute bottom-[-10%] left-[-5%] h-[400px] w-[400px] opacity-[0.05]"
					viewBox="0 0 100 100"
				>
					<rect
						x="5"
						y="5"
						width="90"
						height="90"
						fill="none"
						stroke="#4D96FF"
						strokeWidth="0.5"
						rx="2"
					/>
					<rect
						x="20"
						y="20"
						width="60"
						height="60"
						fill="none"
						stroke="#4D96FF"
						strokeWidth="0.5"
						rx="2"
					/>
					<rect
						x="35"
						y="35"
						width="30"
						height="30"
						fill="none"
						stroke="#4D96FF"
						strokeWidth="0.5"
						rx="2"
					/>
				</svg>
				<svg
					className="absolute top-[45%] left-[60%] h-[200px] w-[200px] opacity-[0.04]"
					viewBox="0 0 100 100"
				>
					<polygon
						points="50,5 95,95 5,95"
						fill="none"
						stroke="#6BCB77"
						strokeWidth="0.8"
					/>
				</svg>
			</div>

			{/* Dot grid */}
			<div
				className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
				style={{
					backgroundImage:
						"radial-gradient(circle, #1a1a2e 0.8px, transparent 0.8px)",
					backgroundSize: "28px 28px",
				}}
			/>

			<div className="relative z-10">
				{/* Navigation */}
				<nav className="sticky top-0 z-40 bg-[#FFF8ED]/80 backdrop-blur-xl">
					<div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-8">
						<div className="flex items-center gap-3">
							<div className="relative">
								<div className="flex h-9 w-9 rotate-3 items-center justify-center rounded-2xl bg-[#1a1a2e] shadow-[3px_3px_0_0_#FF6B6B]">
									<span className="-rotate-3 font-black text-white text-xs">
										iT
									</span>
								</div>
							</div>
							<span className="font-black text-[17px] tracking-tight">
								IGG Technik
							</span>
						</div>
						<div className="flex items-center gap-3">
							<Link
								href={"/event-request" as Route}
								className="px-3 py-2 font-bold text-[#1a1a2e]/60 text-[13px] transition-colors hover:text-[#FF6B6B]"
							>
								Event anfragen
							</Link>
							<Link
								href={"/sign-in" as Route}
								className="rounded-xl bg-[#1a1a2e] px-5 py-2 font-bold text-[#FFF8ED] text-[13px] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#FF6B6B]"
							>
								Anmelden
							</Link>
						</div>
					</div>
				</nav>

				{/* Hero - cleaner, punchier */}
				<section className="mx-auto max-w-[1100px] px-8 pt-20 pb-24">
					<div className="max-w-2xl">
						<div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#6BCB77]/25 bg-[#6BCB77]/15 px-4 py-1.5">
							<div className="h-2 w-2 rounded-full bg-[#6BCB77]" />
							<span className="font-bold text-[#1a1a2e]/70 text-[12px]">
								Veranstaltungstechnik am IGG
							</span>
						</div>
						<h1 className="font-black text-[clamp(2.8rem,6vw,5rem)] leading-[0.93] tracking-[-0.04em]">
							Euer Event,{" "}
							<span className="relative inline-block">
								unsere
								<svg
									className="absolute -bottom-1 left-0 w-full"
									height="8"
									viewBox="0 0 200 8"
									preserveAspectRatio="none"
								>
									<path
										d="M0 6 Q40 0 100 5 Q160 10 200 3"
										fill="none"
										stroke="#FF6B6B"
										strokeWidth="3"
										strokeLinecap="round"
									/>
								</svg>
							</span>{" "}
							<span
								className="bg-gradient-to-r from-[#FF6B6B] via-[#4D96FF] to-[#6BCB77] bg-clip-text"
								style={{ WebkitTextFillColor: "transparent" }}
							>
								Technik.
							</span>
						</h1>
						<p className="mt-6 max-w-md text-[#1a1a2e]/50 text-[17px] leading-relaxed">
							Licht, Ton und Video fur alle Schulveranstaltungen. Professionell
							betreut vom Technik-Team.
						</p>
						<div className="mt-10 flex flex-wrap items-center gap-3">
							<Link
								href={"/event-request" as Route}
								className="group inline-flex items-center gap-2.5 rounded-2xl bg-[#FF6B6B] px-7 py-3.5 font-bold text-[14px] text-white shadow-[4px_4px_0_0_#c44] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#c44]"
							>
								Event anfragen
								<svg
									className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2.5}
								>
									<path d="M5 12h14M12 5l7 7-7 7" />
								</svg>
							</Link>
							<a
								href="#how-to"
								className="rounded-2xl border-2 border-[#1a1a2e]/15 px-7 py-3.5 font-bold text-[#1a1a2e]/50 text-[14px] transition-all hover:border-[#1a1a2e]/30 hover:text-[#1a1a2e]/70"
							>
								Per E-Mail anfragen
							</a>
						</div>
					</div>
				</section>

				{/* Equipment - card blocks with shadow offset */}
				<section className="mx-auto max-w-[1100px] px-8 pb-20">
					<div className="grid grid-cols-1 gap-5 md:grid-cols-3">
						{[
							{
								color: "#4D96FF",
								shadow: "#3a78d4",
								title: "Tontechnik",
								desc: "PA-System, Funkmikrofone, Mischpult und Monitoring",
								items: ["PA", "Mikros", "Mixer"],
							},
							{
								color: "#FFD93D",
								shadow: "#d4b432",
								title: "Lichttechnik",
								desc: "LED-Scheinwerfer, PAR-Strahler, DMX-Steuerung",
								items: ["LED", "PAR", "DMX"],
							},
							{
								color: "#6BCB77",
								shadow: "#4fa85c",
								title: "Videotechnik",
								desc: "Beamer, Kameras, Livestream und Aufzeichnung",
								items: ["Beamer", "Kamera", "Stream"],
							},
						].map((card, i) => (
							<div
								key={card.title}
								className="rounded-2xl border border-[#1a1a2e]/8 bg-white p-6 transition-all hover:-translate-y-1"
								style={{
									boxShadow: `5px 5px 0 0 ${card.color}30`,
								}}
							>
								<div
									className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
									style={{ backgroundColor: `${card.color}18` }}
								>
									<div
										className="h-4 w-4 rounded-md"
										style={{ backgroundColor: card.color }}
									/>
								</div>
								<h3 className="mb-2 font-black text-[17px]">{card.title}</h3>
								<p className="mb-4 text-[#1a1a2e]/45 text-[14px] leading-relaxed">
									{card.desc}
								</p>
								<div className="flex gap-2">
									{card.items.map((item) => (
										<span
											key={item}
											className="rounded-lg px-2.5 py-1 font-bold text-[11px]"
											style={{
												backgroundColor: `${card.color}12`,
												color: card.shadow,
											}}
										>
											{item}
										</span>
									))}
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Calendar */}
				<section className="mx-auto max-w-[1100px] px-8 pb-20">
					<div className="overflow-hidden rounded-3xl border border-[#1a1a2e]/8 bg-white shadow-[6px_6px_0_0_rgba(26,26,46,0.06)]">
						<div className="flex items-center justify-between border-[#1a1a2e]/5 border-b px-6 py-4">
							<div className="flex items-center gap-3">
								<div className="flex gap-1.5">
									<div className="h-3 w-3 rounded-full bg-[#FF6B6B]" />
									<div className="h-3 w-3 rounded-full bg-[#FFD93D]" />
									<div className="h-3 w-3 rounded-full bg-[#6BCB77]" />
								</div>
								<span className="font-black text-[13px]">
									Veranstaltungskalender
								</span>
							</div>
							<Link
								href="/calendar"
								className="flex items-center gap-1 font-bold text-[#4D96FF] text-[12px] hover:underline"
							>
								Vollansicht
								<svg
									className="h-3 w-3"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2.5}
								>
									<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
								</svg>
							</Link>
						</div>
						<div className="p-5">
							<MockCalendar
								variant="light"
								className="!bg-transparent !border-0 !shadow-none !p-0 !rounded-none"
							/>
						</div>
					</div>
				</section>

				{/* Email Tutorial - accordion style */}
				<section id="how-to" className="mx-auto max-w-[1100px] px-8 pb-24">
					<div className="grid grid-cols-12 gap-10">
						<div className="col-span-12 md:col-span-4">
							<div className="sticky top-24">
								<div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4D96FF]/20 bg-[#4D96FF]/12 px-3.5 py-1">
									<span className="font-bold text-[#4D96FF] text-[11px]">
										Kein Account nötig
									</span>
								</div>
								<h2 className="mb-3 font-black text-[2rem] leading-tight tracking-[-0.03em]">
									Event per E-Mail anfragen
								</h2>
								<p className="text-[#1a1a2e]/45 text-[14px] leading-relaxed">
									Einfach eine E-Mail mit den Details schicken, wir kümmern uns
									um den Rest.
								</p>
							</div>
						</div>
						<div className="col-span-12 md:col-span-8">
							<div className="space-y-3">
								{[
									{
										step: 1,
										color: "#FF6B6B",
										title: "E-Mail verfassen",
										short: "An event@igg.codity.app schreiben",
										detail:
											"Verfassen Sie eine neue E-Mail an event@igg.codity.app. Verwenden Sie als Betreff den Namen Ihres Events, z.B. 'Weihnachtskonzert 2025'.",
									},
									{
										step: 2,
										color: "#FFD93D",
										title: "Details angeben",
										short: "Datum, Ort und Technik-Bedarf beschreiben",
										detail:
											"Beschreiben Sie im Text der E-Mail: Datum und Uhrzeit, Veranstaltungsort, erwartete Teilnehmerzahl und welche Technik Sie benötigen (Mikrofone, Beamer, Bühnenbeleuchtung, etc.).",
									},
									{
										step: 3,
										color: "#6BCB77",
										title: "Bestätigung erhalten",
										short: "Antwort innerhalb von 48 Stunden",
										detail:
											"Das Technik-Team prüft Ihre Anfrage und meldet sich per E-Mail bei Ihnen. In der Bestätigung erhalten Sie alle Details zur technischen Umsetzung.",
									},
								].map((step) => (
									<button
										key={step.step}
										onClick={() =>
											setExpandedStep(
												expandedStep === step.step ? null : step.step,
											)
										}
										className="w-full rounded-2xl border border-[#1a1a2e]/8 bg-white p-5 text-left transition-all hover:-translate-y-0.5"
										style={{
											boxShadow:
												expandedStep === step.step
													? `4px 4px 0 0 ${step.color}40`
													: "2px 2px 0 0 rgba(26,26,46,0.04)",
										}}
									>
										<div className="flex items-center gap-4">
											<div
												className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-black text-sm text-white"
												style={{ backgroundColor: step.color }}
											>
												{step.step}
											</div>
											<div className="min-w-0 flex-1">
												<div className="flex items-center justify-between">
													<h3 className="font-bold text-[15px]">
														{step.title}
													</h3>
													<svg
														className={`ml-2 h-4 w-4 shrink-0 text-[#1a1a2e]/25 transition-transform ${expandedStep === step.step ? "rotate-180" : ""}`}
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
														strokeWidth={2}
													>
														<path d="M19 9l-7 7-7-7" />
													</svg>
												</div>
												<p className="mt-0.5 text-[#1a1a2e]/40 text-[13px]">
													{step.short}
												</p>
											</div>
										</div>
										{expandedStep === step.step && (
											<div className="mt-4 ml-13 border-[#1a1a2e]/5 border-t pt-4 pl-[3.25rem]">
												<p className="text-[#1a1a2e]/55 text-[14px] leading-relaxed">
													{step.detail}
												</p>
											</div>
										)}
									</button>
								))}
							</div>

							<div className="mt-6 ml-0">
								<a
									href="mailto:event@igg.codity.app"
									className="inline-flex items-center gap-3 rounded-2xl bg-[#1a1a2e] px-6 py-3.5 font-bold text-[#FFF8ED] text-[14px] shadow-[4px_4px_0_0_rgba(26,26,46,0.15)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_rgba(26,26,46,0.15)]"
								>
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<rect x="2" y="4" width="20" height="16" rx="2" />
										<path d="M22 7l-10 6L2 7" />
									</svg>
									event@igg.codity.app
								</a>
							</div>
						</div>
					</div>
				</section>

				{/* Footer */}
				<footer className="border-[#1a1a2e]/8 border-t">
					<div className="mx-auto flex max-w-[1100px] items-center justify-between px-8 py-6">
						<div className="flex items-center gap-2">
							<span className="font-black text-[13px]">IGG Technik</span>
							<span className="text-[#1a1a2e]/30 text-[13px]">
								{new Date().getFullYear()}
							</span>
						</div>
						<div className="flex items-center gap-3">
							{[
								{ label: "Licht", color: "#FFD93D" },
								{ label: "Ton", color: "#4D96FF" },
								{ label: "Video", color: "#6BCB77" },
							].map((item) => (
								<span
									key={item.label}
									className="rounded-lg px-2.5 py-1 font-bold text-[11px]"
									style={{
										backgroundColor: `${item.color}12`,
										color: `${item.color}cc`,
									}}
								>
									{item.label}
								</span>
							))}
						</div>
					</div>
				</footer>
			</div>
		</div>
	);
}
