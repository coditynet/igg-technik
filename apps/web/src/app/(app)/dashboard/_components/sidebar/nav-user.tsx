"use client";

import type { User } from "better-auth";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useRef } from "react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/auth/user-avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutIcon } from "@/components/ui/icons/logout";
import { MoonIcon } from "@/components/ui/icons/moon";
import { SunIcon } from "@/components/ui/icons/sun";
import { SunMoonIcon } from "@/components/ui/icons/sun-moon";
import { UserIcon } from "@/components/ui/icons/user";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/hooks/use-auth";

interface IconHandle {
	startAnimation: () => void;
	stopAnimation: () => void;
}

export function NavUser({ user }: { user?: User }) {
	const { isMobile } = useSidebar();
	const userIconRef = useRef<IconHandle>(null);
	const logoutIconRef = useRef<IconHandle>(null);
	const sunIconRef = useRef<IconHandle>(null);
	const moonIconRef = useRef<IconHandle>(null);
	const sunMoonIconRef = useRef<IconHandle>(null);
	const themeIconRef = useRef<IconHandle>(null);
	const { theme, setTheme } = useTheme();
	const { refetchSession, session } = useAuth();

	const router = useRouter();

	if (!user) {
		return null;
	}

	const handleStopImpersonating = async () => {
		const { error } = await authClient.admin.stopImpersonating();
		if (error) {
			toast.error("Fehler beim Beenden der Impersonierung");
			return;
		}
		toast.success("Impersonierung beendet");
		refetchSession();
		router.refresh();
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="default"
							className="font-mono uppercase tracking-[0.1em] data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<UserAvatar user={user} />
							<div className="grid flex-1 text-left leading-tight">
								<span className="truncate font-mono text-xs font-semibold uppercase tracking-[0.1em]">
									{user.name}
								</span>
							</div>
							<ChevronsUpDown className="ml-auto size-3 text-[#555]" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 bg-[#111] ring-[#333]"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left">
								<UserAvatar user={user} className="h-8 w-8" />
								<div className="grid flex-1 text-left leading-tight">
									<span className="truncate font-mono text-xs font-medium text-[#e8e4de]">
										{user.name}
									</span>
									<span className="truncate font-mono text-[10px] text-[#666]">
										{user.email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator className="bg-[#333]" />
						<DropdownMenuGroup>
							<DropdownMenuItem
								onClick={() => router.push("/account")}
								onMouseEnter={() => userIconRef.current?.startAnimation()}
								onMouseLeave={() => userIconRef.current?.stopAnimation()}
								className="font-mono uppercase tracking-[0.1em] text-[#888] focus:bg-[#1a1a1a] focus:text-[#e8e4de]"
							>
								<UserIcon ref={userIconRef} />
								Account
							</DropdownMenuItem>
						</DropdownMenuGroup>
						{session?.session.impersonatedBy && (
							<>
								<DropdownMenuSeparator className="bg-[#333]" />
								<DropdownMenuItem
									onClick={handleStopImpersonating}
									className="font-mono uppercase tracking-[0.1em] text-[#ff3d00] focus:bg-[#ff3d00]/10 focus:text-[#ff3d00]"
								>
									<LogOut className="mr-2 size-4" />
									Impersonierung beenden
								</DropdownMenuItem>
							</>
						)}
						<DropdownMenuSeparator className="bg-[#333]" />
						<DropdownMenuSub>
							<DropdownMenuSubTrigger
								onMouseEnter={() => themeIconRef.current?.startAnimation()}
								onMouseLeave={() => themeIconRef.current?.stopAnimation()}
								className="font-mono uppercase tracking-[0.1em] text-[#888] focus:bg-[#1a1a1a] focus:text-[#e8e4de]"
							>
								<SunMoonIcon ref={themeIconRef} />
								Theme
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent className="bg-[#111] ring-[#333]">
									<DropdownMenuItem
										onClick={() => setTheme("light")}
										onMouseEnter={() => sunIconRef.current?.startAnimation()}
										onMouseLeave={() => sunIconRef.current?.stopAnimation()}
										className="font-mono uppercase tracking-[0.1em] text-[#888] focus:bg-[#1a1a1a] focus:text-[#e8e4de]"
									>
										<SunIcon ref={sunIconRef} />
										Light
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => setTheme("dark")}
										onMouseEnter={() => moonIconRef.current?.startAnimation()}
										onMouseLeave={() => moonIconRef.current?.stopAnimation()}
										className="font-mono uppercase tracking-[0.1em] text-[#888] focus:bg-[#1a1a1a] focus:text-[#e8e4de]"
									>
										<MoonIcon ref={moonIconRef} />
										Dark
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => setTheme("system")}
										onMouseEnter={() =>
											sunMoonIconRef.current?.startAnimation()
										}
										onMouseLeave={() => sunMoonIconRef.current?.stopAnimation()}
										className="font-mono uppercase tracking-[0.1em] text-[#888] focus:bg-[#1a1a1a] focus:text-[#e8e4de]"
									>
										<SunMoonIcon ref={sunMoonIconRef} />
										System
									</DropdownMenuItem>
								</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>
						<DropdownMenuSeparator className="bg-[#333]" />
						<DropdownMenuItem
							onMouseEnter={() => logoutIconRef.current?.startAnimation()}
							onMouseLeave={() => logoutIconRef.current?.stopAnimation()}
							onClick={async () => {
								const { error } = await authClient.signOut();
								if (!error) {
									router.push("/sign-in");
								}
							}}
							className="font-mono uppercase tracking-[0.1em] text-[#888] focus:bg-[#ff3d00]/10 focus:text-[#ff3d00]"
						>
							<LogoutIcon ref={logoutIconRef} />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
