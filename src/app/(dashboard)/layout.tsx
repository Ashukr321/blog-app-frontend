"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/react-query";

// Login-required pages: guests are sent to /login and come back after signing in.
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: me, isPending } = useMe();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isPending && !me)
            router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }, [isPending, me, pathname, router]);

    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
            {me ? children : <Skeleton className="h-64 w-full rounded-xl" />}
        </div>
    );
}
