"use client";

import { useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, tokenStore } from "@/utils/apiClient";
import type { Profile } from "@/types/post";
import { authKeys, postKeys } from "../query-keys";

const noopSubscribe = () => () => {};

/** The logged-in user, `null` for guests. Pending until the client has checked the stored token. */
export function useMe() {
    // The server always renders as "pending"; if the profile arrives while React is still
    // hydrating, showing it would mismatch the server HTML. So stay pending until hydrated.
    const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
    const query = useQuery({
        queryKey: authKeys.me(),
        queryFn: async () =>
            tokenStore.get()
                ? (await apiClient.get<{ data: Profile }>("/me/profile")).data
                      .data
                : null,
        staleTime: Infinity,
    });
    return hydrated
        ? query
        : ({ ...query, data: undefined, isPending: true, status: "pending" } as typeof query);
}

type AuthResponse = { data: { accessToken: string } };

function useAuthMutation<T>(path: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: T) => apiClient.post<AuthResponse>(path, body),
        onSuccess: async (res) => {
            tokenStore.set(res.data.data.accessToken);
            await qc.invalidateQueries({ queryKey: authKeys.me() });
            qc.invalidateQueries({ queryKey: postKeys.all }); // refresh myReaction
        },
    });
}

export const useLogin = () =>
    useAuthMutation<{ email: string; password: string }>("/auth/login");

export const useRegister = () =>
    useAuthMutation<{ email: string; password: string; displayName: string }>(
        "/auth/register",
    );

export function useLogout() {
    const qc = useQueryClient();
    return () => {
        tokenStore.clear();
        qc.setQueryData(authKeys.me(), null);
        qc.invalidateQueries({ queryKey: postKeys.all });
    };
}

export function useUpdateProfile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (
            body: Partial<Pick<Profile, "displayName" | "avatarUrl" | "bio">>,
        ) =>
            (await apiClient.patch<{ data: Profile }>("/me/profile", body)).data
                .data,
        onSuccess: (me) => qc.setQueryData(authKeys.me(), me),
    });
}
