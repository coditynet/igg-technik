"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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
	blue: "bg-blue-500",
	orange: "bg-orange-500",
	violet: "bg-violet-500",
	rose: "bg-rose-500",
	emerald: "bg-emerald-500",
};

export const columns: ColumnDef<Event>[] = [
	{
		accessorKey: "title",
		header: "Titel",
		cell: ({ row }) => {
			return (
				<Link
					href={`/dashboard/events/${row.original._id}` as any}
					className="font-medium hover:underline"
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
			return format(date, "PP p", { locale: de });
		},
	},
	{
		accessorKey: "end",
		header: "Ende",
		cell: ({ row }) => {
			const date = new Date(row.getValue("end"));
			return format(date, "PP p", { locale: de });
		},
	},
	{
		accessorKey: "group",
		header: "Gruppe",
		cell: ({ row }) => {
			const group = row.original.group;
			if (!group) {
				return <span className="text-muted-foreground">-</span>;
			}

			const colorClass = colorMap[group.color] || "bg-gray-500";

			return (
				<Badge
					className={`${colorClass} hover:${colorClass} border-none text-white`}
				>
					{group.name}
				</Badge>
			);
		},
	},
	{
		accessorKey: "location",
		header: "Ort",
	},
];
