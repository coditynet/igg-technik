"use client"
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import type { Route } from "next";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();

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
                        toast.success("Sign in successful");
                    },
                    onError: (error) => {
                        toast.error(error.error?.message || error.error?.statusText || "Sign in failed");
                    },
                },
            );
        },
        validators: {
            onSubmit: z.object({
                email: z.string().email("Invalid email address"),
                password: z.string().min(8, "Password must be at least 8 characters"),
            }),
        },
    });

    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
            >
                <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
                    <div className="text-center">
                        <Link href="/" aria-label="go home" className="mx-auto block w-fit" />
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Bei IGG-Technik anmelden</h1>
                        <p className="text-sm">Welcome back! Sign in to continue</p>
                    </div>

                    <div className="mt-6 space-y-6">
                        <div className="space-y-2">
                            <form.Field name="email">
                                {(field) => (
                                    <>
                                        <Label htmlFor={field.name} className="block text-sm">
                                            Email
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
                                    Password
                                </Label>
                                <Button variant="link" size="sm">
                                    <Link href="#" className="link intent-info variant-ghost text-sm">
                                        Forgot your Password ?
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
                                    {state.isSubmitting ? "Submitting..." : "Sign In"}
                                </Button>
                            )}
                        </form.Subscribe>
                    </div>
                </div>

                <div className="p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Du hast noch keine Account?
                    </p>
                </div>
            </form>
        </section>
    );
}