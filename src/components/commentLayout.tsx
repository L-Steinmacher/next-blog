import { type Comment } from "@prisma/client"

export function CommentLayout({comments}: {comments: Comment[], slug: string}) {
  if (!comments) {
      return null
  }
    return (
        <div>
            {comments.map((comment: Comment) => (
                <div key={comment.id}>
                    <p>{comment.content}</p>

                </div>
            ))}
        </div>
    )
}