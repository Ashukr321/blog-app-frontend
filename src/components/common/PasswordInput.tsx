"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function PasswordInput({
    className,
    ...props
}: React.ComponentProps<typeof Input>) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <Input
                {...props}
                type={show ? "text" : "password"}
                className={cn("pr-10", className)}
            />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                aria-pressed={show}
                className="text-muted-foreground hover:text-foreground focus-visible:outline-ring absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg transition-colors focus-visible:outline-2"
            >
                {show ? (
                    <EyeOff className="size-4" />
                ) : (
                    <Eye className="size-4" />
                )}
            </button>
        </div>
    );
}
