"use client";

import { createPortal } from "react-dom";
import { haptic } from "ios-haptics";
import { Menu, X } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function MobileSidebarTrigger() {
	const { toggleSidebar, openMobile } = useSidebar();

	const content = (
		<div className="fixed right-6 bottom-6 z-[100] md:hidden">
			<Button data-sidebar="trigger"
				data-slot="sidebar-trigger"
				size="icon-lg"
				variant="secondary"
				onClick={() => { haptic(); toggleSidebar() }}
			>
				{openMobile 
					? <X />
					: <Menu />
				}
			</Button>
		</div>
	);

	return createPortal(content, document.body);
}
