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
import { goeyToast as toast } from "goey-toast";
import {
	ArrowUpDown,
	Ban,
	CheckCircle,
	Edit,
	KeyRound,
	Loader2,
	LogOut,
	MoreHorizontal,
	Plus,
	Search,
	ShieldCheck,
	ShieldX,
	Trash2,
	UserX,
	VenetianMask,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { UserAvatar } from "@/components/auth/user-avatar";
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
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
	image?: string | null;
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
	const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(
		null,
	);
	const [editUserId, setEditUserId] = useState<string | null>(null);
	const [editUserData, setEditUserData] = useState<{
		name: string;
		email: string;
		role: "user" | "admin";
	}>({ name: "", email: "", role: "user" });

	const [newPassword, setNewPassword] = useState("");

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
					image: u.image,
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
			image: u.image,
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

	const resetPasswordMutation = useMutation({
		mutationFn: async ({
			userId,
			newPassword,
		}: {
			userId: string;
			newPassword: string;
		}) => {
			const result = await authClient.admin.setUserPassword({
				userId,
				newPassword,
			});

			if (result.error) {
				throw new Error(
					result.error.message || "Fehler beim Zurücksetzen des Passworts",
				);
			}

			return result.data;
		},
		onSuccess: () => {
			toast.success("Passwort erfolgreich zurückgesetzt");
			setResetPasswordUserId(null);
			setNewPassword("");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Fehler beim Zurücksetzen des Passworts");
		},
	});

	const impersonateUserMutation = useMutation({
		mutationFn: async (userId: string) => {
			const result = await authClient.admin.impersonateUser({
				userId,
			});

			if (result.error) {
				throw new Error(
					result.error.message || "Fehler beim Impersonieren des Benutzers",
				);
			}

			return result.data;
		},
		onSuccess: () => {
			toast.success("Benutzer wird impersoniert...");
			window.location.href = "/dashboard";
		},
		onError: (error: Error) => {
			toast.error(error.message || "Fehler beim Impersonieren des Benutzers");
		},
	});

	const updateUserMutation = useMutation({
		mutationFn: async ({
			userId,
			data,
		}: {
			userId: string;
			data: { name?: string; role?: string };
		}) => {
			const { role, ...updateData } = data;

			if (Object.keys(updateData).length > 0) {
				const result = await authClient.admin.updateUser({
					userId,
					data: updateData,
				});

				if (result.error) {
					throw new Error(
						result.error.message || "Fehler beim Aktualisieren des Benutzers",
					);
				}
			}

			// If role changed, also update role
			if (role) {
				await authClient.admin.setRole({
					userId,
					role: role,
				});
			}

			return true;
		},
		onSuccess: () => {
			toast.success("Benutzer erfolgreich aktualisiert");
			setEditUserId(null);
			allUsersQuery.refetch();
			if (searchQuery) {
				nameSearchQuery.refetch();
				emailSearchQuery.refetch();
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Fehler beim Aktualisieren des Benutzers");
		},
	});

	const stopImpersonatingMutation = useMutation({
		mutationFn: async () => {
			const result = await authClient.admin.stopImpersonating({});
			if (result.error) {
				throw new Error(
					result.error.message || "Fehler beim Beenden der Impersonierung",
				);
			}
			return result.data;
		},
		onSuccess: () => {
			toast.success("Impersonierung beendet");
			window.location.href = "/dashboard/admin/users";
		},
		onError: (error: Error) => {
			toast.error(error.message || "Fehler beim Beenden der Impersonierung");
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

	const handleResetPassword = () => {
		if (!resetPasswordUserId || !newPassword) {
			toast.error("Bitte geben Sie ein neues Passwort ein");
			return;
		}

		resetPasswordMutation.mutate({
			userId: resetPasswordUserId,
			newPassword,
		});
	};

	const handleImpersonateUser = (userId: string) => {
		impersonateUserMutation.mutate(userId);
	};

	const handleUpdateUser = () => {
		if (!editUserId) return;

		updateUserMutation.mutate({
			userId: editUserId,
			data: {
				name: editUserData.name,
				role: editUserData.role,
			},
		});
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
				const user = row.original;
				return (
					<div className="flex items-center gap-3">
						<UserAvatar user={user as any} className="h-7 w-7 rounded-full" />
						<div className="flex items-center gap-2">
							<span className="font-medium">{row.getValue("name")}</span>
							{banned && (
								<Badge variant="destructive" className="text-xs">
									Gesperrt
								</Badge>
							)}
						</div>
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
							<Button variant="ghost" className="size-8 p-0 text-[#888] hover:bg-[#ff3d00]/10 hover:text-[#ff3d00]">
								<span className="sr-only">Menü öffnen</span>
								<MoreHorizontal className="size-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48 border-[#222] bg-[#111] text-[#e8e4de]">
							<DropdownMenuLabel>Aktionen</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() => {
									setEditUserId(user.id);
									setEditUserData({
										name: user.name,
										email: user.email,
										role: (user.role as "user" | "admin") || "user",
									});
								}}
							>
								<Edit className="mr-2 size-4" />
								<span>Bearbeiten</span>
							</DropdownMenuItem>
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
							<DropdownMenuItem onClick={() => handleImpersonateUser(user.id)}>
								<VenetianMask className="mr-2 size-4" />
								<span>Impersonieren</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setResetPasswordUserId(user.id)}>
								<KeyRound className="mr-2 size-4" />
								<span>Passwort zurücksetzen</span>
							</DropdownMenuItem>
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
			<div className="container mx-auto py-10">
				<div className="mb-8 flex items-center justify-between">
					<div className="space-y-2">
						<Skeleton className="h-9 w-64" />
						<Skeleton className="h-5 w-96" />
					</div>
					<Skeleton className="h-10 w-40" />
				</div>

				<div className="mb-4">
					<Skeleton className="h-10 w-full" />
				</div>

				<div className="border border-[#222] bg-[#0f0f0f]">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>
									<Skeleton className="h-8 w-20" />
								</TableHead>
								<TableHead>
									<Skeleton className="h-8 w-20" />
								</TableHead>
								<TableHead>
									<Skeleton className="h-8 w-16" />
								</TableHead>
								<TableHead>
									<Skeleton className="h-8 w-24" />
								</TableHead>
								<TableHead />
							</TableRow>
						</TableHeader>
						<TableBody>
							{[...Array(5)].map((_, i) => (
								<TableRow key={`auth-check-${Date.now()}-${i}`}>
									<TableCell>
										<div className="flex items-center gap-2">
											<Skeleton className="h-4 w-32" />
										</div>
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-48" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="ml-auto h-8 w-8" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				<div className="flex items-center justify-between space-x-2 py-4">
					<Skeleton className="h-5 w-32" />
					<div className="flex items-center space-x-2">
						<Skeleton className="h-9 w-20" />
						<Skeleton className="h-5 w-24" />
						<Skeleton className="h-9 w-20" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-10">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<div className="mb-2 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
						Verwaltung
					</div>
					<h1 className="font-black text-3xl uppercase tracking-tight">
						Benutzerverwaltung
					</h1>
					<p className="font-mono text-[#777] text-xs">
						Verwalten Sie Benutzer, Rollen und Berechtigungen
					</p>
				</div>
				<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
					<DialogTrigger asChild>
						<div className="flex gap-2">
							{session?.session.impersonatedBy && (
								<Button
									variant="destructive"
									onClick={() => stopImpersonatingMutation.mutate()}
									disabled={stopImpersonatingMutation.isPending}
									className="border border-red-500/40 bg-red-500/15 font-mono text-[10px] uppercase tracking-[0.12em] text-red-300 hover:bg-red-500/20"
								>
									{stopImpersonatingMutation.isPending ? (
										<Loader2 className="mr-2 size-4 animate-spin" />
									) : (
										<LogOut className="mr-2 size-4" />
									)}
									Impersonierung beenden
								</Button>
							)}
							<Button className="bg-[#ff3d00] font-mono text-[10px] uppercase tracking-[0.12em] text-black transition-all hover:bg-[#ff3d00] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_rgba(255,61,0,0.3)]">
								<Plus className="mr-2 size-4" />
								Neuer Benutzer
							</Button>
						</div>
					</DialogTrigger>
					<DialogContent className="border-[#222] bg-[#0a0a0a] text-[#e8e4de]">
						<DialogHeader>
							<DialogTitle className="font-black uppercase tracking-tight">
								Neuen Benutzer erstellen
							</DialogTitle>
							<DialogDescription className="font-mono text-[#777] text-xs">
								Erstellen Sie einen neuen Benutzer mit E-Mail und Passwort.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label
									htmlFor="name"
									className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]"
								>
									Name
								</Label>
								<Input
									id="name"
									value={newUser.name}
									onChange={(e) =>
										setNewUser({ ...newUser, name: e.target.value })
									}
									placeholder="Max Mustermann"
									className="border-[#222] bg-[#111] font-mono text-xs placeholder:text-[#444]"
								/>
							</div>
							<div className="grid gap-2">
								<Label
									htmlFor="email"
									className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]"
								>
									E-Mail
								</Label>
								<Input
									id="email"
									type="email"
									value={newUser.email}
									onChange={(e) =>
										setNewUser({ ...newUser, email: e.target.value })
									}
									placeholder="max@beispiel.de"
									className="border-[#222] bg-[#111] font-mono text-xs placeholder:text-[#444]"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="password" className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">Passwort</Label>
								<Input
									id="password"
									type="password"
									value={newUser.password}
									onChange={(e) =>
										setNewUser({ ...newUser, password: e.target.value })
									}
									placeholder="••••••••"
									className="border-[#222] bg-[#111] font-mono text-xs placeholder:text-[#444]"
								/>
							</div>
							<div className="grid gap-2">
								<Label
									htmlFor="role"
									className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]"
								>
									Rolle
								</Label>
								<Select
									value={newUser.role}
									onValueChange={(value: "user" | "admin") =>
										setNewUser({ ...newUser, role: value })
									}
								>
									<SelectTrigger className="border-[#222] bg-[#111] font-mono text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="border-[#222] bg-[#111] text-[#e8e4de]">
										<SelectItem value="user" className="font-mono text-xs">Benutzer</SelectItem>
										<SelectItem value="admin" className="font-mono text-xs">Admin</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setCreateDialogOpen(false)}
								className="border-[#222] bg-[#111] font-mono text-[10px] uppercase tracking-[0.1em]"
							>
								Abbrechen
							</Button>
							<Button
								onClick={handleCreateUser}
								disabled={createUserMutation.isPending}
								className="bg-[#ff3d00] font-mono text-[10px] uppercase tracking-[0.12em] text-black"
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
					<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#666]" />
					<Input
						placeholder="Name oder E-Mail suchen..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="border-[#222] bg-[#111] pl-9 font-mono text-xs placeholder:text-[#444]"
					/>
				</div>
			</div>

			<div className="border border-[#222] bg-[#0f0f0f]">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="border-[#222] hover:bg-transparent">
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id} className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
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
							[...Array(5)].map((_, i) => (
								<TableRow key={`loading-${pagination.pageIndex}-${i}`}>
									<TableCell>
										<div className="flex items-center gap-2">
											<Skeleton className="h-4 w-32" />
										</div>
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-48" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="ml-auto h-8 w-8" />
									</TableCell>
								</TableRow>
							))
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className="border-[#1c1c1c] hover:bg-[#ff3d00]/5"
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className="text-[#e8e4de]">
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
								<TableCell colSpan={columns.length} className="h-[400px] p-0">
									<Empty>
										<EmptyHeader>
											<EmptyMedia variant="icon">
												<UserX />
											</EmptyMedia>
											<EmptyTitle>Keine Benutzer gefunden</EmptyTitle>
											<EmptyDescription>
												{searchQuery
													? "Es wurden keine Benutzer gefunden, die Ihren Suchkriterien entsprechen."
													: "Es sind noch keine Benutzer vorhanden. Erstellen Sie den ersten Benutzer."}
											</EmptyDescription>
										</EmptyHeader>
										{!searchQuery && (
											<EmptyContent>
												<Button
													onClick={() => setCreateDialogOpen(true)}
													className="bg-[#ff3d00] font-mono text-[10px] uppercase tracking-[0.12em] text-black"
												>
													<Plus className="mr-2 size-4" />
													Neuer Benutzer
												</Button>
											</EmptyContent>
										)}
									</Empty>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between space-x-2 py-4">
				<div className="font-mono text-[#777] text-xs">
					{total} Benutzer insgesamt
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						className="border-[#222] bg-[#111] font-mono text-[10px] uppercase tracking-[0.1em]"
					>
						Zurück
					</Button>
					<div className="flex items-center gap-1 font-mono text-[#777] text-xs">
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
						className="border-[#222] bg-[#111] font-mono text-[10px] uppercase tracking-[0.1em]"
					>
						Weiter
					</Button>
				</div>
			</div>

			<AlertDialog
				open={deleteUserId !== null}
				onOpenChange={(open) => !open && setDeleteUserId(null)}
			>
				<AlertDialogContent className="border-[#222] bg-[#0a0a0a] text-[#e8e4de]">
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

			<Dialog
				open={resetPasswordUserId !== null}
				onOpenChange={(open) => {
					if (!open) {
						setResetPasswordUserId(null);
						setNewPassword("");
					}
				}}
			>
				<DialogContent className="border-[#222] bg-[#0a0a0a] text-[#e8e4de]">
					<DialogHeader>
						<DialogTitle>Passwort zurücksetzen</DialogTitle>
						<DialogDescription>
							Setzen Sie ein neues Passwort für den Benutzer.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="new-password">Neues Passwort</Label>
							<Input
								id="new-password"
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								placeholder="••••••••"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setResetPasswordUserId(null);
								setNewPassword("");
							}}
						>
							Abbrechen
						</Button>
						<Button
							onClick={handleResetPassword}
							disabled={resetPasswordMutation.isPending}
						>
							{resetPasswordMutation.isPending && (
								<Loader2 className="mr-2 size-4 animate-spin" />
							)}
							Passwort ändern
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={editUserId !== null}
				onOpenChange={(open) => {
					if (!open) {
						setEditUserId(null);
					}
				}}
			>
				<DialogContent className="border-[#222] bg-[#0a0a0a] text-[#e8e4de]">
					<DialogHeader>
						<DialogTitle>Benutzer bearbeiten</DialogTitle>
						<DialogDescription>
							Bearbeiten Sie die Details des Benutzers.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="edit-name">Name</Label>
							<Input
								id="edit-name"
								value={editUserData.name}
								onChange={(e) =>
									setEditUserData({ ...editUserData, name: e.target.value })
								}
								placeholder="Max Mustermann"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-email">E-Mail</Label>
							<Input
								id="edit-email"
								type="email"
								value={editUserData.email}
								disabled
								className="bg-muted"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-role">Rolle</Label>
							<Select
								value={editUserData.role}
								onValueChange={(value: "user" | "admin") =>
									setEditUserData({ ...editUserData, role: value })
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
						<Button variant="outline" onClick={() => setEditUserId(null)}>
							Abbrechen
						</Button>
						<Button
							onClick={handleUpdateUser}
							disabled={updateUserMutation.isPending}
						>
							{updateUserMutation.isPending && (
								<Loader2 className="mr-2 size-4 animate-spin" />
							)}
							Speichern
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
