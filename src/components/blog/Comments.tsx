"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/common/UserAvatar";
import { useCommentAction, useComments, type CommentNode } from "@/react-query";
import type { PostDetail, Profile } from "@/types/post";
import { errorMessage } from "@/utils/apiClient";
import { formatDate } from "@/utils/format";
import { commentSchema } from "@/validations";

type Action = ReturnType<typeof useCommentAction>;

function CommentBox({
    initial = "",
    submitLabel,
    action,
    onSubmit,
    onCancel,
}: {
    initial?: string;
    submitLabel: string;
    action: Action;
    onSubmit: (body: string) => Parameters<Action["mutate"]>[0];
    onCancel?: () => void;
}) {
    const [body, setBody] = useState(initial);
    const [error, setError] = useState("");

    return (
        <form
            className="grid gap-2"
            onSubmit={(e) => {
                e.preventDefault();
                const parsed = commentSchema.safeParse({ body });
                if (!parsed.success)
                    return setError(parsed.error.issues[0].message);
                setError("");
                action.mutate(onSubmit(parsed.data.body), {
                    onSuccess: () => {
                        setBody("");
                        onCancel?.();
                    },
                    onError: (err) => toast.error(errorMessage(err)),
                });
            }}
        >
            <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Write a comment…"
                aria-label={submitLabel}
                aria-invalid={!!error}
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                )}
                <Button type="submit" size="sm" disabled={action.isPending}>
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}

function CommentItem({
    c,
    me,
    action,
}: {
    c: CommentNode;
    me: Profile | null;
    action: Action;
}) {
    const [mode, setMode] = useState<"view" | "reply" | "edit">("view");
    // A deleted comment with no replies has nothing worth showing.
    if (c.isDeleted && !c.replies.length) return null;
    const isOwner = me?.userId === c.author.id;

    return (
        <li className="grid gap-2">
            <div className="flex gap-3">
                <UserAvatar user={c.author} size="sm" className="mt-0.5" />
                <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground text-xs">
                        <span className="text-foreground font-medium">
                            {c.isDeleted ? "—" : c.author.displayName}
                        </span>
                        {" · "}
                        {formatDate(c.createdAt)}
                        {c.updatedAt !== c.createdAt &&
                            !c.isDeleted &&
                            " · edited"}
                    </p>
                    {mode === "edit" ? (
                        <div className="mt-1">
                            <CommentBox
                                initial={c.body ?? ""}
                                submitLabel="Save"
                                action={action}
                                onSubmit={(body) => ({
                                    kind: "edit",
                                    id: c.id,
                                    body,
                                })}
                                onCancel={() => setMode("view")}
                            />
                        </div>
                    ) : (
                        <p
                            className={`mt-0.5 text-sm break-words whitespace-pre-wrap ${c.isDeleted ? "text-muted-foreground italic" : ""}`}
                        >
                            {c.isDeleted ? "[deleted]" : c.body}
                        </p>
                    )}
                    {!c.isDeleted && me && mode === "view" && (
                        <div className="mt-1 flex gap-1">
                            <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setMode("reply")}
                            >
                                Reply
                            </Button>
                            {isOwner && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="xs"
                                        onClick={() => setMode("edit")}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="xs"
                                        className="text-destructive"
                                        disabled={action.isPending}
                                        onClick={() =>
                                            confirm("Delete this comment?") &&
                                            action.mutate(
                                                { kind: "delete", id: c.id },
                                                {
                                                    onError: (e) =>
                                                        toast.error(
                                                            errorMessage(e),
                                                        ),
                                                },
                                            )
                                        }
                                    >
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                    {mode === "reply" && (
                        <div className="mt-2">
                            <CommentBox
                                submitLabel="Reply"
                                action={action}
                                onSubmit={(body) => ({
                                    kind: "add",
                                    body,
                                    parentId: c.id,
                                })}
                                onCancel={() => setMode("view")}
                            />
                        </div>
                    )}
                </div>
            </div>
            {c.replies.length > 0 && (
                <ul className="ml-4 grid gap-4 border-l pl-3 sm:ml-9 sm:pl-4">
                    {c.replies.map((r) => (
                        <CommentItem key={r.id} c={r} me={me} action={action} />
                    ))}
                </ul>
            )}
        </li>
    );
}

export default function Comments({
    post,
    me,
}: {
    post: PostDetail;
    me: Profile | null;
}) {
    const { tree, isPending, hasNextPage, fetchNextPage, isFetchingNextPage } =
        useComments(post.id);
    const action = useCommentAction(post);

    return (
        <section aria-labelledby="comments" className="mt-10">
            <h2 id="comments" className="mb-4 text-lg font-semibold">
                Comments ({post.counts.comments})
            </h2>
            {me ? (
                <CommentBox
                    submitLabel="Comment"
                    action={action}
                    onSubmit={(body) => ({ kind: "add", body })}
                />
            ) : (
                <p className="text-muted-foreground rounded-lg border p-4 text-sm">
                    <Link
                        href={`/login?next=/blog/${post.slug}`}
                        className="text-foreground font-medium underline underline-offset-4"
                    >
                        Sign in
                    </Link>{" "}
                    to join the conversation.
                </p>
            )}
            <div className="mt-6">
                {isPending ? (
                    <Skeleton className="h-20 w-full" />
                ) : tree.length ? (
                    <ul className="grid gap-5">
                        {tree.map((c) => (
                            <CommentItem
                                key={c.id}
                                c={c}
                                me={me}
                                action={action}
                            />
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground text-sm">
                        No comments yet.
                    </p>
                )}
                {hasNextPage && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        Load more comments
                    </Button>
                )}
            </div>
        </section>
    );
}
