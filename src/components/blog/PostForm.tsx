"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/common/ImageUpload";
import { useSavePost } from "@/react-query";
import type { PostDetail } from "@/types/post";
import { errorMessage } from "@/utils/apiClient";
import { postSchema, type PostFormInput } from "@/validations";

const Err = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-destructive mt-1 text-xs">{msg}</p> : null;

// Borderless "page" fields: the editor should read like the post, not like a form.
const bare =
    "border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent";

export default function PostForm({ post }: { post?: PostDetail }) {
    const router = useRouter();
    const save = useSavePost(post?.id);
    const { register, handleSubmit, formState, control, setValue } =
        useForm<PostFormInput>({
            resolver: zodResolver(postSchema),
            defaultValues: {
                title: post?.title ?? "",
                excerpt: post?.excerpt ?? "",
                photoUrl: post?.photoUrl ?? "",
                content: post?.content ?? "",
            },
        });
    const { errors } = formState;
    const [photoUrl, content] = useWatch({
        control,
        name: ["photoUrl", "content"],
    });
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;

    const submit = (status: "draft" | "published") =>
        handleSubmit((v) =>
            save.mutate(
                {
                    ...v,
                    excerpt: v.excerpt || null,
                    photoUrl: v.photoUrl || null,
                    status,
                },
                {
                    onSuccess: (saved) => {
                        toast.success(
                            status === "draft"
                                ? "Draft saved"
                                : post?.status === "published"
                                  ? "Changes saved"
                                  : "Post published",
                        );
                        router.push(`/blog/${saved.slug}`);
                    },
                    onError: (e) => toast.error(errorMessage(e)),
                },
            ),
        );

    const isPublished = post?.status === "published";

    return (
        <form noValidate onSubmit={submit("published")}>
            {/* Sticky action bar */}
            <div className="bg-background/80 sticky top-14 z-30 -mx-4 mb-8 flex items-center justify-between gap-2 border-b px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
                <p className="text-muted-foreground text-xs">
                    {post
                        ? isPublished
                            ? "Editing published post"
                            : "Editing draft"
                        : "New post"}
                    <span className="hidden sm:inline"> · {words} words</span>
                </p>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    {!isPublished && (
                        <Button
                            type="button"
                            variant="outline"
                            disabled={save.isPending}
                            onClick={submit("draft")}
                        >
                            Save draft
                        </Button>
                    )}
                    <Button
                        type="submit"
                        className="rounded-full px-4"
                        disabled={save.isPending}
                    >
                        {save.isPending && <Loader2 className="animate-spin" />}
                        {isPublished ? "Save changes" : "Publish"}
                    </Button>
                </div>
            </div>

            {/* Cover */}
            <div className="mb-8">
                <ImageUpload
                    label="Add a cover image (optional)"
                    value={photoUrl}
                    onChange={(url) =>
                        setValue("photoUrl", url, {
                            shouldDirty: true,
                            shouldValidate: true,
                        })
                    }
                />
                <Err msg={errors.photoUrl?.message} />
            </div>

            <Textarea
                id="title"
                rows={1}
                placeholder="Title"
                aria-label="Title"
                className={`${bare} font-heading field-sizing-content min-h-0 resize-none text-3xl leading-tight font-extrabold tracking-tight md:text-4xl`}
                aria-invalid={!!errors.title}
                {...register("title")}
            />
            <Err msg={errors.title?.message} />

            <Textarea
                id="excerpt"
                rows={1}
                placeholder="A short subtitle or teaser (optional)"
                aria-label="Excerpt"
                className={`${bare} text-muted-foreground mt-3 field-sizing-content min-h-0 resize-none text-lg md:text-xl`}
                aria-invalid={!!errors.excerpt}
                {...register("excerpt")}
            />
            <Err msg={errors.excerpt?.message} />

            <hr className="my-6" />

            <Textarea
                id="content"
                placeholder="Tell your story…"
                aria-label="Content"
                className={`${bare} field-sizing-content min-h-80 resize-none text-base leading-8 md:text-lg`}
                aria-invalid={!!errors.content}
                {...register("content")}
            />
            <Err msg={errors.content?.message} />
        </form>
    );
}
