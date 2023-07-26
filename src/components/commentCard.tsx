import Image from "next/image";
import { type Comment } from "../interfaces/comments";

  interface CommentCardProps {
    comment: Comment;
  }

  // Create the CommentCard component
  const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
    return (
      <div
        key={comment.id}
        className="mx-auto mb-4 max-w-2xl rounded-lg bg-[#fffefe] p-6 shadow-lg"
        role="article"
      >
        <div className="flex items-center mb-4">
          {comment.commenter?.image ? (
            <Image
              className="w-8 h-8 mr-3 rounded-full"
              src={comment.commenter?.image}
              alt={comment.commenter.name || 'Commenter Image'}
              width={32}
              height={32}
            />
          ) : (
            <Image
              className="w-8 h-8 mr-3 rounded-full"
              src="/images/user.png"
              alt="User Image"
              width={32}
              height={32}
            />
          )}
          <p className="font-bold">{comment.commenter?.name}</p>
        </div>
        <p className="text-gray-700">{comment.content}</p>
        <p className="mt-2 text-sm text-gray-500">
          {comment.createdAt.toISOString()}
        </p>
      </div>
    );
  };

  export default CommentCard;
