import { Label } from "@/components/ui/label";

type Props = {
    id: string;
    label: string;
    error?: string;
    children: React.ReactNode;
};

/** Label + control + inline error, the one form row shape used across the app. */
export default function FormField({ id, label, error, children }: Props) {
    return (
        <div className="grid gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            {children}
            {error && (
                <p id={`${id}-error`} className="text-destructive text-xs">
                    {error}
                </p>
            )}
        </div>
    );
}
