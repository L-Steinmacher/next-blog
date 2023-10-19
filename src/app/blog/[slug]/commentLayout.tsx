
import { api } from "~/trpc/server";
import CommentForm from "./commentForm";
import { type Comment } from "~/interfaces/comments";

async function getCommentsForPost(slug: string) {
    const comments = await api.comments.getCommentsForPost.query({slug}) as Comment[];
    return comments;
}

export async function CommentLayout({ slug }: { slug: string }) {
    const allComments = await getCommentsForPost(slug)
    return (
        <div>
            commentLayout
            <section aria-labelledby="comments-heading" className="pt-16">
                <CommentForm  slug={slug} allComments={allComments} />
            </section>
        </div>
    );
}
