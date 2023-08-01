import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
    createTRPCRouter,
    publicProcedure,

} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import validateToken from "~/utils/validateToken";

const defaultCommentSelect = Prisma.validator<Prisma.CommentSelect>()({
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

export const commentsRouter = createTRPCRouter({
    getCommentsForPost: publicProcedure
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
        .input(z.object({ postSlug: z.string(), content: z.string(), token: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const isUserLoggedIn = ctx.session?.user;
            if (!isUserLoggedIn) {
                // render a model for the user to log in
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You must be logged in to comment",
                });
            }
            // if content is not a string or is empty
            if (!input.content || typeof input.content !== "string") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Comment must have content",
                });
            }
            // if slug is not a string or is empty
            if (!input.postSlug || typeof input.postSlug !== "string") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Comment must have a post slug",
                });
            }


            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

            const recentComments = await prisma.comment.findMany({
                where: {
                    commenterId: isUserLoggedIn.id,
                    createdAt: {
                        gte: fiveMinutesAgo,
                    },
                },
            });

            if (recentComments.length >= 5) {
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message: "You're doing that too much. Try again in 5 minutes."
                });
            }

            const comment = await prisma.comment.create({
                data: {
                    content: input.content,
                    postSlug: input.postSlug,
                    commenterId: isUserLoggedIn.id,
                },
                include: {
                    commenter: true,
                },
            });
            return comment;
        }),
    deleteComment: publicProcedure
        .input(z.object({ commentId: z.string(), }))
        .mutation(async ({ ctx, input }) => {
            const userIsAdmin = ctx.session?.user?.isAdmin;
            if (!userIsAdmin) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You must be an admin to delete comments",
                });
            }

            const comment = await prisma.comment.findUnique({
                where: {
                    id: input.commentId,
                },
                select: defaultCommentSelect,
            });

            if (!comment) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `No comment found with id ${input.commentId}`,
                });
            }

            await prisma.comment.delete({
                where: {
                    id: input.commentId,
                },
            });

            return comment;
        }),
});
