"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { PasskeyFrame } from "./_components/passkey-frame";
import { ProfileFrame } from "./_components/profile-frame";
import { SessionsFrame } from "./_components/sessions-frame";
import { Separator } from "@/components/ui/separator";

export default function AccountPage() {
	const { data: session } = authClient.useSession();

	return (
		<div className="flex min-h-screen flex-col bg-muted/30">
			<div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" asChild className="-ml-2">
							<Link href="/dashboard">
								<ArrowLeft className="size-5" />
								<span className="sr-only">Zurück</span>
							</Link>
						</Button>
						<h1 className="font-semibold text-xl tracking-tight">Konto</h1>
					</div>
				</div>
			</div>

			<main className="container mx-auto flex-1 max-w-3xl px-4 py-10 sm:px-6">
				<div className="space-y-10">
					<section id="profile" className="space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="font-semibold text-lg">Allgemein</h2>
						</div>
						<ProfileFrame user={session?.user} />
					</section>

					<Separator />

					<section id="security" className="space-y-6">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="font-semibold text-lg">Sicherheit</h2>
								<p className="text-muted-foreground text-sm">
									Verwalte deine Passwörter und Anmeldemethoden.
								</p>
							</div>
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
