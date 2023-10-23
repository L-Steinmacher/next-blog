import { Prisma } from "@prisma/client";
import BadWordsFilter from "bad-words";
import { getPostBySlug } from "lib/blogApi";
import { z } from "zod";
import { type NonNullablePostOptions } from "~/interfaces/post";
import { translateCases } from "~/interfaces/translate";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";
import { db as prisma } from "~/server/db";
import { LangCall } from "~/utils/langCall";
import { trpcInvariant } from "~/utils/miscUtils";
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

            trpcInvariant(comments, "NOT_FOUND", `No comments found for post ${slug}`);

            comments.sort((a, b) => {
                if (a.createdAt > b.createdAt) {
                    return 1;
                }
                if (a.createdAt < b.createdAt) {
                    return -1;
                }
                return 0;
            });
            return comments;
        }),
    getCommentData: publicProcedure
        .input(z.object({ commentId: z.string() }))
        .query(async ({ input }) => {
            // TODO: make this a protected procedure
            // as only a user with a session will be getting a single comment for the edit comment flow.
            const { commentId } = input;
            const comment = await prisma.comment.findUnique({
                where: {
                    id: commentId,
                },
                select: defaultCommentSelect,
            });
            trpcInvariant(comment, "NOT_FOUND", `No comment found with id ${commentId}`);
            return comment;
        }),
    createComment: protectedProcedure
        .input(z.object({ postSlug: z.string(), content: z.string().min(2, "Common', you can figure out something longer than 2 characters").max(500, "Keep it under 500 characters cowboy."), token: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { postSlug, content, token } = input;
            const { session } = ctx;
            const isDev = process.env.NODE_ENV === "development";
            if (isDev) {
                console.log("Recaptcha validation skipped in development");
            } else {
                const recaptchaResponse = await validateToken(token);
                trpcInvariant(recaptchaResponse, "BAD_REQUEST", "Recaptcha validation failed");
            }

            trpcInvariant(session?.user, "UNAUTHORIZED", "You must be logged in to comment");
            trpcInvariant(content, "BAD_REQUEST", "Comment must have content");
            trpcInvariant(typeof content === "string", "BAD_REQUEST", "Comment must have content");
            trpcInvariant(postSlug, "BAD_REQUEST", "Comment must have a post slug")

            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const recentComments = await prisma.comment.findMany({
                where: {
                    commenterId: ctx.session?.user.id,
                    createdAt: {
                        gte: fiveMinutesAgo,
                    },
                },
            });
            const rateLimited = recentComments.length >= 5;
            trpcInvariant(!rateLimited, "TOO_MANY_REQUESTS", "You're doing that too much. Try again in 5 minutes.")

            const filter = new BadWordsFilter();
            const cleanedContent = filter.clean(content.trim());

            const comment = await prisma.comment.create({
                data: {
                    content: cleanedContent,
                    postSlug: postSlug,
                    commenterId: ctx.session?.user.id,
                },
                include: {
                    commenter: true,
                },
            });
            trpcInvariant(comment, "INTERNAL_SERVER_ERROR", "Something went wrong creating your comment");
            const email = {
                to: admin_email,
                subject: `New Comment on ${postSlug}`,
                html: `<p>${comment.commenter.name || "Anonymous"} commented on ${postSlug}:</p><p>${comment.content}</p>`,
                text: `${comment.commenter.name || "Anonymous"} commented on ${postSlug}:\n${comment.content}`,
            };
            if (!isDev) {
                const res = await sendEmail(email)
                console.log("sendEmail res", res);
            }
            console.log("email", email);
            return comment;
        }),
    updateComment: protectedProcedure
        .input(z.object({
            commentId: z.string(),
            caseType: z.enum(translateCases),
            content: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { commentId, caseType, content } = input;

            const filter = new BadWordsFilter();

            const comment = await prisma.comment.findUnique({
                where: {
                    id: commentId,
                },
                select: {
                    commenter: {
                        select: {
                            id: true,
                        },
                    },
                    postSlug: true,
                }
            });
            trpcInvariant(comment, "NOT_FOUND", "No comment found!");

            const loggedInUserId = ctx.session?.user.id;
            const originalCommenterId = comment?.commenter.id;
            const allowedToEdit = loggedInUserId === originalCommenterId;

            trpcInvariant(allowedToEdit, "BAD_REQUEST", "Issue with the comment update!");

            const cleanedComment = filter.clean(content);

            if (caseType === "none") {
                const updatedComment = await prisma.comment.update({
                    where: {
                        id: commentId,
                    },
                    data: {
                        content: cleanedComment,
                    },
                });
                return { success: true, comment: updatedComment };
            } else {
                const curLangTokens = await prisma.user.findUnique({
                    where: {
                        id: loggedInUserId,
                    },
                    select: {
                        langToken: true,
                    },
                });
                const hasTokens = curLangTokens && curLangTokens?.langToken;
                trpcInvariant(hasTokens, "BAD_REQUEST", "Not enough tokens!")

                let newCommentContent: string;
                if (caseType === "intellegizer") {
                    const postData: NonNullablePostOptions = await getPostBySlug(comment.postSlug, ["content"]);
                    trpcInvariant(postData, "BAD_REQUEST", "No post found!");

                    newCommentContent = await LangCall(cleanedComment, caseType, postData.content);
                } else {
                    newCommentContent = await LangCall(cleanedComment, caseType);
                }

                const updatedComment = await prisma.comment.update({
                    where: {
                        id: commentId,
                    },
                    data: {
                        content: newCommentContent,
                        commenter: {
                            update: {
                                langToken: {
                                    decrement: 1,
                                },
                            },
                        },
                    },
                });

                return { success: true, comment: updatedComment };
            }
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
            trpcInvariant(comment, "NOT_FOUND", `No comment found with id ${commentId}`);

            const userIsAdmin = ctx.session?.user?.isAdmin;
            const loggedInUserId = ctx.session?.user?.id;
            const commentAuthorId = comment.commenter.id;
            const isOwnComment = loggedInUserId === commentAuthorId;
            const allowedToDelete = userIsAdmin || isOwnComment;
            // Todo: log user out if they get this far and are not the author
            trpcInvariant(allowedToDelete, "UNAUTHORIZED", "You are not authorized to delete this comment!!!");

            await prisma.comment.delete({
                where: {
                    id: commentId,
                },
            });

            return { success: true };

        }),
});
