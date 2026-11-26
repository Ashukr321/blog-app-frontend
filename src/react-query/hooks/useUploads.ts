import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/utils/apiClient";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** POST /uploads/image → public URL to store as photoUrl / avatarUrl. */
export function useUploadImage() {
    return useMutation({
        mutationFn: async (file: File) => {
            const body = new FormData();
            body.append("image", file);
            const res = await apiClient.post<{ data: { url: string } }>(
                "/uploads/image",
                body,
            );
            return res.data.data.url;
        },
    });
}
