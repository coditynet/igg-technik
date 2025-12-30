"use client";

import type { User } from "better-auth";
import { ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { UserIcon } from "@/components/ui/icons/user";
import { LogoutIcon } from "@/components/ui/icons/logout";
import { authClient } from "@/lib/auth-client";
import {useRouter} from "next/navigation";

interface IconHandle {
	startAnimation: () => void;
	stopAnimation: () => void;
}

export function NavUser({ user }: { user?: User }) {
	const { isMobile } = useSidebar();
	const userIconRef = useRef<IconHandle>(null);
	const logoutIconRef = useRef<IconHandle>(null);

	const router = useRouter()

	if (!user) {
		return null;
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={user.image ?? undefined} alt={user.name} />
								<AvatarFallback className="rounded-lg">CN</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{user.name}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src={user.image ?? undefined} alt={user.name} />
									<AvatarFallback className="rounded-lg">CN</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{user.name}</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem 
								asChild
								onMouseEnter={() => userIconRef.current?.startAnimation()}
								onMouseLeave={() => userIconRef.current?.stopAnimation()}
							>
								<a href="/account">
									<UserIcon ref={userIconRef} />
									Account
								</a>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onMouseEnter={() => logoutIconRef.current?.startAnimation()}
							onMouseLeave={() => logoutIconRef.current?.stopAnimation()}
							onClick={async () => {
								const { error } = await authClient.signOut();
								if (!error) {
									router.push("/sign-in");
								}
							}}
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
