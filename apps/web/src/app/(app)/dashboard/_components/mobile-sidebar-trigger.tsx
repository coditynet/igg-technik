"use client";

import { createPortal } from "react-dom";
import { haptic } from "ios-haptics";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/animate-ui/icons/menu";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";

export function MobileSidebarTrigger() {
    const { toggleSidebar, openMobile } = useSidebar();

    const content = (
        <div className="fixed right-6 bottom-6 z-[100] md:hidden">
            <AnimateIcon 
                animate={openMobile}
                animateOnHover={!openMobile}
            >
                <Button 
                    data-sidebar="trigger"
                    data-slot="sidebar-trigger"
                    size="icon-lg"
                    variant="secondary"
                    onClick={() => { haptic(); toggleSidebar() }}
                >
                    <Menu />
                </Button>
            </AnimateIcon>
        </div>
    );

    return createPortal(content, document.body);
}
