"use client";

import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, useUploadImage } from "@/react-query";
import { errorMessage } from "@/utils/apiClient";
import { cn } from "@/lib/utils";

type Props = {
    value: string;
    onChange: (url: string) => void;
    /** "cover" = wide drop zone with preview; "avatar" = buttons beside a preview you render yourself. */
    variant?: "cover" | "avatar";
    label: string;
    /** Avatar variant: the preview shown left of the buttons. */
    preview?: ReactNode;
};

export default function ImageUpload({
    value,
    onChange,
    variant = "cover",
    label,
    preview,
}: Props) {
    const input = useRef<HTMLInputElement>(null);
    const upload = useUploadImage();
    const [dragging, setDragging] = useState(false);

    const pick = () => input.current?.click();

    const send = (file?: File) => {
        if (!file) return;
        // Same limits the API enforces; checking here saves a slow failed upload.
        if (!IMAGE_TYPES.includes(file.type))
            return toast.error("Use a JPEG, PNG, WebP or GIF image.");
        if (file.size > MAX_IMAGE_BYTES)
            return toast.error("Image must be 5 MB or smaller.");
        upload.mutate(file, {
            onSuccess: (url) => onChange(url),
            onError: (e) => toast.error(errorMessage(e)),
        });
    };

    const fileInput = (
        <input
            ref={input}
            type="file"
            accept={IMAGE_TYPES.join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
                send(e.target.files?.[0]);
                e.target.value = ""; // allow re-picking the same file
            }}
        />
    );

    const busy = upload.isPending;
    const actions = value && (
        <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={pick} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                Replace
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange("")}
                disabled={busy}
            >
                <Trash2 /> Remove
            </Button>
        </div>
    );

    if (variant === "avatar")
        return (
            <div className="flex items-center gap-4">
                {preview}
                {fileInput}
                {value ? (
                    actions
                ) : (
                    <Button type="button" variant="outline" size="sm" onClick={pick} disabled={busy}>
                        {busy ? <Loader2 className="animate-spin" /> : <ImagePlus />}
                        {busy ? "Uploading…" : label}
                    </Button>
                )}
            </div>
        );

    return (
        <div>
            {fileInput}
            {value ? (
                <div className="space-y-3">
                    <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element -- uploaded file served by the API */}
                        <img
                            src={value}
                            alt="Cover preview"
                            className={cn(
                                "aspect-[21/9] w-full rounded-2xl object-cover transition",
                                busy && "opacity-50",
                            )}
                        />
                        {busy && (
                            <Loader2 className="absolute inset-0 m-auto size-8 animate-spin text-white" />
                        )}
                    </div>
                    {actions}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={pick}
                    disabled={busy}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        send(e.dataTransfer.files[0]);
                    }}
                    className={cn(
                        "text-muted-foreground hover:border-primary/50 hover:bg-primary/5 focus-visible:ring-ring/50 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-sm transition outline-none focus-visible:ring-3",
                        dragging && "border-primary bg-primary/5",
                    )}
                >
                    {busy ? (
                        <Loader2 className="text-primary size-6 animate-spin" />
                    ) : (
                        <span className="from-primary/15 text-primary flex size-11 items-center justify-center rounded-xl bg-gradient-to-br to-fuchsia-500/15">
                            <ImagePlus className="size-5" />
                        </span>
                    )}
                    <span className="text-foreground font-medium">
                        {busy ? "Uploading…" : label}
                    </span>
                    <span className="text-xs">
                        Click or drag an image here · JPEG, PNG, WebP or GIF up to 5 MB
                    </span>
                </button>
            )}
        </div>
    );
}
