import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,

} from "~/server/api/trpc";
import { prisma } from "~/server/db";

const defaultCommentSelect = Prisma.validator<Prisma.CommentSelect>()({
    id: true,
    content: true,
    postSlug: true,
    commenter: {
        select: {
            id: true,
            name: true,
            image: true,
        },},
    createdAt: true,
    });

export const commentsRouter = createTRPCRouter({
    getCommentsForPost:publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
        const { slug } = input;
        const comments = await prisma.comment.findMany({
            where: {
                postSlug: slug,
            },
            select: defaultCommentSelect,
        });

        if (!comments) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `No comments found for post ${slug}`,
            });
        }
        return comments;
    }),
    createComment: publicProcedure
    .input(z.object({ commenterId: z.string(),slug: z.string(), content: z.string() }))
    .query(async ({input }) => {
        const comment = await prisma.comment.create({
            data: {
                content: input.content,
                postSlug: input.slug,
                commenterId: input.commenterId,
            },
        });
        return comment;
    }),
});
