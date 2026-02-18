"use client";

import type { Id } from "@igg/backend/convex/_generated/dataModel";
import { Minus, Plus, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type EquipmentSelectionValue = Record<string, number>;

type InventoryItem = {
	_id: Id<"inventoryItems">;
	name: string;
	count: number;
};

type EventEquipmentSelectorProps = {
	idPrefix: string;
	items: InventoryItem[] | undefined;
	value: EquipmentSelectionValue;
	onChange: (value: EquipmentSelectionValue) => void;
	readOnly?: boolean;
	className?: string;
};

function selectedCount(value: EquipmentSelectionValue) {
	return Object.values(value).filter((quantity) => quantity > 0).length;
}

function selectedQuantity(value: EquipmentSelectionValue) {
	return Object.values(value)
		.filter((quantity) => quantity > 0)
		.reduce((sum, quantity) => sum + quantity, 0);
}

export function eventEquipmentToMutationInput(value: EquipmentSelectionValue) {
	return Object.entries(value)
		.filter(([, quantity]) => Number.isInteger(quantity) && quantity > 0)
		.map(([itemId, quantity]) => ({
			itemId: itemId as Id<"inventoryItems">,
			count: quantity,
		}));
}

export function eventEquipmentFromStoredValue(
	equipment:
		| Array<{
				itemId: Id<"inventoryItems">;
				count?: number;
				quantity?: number;
		  }>
		| undefined,
) {
	if (!equipment) {
		return {};
	}
	const map: EquipmentSelectionValue = {};
	for (const item of equipment) {
		const count =
			typeof item.count === "number" ? item.count : (item.quantity ?? 0);
		if (Number.isInteger(count) && count > 0) {
			map[item.itemId] = count;
		}
	}
	return map;
}

export function EventEquipmentSelector({
	idPrefix,
	items,
	value,
	onChange,
	readOnly = false,
	className,
}: EventEquipmentSelectorProps) {
	const setQuantity = (itemId: string, max: number, rawQuantity: number) => {
		const quantity = Math.max(0, Math.min(max, Math.trunc(rawQuantity || 0)));
		onChange({
			...value,
			[itemId]: quantity,
		});
	};

	const selectedItems =
		items?.filter((item) => (value[item._id] ?? 0) > 0) ?? [];

	if (readOnly) {
		return (
			<div className={cn("space-y-3", className)}>
				<div className="flex items-center justify-between gap-3">
					<Label className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
						Equipment
					</Label>
					<Badge className="border-none bg-[#1f1f1f] font-mono text-[#b9b1a8] text-[10px] uppercase tracking-[0.12em]">
						{selectedCount(value)} Typen • {selectedQuantity(value)} gesamt
					</Badge>
				</div>
				{!items ? (
					<Skeleton className="h-20 w-full bg-[#111]" />
				) : selectedItems.length === 0 ? (
					<div className="flex items-center gap-2 border border-[#222] bg-[#111] px-3 py-3 font-mono text-[#777] text-xs">
						<Wrench className="size-4 text-[#555]" />
						Kein Equipment zugewiesen
					</div>
				) : (
					<div className="grid gap-2">
						{selectedItems.map((item) => (
							<div
								key={item._id}
								className="flex items-center justify-between gap-3 border border-[#222] bg-[#111] px-3 py-2.5"
							>
								<div className="font-medium text-[#e8e4de] text-sm">
									{item.name}
								</div>
								<div className="font-mono text-[#b9b1a8] text-xs">
									{value[item._id]} / {item.count}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		);
	}

	return (
		<div className={cn("space-y-3", className)}>
			<div className="flex items-center justify-between gap-3">
				<Label className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
					Equipment
				</Label>
				<Badge className="border-none bg-[#1f1f1f] font-mono text-[#b9b1a8] text-[10px] uppercase tracking-[0.12em]">
					{selectedCount(value)} Typen • {selectedQuantity(value)} gesamt
				</Badge>
			</div>

			<div className="space-y-2 border border-[#222] bg-[#0b0b0b] p-3">
				{!items ? (
					Array.from({ length: 4 }).map((_, index) => (
						<Skeleton
							key={`${idPrefix}-equipment-skeleton-${index + 1}`}
							className="h-12 w-full bg-[#111]"
						/>
					))
				) : items.length === 0 ? (
					<div className="flex items-center gap-2 border border-[#222] bg-[#111] px-3 py-3 font-mono text-[#777] text-xs">
						<Wrench className="size-4 text-[#555]" />
						Keine Inventory-Items vorhanden
					</div>
				) : (
					items.map((item) => {
						const itemId = `${idPrefix}-equipment-${item._id}`;
						const quantity = value[item._id] ?? 0;
						return (
							<div
								key={item._id}
								className={cn(
									"grid gap-2 border px-3 py-2.5 transition-colors sm:grid-cols-[1fr_auto]",
									quantity > 0
										? "border-[#ff3d00]/40 bg-[#ff3d00]/5"
										: "border-[#222] bg-[#111]",
								)}
							>
								<div>
									<Label htmlFor={itemId} className="text-[#e8e4de] text-sm">
										{item.name}
									</Label>
									<div className="mt-0.5 font-mono text-[#777] text-[10px] uppercase tracking-[0.12em]">
										Verfügbar: {item.count}
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Button
										type="button"
										variant="outline"
										size="icon-sm"
										onClick={() =>
											setQuantity(item._id, item.count, quantity - 1)
										}
										disabled={quantity <= 0}
										className="border-[#222] bg-[#111] text-[#999] hover:bg-[#141414] hover:text-[#ff3d00]"
									>
										<Minus className="size-3.5" />
									</Button>
									<Input
										id={itemId}
										type="number"
										min={0}
										max={item.count}
										step={1}
										value={String(quantity)}
										onChange={(event) =>
											setQuantity(
												item._id,
												item.count,
												Number(event.target.value),
											)
										}
										className="w-20 border-[#222] bg-[#0d0d0d] text-center font-mono text-xs"
									/>
									<Button
										type="button"
										variant="outline"
										size="icon-sm"
										onClick={() =>
											setQuantity(item._id, item.count, quantity + 1)
										}
										disabled={quantity >= item.count}
										className="border-[#222] bg-[#111] text-[#999] hover:bg-[#141414] hover:text-[#ff3d00]"
									>
										<Plus className="size-3.5" />
									</Button>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
