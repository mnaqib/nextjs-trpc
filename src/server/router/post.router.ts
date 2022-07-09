import { TRPCError } from '@trpc/server'
import { createPostSchema, getSinglePostSchema } from '../../schema/post.schema'
import { createRouter } from '../createRouter'

export const postRouter = createRouter()
    .mutation('create-post', {
        input: createPostSchema,
        async resolve({ ctx, input }) {
            if (!ctx.user) {
                new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'cannot create a post while logged out',
                })
            }

            const post = await ctx.prisma.post.create({
                data: {
                    ...input,
                    user: {
                        connect: {
                            id: ctx.user?.id,
                        },
                    },
                },
            })

            return post
        },
    })
    .query('posts', {
        async resolve({ ctx }) {
            const posts = await ctx.prisma.post.findMany()
            return posts
        },
    })
    .query('single-post', {
        input: getSinglePostSchema,
        async resolve({ ctx, input }) {
            const post = ctx.prisma.post.findUnique({
                where: {
                    id: input.postId,
                },
            })

            return post
        },
    })
