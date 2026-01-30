"use client";

import { api } from "@igg/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";

export default function EventsPage() {
	const [search, setSearch] = useState("");
	const [selectedGroup, setSelectedGroup] = useState<string>("all");
	const [timeFilter, setTimeFilter] = useState<"upcoming" | "past" | "all">("upcoming");
	const [page, setPage] = useState(0);
	const [pageSize] = useState(50);

	const groups = useQuery(api.groups.list);

	const todayStart = useMemo(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return today.getTime();
	}, []);

	const queryArgs = useMemo(() => ({
		query: search || undefined,
		groupId: selectedGroup !== "all" ? (selectedGroup as any) : undefined,
		start: timeFilter === "upcoming" ? todayStart : undefined,
		end: timeFilter === "past" ? todayStart : undefined,
		page,
		pageSize,
	}), [search, selectedGroup, timeFilter, todayStart, page, pageSize]);

	const eventsResult = useQuery(api.events.search, queryArgs);

	useEffect(() => {
		setPage(0);
	}, [search, selectedGroup, timeFilter]);

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	return (
		<div className="max-w-6xl space-y-4">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Veranstaltungen</h1>
				<p className="text-muted-foreground">
					Verwalten und anzeigen Sie Veranstaltungen.
				</p>
			</div>

			<div className="flex flex-wrap items-center gap-4">
				<Input
					placeholder="Veranstaltungen suchen..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="max-w-sm"
				/>

				<Select value={timeFilter} onValueChange={(value: "upcoming" | "past" | "all") => setTimeFilter(value)}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Nach Zeit filtern" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="upcoming">Kommende</SelectItem>
						<SelectItem value="past">Vergangene</SelectItem>
						<SelectItem value="all">Alle</SelectItem>
					</SelectContent>
				</Select>

				<Select value={selectedGroup} onValueChange={setSelectedGroup}>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="Nach Gruppe filtern" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Alle Gruppen</SelectItem>
						{groups?.map((group) => (
							<SelectItem key={group._id} value={group._id}>
								{group.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{eventsResult ? (
				<DataTable 
					columns={columns} 
					data={eventsResult.events}
					totalCount={eventsResult.totalCount}
					page={page}
					pageSize={pageSize}
					hasMore={eventsResult.hasMore}
					onPageChange={handlePageChange}
				/>
			) : (
				<div className="space-y-2">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-20 w-full" />
				</div>
			)}
		</div>
	);
}
