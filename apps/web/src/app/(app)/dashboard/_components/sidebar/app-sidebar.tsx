"use client";

import Link from "next/link";
import type * as React from "react";
import { AtSignIcon } from "@/components/ui/icons/at-sign";
import { CalendarIcon } from "@/components/ui/icons/calendar";
import { DashboardIcon } from "@/components/ui/icons/dashboard";
import { MailIcon } from "@/components/ui/icons/mail";
import { PartyPopperIcon } from "@/components/ui/icons/party-popper";
import { SettingsIcon } from "@/components/ui/icons/settings";
import { UsersIcon } from "@/components/ui/icons/users";
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
import { useAuth } from "@/hooks/use-auth";
import { NavAdmin } from "./nav-admin";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const data = {
	navMain: [
		{
			title: "Overview",
			url: "/dashboard",
			icon: DashboardIcon,
		},
		{
			title: "Events",
			url: "/dashboard/events",
			icon: PartyPopperIcon,
		},
		{
			title: "Incoming Requests",
			url: "/dashboard/incoming-requests",
			icon: AtSignIcon,
		},
		{
			title: "Emails",
			url: "/dashboard/emails",
			icon: MailIcon,
		},
		{
			title: "Kalender",
			url: "/dashboard/calendar",
			icon: CalendarIcon,
		},
		{
			title: "Settings",
			url: "#",
			icon: SettingsIcon,
			items: [
				{
					title: "Allgemein",
					url: "#",
				},
				{
					title: "Gruppen",
					url: "/dashboard/groups",
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
	const { session } = useAuth();

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader className="border-[#222] border-b">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/" className="flex items-center gap-2">
								<div className="flex aspect-square size-8 items-center justify-center bg-[#ff3d00] font-black font-mono text-black text-xs">
									T
								</div>
								<span className="font-bold font-mono text-[#e8e4de] text-xs uppercase tracking-[0.2em]">
									IGG Technik
								</span>
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
