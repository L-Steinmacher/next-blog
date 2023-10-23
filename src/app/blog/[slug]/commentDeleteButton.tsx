'use client';
import { useRouter } from 'next/navigation';
import { api } from '~/utils/api';

export default function CommentDeleteButton({
    commentId,
}: {
    commentId: string;
}) {
    const router = useRouter();
    const deleteComment = api.comments.deleteComment.useMutation({
        onSuccess:  () => {
        router.refresh();
        },
        onError: error => {
            console.log('error deleting comment', error);
        }
    });

    return (
        <>
            <button
                className="items-center  rounded-md border border-transparent bg-none px-4 py-2 text-base font-medium text-white shadow-sm shadow-slate-400 hover:bg-red-200 focus:outline-none"
                onClick={e => {
                    e.preventDefault();
                    deleteComment.mutate({ commentId });
                }}
            >
                ❌
            </button>
        </>
    );
}
