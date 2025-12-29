"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
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
import { useEffect, useMemo, useState } from "react";
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

	const allUsersQuery = useQuery({
		queryKey: [
			"admin-users",
			pagination.pageIndex,
			pagination.pageSize,
			searchQuery,
		],
		queryFn: async () => {
			if (!searchQuery) {
				const result = await authClient.admin.listUsers({
					query: {
						limit: pagination.pageSize,
						offset: pagination.pageIndex * pagination.pageSize,
					},
				});

				if (result.error) {
					throw new Error("Fehler beim Laden der Benutzer");
				}

				const userData = (result.data?.users || []).map((u) => ({
					id: u.id,
					name: u.name,
					email: u.email,
					role: u.role || "user",
					banned: u.banned || false,
					createdAt: u.createdAt,
				}));

				return {
					users: userData,
					total: result.data?.total || 0,
				};
			}
			return null;
		},
		enabled:
			!isSessionPending && session?.user?.role === "admin" && !searchQuery,
	});

	const nameSearchQuery = useQuery({
		queryKey: [
			"admin-users-search-name",
			pagination.pageIndex,
			pagination.pageSize,
			searchQuery,
		],
		queryFn: async () => {
			const result = await authClient.admin.listUsers({
				query: {
					limit: pagination.pageSize,
					offset: pagination.pageIndex * pagination.pageSize,
					searchValue: searchQuery,
					searchField: "name",
					searchOperator: "contains",
				},
			});

			if (result.error) {
				throw new Error("Fehler beim Laden der Benutzer");
			}

			return result.data?.users || [];
		},
		enabled:
			!isSessionPending &&
			session?.user?.role === "admin" &&
			searchQuery.length > 0,
	});

	const emailSearchQuery = useQuery({
		queryKey: [
			"admin-users-search-email",
			pagination.pageIndex,
			pagination.pageSize,
			searchQuery,
		],
		queryFn: async () => {
			const result = await authClient.admin.listUsers({
				query: {
					limit: pagination.pageSize,
					offset: pagination.pageIndex * pagination.pageSize,
					searchValue: searchQuery,
					searchField: "email",
					searchOperator: "contains",
				},
			});

			if (result.error) {
				throw new Error("Fehler beim Laden der Benutzer");
			}

			return result.data?.users || [];
		},
		enabled:
			!isSessionPending &&
			session?.user?.role === "admin" &&
			searchQuery.length > 0,
	});

	const searchResults = useMemo(() => {
		if (!searchQuery) {
			return null;
		}

		const nameUsers = nameSearchQuery.data || [];
		const emailUsers = emailSearchQuery.data || [];

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

		return {
			users: userData,
			total: userData.length,
		};
	}, [searchQuery, nameSearchQuery.data, emailSearchQuery.data]);

	const users = useMemo(() => {
		if (searchQuery) {
			return searchResults?.users || [];
		}
		return allUsersQuery.data?.users || [];
	}, [searchQuery, searchResults, allUsersQuery.data]);

	const total = useMemo(() => {
		if (searchQuery) {
			return searchResults?.total || 0;
		}
		return allUsersQuery.data?.total || 0;
	}, [searchQuery, searchResults, allUsersQuery.data]);

	const isLoading = useMemo(() => {
		if (searchQuery) {
			return nameSearchQuery.isLoading || emailSearchQuery.isLoading;
		}
		return allUsersQuery.isLoading;
	}, [
		searchQuery,
		nameSearchQuery.isLoading,
		emailSearchQuery.isLoading,
		allUsersQuery.isLoading,
	]);

	const createUserMutation = useMutation({
		mutationFn: async (userData: {
			email: string;
			password: string;
			name: string;
			role: "user" | "admin";
		}) => {
			const result = await authClient.admin.createUser(userData);

			if (result.error) {
				throw new Error(
					result.error.message || "Fehler beim Erstellen des Benutzers",
				);
			}

			return result.data;
		},
		onSuccess: () => {
			toast.success("Benutzer erfolgreich erstellt");
			setCreateDialogOpen(false);
			setNewUser({ email: "", password: "", name: "", role: "user" });
			allUsersQuery.refetch();
			if (searchQuery) {
				nameSearchQuery.refetch();
				emailSearchQuery.refetch();
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Fehler beim Erstellen des Benutzers");
		},
	});

	const changeRoleMutation = useMutation({
		mutationFn: async ({
			userId,
			role,
		}: {
			userId: string;
			role: "user" | "admin";
		}) => {
			const result = await authClient.admin.setRole({
				userId,
				role,
			});

			if (result.error) {
				throw new Error(result.error.message || "Fehler beim Ändern der Rolle");
			}

			return result.data;
		},
		onSuccess: () => {
			toast.success("Rolle erfolgreich geändert");
			allUsersQuery.refetch();
			if (searchQuery) {
				nameSearchQuery.refetch();
				emailSearchQuery.refetch();
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Fehler beim Ändern der Rolle");
		},
	});

	const banUserMutation = useMutation({
		mutationFn: async (userId: string) => {
			const result = await authClient.admin.banUser({
				userId,
				banReason: "Von Administrator gesperrt",
			});

			if (result.error) {
				throw new Error(
					result.error.message || "Fehler beim Sperren des Benutzers",
				);
			}

			return result.data;
		},
		onSuccess: () => {
			toast.success("Benutzer erfolgreich gesperrt");
			allUsersQuery.refetch();
			if (searchQuery) {
				nameSearchQuery.refetch();
				emailSearchQuery.refetch();
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Fehler beim Sperren des Benutzers");
		},
	});

	const unbanUserMutation = useMutation({
		mutationFn: async (userId: string) => {
			const result = await authClient.admin.unbanUser({
				userId,
			});

			if (result.error) {
				throw new Error(
					result.error.message || "Fehler beim Entsperren des Benutzers",
				);
			}

			return result.data;
		},
		onSuccess: () => {
			toast.success("Benutzer erfolgreich entsperrt");
			allUsersQuery.refetch();
			if (searchQuery) {
				nameSearchQuery.refetch();
				emailSearchQuery.refetch();
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Fehler beim Entsperren des Benutzers");
		},
	});

	const deleteUserMutation = useMutation({
		mutationFn: async (userId: string) => {
			const result = await authClient.admin.removeUser({
				userId,
			});

			if (result.error) {
				throw new Error(
					result.error.message || "Fehler beim Löschen des Benutzers",
				);
			}

			return result.data;
		},
		onSuccess: () => {
			toast.success("Benutzer erfolgreich gelöscht");
			allUsersQuery.refetch();
			if (searchQuery) {
				nameSearchQuery.refetch();
				emailSearchQuery.refetch();
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Fehler beim Löschen des Benutzers");
		},
	});

	const handleCreateUser = () => {
		if (!newUser.email || !newUser.password || !newUser.name) {
			toast.error("Bitte füllen Sie alle Felder aus");
			return;
		}

		createUserMutation.mutate(newUser);
	};

	const handleRoleChange = (userId: string, newRole: "user" | "admin") => {
		changeRoleMutation.mutate({ userId, role: newRole });
	};

	const handleBanUser = (userId: string) => {
		banUserMutation.mutate(userId);
	};

	const handleUnbanUser = (userId: string) => {
		unbanUserMutation.mutate(userId);
	};

	const handleDeleteUser = (userId: string) => {
		deleteUserMutation.mutate(userId);
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
							<Button
								onClick={handleCreateUser}
								disabled={createUserMutation.isPending}
							>
								{createUserMutation.isPending && (
									<Loader2 className="mr-2 size-4 animate-spin" />
								)}
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
