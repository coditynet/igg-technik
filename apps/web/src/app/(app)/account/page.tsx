"use client";

import { ArrowLeft } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { PasskeyFrame } from "./_components/passkey-frame";
import { ProfileFrame } from "./_components/profile-frame";
import { SessionsFrame } from "./_components/sessions-frame";

export default function AccountPage() {
	const { data: session } = authClient.useSession();

	return (
		<div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] text-[#e8e4de] selection:bg-[#ff3d00] selection:text-black">
			<div
				className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
				style={{
					backgroundImage:
						"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
				}}
			/>

			<header className="sticky top-0 z-40 border-[#222] border-b bg-[#0a0a0a]/95 backdrop-blur">
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							size="sm"
							asChild
							className="border border-[#222] bg-[#111] font-mono text-[#e8e4de] text-[10px] uppercase tracking-[0.2em] hover:bg-[#151515]"
						>
							<Link href={"/dashboard" as Route}>
								<ArrowLeft className="mr-2 size-4" />
								Zurück
							</Link>
						</Button>
						<div className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
							Account
						</div>
					</div>
					<div className="font-mono text-[#777] text-[10px] uppercase tracking-[0.2em]">
						Kontoverwaltung
					</div>
				</div>
			</header>

			<main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6">
				<div className="space-y-8">
					<section id="profile" className="space-y-4">
						<div className="border border-[#222] bg-[#0f0f0f] px-4 py-3">
							<div className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
								Allgemein
							</div>
							<h1 className="mt-1 font-black text-3xl uppercase tracking-tight">
								Konto
							</h1>
							<p className="mt-1 font-mono text-[#777] text-xs">
								Verwalte deine persönlichen Informationen.
							</p>
						</div>
						<ProfileFrame user={session?.user} />
					</section>

					<section id="security" className="space-y-6">
						<div className="border border-[#222] bg-[#0f0f0f] px-4 py-3">
							<div className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
								Sicherheit
							</div>
							<p className="mt-1 font-mono text-[#777] text-xs">
								Verwalte Passwörter, Passkeys und aktive Sitzungen.
							</p>
						</div>

						<div className="grid gap-6">
							<PasskeyFrame />
							<SessionsFrame currentSessionId={session?.session?.id} />
						</div>
					</section>
				</div>
			</main>
		</div>
	);
}
