"use client";

import type { Route } from "next";
import Link from "next/link";
import { MockCalendar } from "@/components/mock-calendar";

export default function Design4() {
	return (
		<div
			className="min-h-screen overflow-x-hidden bg-white text-[#111]"
			style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
		>
			{/* Strict grid lines */}
			<div
				className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
				style={{
					backgroundImage:
						"linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
					backgroundSize: "80px 80px",
				}}
			/>

			<div className="relative z-10">
				{/* Navigation - Swiss style, flush left */}
				<nav className="border-[#111] border-b bg-white">
					<div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-8">
						<div className="flex items-baseline gap-2">
							<span className="font-bold text-[15px] tracking-[-0.02em]">
								IGG
							</span>
							<span className="font-light text-[15px] tracking-[-0.02em]">
								Technik
							</span>
						</div>
						<div className="flex items-center gap-6">
							<Link
								href={"/event-request" as Route}
								className="text-[#666] text-[13px] transition-colors hover:text-[#111]"
							>
								Event anfragen
							</Link>
							<Link
								href="/calendar"
								className="text-[#666] text-[13px] transition-colors hover:text-[#111]"
							>
								Kalender
							</Link>
							<Link
								href="/sign-in"
								className="bg-[#111] px-4 py-1.5 text-[13px] text-white transition-colors hover:bg-[#333]"
							>
								Anmelden
							</Link>
						</div>
					</div>
				</nav>

				{/* Hero - Massive typography, asymmetric */}
				<section className="mx-auto max-w-[1200px] px-8 pt-20 pb-16">
					<div className="grid grid-cols-12 gap-x-5">
						<div className="col-span-12 mb-4">
							<span className="text-[#999] text-[13px] uppercase tracking-[0.15em]">
								Veranstaltungstechnik
							</span>
						</div>
						<div className="col-span-12 lg:col-span-8">
							<h1 className="font-bold text-[clamp(3.5rem,9vw,9rem)] leading-[0.88] tracking-[-0.05em]">
								Technik
								<br />
								<span className="font-light italic">für die</span>
								<br />
								Bühne.
							</h1>
						</div>
						<div className="col-span-12 flex flex-col justify-end lg:col-span-4">
							<div className="mt-8 border-[#111] border-t pt-5 lg:mt-0">
								<p className="max-w-sm text-[#555] text-[15px] leading-relaxed">
									Das IGG Technik-Team betreut alle schulischen Veranstaltungen
									mit professioneller Licht-, Ton- und Videotechnik.
								</p>
								<div className="mt-6 flex gap-3">
									<Link
										href={"/event-request" as Route}
										className="inline-flex items-center gap-2 bg-[#111] px-5 py-2.5 text-[13px] text-white transition-colors hover:bg-[#333]"
									>
										Event anfragen
										<svg
											className="h-3.5 w-3.5"
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
					</div>
				</section>

				{/* Horizontal rule */}
				<div className="mx-auto max-w-[1200px] px-8">
					<div className="h-px bg-[#111]" />
				</div>

				{/* Stats row - Swiss precision */}
				<section className="mx-auto max-w-[1200px] px-8 py-12">
					<div className="grid grid-cols-4 gap-5">
						{[
							{ num: "3", label: "Fachbereiche", sub: "Licht / Ton / Video" },
							{
								num: "50+",
								label: "Events / Jahr",
								sub: "Konzerte, Theater, Feiern",
							},
							{ num: "48h", label: "Antwortzeit", sub: "Auf jede Anfrage" },
							{ num: "24/7", label: "Verfügbar", sub: "Online Event-Anfrage" },
						].map((item) => (
							<div key={item.label} className="border-[#ddd] border-l pl-5">
								<div className="mb-1 font-bold text-[2.5rem] leading-none tracking-[-0.03em]">
									{item.num}
								</div>
								<div className="mb-0.5 font-medium text-[#111] text-[13px]">
									{item.label}
								</div>
								<div className="text-[#999] text-[12px]">{item.sub}</div>
							</div>
						))}
					</div>
				</section>

				{/* Calendar section */}
				<section className="mx-auto max-w-[1200px] px-8 pb-16">
					<div className="grid grid-cols-12 gap-5">
						<div className="col-span-12 lg:col-span-4">
							<div className="sticky top-24">
								<span className="mb-3 block text-[#999] text-[13px] uppercase tracking-[0.15em]">
									Kalender
								</span>
								<h2 className="mb-4 font-bold text-[2.5rem] leading-[1.05] tracking-[-0.04em]">
									Alle Events
									<br />
									im Überblick.
								</h2>
								<p className="mb-6 text-[#555] text-[15px] leading-relaxed">
									Hier sehen Sie alle geplanten Veranstaltungen. Für die
									vollständige Ansicht öffnen Sie den Kalender.
								</p>
								<Link
									href="/calendar"
									className="inline-flex items-center gap-1.5 text-[#111] text-[13px] underline decoration-[#ccc] underline-offset-4 transition-colors hover:decoration-[#111]"
								>
									Vollansicht öffnen
									<svg
										className="h-3.5 w-3.5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2}
									>
										<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
									</svg>
								</Link>
							</div>
						</div>
						<div className="col-span-12 lg:col-span-8">
							<div className="border border-[#e5e5e5]">
								<MockCalendar
									variant="light"
									className="!rounded-none !border-0"
								/>
							</div>
						</div>
					</div>
				</section>

				{/* Horizontal rule */}
				<div className="mx-auto max-w-[1200px] px-8">
					<div className="h-px bg-[#111]" />
				</div>

				{/* E-Mail Tutorial - strict grid */}
				<section className="mx-auto max-w-[1200px] px-8 py-16">
					<div className="grid grid-cols-12 gap-5">
						<div className="col-span-12 lg:col-span-4">
							<span className="mb-3 block text-[#999] text-[13px] uppercase tracking-[0.15em]">
								Anleitung
							</span>
							<h2 className="font-bold text-[2.5rem] leading-[1.05] tracking-[-0.04em]">
								Event per
								<br />
								E-Mail.
							</h2>
						</div>
						<div className="col-span-12 lg:col-span-8">
							<div className="space-y-0">
								{[
									{
										num: "1",
										title: "E-Mail verfassen",
										desc: "Schreiben Sie an event@igg.codity.app. Der Betreff ist der Name Ihres Events.",
									},
									{
										num: "2",
										title: "Alle Details nennen",
										desc: "Wann, wo und welche Technik benötigt wird: Mikrofone, Beamer, Bühnenbeleuchtung etc.",
									},
									{
										num: "3",
										title: "Bestätigung abwarten",
										desc: "Das Technik-Team prüft Ihre Anfrage und meldet sich innerhalb von 48 Stunden.",
									},
								].map((step, i) => (
									<div
										key={step.num}
										className={`grid grid-cols-[3rem_1fr] gap-5 py-7 ${i > 0 ? "border-[#e5e5e5] border-t" : ""}`}
									>
										<div className="font-bold text-[#ddd] text-[2rem] leading-none">
											{step.num}
										</div>
										<div>
											<h3 className="mb-1 font-bold text-[15px]">
												{step.title}
											</h3>
											<p className="text-[#666] text-[14px] leading-relaxed">
												{step.desc}
											</p>
										</div>
									</div>
								))}
							</div>

							<div className="mt-8 flex items-center justify-between bg-[#f5f5f5] p-5">
								<div>
									<div className="mb-1 text-[#999] text-[12px] uppercase tracking-[0.1em]">
										Kontakt E-Mail
									</div>
									<a
										href="mailto:event@igg.codity.app"
										className="font-bold text-[15px] underline underline-offset-4 transition-all hover:decoration-2"
									>
										event@igg.codity.app
									</a>
								</div>
								<a
									href="mailto:event@igg.codity.app"
									className="bg-[#111] px-5 py-2.5 text-[13px] text-white transition-colors hover:bg-[#333]"
								>
									E-Mail öffnen
								</a>
							</div>
						</div>
					</div>
				</section>

				{/* Footer */}
				<footer className="border-[#111] border-t bg-white">
					<div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-8">
						<div className="flex items-baseline gap-2">
							<span className="font-bold text-[13px]">IGG Technik</span>
							<span className="text-[#999] text-[12px]">
								{new Date().getFullYear()}
							</span>
						</div>
						<div className="text-[#999] text-[12px]">Licht / Ton / Video</div>
					</div>
				</footer>
			</div>
		</div>
	);
}
