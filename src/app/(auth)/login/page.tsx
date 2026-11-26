"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthHeader from "@/components/common/AuthHeader";
import FormField from "@/components/common/FormField";
import PasswordInput from "@/components/common/PasswordInput";
import { useLogin } from "@/react-query";
import { errorMessage } from "@/utils/apiClient";
import { loginSchema, type LoginInput } from "@/validations";

// Only allow same-site relative redirects.
const safeNext = (next: string | null) =>
    next?.startsWith("/") && !next.startsWith("//") ? next : "/";

function LoginForm() {
    const router = useRouter();
    const next = safeNext(useSearchParams().get("next"));
    const login = useLogin();
    const { register, handleSubmit, formState } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });
    const { errors } = formState;

    return (
        <form
            onSubmit={handleSubmit((v) =>
                login.mutate(v, { onSuccess: () => router.replace(next) }),
            )}
            className="grid gap-4"
            noValidate
        >
            <FormField id="email" label="Email" error={errors.email?.message}>
                <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-11"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                />
            </FormField>
            <FormField
                id="password"
                label="Password"
                error={errors.password?.message}
            >
                <PasswordInput
                    id="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-11"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                />
            </FormField>
            {login.isError && (
                <p
                    role="alert"
                    className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm"
                >
                    {errorMessage(login.error)}
                </p>
            )}
            <Button type="submit" className="h-11" disabled={login.isPending}>
                {login.isPending && <Loader2 className="animate-spin" />}
                {login.isPending ? "Signing in…" : "Sign in"}
            </Button>
        </form>
    );
}

export default function LoginPage() {
    return (
        <>
            <AuthHeader
                title="Welcome back"
                description="Sign in to like, comment and write posts."
            />
            <Suspense>
                <LoginForm />
            </Suspense>
            <p className="text-muted-foreground mt-6 text-center text-sm">
                No account?{" "}
                <Link
                    href="/register"
                    className="text-foreground font-medium underline-offset-4 hover:underline"
                >
                    Create one
                </Link>
            </p>
        </>
    );
}
