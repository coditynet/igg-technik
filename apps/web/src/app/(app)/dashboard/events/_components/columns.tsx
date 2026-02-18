"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EventShareDialog } from "./event-share-dialog";

export type Event = {
	_id: string;
	title: string;
	start: string;
	end: string;
	location?: string;
	group?: {
		name: string;
		color: string;
	};
};

const colorMap: Record<string, string> = {
	blue: "bg-blue-500 hover:bg-blue-500",
	orange: "bg-orange-500 hover:bg-orange-500",
	violet: "bg-violet-500 hover:bg-violet-500",
	rose: "bg-rose-500 hover:bg-rose-500",
	emerald: "bg-emerald-500 hover:bg-emerald-500",
};

export const columns: ColumnDef<Event>[] = [
	{
		accessorKey: "title",
		header: "Titel",
		cell: ({ row }) => {
			return (
				<Link
					href={`/dashboard/events/${row.original._id}` as any}
					className="font-medium text-[#ff3d00] hover:underline"
				>
					{row.getValue("title")}
				</Link>
			);
		},
	},
	{
		accessorKey: "start",
		header: "Start",
		cell: ({ row }) => {
			const date = new Date(row.getValue("start"));
			return (
				<span className="text-muted-foreground">
					{format(date, "PP p", { locale: de })}
				</span>
			);
		},
	},
	{
		accessorKey: "end",
		header: "Ende",
		cell: ({ row }) => {
			const date = new Date(row.getValue("end"));
			return (
				<span className="text-muted-foreground">
					{format(date, "PP p", { locale: de })}
				</span>
			);
		},
	},
	{
		accessorKey: "group",
		header: "Gruppe",
		cell: ({ row }) => {
			const group = row.original.group;
			if (!group) {
				return <span className="text-muted-foreground">&mdash;</span>;
			}

			const colorClass =
				colorMap[group.color] || "bg-gray-500 hover:bg-gray-500";

			return (
				<Badge
					className={`${colorClass} border-none font-mono text-[10px] uppercase tracking-[0.1em] text-white`}
				>
					{group.name}
				</Badge>
			);
		},
	},
	{
		accessorKey: "location",
		header: "Ort",
		cell: ({ row }) => {
			const location = row.getValue("location") as string | undefined;
			if (!location) {
				return <span className="text-muted-foreground">&mdash;</span>;
			}
			return <span className="text-muted-foreground">{location}</span>;
		},
	},
	{
		id: "share",
		header: "Teilen",
		cell: ({ row }) => {
			return (
				<EventShareDialog
					eventId={row.original._id}
					title={row.original.title}
				/>
			);
		},
	},
];
