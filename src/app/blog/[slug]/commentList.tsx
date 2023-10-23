import { type CommentSelect } from '~/interfaces/comments';
import CommentCard from './commentCard';

export default function CommentList({
    allComments,
}: {
    allComments: CommentSelect[] | undefined;
}) {

    return (
        <div className="mt-16">
            <h2 id="comments-heading" className="sr-only">
                Comments
            </h2>
            {allComments ? (
                allComments.map(comment => (
                        comment ? (
                    <CommentCard key={comment?.id} comment={comment} />
                    ) : null
                    )
            )) : (
                <p className="text-center text-xl text-gray-500">
                    Be the first to leave your thoughts!
                </p>
            )}
        </div>
    );
}
