
import Image from 'next/image';

import CommentEditModal from './commentEditModal';
import CommentDeleteButton from './commentDeleteButton';
import { type Comment } from '~/interfaces/comments';
import { api } from '~/utils/api'
import { formatRelativeTime } from '~/utils/miscUtils';


// Create the CommentCard component
export default function CommentCard({ comment }: { comment: Comment }) {
    const commenterImage = comment.commenter?.image ?? '/images/user.png';
    const createdAt = comment.createdAt.toISOString();
    const displayTime = formatRelativeTime(createdAt);

    const user = api.user.getUserSession.useQuery().data;
    const isOwner = user?.id === comment.commenter?.id;
    const isAdmin = user?.isAdmin;

    return (
        <div
            key={comment.id}
            className="mx-auto mb-4 w-full max-w-2xl rounded-lg bg-[#fffefe] p-6 shadow-lg"
            role="article"
        >
            <div className="mb-4 flex items-center justify-between ">
                <div className="flex items-center">
                    <Image
                        className="mr-3 h-8 w-8 rounded-full"
                        src={commenterImage}
                        alt={comment.commenter?.name ?? 'Commenter Image'}
                        width={32}
                        height={32}
                    />
                    <p className="font-bold">{comment.commenter?.name}</p>
                </div>
                {isOwner ? (

                  <CommentEditModal comment={comment} user={user} />
                  ): isAdmin ? (
                    <CommentDeleteButton commentId={comment.id} />
                ) : null }
            </div>
            <p className="text-gray-700">{comment.content}</p>
            <p className="mt-2 text-sm text-gray-500">Created: {displayTime}</p>
        </div>
    );
};
