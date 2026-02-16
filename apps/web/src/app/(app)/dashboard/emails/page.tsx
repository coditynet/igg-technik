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

	return (
		<div className="max-w-6xl space-y-4">
			<div>
				<div className="mb-2 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
					Verwaltung
				</div>
				<h1 className="font-black text-3xl uppercase tracking-tight">
					E-Mails
				</h1>
				<p className="font-mono text-[#777] text-xs">
					Verwalten Sie eingehende Event-E-Mails
				</p>
			</div>

			{emails === undefined ? (
				<div className="border border-[#222] bg-[#0f0f0f]">
					<Table>
						<TableHeader>
							<TableRow className="border-[#222] hover:bg-transparent">
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Betreff
								</TableHead>
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Von
								</TableHead>
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Status
								</TableHead>
								<TableHead className="text-right font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Empfangen
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 5 }).map((_, index) => (
								<TableRow
									key={`email-loading-${index + 1}`}
									className="border-[#1c1c1c] hover:bg-transparent"
								>
									<TableCell>
										<Skeleton className="h-4 w-[85%] bg-[#111]" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-[70%] bg-[#111]" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-6 w-20 bg-[#111]" />
									</TableCell>
									<TableCell className="text-right">
										<Skeleton className="ml-auto h-4 w-20 bg-[#111]" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			) : !emails || emails.length === 0 ? (
				<div className="flex h-[400px] items-center justify-center border border-[#222] bg-[#0f0f0f]">
					<p className="font-mono text-[#777] text-xs">
						Keine E-Mails gefunden
					</p>
				</div>
			) : (
				<div className="border border-[#222] bg-[#0f0f0f]">
					<Table>
						<TableHeader>
							<TableRow className="border-[#222] hover:bg-transparent">
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Betreff
								</TableHead>
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Von
								</TableHead>
								<TableHead className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Status
								</TableHead>
								<TableHead className="text-right font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.2em]">
									Empfangen
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{emails.map((email) => (
								<TableRow
									key={email._id}
									className="border-[#1c1c1c] hover:bg-[#ff3d00]/5"
								>
									<TableCell>
										<Link
											href={`/dashboard/emails/${email._id}` as any}
											className="font-medium text-[#e8e4de] hover:text-[#ff3d00] hover:underline"
										>
											{email.subject || "(Kein Betreff)"}
										</Link>
									</TableCell>
									<TableCell className="font-mono text-[#888] text-xs">
										{email.from}
									</TableCell>
									<TableCell>
										<span
											className={
												email.processed
													? "inline-flex border border-emerald-500/40 bg-emerald-500/15 px-2 py-1 font-mono text-[10px] text-emerald-300 uppercase tracking-[0.15em]"
													: "inline-flex border border-[#ff3d00]/40 bg-[#ff3d00]/15 px-2 py-1 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.15em]"
											}
										>
											{email.processed ? "Verarbeitet" : "Ausstehend"}
										</span>
									</TableCell>
									<TableCell className="text-right font-mono text-[#888] text-xs">
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
			)}
		</div>
	);
}
