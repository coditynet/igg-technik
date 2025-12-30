"use client";

import { Calendar, Settings2, SquareTerminal, User } from "lucide-react";
import Link from "next/link";
import type * as React from "react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { NavAdmin } from "./nav-admin";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { CalendarDaysIcon } from "@/components/ui/icons/calendar-days";
import { AtSignIcon } from "@/components/ui/icons/at-sign";
import { SettingsIcon } from "@/components/ui/icons/settings";
import { PartyPopperIcon } from "@/components/ui/icons/party-popper";
import { UsersIcon } from "@/components/ui/icons/users";

const data = {
	navMain: [
		{
			title: "Events",
			url: "#",
			icon: PartyPopperIcon,
			isActive: true,
			items: [
				{
					title: "History",
					url: "#",
				},
				{
					title: "Starred",
					url: "#",
				},
				{
					title: "Settings",
					url: "#",
				},
			],
		},
		{
			title: "Email",
			url: "/dashboard/email",
			icon: AtSignIcon,
		},
		{
			title: "Kalender",
			url: "/dashboard/calendar",
			icon: CalendarDaysIcon,
		},
		{
			title: "Settings",
			url: "#",
			icon: SettingsIcon,
			items: [
				{
					title: "Account",
					url: "/account",
				},
				{
					title: "General",
					url: "#",
				},
				{
					title: "Team",
					url: "#",
				},
				{
					title: "Billing",
					url: "#",
				},
				{
					title: "Limits",
					url: "#",
				},
			],
		},
	],
	admin: [
		{
			name: "Benutzer",
			url: "/dashboard/admin/users",
			icon: UsersIcon,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = authClient.useSession();

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<span className="font-bold text-lg">IT</span>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">IGG Technik</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				{session?.user.role === "admin" && <NavAdmin admin={data.admin} />}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={session?.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
