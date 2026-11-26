"use client";

import Link from "next/link";
import Logo from "@/components/common/Logo";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    LogOut,
    PenSquare,
    Settings,
    User,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "@/components/common/UserAvatar";
import { useLogout, useMe } from "@/react-query";
import { siteConfig } from "@/utils/site";

export default function Header() {
    const { data: me, isPending } = useMe();
    const logout = useLogout();
    const router = useRouter();

    return (
        <header className="bg-background/70 sticky top-0 z-40 border-b backdrop-blur-xl">
            <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
                <Link href="/" aria-label={`${siteConfig.name} home`} className="truncate">
                    <Logo />
                </Link>

                {isPending ? (
                    <Skeleton className="size-8 rounded-full" />
                ) : me ? (
                    <div className="flex items-center gap-2">
                        <Link
                            href="/write"
                            className={buttonVariants({
                                className: "rounded-full px-4",
                            })}
                        >
                            <PenSquare />{" "}
                            <span className="hidden sm:inline">Write</span>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full"
                                    />
                                }
                                aria-label="Account menu"
                            >
                                <UserAvatar user={me} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="truncate">
                                        {me.displayName}
                                    </DropdownMenuLabel>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => router.push("/dashboard")}
                                >
                                    <LayoutDashboard /> Dashboard
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        router.push(`/profile/${me.userId}`)
                                    }
                                >
                                    <User /> Public profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => router.push("/settings")}
                                >
                                    <Settings /> Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => {
                                        logout();
                                        router.push("/");
                                    }}
                                >
                                    <LogOut /> Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ) : (
                    <div className="flex items-center gap-1">
                        <Link
                            href="/login"
                            className={buttonVariants({
                                variant: "ghost",
                                size: "sm",
                            })}
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/register"
                            className={buttonVariants({
                                className: "rounded-full px-4",
                            })}
                        >
                            Get started
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    );
}
