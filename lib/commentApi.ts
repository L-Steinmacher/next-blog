import { prisma } from "~/server/db";

export async function createComment(
    content: string,
    postSlug: string,
    commenterId: string
): Promise<Comment> {
    const commenter = await prisma.user.findUnique({
        where: {
            id: commenterId,
        },
    });

    if (!commenter) {
        throw new Error(`No user with id ${commenterId} found`);
    }

    const comment = await prisma.comment.create({
        data: {
            content,
            postSlug,
            commenter: {
                connect: {
                    id: commenterId,
                },
            },
        },
    });

    return comment;
}