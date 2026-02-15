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

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	totalCount?: number;
	page?: number;
	pageSize?: number;
	hasMore?: boolean;
	onPageChange?: (page: number) => void;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	totalCount,
	page = 0,
	pageSize = 50,
	hasMore = false,
	onPageChange,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const showPagination = totalCount !== undefined && onPageChange;
	const startItem = page * pageSize + 1;
	const endItem = Math.min((page + 1) * pageSize, totalCount ?? 0);

	return (
		<div className="space-y-4">
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
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
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									Keine Ergebnisse.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{showPagination && totalCount > 0 && (
				<div className="flex items-center justify-between">
					<div className="text-muted-foreground text-sm">
						{startItem} bis {endItem} von {totalCount} Veranstaltungen
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => onPageChange(page - 1)}
							disabled={page === 0}
						>
							Zurück
						</Button>
						<div className="text-sm">
							Seite {page + 1} von {Math.ceil(totalCount / pageSize)}
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => onPageChange(page + 1)}
							disabled={!hasMore}
						>
							Weiter
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
