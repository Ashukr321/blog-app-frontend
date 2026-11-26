import type { Metadata } from "next";
import PostForm from "@/components/blog/PostForm";

export const metadata: Metadata = {
    title: "Write a post",
    robots: { index: false },
};

export default function WritePage() {
    return (
        <>
            <h1 className="sr-only">Write a post</h1>
            <PostForm />
        </>
    );
}
