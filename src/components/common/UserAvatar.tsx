import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Author } from "@/types/post";
import { initials } from "@/utils/format";

type Props = {
    user: Pick<Author, "displayName" | "avatarUrl">;
    size?: "sm" | "default" | "lg";
    className?: string;
};

export default function UserAvatar({ user, size, className }: Props) {
    return (
        <Avatar size={size} className={className}>
            {user.avatarUrl && (
                <AvatarImage src={user.avatarUrl} alt={user.displayName} />
            )}
            <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
        </Avatar>
    );
}
