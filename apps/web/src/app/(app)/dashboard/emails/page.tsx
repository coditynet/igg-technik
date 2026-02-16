"use client";

import { api } from "@igg/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export default function EmailsPage() {
	const emails = useQuery(api.mail.queries.listEmails);

	if (emails === undefined) {
		return (
			<div className="max-w-6xl space-y-4">
				<div className="space-y-2">
					<Skeleton className="h-3 w-24 bg-[#1c1c1c]" />
					<Skeleton className="h-9 w-48 bg-[#1c1c1c]" />
					<Skeleton className="h-5 w-80 bg-[#1c1c1c]" />
				</div>
				<Skeleton className="h-[400px] w-full rounded-none bg-[#111]" />
			</div>
		);
	}

	if (!emails || emails.length === 0) {
		return (
			<div className="max-w-6xl space-y-4">
				<div>
					<div className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[#ff3d00]">
						Verwaltung
					</div>
					<h1 className="font-black text-3xl uppercase tracking-tight">E-Mails</h1>
					<p className="font-mono text-xs text-[#777]">
						Verwalten Sie eingehende Event-E-Mails
					</p>
				</div>
				<div className="flex h-[400px] items-center justify-center border border-[#222] bg-[#0f0f0f]">
					<p className="font-mono text-xs text-[#777]">Keine E-Mails gefunden</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-6xl space-y-4">
			<div>
				<div className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[#ff3d00]">
					Verwaltung
				</div>
				<h1 className="font-black text-3xl uppercase tracking-tight">E-Mails</h1>
				<p className="font-mono text-xs text-[#777]">
					Verwalten Sie eingehende Event-E-Mails
				</p>
			</div>

			<div className="border border-[#222] bg-[#0f0f0f]">
				<Table>
					<TableHeader>
						<TableRow className="border-[#222] hover:bg-transparent">
							<TableHead className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ff3d00]">
								Betreff
							</TableHead>
							<TableHead className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ff3d00]">
								Von
							</TableHead>
							<TableHead className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ff3d00]">
								Status
							</TableHead>
							<TableHead className="text-right font-mono text-[10px] uppercase tracking-[0.2em] text-[#ff3d00]">
								Empfangen
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{emails.map((email) => (
							<TableRow key={email._id} className="border-[#1c1c1c] hover:bg-[#ff3d00]/5">
								<TableCell>
									<Link
										href={`/dashboard/emails/${email._id}` as any}
										className="font-medium text-[#e8e4de] hover:text-[#ff3d00] hover:underline"
									>
										{email.subject || "(Kein Betreff)"}
									</Link>
								</TableCell>
								<TableCell className="font-mono text-xs text-[#888]">
									{email.from}
								</TableCell>
								<TableCell>
									<span
										className={
											email.processed
												? "inline-flex border border-emerald-500/40 bg-emerald-500/15 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-emerald-300"
												: "inline-flex border border-[#ff3d00]/40 bg-[#ff3d00]/15 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#ff3d00]"
										}
									>
										{email.processed ? "Verarbeitet" : "Ausstehend"}
									</span>
								</TableCell>
								<TableCell className="text-right font-mono text-xs text-[#888]">
									{formatDistanceToNow(new Date(email.receivedAt), {
										addSuffix: true,
										locale: de,
									})}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
