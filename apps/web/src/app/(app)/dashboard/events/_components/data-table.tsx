"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	totalCount?: number;
	page?: number;
	pageSize?: number;
	hasMore?: boolean;
	onPageChange?: (page: number) => void;
	loading?: boolean;
}

const SKELETON_WIDTHS = ["w-32", "w-28", "w-28", "w-16", "w-20"];

export function DataTable<TData, TValue>({
	columns,
	data,
	totalCount,
	page = 0,
	pageSize = 50,
	hasMore = false,
	onPageChange,
	loading = false,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const showPagination = !loading && totalCount !== undefined && onPageChange;
	const startItem = page * pageSize + 1;
	const endItem = Math.min((page + 1) * pageSize, totalCount ?? 0);

	return (
		<div className="space-y-4">
			<div className="border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="border-b hover:bg-transparent">
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id} className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ff3d00]">
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{loading ? (
							Array.from({ length: 10 }).map((_, i) => (
								<TableRow key={i} className="border-b">
									{columns.map((_, j) => (
										<TableCell key={j} className="font-mono text-xs">
											<Skeleton className={`h-4 ${SKELETON_WIDTHS[j] ?? "w-24"}`} />
										</TableCell>
									))}
								</TableRow>
							))
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className="border-b transition-colors hover:bg-[#ff3d00]/5"
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className="font-mono text-xs">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center font-mono text-xs text-muted-foreground">
									Keine Ergebnisse.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{showPagination && totalCount > 0 && (
				<div className="flex items-center justify-between">
					<div className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
						{startItem}&ndash;{endItem} von {totalCount}
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => onPageChange(page - 1)}
							disabled={page === 0}
							className="font-mono text-[10px] uppercase tracking-[0.1em]"
						>
							&larr; Zurück
						</Button>
						<div className="font-mono text-[10px] uppercase tracking-[0.1em]">
							{page + 1}/{Math.ceil(totalCount / pageSize)}
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => onPageChange(page + 1)}
							disabled={!hasMore}
							className="font-mono text-[10px] uppercase tracking-[0.1em]"
						>
							Weiter &rarr;
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
