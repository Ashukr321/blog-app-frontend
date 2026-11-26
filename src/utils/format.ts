export const formatDate = (iso: string | null) =>
    iso
        ? new Date(iso).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "Draft";

export const initials = (name: string) =>
    name
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
