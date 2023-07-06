import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.product.findMany();
  }),
  infiniteProducts: publicProcedure
  .input(z.object({
      limit:z.number().min(1).max(100).nullish(), 
      cursor:z.string().nullish()
    }))
  .query(async ({ input, ctx }) => {
    const limit = input.limit ? input.limit : 10 
    const cursor = input.cursor 
    const products = await ctx.prisma.product.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        id: 'asc',
      },
    })

    let nextCursor: typeof cursor | undefined = undefined;
    if (products.length > limit) {
      const nextProduct = products.pop();
      nextCursor =  nextProduct!.id ;
    }

    return { products, nextCursor };
  })
});
