"use client";

import { RiCheckLine, RiExpandUpDownLine } from "@remixicon/react";
import Link from "next/link";
import type * as React from "react";
import { useCalendarContext } from "@/components/event-calendar/calendar-context";
import SidebarCalendar from "@/components/sidebar-calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { isGroupVisible, toggleGroupVisibility, getAllGroups } =
		useCalendarContext();
	const groups = getAllGroups();

	return (
		<Sidebar
			variant="inset"
			{...props}
			className="dark scheme-only-dark max-lg:p-3 lg:pe-1"
		>
			<SidebarHeader>
				<div className="flex items-center justify-between gap-2">
					<Link className="inline-flex" href="/">
						<span className="font-semibold text-xl">IGG Technik</span>
					</Link>
					<SidebarTrigger className="text-muted-foreground/80 hover:bg-transparent! hover:text-foreground/80" />
				</div>
			</SidebarHeader>
			<SidebarContent className="mt-3 gap-0 border-t pt-3">
				<SidebarGroup className="px-1">
					<SidebarCalendar />
				</SidebarGroup>
				<SidebarGroup className="mt-3 border-t px-1 pt-4">
					<SidebarGroupLabel className="text-muted-foreground/65 uppercase">
						Gruppen
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{groups.map((group) => (
								<SidebarMenuItem key={group.id}>
									<SidebarMenuButton
										asChild
										className="relative justify-between rounded-md has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50 [&>svg]:size-auto"
									>
										<span>
											<span className="flex items-center justify-between gap-3 font-medium">
												<Checkbox
													id={group.id}
													className="peer sr-only"
													checked={isGroupVisible(group.id)}
													onCheckedChange={() =>
														toggleGroupVisibility(group.id)
													}
												/>
												<RiCheckLine
													className="peer-not-data-[state=checked]:invisible"
													size={16}
													aria-hidden="true"
												/>
												<label
													htmlFor={group.id}
													className="after:absolute after:inset-0 peer-not-data-[state=checked]:text-muted-foreground/65 peer-not-data-[state=checked]:line-through"
												>
													{group.name}
												</label>
											</span>
											<span
												className="size-1.5 rounded-full bg-(--event-color)"
												style={
													{
														"--event-color": `var(--color-${group.color}-400)`,
													} as React.CSSProperties
												}
											/>
										</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<Link href={"/"} className="cursor-pointer">
						<SidebarMenuItem>
							<SidebarMenuButton size="lg">
								<div>
									<span className="truncate font-medium">Anmelden</span>
								</div>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</Link>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
