import Link from "next/link";
import { ArrowRight, BookOpen, Eye, MessageCircle, ThumbsUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import UserAvatar from "@/components/common/UserAvatar";
import type { Post } from "@/types/post";
import { formatDate } from "@/utils/format";

export default function PostCard({ post }: { post: Post }) {
    return (
        <Card className="group hover:shadow-primary/10 hover:ring-primary/30 relative h-full gap-0 overflow-hidden rounded-2xl p-0 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <span
                aria-hidden
                className="text-foreground pointer-events-none absolute top-3 right-3 z-10 flex translate-y-1 items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold opacity-0 shadow-md backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"
            >
                <BookOpen className="size-3.5" /> Read story
            </span>
            {post.photoUrl ? (
                <div className="overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element -- covers come from any https host */}
                    <img
                        src={post.photoUrl}
                        alt=""
                        className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                </div>
            ) : (
                <div
                    aria-hidden
                    className="font-heading from-primary/15 text-primary/60 flex aspect-video w-full items-center justify-center bg-gradient-to-br via-fuchsia-500/10 to-sky-400/15 text-6xl font-extrabold"
                >
                    {post.title.charAt(0).toUpperCase()}
                </div>
            )}
            <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="group-hover:text-primary line-clamp-2 text-lg leading-snug transition-colors">
                    {/* the ::after stretches the link over the whole card */}
                    <Link
                        href={`/blog/${post.slug}`}
                        className="after:absolute after:inset-0"
                    >
                        {post.title}
                    </Link>
                </h3>
                {post.excerpt && (
                    <p className="text-muted-foreground line-clamp-3 text-sm">
                        {post.excerpt}
                    </p>
                )}
                {/* Always-visible cue so touch users know the card opens the post */}
                <span
                    aria-hidden
                    className="text-primary flex items-center gap-1 text-sm font-medium"
                >
                    Read more
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <div className="text-muted-foreground mt-auto flex items-center justify-between gap-2 pt-2 text-xs">
                    <span className="flex min-w-0 items-center gap-2">
                        <UserAvatar user={post.author} size="sm" />
                        <span className="truncate">
                            {post.author.displayName}
                        </span>
                        <span aria-hidden>·</span>
                        <time
                            dateTime={post.publishedAt ?? undefined}
                            className="shrink-0"
                        >
                            {formatDate(post.publishedAt)}
                        </time>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                        <span
                            className="flex items-center gap-0.5"
                            title="Likes"
                        >
                            <ThumbsUp className="size-3" />
                            {post.counts.likes}
                        </span>
                        <span
                            className="flex items-center gap-0.5"
                            title="Comments"
                        >
                            <MessageCircle className="size-3" />
                            {post.counts.comments}
                        </span>
                        <span
                            className="hidden items-center gap-0.5 sm:flex"
                            title="Views"
                        >
                            <Eye className="size-3" />
                            {post.counts.views}
                        </span>
                    </span>
                </div>
            </div>
        </Card>
    );
}
