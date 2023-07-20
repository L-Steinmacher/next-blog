import { type Comment } from "@prisma/client"
import { type GetServerSideProps, type InferGetServerSidePropsType } from "next"
import { api } from "~/utils/api"


export function CommentLayout({comments, slug}: {comments: Comment[], slug: string}) {
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