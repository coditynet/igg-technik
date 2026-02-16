"use client";

import type { Route } from "next";
import Link from "next/link";
import { MockCalendar } from "@/components/mock-calendar";

export default function Design3() {
	return (
		<div className="min-h-screen overflow-x-hidden bg-[#fafafa] text-[#111] selection:bg-[#111] selection:text-white">
			{/* Subtle noise texture */}
			<div
				className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
				}}
			/>

			<div className="relative z-10">
				{/* Navigation - razor thin */}
				<nav className="sticky top-0 z-40 bg-[#fafafa]">
					<div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-8">
						<Link href="/" className="flex items-baseline gap-1.5">
							<span className="font-semibold text-[15px] tracking-[-0.03em]">
								IGG
							</span>
							<span className="font-light text-[#888] text-[15px] tracking-[-0.02em]">
								Technik
							</span>
						</Link>
						<div className="flex items-center gap-5">
							<Link
								href={"/event-request" as Route}
								className="text-[#999] text-[13px] transition-colors hover:text-[#111]"
							>
								Anfragen
							</Link>
							<Link
								href="/calendar"
								className="text-[#999] text-[13px] transition-colors hover:text-[#111]"
							>
								Kalender
							</Link>
							<div className="h-4 w-px bg-[#ddd]" />
							<Link
								href={"/sign-in" as Route}
								className="text-[#111] text-[13px] transition-opacity hover:opacity-70"
							>
								Anmelden
							</Link>
						</div>
					</div>
					<div className="h-px bg-[#e5e5e5]" />
				</nav>

				{/* Hero - oversized number + text */}
				<section className="mx-auto max-w-[1100px] px-8 pt-24 pb-20">
					<div className="relative">
						<div
							className="pointer-events-none absolute -top-8 -left-4 select-none font-black text-[#f0f0f0] text-[12rem] leading-none"
							aria-hidden
						>
							T
						</div>
						<div className="relative">
							<p className="mb-5 text-[#999] text-[13px] uppercase tracking-[0.2em]">
								Veranstaltungstechnik
							</p>
							<h1 className="max-w-2xl font-semibold text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] tracking-[-0.035em]">
								Professionelle Technik
								<span className="block text-[#bbb]">für eure Schulevents.</span>
							</h1>
							<div className="mt-10 flex items-center gap-3">
								<Link
									href={"/event-request" as Route}
									className="inline-flex items-center gap-2 rounded-full bg-[#111] px-5 py-2.5 text-[13px] text-white transition-colors hover:bg-[#333]"
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
								<a
									href="#guide"
									className="rounded-full border border-[#ddd] px-5 py-2.5 text-[#999] text-[13px] transition-colors hover:border-[#999]"
								>
									Per E-Mail
								</a>
							</div>
						</div>
					</div>
				</section>

				{/* Three column info */}
				<section className="mx-auto max-w-[1100px] px-8 pb-20">
					<div className="grid grid-cols-3 border-[#e5e5e5] border-t">
						{[
							{ label: "Licht", detail: "LED, PAR, DMX-Steuerung" },
							{ label: "Ton", detail: "PA, Mikrofone, Mischpult" },
							{ label: "Video", detail: "Beamer, Kamera, Stream" },
						].map((item, i) => (
							<div
								key={item.label}
								className={`py-6 ${i > 0 ? "border-[#e5e5e5] border-l pl-6" : ""}`}
							>
								<div className="mb-1 text-[#bbb] text-[11px] uppercase tracking-[0.15em]">
									{item.label}
								</div>
								<div className="text-[#555] text-[14px]">{item.detail}</div>
							</div>
						))}
					</div>
				</section>

				{/* Calendar */}
				<section className="mx-auto max-w-[1100px] px-8 pb-20">
					<div className="grid grid-cols-12 items-start gap-12">
						<div className="col-span-4">
							<p className="mb-3 text-[#bbb] text-[11px] uppercase tracking-[0.15em]">
								Kalender
							</p>
							<h2 className="mb-4 font-semibold text-[1.75rem] leading-snug tracking-[-0.03em]">
								Anstehende
								<br />
								Veranstaltungen.
							</h2>
							<p className="mb-6 text-[#888] text-[14px] leading-relaxed">
								Alle geplanten Events auf einen Blick. Öffnen Sie die
								Vollansicht für Details.
							</p>
							<Link
								href="/calendar"
								className="inline-flex items-center gap-1.5 border-[#ccc] border-b pb-0.5 text-[#111] text-[13px] transition-colors hover:border-[#111]"
							>
								Vollansicht
								<svg
									className="h-3 w-3"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
								</svg>
							</Link>
						</div>
						<div className="col-span-8">
							<div className="overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
								<MockCalendar
									variant="light"
									className="!rounded-none !border-0 !shadow-none"
								/>
							</div>
						</div>
					</div>
				</section>

				{/* Divider */}
				<div className="mx-auto max-w-[1100px] px-8">
					<div className="h-px bg-[#e5e5e5]" />
				</div>

				{/* Email tutorial */}
				<section id="guide" className="mx-auto max-w-[1100px] px-8 py-20">
					<div className="grid grid-cols-12 gap-12">
						<div className="col-span-4">
							<p className="mb-3 text-[#bbb] text-[11px] uppercase tracking-[0.15em]">
								Anleitung
							</p>
							<h2 className="font-semibold text-[1.75rem] leading-snug tracking-[-0.03em]">
								Per E-Mail
								<br />
								anfragen.
							</h2>
						</div>
						<div className="col-span-8">
							{[
								{
									title: "E-Mail verfassen",
									desc: "Schreiben Sie an event@igg.codity.app. Verwenden Sie den Eventnamen als Betreff.",
								},
								{
									title: "Details beschreiben",
									desc: "Nennen Sie Datum, Uhrzeit, Ort und welche Technik benötigt wird.",
								},
								{
									title: "Bestätigung erhalten",
									desc: "Das Team prüft Ihre Anfrage und meldet sich innerhalb von 48 Stunden.",
								},
							].map((step, i) => (
								<div
									key={i}
									className={`flex gap-6 py-6 ${i > 0 ? "border-[#e5e5e5] border-t" : ""}`}
								>
									<div className="w-12 shrink-0 pt-0.5 text-[#bbb] text-[11px] uppercase tracking-[0.15em]">
										0{i + 1}
									</div>
									<div>
										<h3 className="mb-1 font-semibold text-[15px] tracking-[-0.01em]">
											{step.title}
										</h3>
										<p className="text-[#888] text-[14px] leading-relaxed">
											{step.desc}
										</p>
									</div>
								</div>
							))}
							<div className="mt-6 flex items-center gap-4 pl-[4.5rem]">
								<a
									href="mailto:event@igg.codity.app"
									className="rounded-full bg-[#111] px-5 py-2.5 text-[13px] text-white transition-colors hover:bg-[#333]"
								>
									E-Mail senden
								</a>
								<a
									href="mailto:event@igg.codity.app"
									className="text-[#999] text-[13px] transition-colors hover:text-[#111]"
								>
									event@igg.codity.app
								</a>
							</div>
						</div>
					</div>
				</section>

				{/* Footer */}
				<footer className="border-[#e5e5e5] border-t">
					<div className="mx-auto flex max-w-[1100px] items-center justify-between px-8 py-6">
						<span className="text-[#bbb] text-[12px]">
							IGG Technik {new Date().getFullYear()}
						</span>
						<span className="text-[#bbb] text-[12px]">Licht / Ton / Video</span>
					</div>
				</footer>
			</div>
		</div>
	);
}
