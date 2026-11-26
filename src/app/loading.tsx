import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-12 sm:px-6">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-64 w-full rounded-xl" />
        </div>
    );
}
