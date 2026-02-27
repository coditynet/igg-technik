"use client";

import { api } from "@igg/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const WEEKDAYS = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"];

const KONAMI = [
	"ArrowUp",
	"ArrowUp",
	"ArrowDown",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"ArrowLeft",
	"ArrowRight",
	"b",
	"a",
];

const GROUP_EVENT_COLORS: Record<string, string> = {
	blue: "border-blue-400 bg-blue-500/12 text-blue-300",
	orange: "border-orange-400 bg-orange-500/12 text-orange-300",
	violet: "border-violet-400 bg-violet-500/12 text-violet-300",
	rose: "border-rose-400 bg-rose-500/12 text-rose-300",
	emerald: "border-emerald-400 bg-emerald-500/12 text-emerald-300",
};

const STEPS = [
	{
		num: "01",
		title: "E-Mail verfassen",
		desc: "Schreiben Sie eine Mail an event@igg.codity.app mit dem Betreff Ihres Events.",
	},
	{
		num: "02",
		title: "Details angeben",
		desc: "Nennen Sie Datum, Uhrzeit, Ort und benötigte Technik (Mikrofone, Beamer, Licht).",
	},
	{
		num: "03",
		title: "Bestätigung erhalten",
		desc: "Sie bekommen eine Bestätigung, in der Sie die Details noch einmal anpassen können.",
	},
];

function useReveal() {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.15 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);
	return { ref, visible };
}

type LandingDayCell = {
	day: number;
	current: boolean;
	today: boolean;
	gridIndex: number;
	key: string;
};

type LandingEventPreview = {
	title: string;
	className: string;
	count: number;
};

type LandingHeroProps = {
	heroReady: boolean;
	calendarReveal: ReturnType<typeof useReveal>;
	monthName: string;
	days: LandingDayCell[];
	calendarEventsByDay: Map<number, LandingEventPreview>;
};

function LandingHero({
	heroReady,
	calendarReveal,
	monthName,
	days,
	calendarEventsByDay,
}: LandingHeroProps) {
	return (
		<section className="mx-auto max-w-[1400px] px-6 pt-32 pb-20">
			<div className="grid grid-cols-12 gap-4">
				<div className="col-span-12 lg:col-span-7">
					<div
						className={`stamp-line mb-6 font-mono text-[#ff3d00] text-xs uppercase tracking-[0.3em] ${heroReady ? "ready" : ""}`}
					>
						Schulevents und so
					</div>
					<h1
						className="font-black text-[clamp(3rem,8vw,8rem)] uppercase leading-[0.85] tracking-[-0.04em]"
						style={{
							fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif",
						}}
					>
						<span
							className={`stamp-line inline-block text-[#ff3d00] ${heroReady ? "ready" : ""}`}
							style={{ animationDelay: "0.1s" }}
						>
							Technik
						</span>
						<br />
						<span
							className={`stamp-line inline-block ${heroReady ? "ready" : ""}`}
							style={{ animationDelay: "0.2s" }}
						>
							für euer
						</span>
						<br />
						<span
							className={`stamp-line inline-block ${heroReady ? "ready" : ""}`}
							style={{ animationDelay: "0.3s" }}
						>
							Event.
						</span>
					</h1>
					<div
						className={`stamp-line mt-10 flex items-center gap-6 ${heroReady ? "ready" : ""}`}
						style={{ animationDelay: "0.5s" }}
					>
						<Link
							href={"/event-request" as Route}
							className="group inline-flex items-center gap-3 bg-[#ff3d00] px-8 py-4 font-mono text-black text-sm uppercase tracking-[0.1em] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_rgba(255,61,0,0.3)]"
						>
							Event anfragen
							<svg
								className="h-4 w-4 transition-transform group-hover:translate-x-1"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
								aria-hidden="true"
							>
								<path d="M5 12h14M12 5l7 7-7 7" />
							</svg>
						</Link>
						<a
							href="#tutorial"
							className="border-[#333] border-b pb-1 font-mono text-[#666] text-xs uppercase tracking-[0.2em] transition-colors hover:text-[#e8e4de]"
						>
							Per E-Mail anfragen
						</a>
					</div>
				</div>
				<div
					ref={calendarReveal.ref}
					className={`reveal-section col-span-12 mt-10 flex items-end lg:col-span-5 lg:mt-0 ${calendarReveal.visible ? "visible" : ""}`}
					style={{ animationDelay: "0.2s" }}
				>
					<div className="relative w-full">
						<div className="absolute -inset-3 -rotate-1 border border-[#ff3d00]/20" />
						<div className="absolute -top-6 -right-3 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
							Geplante Events
						</div>

						<div className="border border-[#222] bg-[#0d0d0d]">
							<div className="flex items-center justify-between border-[#222] border-b px-4 py-3">
								<span className="font-mono text-[#e8e4de] text-sm uppercase tracking-[0.2em]">
									{monthName}
								</span>
								<div className="flex gap-px">
								</div>
							</div>

							<div className="grid grid-cols-7 border-[#222] border-b">
								{WEEKDAYS.map((d) => (
									<div
										key={d}
										className="border-[#222] border-r py-2 text-center font-mono text-[#555] text-[10px] tracking-[0.15em] last:border-r-0"
									>
										{d}
									</div>
								))}
							</div>

							<div className="grid grid-cols-7">
								{days.map((cell) => {
									const event = cell.current
										? calendarEventsByDay.get(cell.day)
										: null;
									return (
										<div
											key={cell.key}
											className={`relative flex flex-col border-[#191919] border-r border-b p-1.5 ${
												cell.gridIndex % 7 === 6 ? "border-r-0" : ""
											} ${cell.gridIndex >= 35 ? "border-b-0" : ""}`}
											style={{ minHeight: "44px" }}
										>
											<span
												className={`font-mono text-[11px] leading-none ${
													cell.today
														? "font-bold text-[#0a0a0a]"
														: cell.current
															? "text-[#888]"
															: "text-[#333]"
												}`}
											>
												{cell.today && (
													<span className="inline-flex h-[18px] w-[18px] items-center justify-center bg-[#ff3d00]">
														{cell.day}
													</span>
												)}
												{!cell.today && cell.day}
											</span>
											{event && (
												<div className={`mt-1 border-l px-1 py-px ${event.className}`}>
													<span className="block truncate font-mono text-[7px] uppercase leading-tight tracking-wider">
														{event.title}
														{event.count > 1 ? ` +${event.count - 1}` : ""}
													</span>
												</div>
											)}
										</div>
									);
								})}
							</div>
						</div>

						<Link
							href={"/calendar" as Route}
							className="group relative z-10 mt-3 flex items-center gap-3 border border-[#ff3d00]/30 bg-[#ff3d00]/10 px-4 py-3 transition-all hover:bg-[#ff3d00]/20"
						>
							<span className="font-mono text-[#ff3d00] text-xs uppercase tracking-[0.15em]">
								Kalender öffnen
							</span>
							<svg
								className="h-4 w-4 text-[#ff3d00] transition-transform group-hover:translate-x-1"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
								aria-hidden="true"
							>
								<path d="M5 12h14M12 5l7 7-7 7" />
							</svg>
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}

function LandingCalendarFullscreenHero({
	monthName,
	days,
	calendarEventsByDay,
	onPrevious,
	onNext,
}: Pick<LandingHeroProps, "monthName" | "days" | "calendarEventsByDay"> & {
	onPrevious: () => void;
	onNext: () => void;
}) {
	return (
		<section className="mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-[1400px] flex-col px-6 pt-20 pb-6">
			<div className="mb-6 flex flex-col items-center text-center">
				<p className="font-mono text-[#666] text-[10px] uppercase tracking-[0.3em] select-none">
					Kalender
				</p>
				<h2
					className="mt-2 font-black text-[#e8e4de] text-[clamp(1.75rem,3.2vw,2.75rem)] uppercase leading-[0.95] tracking-[-0.02em]"
					style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif" }}
				>
					Geplante Veranstaltungen
				</h2>
				<div className="mt-3 h-px w-36 bg-gradient-to-r from-transparent via-[#ff3d00]/70 to-transparent" />
				</div>

			<div className="relative flex min-h-0 flex-1 flex-col border border-[#222] bg-[#0d0d0d]">
				<div className="flex items-center justify-between border-[#222] border-b px-4 py-3">
					<span className="font-mono text-[#e8e4de] text-sm uppercase tracking-[0.2em]">
						{monthName}
					</span>
					<div className="flex gap-px">
						<Button
							type="button"
							variant="outline"
							size="icon-sm"
							onClick={onPrevious}
							className="border-[#222] bg-[#151515]"
						>
							<ChevronLeft className="size-3.5" />
						</Button>
						<Button
							type="button"
							variant="outline"
							size="icon-sm"
							onClick={onNext}
							className="border-[#222] bg-[#151515]"
						>
							<ChevronRight className="size-3.5" />
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-7 border-[#222] border-b">
					{WEEKDAYS.map((d) => (
						<div
							key={d}
							className="border-[#222] border-r py-2 text-center font-mono text-[#555] text-[10px] tracking-[0.15em] last:border-r-0"
						>
							{d}
						</div>
					))}
				</div>

				<div className="grid flex-1 grid-cols-7 [grid-auto-rows:minmax(0,1fr)]">
					{days.map((cell) => {
						const event = cell.current ? calendarEventsByDay.get(cell.day) : null;
						return (
							<div
								key={cell.key}
								className={`relative flex min-h-0 flex-col border-[#191919] border-r border-b p-2 ${
									cell.gridIndex % 7 === 6 ? "border-r-0" : ""
								} ${cell.gridIndex >= 35 ? "border-b-0" : ""}`}
							>
								<span
									className={`font-mono text-xs leading-none ${
										cell.today
											? "font-bold text-[#0a0a0a]"
											: cell.current
												? "text-[#888]"
												: "text-[#333]"
									}`}
								>
									{cell.today && (
										<span className="inline-flex h-6 w-6 items-center justify-center bg-[#ff3d00]">
											{cell.day}
										</span>
									)}
									{!cell.today && cell.day}
								</span>
								{event && (
									<div className={`mt-2 border-l px-1.5 py-1 ${event.className}`}>
										<span className="block truncate font-mono text-[8px] uppercase leading-tight tracking-wider">
											{event.title}
											{event.count > 1 ? ` +${event.count - 1}` : ""}
										</span>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

type LandingPageContentProps = {
	showFullscreenCalendarHero: boolean;
};

export function LandingPageContent({
	showFullscreenCalendarHero,
}: LandingPageContentProps) {
	const calendarData = useQuery(api.events.list);
	const [currentDate, setCurrentDate] = useState(() => new Date());

	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();
	const todayDate = new Date();
	const todayDay = todayDate.getDate();
	const todayMonth = todayDate.getMonth();
	const todayYear = todayDate.getFullYear();
	const monthName = currentDate.toLocaleDateString("de-DE", {
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
			cells.push({
				day: i,
				current: true,
				today:
					i === todayDay &&
					month === todayMonth &&
					year === todayYear,
			});
		const remaining = 42 - cells.length;
		for (let i = 1; i <= remaining; i++)
			cells.push({ day: i, current: false, today: false });
		return cells.map((cell, index) => ({
			...cell,
			gridIndex: index,
			key: `${cell.current ? "cur" : "adj"}-${cell.day}-${index}`,
		}));
	}, [year, month, todayDay, todayMonth, todayYear]);

	const handlePreviousMonth = useCallback(() => {
		setCurrentDate((prev) => subMonths(prev, 1));
	}, []);

	const handleNextMonth = useCallback(() => {
		setCurrentDate((prev) => addMonths(prev, 1));
	}, []);

	const calendarEventsByDay = useMemo(() => {
		const eventsByDay = new Map<
			number,
			{ title: string; className: string; count: number }
		>();
		if (!calendarData?.events) {
			return eventsByDay;
		}

		const groupsById = new Map(
			(calendarData.groups ?? []).map((group) => [String(group._id), group]),
		);
		const monthStart = new Date(year, month, 1);
		const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

		const events = [...calendarData.events].sort(
			(a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
		);

		for (const event of events) {
			const eventStart = new Date(event.start);
			const eventEnd = new Date(event.end);
			if (
				Number.isNaN(eventStart.getTime()) ||
				Number.isNaN(eventEnd.getTime()) ||
				eventEnd < monthStart ||
				eventStart > monthEnd
			) {
				continue;
			}

			const start = new Date(
				Math.max(eventStart.getTime(), monthStart.getTime()),
			);
			start.setHours(0, 0, 0, 0);
			const end = new Date(Math.min(eventEnd.getTime(), monthEnd.getTime()));
			end.setHours(0, 0, 0, 0);

			const group = groupsById.get(String(event.groupId));
			const eventClass =
				GROUP_EVENT_COLORS[group?.color ?? ""] ??
				"border-[#ff3d00] bg-[#ff3d00]/10 text-[#ff3d00]";

			for (
				const cursor = new Date(start);
				cursor <= end;
				cursor.setDate(cursor.getDate() + 1)
			) {
				if (cursor.getFullYear() !== year || cursor.getMonth() !== month) {
					continue;
				}

				const day = cursor.getDate();
				const existing = eventsByDay.get(day);
				if (existing) {
					existing.count += 1;
				} else {
					eventsByDay.set(day, {
						title: event.title,
						className: eventClass,
						count: 1,
					});
				}
			}
		}

		return eventsByDay;
	}, [calendarData, year, month]);

	// Konami code easter egg
	const [glitch, setGlitch] = useState(false);
	const [konamiIndex, setKonamiIndex] = useState(0);
	const [isAiInfoOpen, setIsAiInfoOpen] = useState(false);

	const triggerGlitch = useCallback(() => {
		setGlitch(true);
		setTimeout(() => setGlitch(false), 2000);
	}, []);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === KONAMI[konamiIndex]) {
				const next = konamiIndex + 1;
				if (next === KONAMI.length) {
					setKonamiIndex(0);
					triggerGlitch();
				} else {
					setKonamiIndex(next);
				}
			} else {
				setKonamiIndex(e.key === KONAMI[0] ? 1 : 0);
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [konamiIndex, triggerGlitch]);

	useEffect(() => {
		const secretHandler = () => {
			triggerGlitch();
		};
		window.addEventListener(
			"landing-secret-trigger",
			secretHandler as EventListener,
		);
		return () => {
			window.removeEventListener(
				"landing-secret-trigger",
				secretHandler as EventListener,
			);
		};
	}, [triggerGlitch]);

	// Scroll-triggered reveal animations
	const aboutReveal = useReveal();
	const tutorialReveal = useReveal();
	const calendarReveal = useReveal();

	// Hero text stagger
	const [heroReady, setHeroReady] = useState(false);
	useEffect(() => {
		const t = setTimeout(() => setHeroReady(true), 100);
		return () => clearTimeout(t);
	}, []);

	return (
		<div
			className={`relative min-h-screen bg-[#0a0a0a] text-[#e8e4de] selection:bg-[#ff3d00] selection:text-black ${glitch ? "animate-[glitch_0.15s_ease_infinite]" : ""}`}
		>
			{/* Glitch overlay */}
			{glitch && (
				<div className="pointer-events-none absolute inset-0 z-999">
					<div className="inset-0 animate-pulse bg-[#ff3d00] opacity-20 mix-blend-multiply" />
					<div
						className="inset-0"
						style={{
							background:
								"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,61,0,0.03) 2px, rgba(255,61,0,0.03) 4px)",
						}}
					/>
				</div>
			)}

			{/* Glitch keyframes */}
			{glitch && (
				<style>{`
					@keyframes glitch {
						0% { transform: translate(0); filter: hue-rotate(0deg); }
						20% { transform: translate(-2px, 2px); filter: hue-rotate(90deg); }
						40% { transform: translate(2px, -1px); filter: hue-rotate(180deg); }
						60% { transform: translate(-1px, -2px); filter: hue-rotate(270deg); }
						80% { transform: translate(1px, 1px); filter: hue-rotate(360deg); }
						100% { transform: translate(0); filter: hue-rotate(0deg); }
					}
				`}</style>
			)}

			{/* Animation styles */}
			<style>{`
				@keyframes stampIn {
					from { clip-path: inset(100% 0 0 0); transform: translateY(8px); }
					to { clip-path: inset(0 0 0 0); transform: translateY(0); }
				}
				@keyframes fadeSlideUp {
					from { opacity: 0; transform: translateY(20px); }
					to { opacity: 1; transform: translateY(0); }
				}
				@keyframes scanline {
					from { transform: translateY(-100%); }
					to { transform: translateY(100vh); }
				}
				@keyframes diamondPulse {
					0%, 100% { transform: rotate(45deg) scale(1); }
					50% { transform: rotate(45deg) scale(0.92); }
				}
				.stamp-line {
					clip-path: inset(100% 0 0 0);
					transform: translateY(8px);
				}
				.stamp-line.ready {
					animation: stampIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
				}
				.reveal-section {
					opacity: 0;
					transform: translateY(20px);
				}
				.reveal-section.visible {
					animation: fadeSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
				}
			`}</style>

			{/* Grain overlay */}
			<div
				className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
				}}
			/>

			{/* Navigation */}
			<nav className="fixed top-0 right-0 left-0 z-40 border-[#222] border-b backdrop-blur-xl">
				<div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
					<div className="flex items-center">
						<span className="font-mono text-sm uppercase tracking-[0.3em]">
							IGG Technik
						</span>
					</div>
					<div className="flex items-center gap-6">
						<Link
							href={"/sign-in" as Route}
							className="font-mono text-[#666] text-xs uppercase tracking-[0.2em] transition-colors hover:text-[#ff3d00]"
						>
							Anmelden
						</Link>
						<Link
							href={"/event-request" as Route}
							className="bg-[#ff3d00] px-4 py-2 font-mono text-black text-xs uppercase tracking-[0.2em] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_rgba(255,61,0,0.3)]"
						>
							Event anfragen
						</Link>
					</div>
				</div>
			</nav>

			{showFullscreenCalendarHero ? (
				<LandingCalendarFullscreenHero
					monthName={monthName}
					days={days}
					calendarEventsByDay={calendarEventsByDay}
					onPrevious={handlePreviousMonth}
					onNext={handleNextMonth}
				/>
			) : (
				<LandingHero
					heroReady={heroReady}
					calendarReveal={calendarReveal}
					monthName={monthName}
					days={days}
					calendarEventsByDay={calendarEventsByDay}
				/>
			)}

			{/* Divider */}
			<div className="mx-auto max-w-[1400px] px-6">
				<div className="h-px bg-[#222]" />
			</div>

			{/* Info strip
			<section
				ref={infoReveal.ref}
				className={`reveal-section mx-auto max-w-[1400px] px-6 py-16 ${infoReveal.visible ? "visible" : ""}`}
			>
				<div className="grid grid-cols-1 gap-px bg-[#222] md:grid-cols-3">
					{[
						{
							label: "Cooler Text",
							value: "Cooler Text 2",
							desc: "Und noch mehr text",
						},
						{
							label: "Noch coolerer text",
							value: "Noch coolerer text 2",
							desc: "Hier könnte auch nochmal was stehen",
						},
						{
							label: "Und nochmal",
							value: "idk",
							desc: "idk....",
						},
					].map((item) => (
						<div
							key={item.label}
							className="group bg-[#0a0a0a] p-8 transition-colors hover:bg-[#111]"
						>
							<div className="mb-3 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
								{item.label}
							</div>
							<div className="mb-2 font-black text-2xl uppercase tracking-tight">
								{item.value}
							</div>
							<div className="text-[#666] text-sm">{item.desc}</div>
						</div>
					))}
				</div>
			</section> */}

			{/* About / Behind the Scenes */}
			<section
				ref={aboutReveal.ref}
				className={`reveal-section mx-auto max-w-[1400px] px-6 py-20 ${aboutReveal.visible ? "visible" : ""}`}
			>
				<div className="grid grid-cols-12 gap-8">
					<div className="col-span-12 lg:col-span-5">
						<div className="mb-4 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
							Behind the Scenes
						</div>
						<h2 className="font-black text-4xl uppercase leading-tight tracking-tight">
							Über uns
							<br />
						</h2>
					</div>
					<div className="col-span-12 lg:col-span-7">
						<div className="space-y-6">
							<div className="border-[#222] border-l-2 pl-6">
								<p className="text-[#999] text-sm leading-relaxed">
									Wir sind das Technik-Team am IGG. Mehr Infos über uns folgen
									bald!
								</p>
							</div>
							<div className="border-[#222] border-l-2 pl-6">
								<p className="text-[#999] text-sm leading-relaxed">
									Im laufe des letzten Monats haben wir diese Website entwickelt
									um es euch Lehrern noch einfacher zu machen euer Event bei uns
									Anzumelden...
								</p>
							</div>
							<div className="border border-[#ff3d00]/20 bg-[#111] p-6">
								<p className="font-mono text-[#e8e4de] text-sm leading-relaxed">
									Bist du an Technik interessiert? Schau doch einfach mal
									vorbei. Wir freuen uns (fast) immer über neue Mitglieder.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Divider */}
			<div className="mx-auto max-w-[1400px] px-6">
				<div className="h-px bg-[#222]" />
			</div>

			{/* Tutorial */}
			<section
				ref={tutorialReveal.ref}
				id="tutorial"
				className={`reveal-section mx-auto max-w-[1400px] px-6 py-20 ${tutorialReveal.visible ? "visible" : ""}`}
			>
				<div className="grid grid-cols-12 gap-8">
					<div className="col-span-12 lg:col-span-4">
						<div className="mb-4 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
							Anleitung und so
						</div>
						<h2 className="font-black text-4xl uppercase leading-tight tracking-tight">
							Event per
							<br />
							E-Mail anfragen
						</h2>
						<div className="mt-4 border border-[#ff3d00]/40 bg-[#ff3d00]/10 p-3">
							<div className="mb-1 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.18em]">
								Hinweis
							</div>
							<div className="">
							<p className="font-mono text-[#ff3d00] text-[11px] leading-relaxed">
								E-Mails werden zur Verarbeitung der Anfrage über 
								<a href="https://legal.mistral.ai/terms/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-[12px]"> Mistral</a>.  
								weitergeleitet.
							</p>
							</div>
							<button
								type="button"
								onClick={() => setIsAiInfoOpen(true)}
								className="mt-2 border border-[#ff3d00]/40 px-2 py-1 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.14em] transition-colors hover:bg-[#ff3d00]/20"
							>
								Mehr Infos
							</button>
						</div>
						<p className="mt-4 text-[#666] text-sm leading-relaxed">
							Sie können auch ohne Account ein Event bei uns anfragen. Schicken
							Sie einfach eine E-Mail mit den wichtigsten Infos.
						</p>
					</div>
					<div className="col-span-12 lg:col-span-8">
						<div className="space-y-px">
							{STEPS.map((step) => (
								<div
									key={step.num}
									className="group flex gap-6 border border-[#222] bg-[#111] p-6 transition-colors hover:border-[#ff3d00]/30"
								>
									<div className="font-black font-mono text-3xl text-[#222] transition-colors group-hover:text-[#ff3d00] select-none">
										{step.num}
									</div>
									<div>
										<h3 className="mb-1 font-bold text-lg uppercase tracking-tight">
											{step.title}
										</h3>
										<p className="text-[#666] text-sm">{step.desc}</p>
									</div>
								</div>
							))}
						</div>
						<div className="mt-6 border border-[#333] border-dashed bg-[#0d0d0d] p-5">
							<div className="mb-2 font-mono text-[#666] text-[10px] uppercase tracking-[0.3em]">
								E-Mail Adresse
							</div>
							<a
								href="mailto:event@igg.codity.app"
								className="font-mono text-[#ff3d00] text-xl hover:underline"
							>
								event@igg.codity.app
							</a>
						</div>
						<div className="mt-4 flex items-center gap-3 border-[#222] border-t pt-4">
							<span className="text-[#666] text-sm">
								Keine Lust auf E-Mails?
							</span>
							<Link
								href={"/event-request" as Route}
								className="group inline-flex items-center gap-2 font-mono text-[#ff3d00] text-xs uppercase tracking-[0.2em] transition-colors hover:text-[#ff5722]"
							>
								Formular ausfüllen
								<svg
									className="h-3 w-3 transition-transform group-hover:translate-x-1"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
									aria-hidden="true"
								>
									<path d="M5 12h14M12 5l7 7-7 7" />
								</svg>
							</Link>
						</div>
					</div>
				</div>
			</section>
			<Sheet open={isAiInfoOpen} onOpenChange={setIsAiInfoOpen}>
				<SheetContent
					side="right"
					className="w-full border-[#222] border-l bg-[#0a0a0a] text-[#e8e4de] sm:max-w-xl"
				>
					<SheetHeader>
						<SheetTitle className="font-bold font-mono text-[#e8e4de] text-sm uppercase tracking-[0.15em]">
							Datenschutzhinweis
						</SheetTitle>
						<SheetDescription className="font-mono text-[#777] text-xs">
							Wie wir Ihre E-Mail-Inhalte mit Mistral verarbeiten.
						</SheetDescription>
					</SheetHeader>
					<div className="space-y-4 px-4 pb-4 font-mono text-[#c9c4be] text-xs leading-relaxed">
						<p>
							Zur automatischen Verarbeitung Ihrer Event-Anfrage senden wir den
							Betreff und den Inhalt Ihrer E-Mail an 
							<a href="https://legal.mistral.ai/terms/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-[12px]"> Mistral</a>.  
							.
						</p>
						<p>
							Wir senden dafür keine zusätzlichen personenbezogenen Daten wie
							Ihre E-Mail-Adresse oder andere Metadaten.
						</p>
						<div className="border border-[#ff3d00]/40 bg-[#ff3d00]/10 p-3 text-[#ff3d00]">
							Bitte senden Sie keine sensiblen Daten in Ihrer Anfrage-E-Mail.
						</div>
						<div className="border border-[#333] bg-[#111] p-3">
							<p className="text-[#e8e4de]">
								Wenn Ihr Event sensible Daten enthält oder Sie keine
								Verarbeitung durch KI möchten, nutzen Sie bitte stattdessen unser
								Formular:
							</p>
							<Link
								href={"/event-request" as Route}
								onClick={() => setIsAiInfoOpen(false)}
								className="mt-2 inline-flex border border-[#ff3d00]/40 bg-[#ff3d00]/10 px-2 py-1 text-[#ff3d00] text-[10px] uppercase tracking-[0.14em] transition-colors hover:bg-[#ff3d00]/20"
							>
								Zum Formular
							</Link>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
