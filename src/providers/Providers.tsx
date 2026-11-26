"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { authKeys, useMe } from "@/react-query";
import {
    AUTH_LOGOUT_EVENT,
    tokenExpiresAt,
    tokenStore,
} from "@/utils/apiClient";
import QueryProvider from "./QueryProvider";

// Tokens last 1h with no refresh token: log out the moment it expires (or the API rejects it),
// and send the user to login so they can come straight back to what they were doing.
function SessionWatcher() {
    const qc = useQueryClient();
    const router = useRouter();
    const pathname = usePathname();
    const { data: me } = useMe();

    useEffect(() => {
        const onLogout = () => {
            if (qc.getQueryData(authKeys.me()) === null) return; // already a guest
            qc.setQueryData(authKeys.me(), null);
            toast.info("Your session expired. Please sign in again.");
            router.push(`/login?next=${encodeURIComponent(pathname)}`);
        };
        window.addEventListener(AUTH_LOGOUT_EVENT, onLogout);
        return () => window.removeEventListener(AUTH_LOGOUT_EVENT, onLogout);
    }, [qc, router, pathname]);

    useEffect(() => {
        const token = me && tokenStore.get();
        const exp = token && tokenExpiresAt(token);
        if (!exp) return;
        const timer = setTimeout(
            () => {
                tokenStore.clear();
                window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
            },
            // setTimeout caps at ~24.8 days; tokens here last 1h.
            Math.min(exp - Date.now(), 2 ** 31 - 1),
        );
        return () => clearTimeout(timer);
    }, [me]);

    return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryProvider>
            <SessionWatcher />
            {children}
            <Toaster richColors position="top-center" />
        </QueryProvider>
    );
}
