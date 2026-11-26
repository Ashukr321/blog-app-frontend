import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="mx-auto max-w-md px-4 py-24 text-center">
            <p className="from-primary font-heading bg-gradient-to-br to-fuchsia-500 bg-clip-text text-7xl font-extrabold text-transparent">
                404
            </p>
            <h1 className="mt-4 text-2xl">Page not found</h1>
            <p className="text-muted-foreground mt-2">
                The page you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link
                href="/"
                className={buttonVariants({
                    className: "mt-6 rounded-full px-5",
                })}
            >
                Go home
            </Link>
        </div>
    );
}
