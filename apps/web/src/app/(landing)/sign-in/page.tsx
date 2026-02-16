"use client";

import { useForm } from "@tanstack/react-form";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

function BrutalistLoader() {
	return (
		<div className="relative h-[2px] w-16 overflow-hidden bg-[#222]">
			<div
				className="absolute inset-y-0 left-0 w-1/2 bg-[#ff3d00]"
				style={{
					animation: "scanBar 0.8s ease-in-out infinite",
				}}
			/>
			<style>{`
				@keyframes scanBar {
					0% { left: -50%; }
					100% { left: 100%; }
				}
			`}</style>
		</div>
	);
}

export default function BrutalistSignIn() {
	const router = useRouter();
	const [isSigningInWithPasskey, setIsSigningInWithPasskey] = useState(false);
	const { data: session, isPending } = authClient.useSession();
	const [showForgot, setShowForgot] = useState(false);
	const [signInSuccess, setSignInSuccess] = useState(false);

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
						setSignInSuccess(true);
						toast.success("Erfolgreich angemeldet");
						router.push("/dashboard" as Route);
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
				setSignInSuccess(true);
				toast.success("Erfolgreich angemeldet");
				router.push("/dashboard" as Route);
			}
		} catch (_err) {
			toast.error("Passkey-Anmeldung fehlgeschlagen");
		} finally {
			setIsSigningInWithPasskey(false);
		}
	};

	if (isPending || signInSuccess) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
				<BrutalistLoader />
			</div>
		);
	}

	return (
		<div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] text-[#e8e4de] selection:bg-[#ff3d00] selection:text-black">
			<div
				className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
				}}
			/>

			<nav className="fixed top-0 right-0 left-0 z-40 border-[#222] border-b">
				<div className="mx-auto flex max-w-[900px] items-center justify-between px-6 py-4">
					<Link
						href={"/" as Route}
						className="group flex items-center gap-3 font-mono text-[#666] text-xs uppercase tracking-[0.2em] transition-colors hover:text-[#e8e4de]"
					>
						<svg
							className="h-4 w-4 transition-transform group-hover:-translate-x-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path d="M19 12H5M12 19l-7-7 7-7" />
						</svg>
						Zurück
					</Link>
					<span className="font-mono text-sm uppercase tracking-[0.3em]">
						IGG Technik
					</span>
				</div>
			</nav>

			<div className="relative z-10 mx-auto flex min-h-screen max-w-[900px] items-center px-6">
				<div className="w-full max-w-md">
					<div className="mb-4 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
						Zugang
					</div>
					<h1
						className="mb-3 font-black text-[clamp(2rem,5vw,3.5rem)] uppercase leading-[0.9] tracking-[-0.03em]"
						style={{
							fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif",
						}}
					>
						Anmelden.
					</h1>
					<p className="mb-10 text-[#666] text-sm leading-relaxed">
						Willkommen zurück. Melde dich an um fortzufahren.
					</p>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-0"
					>
						<div className="border-[#222] border-t py-5">
							<form.Field name="email">
								{(field) => (
									<>
										<label
											htmlFor={field.name}
											className="mb-3 block font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]"
										>
											E-Mail
										</label>
										<input
											id={field.name}
											name={field.name}
											type="email"
											required
											placeholder="max@beispiel.de"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="w-full border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none placeholder:text-[#444] focus:border-[#ff3d00]/50"
										/>
										{field.state.meta.errors.map((error) => (
											<p
												key={error?.message}
												className="mt-2 font-mono text-[#ff3d00] text-xs"
											>
												{error?.message}
											</p>
										))}
									</>
								)}
							</form.Field>
						</div>

						<div className="border-[#222] border-t py-5">
							<form.Field name="password">
								{(field) => (
									<>
										<div className="mb-3 flex items-center justify-between">
											<label
												htmlFor={field.name}
												className="font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]"
											>
												Passwort
											</label>
											<button
												type="button"
												onClick={() => setShowForgot(!showForgot)}
												className="font-mono text-[#555] text-[10px] uppercase tracking-[0.15em] transition-colors hover:text-[#ff3d00]"
											>
												Vergessen?
											</button>
										</div>
										<input
											id={field.name}
											name={field.name}
											type="password"
											required
											placeholder="••••••••"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="w-full border border-[#222] bg-[#111] px-4 py-3 font-mono text-[#e8e4de] text-sm outline-none placeholder:text-[#444] focus:border-[#ff3d00]/50"
										/>
										{field.state.meta.errors.map((error) => (
											<p
												key={error?.message}
												className="mt-2 font-mono text-[#ff3d00] text-xs"
											>
												{error?.message}
											</p>
										))}
									</>
								)}
							</form.Field>
						</div>

						<div className="border-[#222] border-t pt-6">
							<form.Subscribe>
								{(state) => (
									<button
										type="submit"
										disabled={!state.canSubmit || state.isSubmitting}
										className="group inline-flex w-full items-center justify-center gap-3 bg-[#ff3d00] px-8 py-4 font-mono text-black text-sm uppercase tracking-[0.1em] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_rgba(255,61,0,0.3)] disabled:opacity-50"
									>
										{state.isSubmitting ? (
											"Wird angemeldet..."
										) : (
											<>
												Anmelden
												<svg
													className="h-4 w-4 transition-transform group-hover:translate-x-1"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
													strokeWidth={2}
												>
													<path d="M5 12h14M12 5l7 7-7 7" />
												</svg>
											</>
										)}
									</button>
								)}
							</form.Subscribe>
						</div>

						<div className="relative py-6">
							<div className="absolute inset-x-0 top-1/2 h-px bg-[#222]" />
							<div className="relative flex justify-center">
								<span className="bg-[#0a0a0a] px-4 font-mono text-[#444] text-[10px] uppercase tracking-[0.2em]">
									Oder
								</span>
							</div>
						</div>

						<button
							type="button"
							onClick={handlePasskeySignIn}
							disabled={isSigningInWithPasskey}
							className="group flex w-full items-center justify-center gap-3 border border-[#222] bg-[#111] px-8 py-4 font-mono text-[#e8e4de] text-sm uppercase tracking-[0.1em] transition-all hover:border-[#ff3d00]/30 hover:bg-[#1a1a1a] disabled:opacity-50"
						>
							{isSigningInWithPasskey ? (
								<span className="text-[#888]">Wird angemeldet...</span>
							) : (
								<>
									<svg
										className="h-4 w-4 text-[#ff3d00]"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2}
									>
										<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4M14 13.12c0 2.38 0 6.38-1 8.88M17.29 21.02c.12-.6.43-2.3.5-3.02M2 12a10 10 0 0 1 18-6M2 16h.01M21.8 16c.2-2 .131-5.354 0-6M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2M8.65 22c.21-.66.45-1.32.57-2M9 6.8a6 6 0 0 1 9 5.2v2" />
									</svg>
									Mit Passkey anmelden
								</>
							)}
						</button>
					</form>
				</div>

				<div className="pointer-events-none absolute top-1/4 right-8 hidden lg:block">
					<div className="space-y-3 opacity-20">
						<div className="h-px w-32 bg-[#ff3d00]" />
						<div className="h-px w-20 bg-[#ff3d00]" />
						<div className="h-px w-28 bg-[#ff3d00]" />
						<div className="h-px w-16 bg-[#ff3d00]" />
					</div>
				</div>
				<div
					className="pointer-events-none absolute right-12 bottom-1/4 hidden font-mono text-[#222] text-[10px] uppercase tracking-[0.3em] lg:block"
					style={{ writingMode: "vertical-rl" }}
				>
					TECHNIK TEAM // LOGIN
				</div>
			</div>

			<footer className="border-[#222] border-t px-6 py-8">
				<div className="mx-auto flex max-w-[900px] items-center justify-between">
					<div className="font-mono text-[#444] text-[10px] uppercase tracking-[0.3em]">
						IGG Technik {new Date().getFullYear()}
					</div>
					<span className="font-mono text-[#444] text-[10px] uppercase tracking-[0.2em]">
						Made by Codity
					</span>
				</div>
			</footer>

			{showForgot && (
				<div
					className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
					onClick={() => setShowForgot(false)}
				>
					<div
						className="relative mx-6 w-full max-w-sm border border-[#ff3d00]/30 bg-[#0a0a0a] p-8"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							type="button"
							onClick={() => setShowForgot(false)}
							className="absolute top-4 right-4 font-mono text-[#555] text-xs transition-colors hover:text-[#ff3d00]"
						>
							&times;
						</button>
						<div className="mb-4 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.3em]">
							Passwort vergessen
						</div>
						<p className="text-[#e8e4de] text-sm leading-relaxed">
							Melde dich bei dem Technik-Betreuer.
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
