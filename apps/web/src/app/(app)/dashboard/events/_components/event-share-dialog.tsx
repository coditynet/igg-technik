"use client";

import { Copy, ExternalLink, QrCode, Share2 } from "lucide-react";
import { goeyToast } from "goey-toast";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type EventShareDialogProps = {
	eventId: string;
	title: string;
};

export function EventShareDialog({ eventId, title }: EventShareDialogProps) {
	const [origin, setOrigin] = useState("");
	const eventPath = `/event/${eventId}`;

	useEffect(() => {
		setOrigin(window.location.origin);
	}, []);

	const publicUrl = origin ? `${origin}${eventPath}` : eventPath;
	const qrUrl = useMemo(
		() =>
			`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(publicUrl)}`,
		[publicUrl],
	);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(publicUrl);
			goeyToast.success("Öffentlicher Link kopiert");
		} catch (_error) {
			goeyToast.error("Link konnte nicht kopiert werden");
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="border-[#222] bg-[#111] font-mono text-[10px] uppercase tracking-[0.1em] hover:bg-[#171717]"
				>
					<Share2 className="size-3.5" />
					Teilen
				</Button>
			</DialogTrigger>
			<DialogContent className="border-[#222] bg-[#0d0d0d] text-[#e8e4de] sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="font-mono text-sm uppercase tracking-[0.14em]">
						Event teilen
					</DialogTitle>
					<DialogDescription className="font-mono text-[#777] text-xs">
						Öffentliche Event-Seite für "{title}".
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-3">
					<div className="flex items-center justify-center border border-[#222] bg-[#111] p-3">
						<img
							src={qrUrl}
							alt={`QR-Code für ${title}`}
							className="size-48"
							loading="lazy"
						/>
					</div>
					<div className="space-y-1.5">
						<div className="flex items-center gap-1.5 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.18em]">
							<QrCode className="size-3.5" />
							Link
						</div>
						<Input
							readOnly
							value={publicUrl}
							className="border-[#222] bg-[#111] font-mono text-xs"
						/>
					</div>
				</div>

				<DialogFooter className="gap-2 sm:justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={handleCopy}
						className="border-[#222] bg-[#111] font-mono text-[10px] uppercase tracking-[0.1em]"
					>
						<Copy className="size-3.5" />
						Kopieren
					</Button>
					<Button
						asChild
						className="bg-[#ff3d00] font-mono text-black text-[10px] uppercase tracking-[0.1em] hover:bg-[#ff3d00]"
					>
						<a href={publicUrl} target="_blank" rel="noreferrer">
							<ExternalLink className="size-3.5" />
							Öffnen
						</a>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
