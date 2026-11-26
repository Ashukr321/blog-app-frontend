import Link from "next/link";
import { Feather } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

type Props = {
    title: string;
    description: string;
    action?: { href: string; label: string };
};

export default function EmptyState({ title, description, action }: Props) {
    return (
        <div className="bg-muted/40 flex flex-col items-center rounded-3xl border border-dashed px-6 py-16 text-center sm:py-20">
            <div className="from-primary shadow-primary/30 mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br to-fuchsia-500 text-white shadow-lg">
                <Feather className="size-6" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl">{title}</h3>
            <p className="text-muted-foreground mt-2 max-w-sm text-sm text-pretty">
                {description}
            </p>
            {action && (
                <Link
                    href={action.href}
                    className={buttonVariants({
                        size: "lg",
                        className: "mt-6 rounded-full px-5",
                    })}
                >
                    {action.label}
                </Link>
            )}
        </div>
    );
}
