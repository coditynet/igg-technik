"use client";

import { CalendarView } from "@/components/calendar-view";
import { Header } from "@/components/header";
import { Infos } from "@/components/infos";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";
import Link from "next/link";
import { ViewTransition } from "react";

export default function Home() {
	return (
		<div className="flex flex-col">
			<Header />
			<div className="container mx-auto p-8">
				<ViewTransition name="calendar-container" share="calendar-zoom">
					<div className="relative rounded-lg border shadow-lg overflow-hidden">
						<div className="absolute top-4 right-4 z-50">
							<Button asChild variant="secondary" size="sm">
								<Link href="/calendar">
									<Maximize2 className="h-4 w-4 mr-2" />
									Vollbild öffnen
								</Link>
							</Button>
						</div>
						<div className="h-150">
							<CalendarView />
						</div>
					</div>
				</ViewTransition>
			</div>
			<div>
				<Infos />
			</div>
		</div>
	);
}
