"use client";

import { useState } from "react";
import { Link2, Copy, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCalendarContext } from "./calendar-context";

export function CalendarSubscribeButton() {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedGroup, setSelectedGroup] = useState<string>("all");
	const [copied, setCopied] = useState(false);
	const { getAllGroups } = useCalendarContext();

	const groups = getAllGroups();

	const getSubscriptionUrl = () => {
		const baseUrl = window.location.origin;
		if (selectedGroup === "all") {
			return `${baseUrl}/api/calendar/feed`;
		}
		return `${baseUrl}/api/calendar/feed/${selectedGroup}`;
	};

	const handleCopyUrl = async () => {
		const url = getSubscriptionUrl();
		await navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleInstall = () => {
		const url = getSubscriptionUrl();
		const webcalUrl = url.replace(/^https?:/, "webcal:");
		window.location.href = webcalUrl;
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="max-sm:size-8"
					title="Kalender abonnieren"
				>
					<Link2 size={16} aria-hidden="true" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Kalender abonnieren</DialogTitle>
					<DialogDescription>
						Wählen Sie eine Gruppe oder alle Events zum Abonnieren
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<RadioGroup value={selectedGroup} onValueChange={setSelectedGroup}>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="all" id="all" />
							<Label htmlFor="all" className="cursor-pointer flex-1">
								Alle Events
							</Label>
						</div>

						{groups.length > 0 && (
							<>
								<Separator className="my-2" />
								{groups.map((group) => (
									<div key={group.id} className="flex items-center space-x-2">
										<RadioGroupItem value={group.id} id={group.id} />
										<Label
											htmlFor={group.id}
											className="cursor-pointer flex-1 flex items-center gap-2"
										>
											<span
												className="size-3 rounded-full"
												style={{
													backgroundColor: `var(--color-${group.color}-400)`,
												}}
											/>
											{group.name}
										</Label>
									</div>
								))}
							</>
						)}
					</RadioGroup>

					<Separator />

					<div className="flex flex-col gap-2">
						<Button onClick={handleInstall} className="w-full">
							<Download className="mr-2 h-4 w-4" />
							Kalender installieren
						</Button>
						<Button
							onClick={handleCopyUrl}
							variant="outline"
							className="w-full"
						>
							{copied ? (
								<Check className="mr-2 h-4 w-4" />
							) : (
								<Copy className="mr-2 h-4 w-4" />
							)}
							{copied ? "URL kopiert" : "URL kopieren"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
