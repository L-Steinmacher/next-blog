import { prisma } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { LangCall } from "~/utils/langCall";

export const defaultCommentSelect = Prisma.validator<Prisma.CommentSelect>()({
    id: true,
    content: true,
    postSlug: true,
    commenter: {
        select: {
            id: true,
            name: true,
            image: true,
        },
    },
    createdAt: true,
});

const translationRouter = createTRPCRouter({
    translateComment: publicProcedure
        .input(z.object({ commentId: z.string(), caseType: z.string(), postContent: z.string().optional() }))
        .mutation(async ({ ctx, input }) => {
            const { commentId, caseType, postContent } = input;

            const comment = await prisma.comment.findUnique({
                where: {
                    id: commentId,
                },
                select: defaultCommentSelect,
            });

            if (!comment) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `No comment found!`,
                });
            }
            const loggedInUserId = ctx.session?.user.id;
            const originalCommenterId = comment?.commenter.id;

            if (loggedInUserId !== originalCommenterId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You are not the original commenter",
                });
            }

            const newCommentContent = LangCall(comment.content, caseType, postContent);

            const updatedComment = await prisma.comment.update({
                where: {
                    id: commentId,
                },
                data: {
                    content: newCommentContent,
                },
            });

            return { success: true, comment: updatedComment };
        }
    ),
})