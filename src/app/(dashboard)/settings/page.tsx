"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FormField from "@/components/common/FormField";
import UserAvatar from "@/components/common/UserAvatar";
import ImageUpload from "@/components/common/ImageUpload";
import { useMe, useUpdateProfile } from "@/react-query";
import type { Profile } from "@/types/post";
import { errorMessage } from "@/utils/apiClient";
import { profileSchema, type ProfileInput } from "@/validations";

function ProfileForm({ me }: { me: Profile }) {
    const update = useUpdateProfile();
    const { register, handleSubmit, formState, control, reset, setValue } =
        useForm<ProfileInput>({
            resolver: zodResolver(profileSchema),
            defaultValues: {
                displayName: me.displayName,
                avatarUrl: me.avatarUrl ?? "",
                bio: me.bio ?? "",
            },
        });
    const { errors, isDirty } = formState;
    const [displayName, avatarUrl] = useWatch({
        control,
        name: ["displayName", "avatarUrl"],
    });

    return (
        <form
            noValidate
            className="grid gap-5"
            onSubmit={handleSubmit((v) =>
                update.mutate(
                    {
                        displayName: v.displayName,
                        avatarUrl: v.avatarUrl || null,
                        bio: v.bio || null,
                    },
                    {
                        onSuccess: () => {
                            reset(v);
                            toast.success("Profile updated");
                        },
                        onError: (e) => toast.error(errorMessage(e)),
                    },
                ),
            )}
        >
            <div className="space-y-2">
                <ImageUpload
                    variant="avatar"
                    label="Upload photo"
                    value={avatarUrl}
                    onChange={(url) =>
                        setValue("avatarUrl", url, {
                            shouldDirty: true,
                            shouldValidate: true,
                        })
                    }
                    preview={
                        <UserAvatar
                            user={{
                                displayName: displayName || me.displayName,
                                avatarUrl: avatarUrl || null,
                            }}
                            size="lg"
                        />
                    }
                />
                <p className="text-muted-foreground text-sm">{me.email}</p>
                {errors.avatarUrl && (
                    <p className="text-destructive text-xs">
                        {errors.avatarUrl.message}
                    </p>
                )}
            </div>
            <FormField
                id="displayName"
                label="Display name"
                error={errors.displayName?.message}
            >
                <Input
                    id="displayName"
                    {...register("displayName")}
                    aria-invalid={!!errors.displayName}
                />
            </FormField>
            <FormField
                id="bio"
                label="Bio (optional)"
                error={errors.bio?.message}
            >
                <Textarea
                    id="bio"
                    rows={3}
                    {...register("bio")}
                    aria-invalid={!!errors.bio}
                />
            </FormField>
            <Button
                type="submit"
                size="lg"
                className="sm:justify-self-end"
                disabled={!isDirty || update.isPending}
            >
                {update.isPending ? "Saving…" : "Save changes"}
            </Button>
        </form>
    );
}

export default function SettingsPage() {
    const { data: me } = useMe();
    if (!me) return null; // layout guards this
    return (
        <Card className="mx-auto max-w-xl">
            <CardHeader>
                <CardTitle className="text-xl">Profile settings</CardTitle>
                <CardDescription>
                    This is how other readers see you.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ProfileForm me={me} />
            </CardContent>
        </Card>
    );
}
