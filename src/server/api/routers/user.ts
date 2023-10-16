import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db as prisma } from "~/server/db";
import { z } from "zod";

export const userRouter = createTRPCRouter({
    isUserLoggedIn: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
        const { userId } = input;
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `No user found for id ${userId}`,
            });
        }
        return user;
    }),
});