import { prisma } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { LangCall } from "~/utils/langCall";
import { getPostBySlug } from "lib/blogApi";
import { type NonNullablePostOptions } from "~/interfaces/post";
import BadWordsFilter from "bad-words";
import { trpcInvariant } from "~/utils/miscUtils";

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
            trpcInvariant(comment, "NOT_FOUND", "No comment found!");

            const loggedInUserId = ctx.session?.user.id;
            const originalCommenterId = comment?.commenter.id;

            trpcInvariant(loggedInUserId !== originalCommenterId, "BAD_REQUEST", "You are not the original commenter");

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
            trpcInvariant(curLangTokens, "BAD_REQUEST", "No tokens found!")
            trpcInvariant(curLangTokens.langToken > 0, "BAD_REQUEST", "You don't have enough tokens");

            curLangTokens.langToken -= 1;

            let newCommentContent: string;
            if (caseType === "intellegizer") {
                const postData: NonNullablePostOptions = await getPostBySlug(comment.postSlug, ["content"]);
                trpcInvariant(postData, "BAD_REQUEST", "No post found!");

                console.log(postData.content);
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