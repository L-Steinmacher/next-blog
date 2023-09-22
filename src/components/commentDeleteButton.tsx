import { api } from '~/utils/api';

export default function CommentDeleteButton({
    commentId,
}: {
    commentId: string;
}) {
    const utils = api.useContext();
    const deleteComment = api.comments.deleteComment.useMutation({
        onSuccess: async () => {
            await utils.comments.invalidate();
        },
        onError: error => {
            console.log('error deleting comment', error);
        }
    });

    function handleDeleteComment(commentId: string) {
        return deleteComment.mutate(
            { commentId },
            {
                onSettled: () => {
                    console.log('Comment deleted');
                },
            },
        );
    }
    return (
        <>
            <button
                className="items-center  rounded-md border border-transparent bg-none px-4 py-2 text-base font-medium text-white shadow-sm shadow-slate-400 hover:bg-red-200 focus:outline-none"
                onClick={e => {
                    e.preventDefault();
                    handleDeleteComment(commentId);
                }}
            >
                ❌
            </button>
        </>
    );
}
