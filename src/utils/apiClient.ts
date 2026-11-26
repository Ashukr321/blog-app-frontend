import axios, { isAxiosError } from "axios";

export const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000/v1";

const TOKEN_KEY = "blog.accessToken";
export const AUTH_LOGOUT_EVENT = "auth:logout";

/** JWT `exp` in ms, or null if the token can't be read. Not a security check: the API still verifies it. */
export function tokenExpiresAt(token: string): number | null {
    try {
        const payload = JSON.parse(
            atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
        );
        return typeof payload.exp === "number" ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
}

export const tokenStore = {
    // An expired token is treated as no token, so the UI never offers actions that will 401.
    get: () => {
        if (typeof window === "undefined") return null;
        const token = localStorage.getItem(TOKEN_KEY);
        const exp = token && tokenExpiresAt(token);
        if (token && exp && exp <= Date.now()) {
            localStorage.removeItem(TOKEN_KEY);
            return null;
        }
        return token;
    },
    set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
    clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const apiClient = axios.create({ baseURL: API_URL });

apiClient.interceptors.request.use((config) => {
    const token = tokenStore.get();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

apiClient.interceptors.response.use(undefined, (error) => {
    // A stale token breaks even public endpoints: drop it so the retry goes through as a guest.
    if (
        error.response?.status === 401 &&
        error.config?.headers?.Authorization
    ) {
        tokenStore.clear();
        window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
    }
    return Promise.reject(error);
});

// API errors are `{ message }` (incl. the 429 shape), so this works for every status.
export function errorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        // No response at all = API down or the browser blocked it (CORS); axios only says "Network Error".
        if (!error.response)
            return "Can't reach the server. Please check your connection and try again.";
        if (error.response.status === 429)
            return "Too many requests, please slow down.";
        return error.response?.data?.message ?? error.message;
    }
    return error instanceof Error ? error.message : "Something went wrong";
}

export const errorStatus = (error: unknown) =>
    isAxiosError(error) ? error.response?.status : undefined;
