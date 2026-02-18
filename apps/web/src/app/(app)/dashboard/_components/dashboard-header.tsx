"use client";

import { haptic } from "ios-haptics";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DynamicBreadcrumbs } from "./dynamic-breadcrumbs";

export function DashboardHeader() {
	return (
		<header className="z-20 flex h-16 shrink-0 items-center gap-2 border-[#222] border-b bg-[#0a0a0a] transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
			<div className="flex items-center gap-2 px-4">
				<SidebarTrigger onClick={haptic} className="-ml-1 hidden md:flex" />
				<Separator
					orientation="vertical"
					className="mr-2 hidden data-[orientation=vertical]:h-4 md:block"
				/>
				<DynamicBreadcrumbs />
			</div>
		</header>
	);
}
