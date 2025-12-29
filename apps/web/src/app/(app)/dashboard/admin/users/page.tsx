"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowUpDown,
	Ban,
	CheckCircle,
	Loader2,
	MoreHorizontal,
	Plus,
	Search,
	ShieldCheck,
	ShieldX,
	Trash2,
	UserX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";

type UserData = {
	id: string;
	name: string;
	email: string;
	role?: string;
	banned?: boolean;
	createdAt: Date;
};

export default function AdminUsersPage() {
	const router = useRouter();
	const [users, setUsers] = useState<UserData[]>([]);
	const [total, setTotal] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});

	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [newUser, setNewUser] = useState({
		email: "",
		password: "",
		name: "",
		role: "user" as "user" | "admin",
	});
	const [isCreating, setIsCreating] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

	const { data: session, isPending: isSessionPending } =
		authClient.useSession();

	useEffect(() => {
		if (isSessionPending) {
			return;
		}

		if (!session?.user) {
			router.push("/sign-in");
			return;
		}

		if (session.user.role !== "admin") {
			router.push("/dashboard");
			toast.error("Zugriff verweigert. Sie benötigen Admin-Rechte.");
			return;
		}
	}, [session, isSessionPending, router]);

	const fetchUsers = useCallback(async () => {
		if (isSessionPending || session?.user?.role !== "admin") {
			return;
		}

		setIsLoading(true);
		try {
			if (searchQuery) {
				const [nameResult, emailResult] = await Promise.all([
					authClient.admin.listUsers({
						query: {
							limit: pagination.pageSize,
							offset: pagination.pageIndex * pagination.pageSize,
							searchValue: searchQuery,
							searchField: "name",
							searchOperator: "contains",
						},
					}),
					authClient.admin.listUsers({
						query: {
							limit: pagination.pageSize,
							offset: pagination.pageIndex * pagination.pageSize,
							searchValue: searchQuery,
							searchField: "email",
							searchOperator: "contains",
						},
					}),
				]);

				if (nameResult.error && emailResult.error) {
					toast.error("Fehler beim Laden der Benutzer");
					return;
				}

				const nameUsers = nameResult.data?.users || [];
				const emailUsers = emailResult.data?.users || [];

				const allUsers = [...nameUsers];
				const userIds = new Set(nameUsers.map((u) => u.id));

				for (const user of emailUsers) {
					if (!userIds.has(user.id)) {
						allUsers.push(user);
						userIds.add(user.id);
					}
				}

				const userData = allUsers.map((u) => ({
					id: u.id,
					name: u.name,
					email: u.email,
					role: u.role || "user",
					banned: u.banned || false,
					createdAt: u.createdAt,
				}));

				setUsers(userData);
				setTotal(userData.length);
			} else {
				const result = await authClient.admin.listUsers({
					query: {
						limit: pagination.pageSize,
						offset: pagination.pageIndex * pagination.pageSize,
					},
				});

				if (result.error) {
					toast.error("Fehler beim Laden der Benutzer");
					return;
				}

				const userData = (result.data?.users || []).map((u) => ({
					id: u.id,
					name: u.name,
					email: u.email,
					role: u.role || "user",
					banned: u.banned || false,
					createdAt: u.createdAt,
				}));

				setUsers(userData);
				setTotal(result.data?.total || 0);
			}
		} catch (error) {
			toast.error("Fehler beim Laden der Benutzer");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}, [
		pagination.pageIndex,
		pagination.pageSize,
		searchQuery,
		session,
		isSessionPending,
	]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const handleCreateUser = async () => {
		if (!newUser.email || !newUser.password || !newUser.name) {
			toast.error("Bitte füllen Sie alle Felder aus");
			return;
		}

		setIsCreating(true);
		try {
			const result = await authClient.admin.createUser({
				email: newUser.email,
				password: newUser.password,
				name: newUser.name,
				role: newUser.role,
			});

			if (result.error) {
				toast.error(
					result.error.message || "Fehler beim Erstellen des Benutzers",
				);
				return;
			}

			toast.success("Benutzer erfolgreich erstellt");
			setCreateDialogOpen(false);
			setNewUser({ email: "", password: "", name: "", role: "user" });
			await fetchUsers();
		} catch (error) {
			toast.error("Fehler beim Erstellen des Benutzers");
			console.error(error);
		} finally {
			setIsCreating(false);
		}
	};

	const handleRoleChange = async (
		userId: string,
		newRole: "user" | "admin",
	) => {
		try {
			const result = await authClient.admin.setRole({
				userId,
				role: newRole,
			});

			if (result.error) {
				toast.error(result.error.message || "Fehler beim Ändern der Rolle");
				return;
			}

			toast.success("Rolle erfolgreich geändert");
			await fetchUsers();
		} catch (error) {
			toast.error("Fehler beim Ändern der Rolle");
			console.error(error);
		}
	};

	const handleBanUser = async (userId: string) => {
		try {
			const result = await authClient.admin.banUser({
				userId,
				banReason: "Von Administrator gesperrt",
			});

			if (result.error) {
				toast.error(
					result.error.message || "Fehler beim Sperren des Benutzers",
				);
				return;
			}

			toast.success("Benutzer erfolgreich gesperrt");
			await fetchUsers();
		} catch (error) {
			toast.error("Fehler beim Sperren des Benutzers");
			console.error(error);
		}
	};

	const handleUnbanUser = async (userId: string) => {
		try {
			const result = await authClient.admin.unbanUser({
				userId,
			});

			if (result.error) {
				toast.error(
					result.error.message || "Fehler beim Entsperren des Benutzers",
				);
				return;
			}

			toast.success("Benutzer erfolgreich entsperrt");
			await fetchUsers();
		} catch (error) {
			toast.error("Fehler beim Entsperren des Benutzers");
			console.error(error);
		}
	};

	const handleDeleteUser = async (userId: string) => {
		try {
			const result = await authClient.admin.removeUser({
				userId,
			});

			if (result.error) {
				toast.error(
					result.error.message || "Fehler beim Löschen des Benutzers",
				);
				return;
			}

			toast.success("Benutzer erfolgreich gelöscht");
			await fetchUsers();
		} catch (error) {
			toast.error("Fehler beim Löschen des Benutzers");
			console.error(error);
		}
	};

	const columns: ColumnDef<UserData>[] = [
		{
			accessorKey: "name",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Name
						<ArrowUpDown className="ml-2 size-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const banned = row.original.banned;
				return (
					<div className="flex items-center gap-2">
						<span className="font-medium">{row.getValue("name")}</span>
						{banned && (
							<Badge variant="destructive" className="text-xs">
								Gesperrt
							</Badge>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "email",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						E-Mail
						<ArrowUpDown className="ml-2 size-4" />
					</Button>
				);
			},
			cell: ({ row }) => (
				<div className="lowercase">{row.getValue("email")}</div>
			),
		},
		{
			accessorKey: "role",
			header: "Rolle",
			cell: ({ row }) => {
				const role = row.getValue("role") as string;
				return (
					<Badge variant={role === "admin" ? "default" : "secondary"}>
						{role === "admin" ? "Admin" : "Benutzer"}
					</Badge>
				);
			},
		},
		{
			accessorKey: "createdAt",
			header: "Erstellt am",
			cell: ({ row }) => {
				const date = new Date(row.getValue("createdAt"));
				return <div>{date.toLocaleDateString("de-DE")}</div>;
			},
		},
		{
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => {
				const user = row.original;
				const isBanned = user.banned;

				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="size-8 p-0">
								<span className="sr-only">Menü öffnen</span>
								<MoreHorizontal className="size-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							<DropdownMenuLabel>Aktionen</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() =>
									handleRoleChange(
										user.id,
										user.role === "admin" ? "user" : "admin",
									)
								}
							>
								{user.role === "admin" ? (
									<>
										<ShieldX className="mr-2 size-4" />
										<span>Admin entfernen</span>
									</>
								) : (
									<>
										<ShieldCheck className="mr-2 size-4" />
										<span>Zum Admin machen</span>
									</>
								)}
							</DropdownMenuItem>
							{isBanned ? (
								<DropdownMenuItem onClick={() => handleUnbanUser(user.id)}>
									<CheckCircle className="mr-2 size-4" />
									<span>Entsperren</span>
								</DropdownMenuItem>
							) : (
								<DropdownMenuItem
									onClick={() => handleBanUser(user.id)}
									className="text-destructive"
								>
									<Ban className="mr-2 size-4" />
									<span>Sperren</span>
								</DropdownMenuItem>
							)}
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => setDeleteUserId(user.id)}
								className="text-destructive"
							>
								<Trash2 className="mr-2 size-4" />
								<span>Löschen</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	const table = useReactTable({
		data: users,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: setPagination,
		manualPagination: true,
		pageCount: Math.ceil(total / pagination.pageSize),
		state: {
			sorting,
			columnFilters,
			pagination,
		},
	});

	if (isSessionPending || !session || session.user.role !== "admin") {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="size-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="container mx-auto py-10">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">
						Benutzerverwaltung
					</h1>
					<p className="text-muted-foreground">
						Verwalten Sie Benutzer, Rollen und Berechtigungen
					</p>
				</div>
				<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 size-4" />
							Neuer Benutzer
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Neuen Benutzer erstellen</DialogTitle>
							<DialogDescription>
								Erstellen Sie einen neuen Benutzer mit E-Mail und Passwort.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									value={newUser.name}
									onChange={(e) =>
										setNewUser({ ...newUser, name: e.target.value })
									}
									placeholder="Max Mustermann"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="email">E-Mail</Label>
								<Input
									id="email"
									type="email"
									value={newUser.email}
									onChange={(e) =>
										setNewUser({ ...newUser, email: e.target.value })
									}
									placeholder="max@beispiel.de"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="password">Passwort</Label>
								<Input
									id="password"
									type="password"
									value={newUser.password}
									onChange={(e) =>
										setNewUser({ ...newUser, password: e.target.value })
									}
									placeholder="••••••••"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="role">Rolle</Label>
								<Select
									value={newUser.role}
									onValueChange={(value: "user" | "admin") =>
										setNewUser({ ...newUser, role: value })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="user">Benutzer</SelectItem>
										<SelectItem value="admin">Admin</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setCreateDialogOpen(false)}
							>
								Abbrechen
							</Button>
							<Button onClick={handleCreateUser} disabled={isCreating}>
								{isCreating && <Loader2 className="mr-2 size-4 animate-spin" />}
								Erstellen
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<div className="mb-4">
				<div className="relative">
					<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Name oder E-Mail suchen..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

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
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									<Loader2 className="mx-auto size-6 animate-spin" />
								</TableCell>
							</TableRow>
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									<div className="flex flex-col items-center gap-2 text-muted-foreground">
										<UserX className="size-8" />
										<p>Keine Benutzer gefunden</p>
									</div>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between space-x-2 py-4">
				<div className="text-muted-foreground text-sm">
					{total} Benutzer insgesamt
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Zurück
					</Button>
					<div className="flex items-center gap-1 text-sm">
						<span>
							Seite {table.getState().pagination.pageIndex + 1} von{" "}
							{table.getPageCount()}
						</span>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Weiter
					</Button>
				</div>
			</div>

			<AlertDialog
				open={deleteUserId !== null}
				onOpenChange={(open) => !open && setDeleteUserId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Benutzer löschen</AlertDialogTitle>
						<AlertDialogDescription>
							Sind Sie sicher, dass Sie diesen Benutzer löschen möchten? Diese
							Aktion kann nicht rückgängig gemacht werden.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Abbrechen</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (deleteUserId) {
									handleDeleteUser(deleteUserId);
									setDeleteUserId(null);
								}
							}}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Löschen
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
