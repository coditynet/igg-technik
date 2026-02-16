"use client";

import { useMemo } from "react";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const MOCK_EVENTS = [
	{ day: 3, title: "Theaterprobe", color: "bg-blue-500/80" },
	{ day: 7, title: "Konzert Aufbau", color: "bg-orange-500/80" },
	{ day: 8, title: "Konzert", color: "bg-orange-500/80" },
	{ day: 12, title: "Technik AG", color: "bg-violet-500/80" },
	{ day: 15, title: "Elternabend", color: "bg-rose-500/80" },
	{ day: 19, title: "Technik AG", color: "bg-violet-500/80" },
	{ day: 22, title: "Schulaufführung", color: "bg-emerald-500/80" },
	{ day: 23, title: "Schulaufführung", color: "bg-emerald-500/80" },
	{ day: 26, title: "Technik AG", color: "bg-violet-500/80" },
	{ day: 28, title: "Wartung", color: "bg-blue-500/80" },
];

interface MockCalendarProps {
	className?: string;
	variant?: "light" | "dark" | "glass";
}

export function MockCalendar({
	className = "",
	variant = "light",
}: MockCalendarProps) {
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

		for (let i = startDay - 1; i >= 0; i--) {
			cells.push({ day: daysInPrevMonth - i, current: false, today: false });
		}
		for (let i = 1; i <= daysInMonth; i++) {
			cells.push({ day: i, current: true, today: i === today });
		}
		const remaining = 42 - cells.length;
		for (let i = 1; i <= remaining; i++) {
			cells.push({ day: i, current: false, today: false });
		}

		return cells;
	}, [year, month, today]);

	const baseStyles = {
		light: {
			container: "bg-white border border-neutral-200",
			header: "text-neutral-900",
			weekday: "text-neutral-400",
			day: "text-neutral-900",
			dayMuted: "text-neutral-300",
			today: "bg-neutral-900 text-white",
			eventText: "text-white",
		},
		dark: {
			container: "bg-neutral-900 border border-neutral-700",
			header: "text-white",
			weekday: "text-neutral-500",
			day: "text-neutral-100",
			dayMuted: "text-neutral-600",
			today: "bg-white text-neutral-900",
			eventText: "text-white",
		},
		glass: {
			container: "bg-white/5 backdrop-blur-xl border border-white/10",
			header: "text-white",
			weekday: "text-white/40",
			day: "text-white/90",
			dayMuted: "text-white/20",
			today: "bg-white text-black",
			eventText: "text-white",
		},
	};

	const s = baseStyles[variant];

	return (
		<div className={`${s.container} rounded-2xl p-5 ${className}`}>
			<div className="mb-5 flex items-center justify-between">
				<h3 className={`font-semibold text-lg capitalize ${s.header}`}>
					{monthName}
				</h3>
				<div className="flex gap-1">
					<button
						className={`rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/5 ${s.header}`}
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path
								d="M10 12L6 8L10 4"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					<button
						className={`rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/5 ${s.header}`}
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path
								d="M6 4L10 8L6 12"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				</div>
			</div>
			<div className="mb-2 grid grid-cols-7 gap-0.5">
				{WEEKDAYS.map((d) => (
					<div
						key={d}
						className={`py-1 text-center font-medium text-xs ${s.weekday}`}
					>
						{d}
					</div>
				))}
			</div>
			<div className="grid grid-cols-7 gap-0.5">
				{days.map((cell, i) => {
					const event = cell.current
						? MOCK_EVENTS.find((e) => e.day === cell.day)
						: null;
					return (
						<div
							key={i}
							className={`relative flex aspect-square flex-col items-center justify-start rounded-lg pt-1 text-sm transition-colors ${
								cell.today
									? `${s.today} font-bold`
									: cell.current
										? `${s.day} hover:bg-black/5 dark:hover:bg-white/5`
										: s.dayMuted
							}`}
						>
							<span className="text-xs leading-none">{cell.day}</span>
							{event && (
								<div
									className={`mt-0.5 w-[85%] rounded-sm px-0.5 py-px ${event.color}`}
								>
									<span
										className={`block truncate font-medium text-[7px] leading-tight ${s.eventText}`}
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
	);
}
