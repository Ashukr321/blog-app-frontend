export default function AuthHeader({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="mb-8 space-y-2">
            <h1 className="text-3xl">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
        </div>
    );
}
