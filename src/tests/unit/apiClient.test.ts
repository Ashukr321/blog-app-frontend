import { describe, expect, it, vi } from "vitest";
import { tokenExpiresAt, tokenStore } from "@/utils/apiClient";

// Node 26 ships an (unconfigured) global localStorage that shadows jsdom's.
const store = new Map<string, string>();
vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
});

const jwt = (payload: object) =>
    `x.${btoa(JSON.stringify(payload)).replace(/=+$/, "")}.y`;

describe("tokenExpiresAt", () => {
    it("reads exp in ms", () => {
        expect(tokenExpiresAt(jwt({ exp: 100 }))).toBe(100_000);
    });
    it("returns null for garbage", () => {
        expect(tokenExpiresAt("not-a-jwt")).toBeNull();
    });
});

describe("tokenStore", () => {
    it("drops an expired token", () => {
        tokenStore.set(jwt({ exp: Date.now() / 1000 - 10 }));
        expect(tokenStore.get()).toBeNull();
    });
    it("keeps a valid token", () => {
        const t = jwt({ exp: Date.now() / 1000 + 3600 });
        tokenStore.set(t);
        expect(tokenStore.get()).toBe(t);
    });
});
