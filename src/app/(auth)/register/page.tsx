"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthHeader from "@/components/common/AuthHeader";
import FormField from "@/components/common/FormField";
import PasswordInput from "@/components/common/PasswordInput";
import { useRegister } from "@/react-query";
import { errorMessage } from "@/utils/apiClient";
import { registerSchema, type RegisterInput } from "@/validations";

const fields = [
    {
        name: "name",
        label: "Display name",
        type: "text",
        autoComplete: "name",
        placeholder: "Jane Doe",
    },
    {
        name: "email",
        label: "Email",
        type: "email",
        autoComplete: "email",
        placeholder: "you@example.com",
    },
    {
        name: "password",
        label: "Password",
        type: "password",
        autoComplete: "new-password",
        placeholder: "At least 8 characters",
    },
    {
        name: "confirmPassword",
        label: "Confirm password",
        type: "password",
        autoComplete: "new-password",
        placeholder: "Repeat password",
    },
] as const;

export default function RegisterPage() {
    const router = useRouter();
    const signup = useRegister();
    const { register, handleSubmit, formState } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });
    const { errors } = formState;

    return (
        <>
            <AuthHeader
                title="Create your account"
                description="Start writing and join the conversation."
            />
            <form
                noValidate
                className="grid gap-4"
                onSubmit={handleSubmit(({ name, email, password }) =>
                    signup.mutate(
                        { displayName: name, email, password },
                        { onSuccess: () => router.replace("/dashboard") },
                    ),
                )}
            >
                {fields.map(({ name, label, type, ...rest }) => {
                    const Field = type === "password" ? PasswordInput : Input;
                    return (
                        <FormField
                            key={name}
                            id={name}
                            label={label}
                            error={errors[name]?.message}
                        >
                            <Field
                                id={name}
                                {...(type !== "password" && { type })}
                                {...rest}
                                className="h-11"
                                aria-invalid={!!errors[name]}
                                {...register(name)}
                            />
                        </FormField>
                    );
                })}
                <p className="text-muted-foreground -mt-2 text-xs">
                    Use upper &amp; lower case letters, a number and a symbol.
                </p>
                {signup.isError && (
                    <p
                        role="alert"
                        className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm"
                    >
                        {errorMessage(signup.error)}
                    </p>
                )}
                <Button
                    type="submit"
                    className="h-11"
                    disabled={signup.isPending}
                >
                    {signup.isPending && <Loader2 className="animate-spin" />}
                    {signup.isPending ? "Creating account…" : "Create account"}
                </Button>
            </form>
            <p className="text-muted-foreground mt-6 text-center text-sm">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="text-foreground font-medium underline-offset-4 hover:underline"
                >
                    Sign in
                </Link>
            </p>
        </>
    );
}
