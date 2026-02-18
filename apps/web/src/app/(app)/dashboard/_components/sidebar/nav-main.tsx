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
	const startIconAnimation = () => {
		const icon = iconRef.current as Partial<IconHandle> | null;
		if (typeof icon?.startAnimation === "function") {
			icon.startAnimation();
		}
	};
	const stopIconAnimation = () => {
		const icon = iconRef.current as Partial<IconHandle> | null;
		if (typeof icon?.stopAnimation === "function") {
			icon.stopAnimation();
		}
	};

	if (!item.items || item.items.length === 0) {
		const isActive = pathname === item.url;

		return (
			<SidebarMenuItem key={item.title}>
				<SidebarMenuButton
					asChild
					tooltip={item.title}
					isActive={isActive}
					onMouseEnter={startIconAnimation}
					onMouseLeave={stopIconAnimation}
					className={`font-mono uppercase tracking-[0.15em] transition-all ${
						isActive ? "border-[#ff3d00] border-l-2 text-[#ff3d00]" : ""
					}`}
				>
					<Link href={item.url}>
						{item.icon && (
							<item.icon
								ref={iconRef}
								className={isActive ? "text-[#ff3d00]" : ""}
							/>
						)}
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
						onMouseEnter={startIconAnimation}
						onMouseLeave={stopIconAnimation}
						className={`font-mono uppercase tracking-[0.15em] transition-all ${
							hasActiveSubItem ? "text-[#ff3d00]" : ""
						}`}
					>
						{item.icon && (
							<item.icon
								ref={iconRef}
								className={hasActiveSubItem ? "text-[#ff3d00]" : ""}
							/>
						)}
						<span>{item.title}</span>
						<ChevronRight className="ml-auto h-3 w-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
					</SidebarMenuButton>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<SidebarMenuSub>
						{item.items?.map((subItem) => {
							const isSubItemActive = pathname === subItem.url;
							return (
								<SidebarMenuSubItem key={subItem.title}>
									<SidebarMenuSubButton
										asChild
										isActive={isSubItemActive}
										className={`font-mono text-[10px] uppercase tracking-[0.15em] ${
											isSubItemActive ? "text-[#ff3d00]" : ""
										}`}
									>
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
			<SidebarGroupLabel className="font-mono text-[#555] text-[9px] uppercase tracking-[0.3em]">
				Platform
			</SidebarGroupLabel>
			<SidebarMenu className="gap-1">
				{items.map((item) => (
					<NavItemWithIcon key={item.title} item={item} />
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
