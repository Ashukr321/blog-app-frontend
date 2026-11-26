"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    ArrowLeft,
    Eye,
    Pencil,
    Share2,
    ThumbsDown,
    ThumbsUp,
    Trash2,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "@/components/common/UserAvatar";
import Comments from "@/components/blog/Comments";
import {
    useDeletePost,
    useMe,
    usePost,
    useReaction,
    useSavePost,
    useShare,
} from "@/react-query";
import type { PostDetail, Reaction, SharePlatform } from "@/types/post";
import { errorMessage, errorStatus } from "@/utils/apiClient";
import { formatDate } from "@/utils/format";
import { siteConfig } from "@/utils/site";

const SHARE: {
    platform: SharePlatform;
    label: string;
    href?: (url: string) => string;
}[] = [
    { platform: "link", label: "Copy link" },
    {
        platform: "whatsapp",
        label: "WhatsApp",
        href: (u) => `https://wa.me/?text=${u}`,
    },
    {
        platform: "x",
        label: "X (Twitter)",
        href: (u) => `https://twitter.com/intent/tweet?url=${u}`,
    },
    {
        platform: "facebook",
        label: "Facebook",
        href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    },
    {
        platform: "linkedin",
        label: "LinkedIn",
        href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    },
];

function Actions({ post, loggedIn }: { post: PostDetail; loggedIn: boolean }) {
    const router = useRouter();
    const react = useReaction(post);
    const share = useShare(post);
    const requireLogin = () => router.push(`/login?next=/blog/${post.slug}`);

    const onReact = (type: Reaction) =>
        loggedIn
            ? react.mutate(type, {
                  onError: (e) => toast.error(errorMessage(e)),
              })
            : requireLogin();

    const onShare = async ({ platform, href }: (typeof SHARE)[number]) => {
        // Window must open synchronously or popup blockers kick in; guests share without being counted.
        const win = href ? window.open("about:blank", "_blank") : null;
        if (win) win.opener = null;
        let url = `${siteConfig.url}/blog/${post.slug}`;
        if (loggedIn) {
            try {
                url = (await share.mutateAsync(platform)).shareUrl;
            } catch (e) {
                toast.error(errorMessage(e));
            }
        }
        if (href) {
            if (win) win.location.href = href(encodeURIComponent(url));
        } else {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied");
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            {(["like", "dislike"] as const).map((type) => {
                const Icon = type === "like" ? ThumbsUp : ThumbsDown;
                const active = post.myReaction === type;
                return (
                    <Button
                        key={type}
                        variant={active ? "secondary" : "outline"}
                        aria-pressed={active}
                        aria-label={type === "like" ? "Like" : "Dislike"}
                        disabled={react.isPending}
                        onClick={() => onReact(type)}
                    >
                        <Icon className={active ? "fill-current" : ""} />
                        {type === "like"
                            ? post.counts.likes
                            : post.counts.dislikes}
                    </Button>
                );
            })}
            <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" />}>
                    <Share2 /> {post.counts.shares}
                    <span className="sr-only">Share</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {SHARE.map((s) => (
                        <DropdownMenuItem
                            key={s.platform}
                            onClick={() => onShare(s)}
                        >
                            {s.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-muted-foreground ml-auto flex items-center gap-1 text-sm">
                <Eye className="size-4" /> {post.counts.views} views
            </span>
        </div>
    );
}

function OwnerActions({ post }: { post: PostDetail }) {
    const router = useRouter();
    const del = useDeletePost();
    const publish = useSavePost(post.id);

    return (
        <div className="flex flex-wrap gap-2">
            {post.status === "draft" && (
                <Button
                    size="sm"
                    disabled={publish.isPending}
                    onClick={() =>
                        publish.mutate(
                            { status: "published" },
                            {
                                onSuccess: () => toast.success("Published"),
                                onError: (e) => toast.error(errorMessage(e)),
                            },
                        )
                    }
                >
                    Publish
                </Button>
            )}
            <Link
                href={`/edit/${post.slug}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
            >
                <Pencil /> Edit
            </Link>
            <AlertDialog>
                <AlertDialogTrigger
                    render={<Button variant="destructive" size="sm" />}
                >
                    <Trash2 /> Delete
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Its comments, reactions and shares are removed too.
                            This can&apos;t be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button
                            variant="destructive"
                            disabled={del.isPending}
                            onClick={() =>
                                del.mutate(post.id, {
                                    onSuccess: () => {
                                        toast.success("Post deleted");
                                        router.replace("/");
                                    },
                                    onError: (e) =>
                                        toast.error(errorMessage(e)),
                                })
                            }
                        >
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function PostView({ slug }: { slug: string }) {
    const { data: post, isPending, error } = usePost(slug);
    const { data: me } = useMe();

    if (isPending)
        return (
            <div className="mx-auto grid max-w-3xl gap-4 px-4 py-10 sm:px-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="aspect-video w-full rounded-xl" />
                <Skeleton className="h-40 w-full" />
            </div>
        );

    if (error)
        return (
            <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
                <h1 className="text-2xl font-bold">
                    {errorStatus(error) === 404
                        ? "Post not found"
                        : "Couldn't load this post"}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {errorStatus(error) === 404
                        ? "It may have been deleted or is still a draft."
                        : errorMessage(error)}
                </p>
                <Link
                    href="/"
                    className={buttonVariants({
                        variant: "outline",
                        className: "mt-6",
                    })}
                >
                    Back to posts
                </Link>
            </div>
        );

    const isOwner = post.author.id === me?.userId;

    return (
        <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
            <Link
                href="/"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
            >
                <ArrowLeft className="size-4" /> All posts
            </Link>

            {post.status === "draft" && (
                <p className="text-muted-foreground mt-4 rounded-lg border border-dashed px-3 py-2 text-sm">
                    <Badge variant="secondary" className="mr-2">
                        Draft
                    </Badge>
                    Only you can see this post. Bookmark this page to find it
                    again.
                </p>
            )}

            <h1 className="mt-4 text-3xl leading-tight font-extrabold text-balance sm:text-5xl">
                {post.title}
            </h1>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                    href={`/profile/${post.author.id}`}
                    className="flex items-center gap-2 text-sm"
                >
                    <UserAvatar user={post.author} />
                    <span>
                        <span className="font-medium">
                            {post.author.displayName}
                        </span>
                        <span className="text-muted-foreground block text-xs">
                            {formatDate(post.publishedAt)}
                        </span>
                    </span>
                </Link>
                {isOwner && <OwnerActions post={post} />}
            </div>

            {post.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- covers come from any https host
                <img
                    src={post.photoUrl}
                    alt=""
                    className="mt-6 aspect-video w-full rounded-xl object-cover"
                />
            )}

            {/* Rendered as plain text on purpose: content is stored as sent, so rendering HTML would allow XSS. */}
            <div className="mt-8 text-base leading-7 break-words whitespace-pre-wrap sm:text-lg sm:leading-8">
                {post.content}
            </div>

            {post.status === "published" && (
                <>
                    <div className="mt-10 border-t pt-6">
                        <Actions post={post} loggedIn={!!me} />
                    </div>
                    <Comments post={post} me={me ?? null} />
                </>
            )}
        </article>
    );
}
