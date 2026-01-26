"use client";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { FingerprintIcon } from "@/components/ui/icons/fingerprint";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
	const router = useRouter();
	const [isSigningInWithPasskey, setIsSigningInWithPasskey] = useState(false);
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (!isPending && session) {
			router.push("/dashboard" as Route);
		}
	}, [session, isPending, router]);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						router.push("/dashboard" as Route);
						toast.success("Erfolgreich angemeldet");
					},
					onError: (error) => {
						toast.error(
							error.error?.message ||
								error.error?.statusText ||
								"Anmeldung fehlgeschlagen",
						);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.string().email("Ungültige E-Mail-Adresse"),
				password: z
					.string()
					.min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
			}),
		},
	});

	const handlePasskeySignIn = async () => {
		setIsSigningInWithPasskey(true);
		try {
			const { error } = await authClient.signIn.passkey();
			if (error) {
				toast.error(error.message || "Passkey-Anmeldung fehlgeschlagen");
			} else {
				router.push("/dashboard" as Route);
				toast.success("Erfolgreich angemeldet");
			}
		} catch (_err) {
			toast.error("Passkey-Anmeldung fehlgeschlagen");
		} finally {
			setIsSigningInWithPasskey(false);
		}
	};

	if (isPending) {
		return (
			<section className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-transparent">
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="size-8 animate-spin text-muted-foreground" />
					<p className="text-muted-foreground text-sm">Lädt...</p>
				</div>
			</section>
		);
	}

	return (
		<section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border bg-muted shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
			>
				<div className="-m-px rounded-[calc(var(--radius)+.125rem)] border bg-card p-8 pb-6">
					<div className="text-center">
						<Link
							href="/"
							aria-label="go home"
							className="mx-auto block w-fit"
						/>
						<h1 className="mt-4 mb-1 font-semibold text-xl">
							Bei IGG-Technik anmelden
						</h1>
						<p className="text-sm">
							Willkommen zurück! Melde dich an um fortzufahren
						</p>
					</div>

					<div className="mt-6 space-y-6">
						<div className="space-y-2">
							<form.Field name="email">
								{(field) => (
									<>
										<Label htmlFor={field.name} className="block text-sm">
											E-Mail
										</Label>
										<Input
											id={field.name}
											name={field.name}
											type="email"
											required
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-red-500 text-sm">
												{error?.message}
											</p>
										))}
									</>
								)}
							</form.Field>
						</div>

						<div className="space-y-0.5">
							<div className="flex items-center justify-between">
								<Label htmlFor="pwd" className="text-sm">
									Passwort
								</Label>
								<Button variant="link" size="sm">
									<Link
										href="#"
										className="link intent-info variant-ghost text-sm"
									>
										Passwort vergessen?
									</Link>
								</Button>
							</div>

							<form.Field name="password">
								{(field) => (
									<>
										<Input
											id={field.name}
											name={field.name}
											type="password"
											required
											className="input sz-md variant-mixed"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-red-500 text-sm">
												{error?.message}
											</p>
										))}
									</>
								)}
							</form.Field>
						</div>

						<form.Subscribe>
							{(state) => (
								<Button
									type="submit"
									className="w-full"
									disabled={!state.canSubmit || state.isSubmitting}
								>
									{state.isSubmitting ? "Wird angemeldet..." : "Anmelden"}
								</Button>
							)}
						</form.Subscribe>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-card px-2 text-muted-foreground">
									Oder fortfahren mit
								</span>
							</div>
						</div>

						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={handlePasskeySignIn}
							disabled={isSigningInWithPasskey}
						>
							{isSigningInWithPasskey ? (
								<>
									<Loader2 className="mr-2 size-4 animate-spin" />
									Wird angemeldet...
								</>
							) : (
								<>
									<FingerprintIcon size={16} className="mr-2" />
									Mit Passkey anmelden
								</>
							)}
						</Button>
					</div>
				</div>

				<div className="p-3">
					<p className="text-center text-accent-foreground text-sm">
						Du hast noch keinen Account?
					</p>
				</div>
			</form>
		</section>
	);
}
