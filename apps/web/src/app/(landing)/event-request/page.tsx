"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

export default function EventRequest1() {
	const [submitted, setSubmitted] = useState(false);

	return (
		<div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] text-[#e8e4de] selection:bg-[#ff3d00] selection:text-black">
			{/* Grain overlay */}
			<div
				className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
				}}
			/>

			{/* Navigation */}
			<nav className="fixed top-0 right-0 left-0 z-40 border-[#222] border-b bg-[#0a0a0a]/90 backdrop-blur-sm">
				<div className="mx-auto flex max-w-[900px] items-center justify-between px-6 py-4">
					<Link
						href={"/" as Route}
						className="group flex items-center gap-3 font-mono text-[#666] text-xs uppercase tracking-[0.2em] transition-colors hover:text-[#e8e4de]"
					>
						<svg
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

			{/* Form */}
			<div className="mx-auto max-w-[900px] px-6 pt-32 pb-20">
				<div className="mb-4 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
					Neue Anfrage
				</div>
				<h1
					className="mb-12 font-black text-[clamp(2rem,5vw,4rem)] uppercase leading-[0.9] tracking-[-0.03em]"
					style={{
						fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif",
					}}
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
					<form
						onSubmit={(e) => {
							e.preventDefault();
							setSubmitted(true);
						}}
						className="space-y-0"
					>
						{/* Name */}
						<div className="border-[#222] border-t py-6">
							<label className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
								Name
							</label>
							<input
								type="text"
								required
								placeholder="Max Mustermann"
								className="w-full border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none placeholder:text-[#444] focus:border-[#ff3d00]/50"
							/>
						</div>

						{/* Email */}
						<div className="border-[#222] border-t py-6">
							<label className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
								E-Mail Adresse
							</label>
							<input
								type="email"
								required
								placeholder="max@beispiel.de"
								className="w-full border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none placeholder:text-[#444] focus:border-[#ff3d00]/50"
							/>
						</div>

						{/* Event Name */}
						<div className="border-[#222] border-t py-6">
							<label className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
								Name des Events
							</label>
							<input
								type="text"
								required
								placeholder="Weihnachtskonzert 2026"
								className="w-full border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none placeholder:text-[#444] focus:border-[#ff3d00]/50"
							/>
						</div>

						{/* Date + Time */}
						<div className="grid grid-cols-1 gap-0 border-[#222] border-t md:grid-cols-2">
							<div className="py-6 md:border-[#222] md:border-r md:pr-6">
								<label className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
									Datum
								</label>
								<input
									type="date"
									required
									className="w-full border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none [color-scheme:dark] focus:border-[#ff3d00]/50"
								/>
							</div>
							<div className="border-[#222] border-t py-6 md:border-t-0 md:pl-6">
								<label className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
									Uhrzeit
								</label>
								<input
									type="time"
									required
									className="w-full border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none [color-scheme:dark] focus:border-[#ff3d00]/50"
								/>
							</div>
						</div>

						{/* Location */}
						<div className="border-[#222] border-t py-6">
							<label className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
								Veranstaltungsort
							</label>
							<input
								type="text"
								required
								placeholder="Aula, Sporthalle, Pausenhof..."
								className="w-full border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none placeholder:text-[#444] focus:border-[#ff3d00]/50"
							/>
						</div>

						{/* Equipment */}
						<div className="border-[#222] border-t py-6">
							<label className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
								Benötigte Technik
							</label>
							<div className="grid grid-cols-2 gap-3 md:grid-cols-3">
								{[
									"Mikrofone",
									"Lautsprecher",
									"Mischpult",
									"Beamer",
									"Bühnenbeleuchtung",
									"Kamera",
								].map((item) => (
									<label
										key={item}
										className="group flex cursor-pointer items-center gap-3 border border-[#222] bg-[#111] px-4 py-3 transition-colors has-[:checked]:border-[#ff3d00]/50 has-[:checked]:bg-[#ff3d00]/10"
									>
										<input type="checkbox" className="sr-only" />
										<div className="flex h-4 w-4 items-center justify-center border border-[#444] transition-colors group-has-[:checked]:border-[#ff3d00] group-has-[:checked]:bg-[#ff3d00]">
											<svg
												className="h-3 w-3 text-black opacity-0 group-has-[:checked]:opacity-100"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth={3}
											>
												<path d="M5 13l4 4L19 7" />
											</svg>
										</div>
										<span className="font-mono text-[#999] text-xs uppercase tracking-wider transition-colors group-has-[:checked]:text-[#e8e4de]">
											{item}
										</span>
									</label>
								))}
							</div>
						</div>

						{/* Description */}
						<div className="border-[#222] border-t py-6">
							<label className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
								Zusätzliche Infos
							</label>
							<textarea
								rows={4}
								placeholder="Erwartete Teilnehmerzahl, besondere Anforderungen..."
								className="w-full resize-none border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none placeholder:text-[#444] focus:border-[#ff3d00]/50"
							/>
						</div>

						{/* Submit */}
						<div className="border-[#222] border-t pt-8">
							<button
								type="submit"
								className="group inline-flex items-center gap-3 bg-[#ff3d00] px-8 py-4 font-mono text-black text-sm uppercase tracking-[0.1em] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_rgba(255,61,0,0.3)]"
							>
								Anfrage senden
								<svg
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
