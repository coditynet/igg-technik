"use client";

import { Calendar, Settings, Settings2, SquareTerminal, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type * as React from "react";
import { AtSignIcon } from "@/components/ui/icons/at-sign";
import { CalendarIcon } from "@/components/ui/icons/calendar";
import { CalendarDaysIcon } from "@/components/ui/icons/calendar-days";
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
import { authClient } from "@/lib/auth-client";
import { NavAdmin } from "./nav-admin";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { useAuth } from "@/hooks/use-auth";

const data = {
	navMain: [
		{
			title: "Overview",
			url: "/dashboard",
			icon: DashboardIcon,
		},
		{
			title: "Events",
			url: "#",
			icon: PartyPopperIcon,
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
					url: "/dashboard/settings/gruppen",
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
	const { session } = useAuth()

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/" className="flex items-center gap-2">
								<Image
									src="/logo.png"
									alt="IGG Technik"
									width={120}
									height={32}
									className="object-contain"
								/>
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
