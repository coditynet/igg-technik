"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { ProfileFrame } from "./_components/profile-frame";
import { SessionsFrame } from "./_components/sessions-frame";

export default function AccountPage() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!session?.user) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-muted-foreground">
					Please sign in to view your account settings.
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col">
			<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-14 items-center">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/dashboard">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Dashboard
						</Link>
					</Button>
				</div>
			</div>

			<div className="container flex-1 py-8">
				<div className="mx-auto max-w-4xl space-y-8">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							Account Settings
						</h1>
						<p className="mt-2 text-muted-foreground">
							Manage your profile and security preferences
						</p>
					</div>

					<Tabs defaultValue="profile" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="profile">Profile</TabsTrigger>
							<TabsTrigger value="security">Security</TabsTrigger>
						</TabsList>
						<TabsContent value="profile" className="mt-6 space-y-6">
							<ProfileFrame initialName={session.user.name} />
						</TabsContent>
						<TabsContent value="security" className="mt-6 space-y-6">
							<SessionsFrame currentSessionId={session.session.id} />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
