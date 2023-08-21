import Image from "next/image";
import { type Comment } from "../interfaces/comments";
import { formatRelativeTime } from "~/utils/miscUtils";

  interface CommentCardProps {
    comment: Comment;
  }

  // Create the CommentCard component
  const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
    const commenterImage = comment.commenter?.image || "/images/user.png";
    const createdAt = comment.createdAt.toISOString()
    const displayTime = formatRelativeTime(createdAt)

    return (
      <div
        key={comment.id}
        className="mx-auto mb-4 max-w-2xl rounded-lg w-full bg-[#fffefe] p-6 shadow-lg"
        role="article"
      >
        <div className="flex items-center mb-4">
            <Image
              className="w-8 h-8 mr-3 rounded-full"
              src={commenterImage}
              alt={comment.commenter?.name || 'Commenter Image'}
              width={32}
              height={32}
            />
          <p className="font-bold">{comment.commenter?.name}</p>
        </div>
        <p className="text-gray-700">{comment.content}</p>
        <p className="mt-2 text-sm text-gray-500">
          Created: {displayTime}
        </p>
      </div>
    );
  };

  export default CommentCard;
