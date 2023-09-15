import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import BadWordsFilter from "bad-words";
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { sendEmail } from "~/utils/sendEmail";
import validateToken from "~/utils/validateToken";

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

const admin_email = process.env.ADMIN_EMAIL || "";

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
    getCommentData: publicProcedure
        .input(z.object({ commentId: z.string() }))
        .query(async ({ input }) => {
            const { commentId } = input;
            const comment = await prisma.comment.findUnique({
                where: {
                    id: commentId,
                },
                select: defaultCommentSelect,
            });
            if (!comment) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `No comment found with id ${commentId}`,
                });
            }
            return comment;
        }),
    createComment: protectedProcedure
        .input(z.object({ postSlug: z.string(), content: z.string().min(2, "Common', you can figure out something longer than 2 characters").max(500, "Keep it under 500 characters cowboy."), token: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { postSlug, content, token } = input;
            const isDev = process.env.NODE_ENV === "development";
            if (isDev) {
                console.log("Recaptcha validation skipped in development");
            } else {
                const recaptchaResponse = await validateToken(token);
                if (!recaptchaResponse.success) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Recaptcha validation failed",
                    });
                }
            }

            const isUserLoggedIn = ctx.session?.user;

            if (!isUserLoggedIn) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You must be logged in to comment",
                });
            }

            if (!input.content || typeof content !== "string") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Comment must have content",
                });
            }

            if (!input.postSlug || typeof postSlug !== "string") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Comment must have a post slug. Actually HTF did you get here?",
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
                    content: content.trim(),
                    postSlug: postSlug,
                    commenterId: isUserLoggedIn.id,
                },
                include: {
                    commenter: true,
                },
            });
            if (!comment) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Something went wrong creating your comment",
                });
            } else {
                if (!isDev) {
                    const res = await sendEmail({
                        to: admin_email,
                        subject: `New Comment on ${postSlug}`,
                        html: `<p>${comment.commenter.name || "Anonymous"} commented on ${postSlug}:</p><p>${comment.content}</p>`,
                        text: `${comment.commenter.name || "Anonymous"} commented on ${postSlug}:\n${comment.content}`,
                    })
                    console.log("sendEmail res", res);
                }

                return comment;
            }
        }),
    updateComment: protectedProcedure
        .input(z.object({ commentId: z.string(), content: z.string().min(2, "Common', you can figure out something longer than 2 characters").max(500, "Keep it under 500 characters cowboy.") }))
        .mutation(async ({ ctx, input }) => {
            const { commentId, content } = input;
            const filter = new BadWordsFilter();
            const cleanedContent = filter.clean(content.trim());
            const comment = await prisma.comment.findUnique({
                where: {
                    id: commentId,
                },
                select: defaultCommentSelect,
            });
            if (!comment) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `No comment found with id ${commentId}`,
                });
            }

            const isOwnComment = ctx.session?.user?.id === comment.commenter.id;
            if (!isOwnComment) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You are not authorized to update this comment!!!",
                });
            }
            const updatedComment = await prisma.comment.update({
                where: {
                    id: commentId,
                },
                data: {
                    content: cleanedContent,
                },
                select: defaultCommentSelect,
            });
            return updatedComment;
        }),
    deleteComment: protectedProcedure
        .input(z.object({ commentId: z.string(), }))
        .mutation(async ({ ctx, input }) => {
            const { commentId } = input;
            const comment = await prisma.comment.findUnique({
                where: {
                    id: commentId,
                },
                select: defaultCommentSelect,
            });
            if (!comment) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `No comment found with id ${commentId}`,
                });
            }

            const userIsAdmin = ctx.session?.user?.isAdmin;
            const loggedInUserId = ctx.session?.user?.id;
            const commentAuthorId = comment.commenter.id;
            const isOwnComment = loggedInUserId === commentAuthorId;
            if (userIsAdmin || isOwnComment) {
                await prisma.comment.delete({
                    where: {
                        id: commentId,
                    },
                });

                return { success: true };
            } else {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You are not authorized to delete this comment!!!",
                });
            }

        }),
});
