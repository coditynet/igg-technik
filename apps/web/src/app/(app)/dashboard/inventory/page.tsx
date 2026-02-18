"use client";

import { api } from "@igg/backend/convex/_generated/api";
import type { Id } from "@igg/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { goeyToast } from "goey-toast";
import { Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export default function InventoryPage() {
	const items = useQuery(api.inventory.list, {});
	const createItem = useMutation(api.inventory.create);
	const updateItem = useMutation(api.inventory.update);
	const removeItem = useMutation(api.inventory.remove);

	const [newItemName, setNewItemName] = useState("");
	const [newItemQuantity, setNewItemQuantity] = useState("1");
	const [search, setSearch] = useState("");
	const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
	const [editingItemId, setEditingItemId] =
		useState<Id<"inventoryItems"> | null>(null);
	const [editName, setEditName] = useState("");
	const [isSavingEdit, setIsSavingEdit] = useState(false);
	const [draftCounts, setDraftCounts] = useState<Record<string, string>>({});
	const [editingCountId, setEditingCountId] =
		useState<Id<"inventoryItems"> | null>(null);

	const filteredItems = useMemo(() => {
		if (!items) return [];
		const query = search.trim().toLowerCase();
		if (!query) return items;
		return items.filter((item) => item.name.toLowerCase().includes(query));
	}, [items, search]);

	useEffect(() => {
		if (!items) return;
		setDraftCounts(
			Object.fromEntries(items.map((item) => [item._id, String(item.count)])),
		);
	}, [items]);

	const handleAddItem = async () => {
		const name = newItemName.trim();
		const count = Number(newItemQuantity);

		if (!name) {
			goeyToast.error("Bitte geben Sie einen Item-Namen ein.");
			return;
		}

		if (!Number.isInteger(count) || count < 0) {
			goeyToast.error("Bitte geben Sie eine gultige Menge ein.");
			return;
		}

		try {
			await createItem({ name, count });
			setNewItemName("");
			setNewItemQuantity("1");
			goeyToast.success("Item hinzugefugt.");
		} catch {
			goeyToast.error("Item konnte nicht hinzugefugt werden.");
		}
	};

	const handleQuantityBlur = async (
		id: Id<"inventoryItems">,
		currentCount: number,
		nextValue: string,
	) => {
		const nextCount = Number(nextValue);

		if (!Number.isInteger(nextCount) || nextCount < 0) {
			goeyToast.error("Bitte geben Sie eine gultige Menge ein.");
			setDraftCounts((prev) => ({ ...prev, [id]: String(currentCount) }));
			return;
		}

		if (nextCount === currentCount) return;

		setSavingIds((prev) => ({ ...prev, [id]: true }));
		try {
			await updateItem({ id, count: nextCount });
		} catch {
			goeyToast.error("Menge konnte nicht aktualisiert werden.");
			setDraftCounts((prev) => ({ ...prev, [id]: String(currentCount) }));
		} finally {
			setSavingIds((prev) => {
				const { [id]: _removed, ...rest } = prev;
				return rest;
			});
		}
	};

	const handleCountStep = async (
		id: Id<"inventoryItems">,
		currentCount: number,
		delta: number,
	) => {
		const nextCount = currentCount + delta;
		if (nextCount < 0) return;
		setDraftCounts((prev) => ({ ...prev, [id]: String(nextCount) }));
		await handleQuantityBlur(id, currentCount, String(nextCount));
	};

	const handleRemoveItem = async (id: Id<"inventoryItems">) => {
		setSavingIds((prev) => ({ ...prev, [id]: true }));
		try {
			await removeItem({ id });
			goeyToast.success("Item entfernt.");
		} catch {
			goeyToast.error("Item konnte nicht entfernt werden.");
		} finally {
			setSavingIds((prev) => {
				const { [id]: _removed, ...rest } = prev;
				return rest;
			});
		}
	};

	const openEditDialog = (id: Id<"inventoryItems">, name: string) => {
		setEditingItemId(id);
		setEditName(name);
	};

	const closeEditDialog = () => {
		setEditingItemId(null);
		setEditName("");
	};

	const handleEditDialogOpenChange = (open: boolean) => {
		if (!open) {
			closeEditDialog();
		}
	};

	const handleSaveName = async () => {
		if (!editingItemId) return;
		const name = editName.trim();

		if (!name) {
			goeyToast.error("Bitte geben Sie einen Item-Namen ein.");
			return;
		}

		setIsSavingEdit(true);
		try {
			await updateItem({ id: editingItemId, name });
			goeyToast.success("Name aktualisiert.");
			closeEditDialog();
		} catch {
			goeyToast.error("Name konnte nicht aktualisiert werden.");
		} finally {
			setIsSavingEdit(false);
		}
	};

	const getVisibleCount = (id: Id<"inventoryItems">, fallbackCount: number) => {
		if (savingIds[id] && draftCounts[id] !== undefined) {
			return draftCounts[id];
		}
		return String(fallbackCount);
	};

	return (
		<>
			<div className="max-w-6xl space-y-6">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<div className="mb-2 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
							Verwaltung
						</div>
						<h1 className="font-black text-3xl uppercase tracking-tight">
							Inventory
						</h1>
						<p className="mt-1 font-mono text-[#777] text-xs">
							Markieren Sie, wie viele Gerate verfugbar sind.
						</p>
					</div>
				</div>

				<div className="h-px bg-[#222]" />

				<div className="grid gap-3 md:grid-cols-[2fr_1fr_auto]">
					<Input
						placeholder="Neues item (z. B. Microphones)"
						value={newItemName}
						onChange={(event) => setNewItemName(event.target.value)}
						className="border-[#222] bg-[#111] font-mono text-xs"
					/>
					<Input
						type="number"
						min={0}
						step={1}
						placeholder="Menge"
						value={newItemQuantity}
						onChange={(event) => setNewItemQuantity(event.target.value)}
						className="border-[#222] bg-[#111] font-mono text-xs"
					/>
					<Button
						type="button"
						onClick={handleAddItem}
						className="bg-[#ff3d00] font-mono text-black text-xs uppercase tracking-[0.1em] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#ff3d00] hover:shadow-[5px_5px_0_0_rgba(255,61,0,0.3)]"
					>
						Item hinzufugen
					</Button>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<Input
						placeholder="Suchen..."
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						className="max-w-sm border-[#222] bg-[#111] font-mono text-xs"
					/>
				</div>

				<div className="border border-[#222] bg-[#0f0f0f]">
					<Table>
						<TableHeader>
							<TableRow className="border-[#222] hover:bg-transparent">
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Item
								</TableHead>
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Menge
								</TableHead>
								<TableHead className="text-right font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Aktion
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items === undefined ? (
								Array.from({ length: 5 }).map((_, index) => (
									<TableRow
										key={`inventory-loading-${index + 1}`}
										className="border-[#1c1c1c] hover:bg-transparent"
									>
										<TableCell>
											<Skeleton className="h-4 w-[70%] bg-[#111]" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-9 w-24 bg-[#111]" />
										</TableCell>
										<TableCell className="text-right">
											<Skeleton className="ml-auto h-9 w-28 bg-[#111]" />
										</TableCell>
									</TableRow>
								))
							) : filteredItems.length === 0 ? (
								<TableRow className="border-[#1c1c1c] hover:bg-transparent">
									<TableCell
										colSpan={3}
										className="h-36 text-center font-mono text-[#777] text-xs"
									>
										Keine Inventory-Items gefunden.
									</TableCell>
								</TableRow>
							) : (
								filteredItems.map((item) => (
									<TableRow
										key={item._id}
										className="border-[#1c1c1c] hover:bg-[#ff3d00]/5"
									>
										<TableCell className="font-medium text-[#e8e4de]">
											{item.name}
										</TableCell>
										<TableCell className="w-[220px]">
											<ButtonGroup
												aria-label={`Menge für ${item.name}`}
												className="w-fit"
											>
												<Button
													type="button"
													variant="outline"
													size="icon-sm"
													disabled={savingIds[item._id]}
													onClick={() =>
														void handleCountStep(item._id, item.count, -1)
													}
													className="border-[#222] bg-[#111] text-[#888] hover:bg-[#111] hover:text-[#ff3d00]"
													aria-label="Menge verringern"
												>
													<Minus className="h-3.5 w-3.5" />
												</Button>
												{editingCountId === item._id ? (
													<Input
														type="number"
														min={0}
														step={1}
														value={draftCounts[item._id] ?? String(item.count)}
														onChange={(event) =>
															setDraftCounts((prev) => ({
																...prev,
																[item._id]: event.target.value,
															}))
														}
														onBlur={() => {
															setEditingCountId(null);
															void handleQuantityBlur(
																item._id,
																item.count,
																draftCounts[item._id] ?? String(item.count),
															);
														}}
														onKeyDown={(event) => {
															if (event.key === "Enter") {
																setEditingCountId(null);
																void handleQuantityBlur(
																	item._id,
																	item.count,
																	draftCounts[item._id] ?? String(item.count),
																);
															}
															if (event.key === "Escape") {
																setEditingCountId(null);
																setDraftCounts((prev) => ({
																	...prev,
																	[item._id]: String(item.count),
																}));
															}
														}}
														autoFocus
														className="h-7 w-14 border-[#222] bg-[#111] px-1 text-center font-mono text-xs"
													/>
												) : (
													<ButtonGroupText
														asChild
														className="w-14 justify-center border-[#222] bg-[#111] font-mono text-[#e8e4de] text-xs"
													>
														<button
															type="button"
															disabled={savingIds[item._id]}
															onClick={() => {
																setEditingCountId(item._id);
																setDraftCounts((prev) => ({
																	...prev,
																	[item._id]: String(item.count),
																}));
															}}
															aria-label="Menge bearbeiten"
														>
															{getVisibleCount(item._id, item.count)}
														</button>
													</ButtonGroupText>
												)}
												<Button
													type="button"
													variant="outline"
													size="icon-sm"
													disabled={savingIds[item._id]}
													onClick={() =>
														void handleCountStep(item._id, item.count, 1)
													}
													className="border-[#222] bg-[#111] text-[#888] hover:bg-[#111] hover:text-[#ff3d00]"
													aria-label="Menge erhohen"
												>
													<Plus className="h-3.5 w-3.5" />
												</Button>
											</ButtonGroup>
										</TableCell>
										<TableCell>
											<div className="flex justify-end gap-2">
												<Button
													type="button"
													variant="outline"
													size="icon-sm"
													disabled={savingIds[item._id]}
													onClick={() => openEditDialog(item._id, item.name)}
													className="border-[#222] bg-[#111] text-[#888] hover:bg-[#111] hover:text-[#ff3d00]"
													aria-label="Item bearbeiten"
													title="Item bearbeiten"
												>
													<Pencil className="h-3.5 w-3.5" />
												</Button>
												<Button
													type="button"
													variant="destructive"
													size="icon-sm"
													disabled={savingIds[item._id]}
													onClick={() => void handleRemoveItem(item._id)}
													className="border border-[#ff3d00]/40 bg-[#ff3d00]/10 text-[#ff3d00] hover:bg-[#ff3d00]/20"
													aria-label="Item loschen"
													title="Item loschen"
												>
													<Trash2 className="h-3.5 w-3.5" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>
			<Dialog
				open={editingItemId !== null}
				onOpenChange={handleEditDialogOpenChange}
			>
				<DialogContent className="border-[#222] bg-[#0a0a0a] text-[#e8e4de]">
					<DialogHeader>
						<DialogTitle className="font-bold font-mono text-[#e8e4de] uppercase tracking-tight">
							Item bearbeiten
						</DialogTitle>
						<DialogDescription className="font-mono text-[#777] text-xs">
							Aktualisieren Sie den Namen des Inventory-Items.
						</DialogDescription>
					</DialogHeader>
					<Input
						value={editName}
						onChange={(event) => setEditName(event.target.value)}
						placeholder="Item-Name"
						className="border-[#222] bg-[#111] font-mono"
					/>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							disabled={isSavingEdit}
							onClick={closeEditDialog}
							className="border-[#222] bg-[#111] font-mono text-xs uppercase tracking-[0.1em]"
						>
							Abbrechen
						</Button>
						<Button
							type="button"
							disabled={isSavingEdit}
							onClick={() => void handleSaveName()}
							className="bg-[#ff3d00] font-mono text-black text-xs uppercase tracking-[0.1em] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#ff3d00] hover:shadow-[5px_5px_0_0_rgba(255,61,0,0.3)]"
						>
							{isSavingEdit ? "Speichern..." : "Speichern"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
