import { prisma } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { LangCall } from "~/utils/langCall";
import { getPostBySlug } from "lib/blogApi";
import { type NonNullablePostOptions } from "~/interfaces/post";
import markdownToHtml from "lib/markdownToHtml";
import BadWordsFilter from "bad-words";

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
export const translateCases = ["none", "spanish", "german", "bruh", "intellegizer"] as const

export const translationRouter = createTRPCRouter({
    translateComment: publicProcedure
        .input(z.object({ commentId: z.string(), caseType: z.enum(translateCases) }))
        .mutation(async ({ ctx, input }) => {
            const { commentId, caseType } = input;
            const filter = new BadWordsFilter();

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

            const cleanedComment = filter.clean(comment.content.trim());

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
            }

            const curLangTokens = await prisma.user.findUnique({
                where: {
                    id: loggedInUserId,
                },
                select: {
                    langToken: true,
                },
            });
            if (!curLangTokens )  {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "No tokens found!",
                });
            }
            if (curLangTokens.langToken <= 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You don't have enough tokens",
                });
            }

            curLangTokens.langToken -= 1;

            let newCommentContent: string;
            if (caseType === "intellegizer") {
                const postData: NonNullablePostOptions = await getPostBySlug(comment.postSlug, ["content"]);
                if (!postData) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "No post found!",
                    });
                }
                const contentString = await  markdownToHtml(postData.content || "");
                newCommentContent = await LangCall(cleanedComment, caseType, contentString);
            } else {
                newCommentContent = await LangCall(cleanedComment, caseType);
            }

            const updatedComment = await prisma.comment.update({
                where: {
                    id: commentId,
                },
                data: {
                    content: newCommentContent,
                },
            });
            // update the tokens of the user
            await prisma.user.update({
                where: {
                    id: loggedInUserId,
                },
                data: {
                        langToken: {
                        decrement: 1,
                    },
                },
            });

            return { success: true, comment: updatedComment };
        }
    ),
})