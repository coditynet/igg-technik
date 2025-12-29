"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { PasskeyFrame } from "./_components/passkey-frame";
import { ProfileFrame } from "./_components/profile-frame";
import { SessionsFrame } from "./_components/sessions-frame";

export default function AccountPage() {
	const { data: session } = authClient.useSession();

	return (
		<div className="flex min-h-screen flex-col">
			<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-14 items-center">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/dashboard">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Zurück zum Dashboard
						</Link>
					</Button>
				</div>
			</div>

			<div className="container flex-1 py-8">
				<div className="mx-auto max-w-4xl space-y-8">
					<div>
						<h1 className="font-bold text-3xl tracking-tight">
							Kontoeinstellungen
						</h1>
						<p className="mt-2 text-muted-foreground">
							Verwalte dein Profil und deine Sicherheitseinstellungen
						</p>
					</div>

					<Tabs defaultValue="profile" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="profile">Profil</TabsTrigger>
							<TabsTrigger value="security">Sicherheit</TabsTrigger>
						</TabsList>
						<TabsContent value="profile" className="mt-6 space-y-6">
							<ProfileFrame initialName={session?.user?.name || ""} />
						</TabsContent>
						<TabsContent value="security" className="mt-6 space-y-6">
							<PasskeyFrame />
							<SessionsFrame currentSessionId={session?.session?.id} />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
