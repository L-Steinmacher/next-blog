import Image from 'next/image';
import { type Comment } from '../interfaces/comments';
import { formatRelativeTime } from '~/utils/miscUtils';
import CommentEditModal from './commentEditModal';
import { useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface CommentCardProps {
    comment: Comment;
}

// Create the CommentCard component
const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
    const commenterImage = comment.commenter?.image || '/images/user.png';
    const createdAt = comment.createdAt.toISOString();
    const displayTime = formatRelativeTime(createdAt);

    const { data: sessionData } = useSession();
    const isOwner = sessionData?.user?.id === comment.commenter?.id;
    const isAdmin = sessionData?.user?.isAdmin;

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
                        alt={comment.commenter?.name || 'Commenter Image'}
                        width={32}
                        height={32}
                    />
                    <p className="font-bold">{comment.commenter?.name}</p>
                </div>
                {isOwner ? (
                  <CommentEditModal commentId={comment.id} />
                  ): isAdmin ? (
                    <p>deleteButton goes here</p>) : null }
            </div>
            <p className="text-gray-700">{comment.content}</p>
            <p className="mt-2 text-sm text-gray-500">Created: {displayTime}</p>
        </div>
    );
};

export default CommentCard;
