"use client";

import type { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRef } from "react";

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

interface IconHandle {
	startAnimation: () => void;
	stopAnimation: () => void;
}

function AdminNavItem({
	item,
}: {
	item: {
		name: string;
		url: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		icon: any;
	};
}) {
	const iconRef = useRef<IconHandle>(null);
	const pathname = usePathname();
	const isActive = pathname === item.url;

	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				asChild
				isActive={isActive}
				onMouseEnter={() => iconRef.current?.startAnimation()}
				onMouseLeave={() => iconRef.current?.stopAnimation()}
			>
				<a href={item.url}>
					<item.icon ref={iconRef} />
					<span>{item.name}</span>
				</a>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

export function NavAdmin({
	admin,
}: {
	admin: {
		name: string;
		url: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		icon: any;
	}[];
}) {
	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden">
			<SidebarGroupLabel>Admin</SidebarGroupLabel>
			<SidebarMenu>
				{admin.map((item) => (
					<AdminNavItem key={item.name} item={item} />
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
