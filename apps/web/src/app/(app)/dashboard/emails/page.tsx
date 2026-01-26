"use client";

import { api } from "@igg/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
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
			<div className="space-y-4">
				<div className="space-y-2">
					<Skeleton className="h-9 w-48" />
					<Skeleton className="h-5 w-96" />
				</div>
				<Skeleton className="h-[400px] w-full" />
			</div>
		);
	}

	if (!emails || emails.length === 0) {
		return (
			<div className="space-y-4">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">E-Mails</h1>
					<p className="text-muted-foreground">
						Verwalten Sie eingehende Event-E-Mails
					</p>
				</div>
				<div className="flex h-[400px] items-center justify-center rounded-lg border">
					<p className="text-muted-foreground">Keine E-Mails gefunden</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4 max-w-6xl">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">E-Mails</h1>
				<p className="text-muted-foreground">
					Verwalten Sie eingehende Event-E-Mails
				</p>
			</div>

			<div className="rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Betreff</TableHead>
							<TableHead>Von</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Empfangen</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{emails.map((email) => (
							<TableRow key={email._id}>
								<TableCell>
									<Link
										href={`/dashboard/emails/${email._id}` as any}
										className="font-medium hover:underline"
									>
										{email.subject || "(Kein Betreff)"}
									</Link>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{email.from}
								</TableCell>
								<TableCell>
									{email.processed ? (
										<Badge variant="default" className="bg-emerald-500">
											Verarbeitet
										</Badge>
									) : (
										<Badge variant="secondary">Ausstehend</Badge>
									)}
								</TableCell>
								<TableCell className="text-right text-muted-foreground">
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
