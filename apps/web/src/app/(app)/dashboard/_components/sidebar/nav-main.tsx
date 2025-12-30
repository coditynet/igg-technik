"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";

interface IconHandle {
	startAnimation: () => void;
	stopAnimation: () => void;
}

type NavItemProps = {
	item: {
		title: string;
		url: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		icon?: any;
		isActive?: boolean;
		items?: {
			title: string;
			url: string;
		}[];
	};
};

function NavItemWithIcon({ item }: NavItemProps) {
	const iconRef = useRef<IconHandle>(null);
	const pathname = usePathname();

	if (!item.items || item.items.length === 0) {
		const isActive = pathname === item.url;

		return (
			<SidebarMenuItem key={item.title}>
				<SidebarMenuButton
					asChild
					tooltip={item.title}
					isActive={isActive}
					onMouseEnter={() => iconRef.current?.startAnimation()}
					onMouseLeave={() => iconRef.current?.stopAnimation()}
				>
					<Link href={item.url}>
						{item.icon && <item.icon ref={iconRef} />}
						<span>{item.title}</span>
					</Link>
				</SidebarMenuButton>
			</SidebarMenuItem>
		);
	}

	const hasActiveSubItem = item.items?.some(
		(subItem) => pathname === subItem.url,
	);

	return (
		<Collapsible
			key={item.title}
			asChild
			defaultOpen={item.isActive || hasActiveSubItem}
			className="group/collapsible"
		>
			<SidebarMenuItem>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton
						tooltip={item.title}
						onMouseEnter={() => iconRef.current?.startAnimation()}
						onMouseLeave={() => iconRef.current?.stopAnimation()}
					>
						{item.icon && <item.icon ref={iconRef} />}
						<span>{item.title}</span>
						<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
					</SidebarMenuButton>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<SidebarMenuSub>
						{item.items?.map((subItem) => {
							const isSubItemActive = pathname === subItem.url;
							return (
								<SidebarMenuSubItem key={subItem.title}>
									<SidebarMenuSubButton asChild isActive={isSubItemActive}>
										<Link href={subItem.url}>
											<span>{subItem.title}</span>
										</Link>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							);
						})}
					</SidebarMenuSub>
				</CollapsibleContent>
			</SidebarMenuItem>
		</Collapsible>
	);
}

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		icon?: any;
		isActive?: boolean;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
}) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Platform</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => (
					<NavItemWithIcon key={item.title} item={item} />
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
