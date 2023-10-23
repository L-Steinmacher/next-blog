
import { createTRPCRouter, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
    getUserSession: publicProcedure
    .query(({ctx}) => {
        const { session } = ctx

        if (!session) {
            return null;
        }

        return session.user;
    }),
});