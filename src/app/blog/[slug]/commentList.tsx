import CommentCard from './commentCard';
import { api } from '~/trpc/server';

async function getCommentList(slug: string) {
    return await api.comments.getCommentsForPost.query({slug})
}

export default async function CommentList({ slug }: { slug: string }) {
    const allComments = await getCommentList(slug);

    return (
        <div className='mt-16'>
            <h2 id="comments-heading" className="sr-only">
                Comments
            </h2>
            {allComments?.length ? (
                allComments.map(comment => (
                        <CommentCard key={comment.id} comment={comment} />
                        ))
                        ) : (
                            <p className="text-center text-xl text-gray-500">
                    Be the first to leave your thoughts!
                </p>
            )}
            </div>
    );
}
