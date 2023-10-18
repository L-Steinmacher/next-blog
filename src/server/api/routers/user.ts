
import { createTRPCRouter, publicProcedure } from "../trpc";

import { getServerAuthSession } from "~/server/auth";

export const userRouter = createTRPCRouter({
    getUserSession: publicProcedure
    .query(async () => {
        const user = await getServerAuthSession()
        return user;
    }),
});