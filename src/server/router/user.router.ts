import {
    createUserSchema,
    requestOtpSchema,
    verifyOtpSchema,
} from '../../schema/user.schema'
import { createRouter } from '../createRouter'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { TRPCError } from '@trpc/server'
import { sendLoginEmail } from '../../utils/mailer'
import { baseUrl } from '../../constants'
import { decode, encode } from '../../utils/base64'
import { signJwt } from '../../utils/jwt'
import { serialize } from 'cookie'

export const userRouter = createRouter()
    .mutation('register-user', {
        input: createUserSchema,
        resolve: async ({ ctx, input }) => {
            const { name, email } = input
            try {
                const user = await ctx.prisma.user.create({
                    data: {
                        name,
                        email,
                    },
                })

                return user
            } catch (e) {
                if (e instanceof PrismaClientKnownRequestError) {
                    if (e.code === 'P2002') {
                        throw new TRPCError({
                            code: 'CONFLICT',
                            message: 'User already exists',
                        })
                    }
                }

                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Something went wrong',
                })
            }
        },
    })
    .mutation('request-otp', {
        input: requestOtpSchema,
        resolve: async ({ input, ctx }) => {
            const { email, redirect } = input

            const user = await ctx.prisma.user.findUnique({
                where: {
                    email,
                },
            })

            if (!user) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'User not found',
                })
            }

            const token = await ctx.prisma.loginToken.create({
                data: {
                    redirect,
                    user: {
                        connect: {
                            id: user.id,
                        },
                    },
                },
            })

            console.log({ user, token })

            await sendLoginEmail({
                email,
                token: encode(`${token.id}:${email}`),
                url: baseUrl,
            })

            return true
        },
    })
    .query('verify-otp', {
        input: verifyOtpSchema,
        resolve: async ({ input, ctx }) => {
            const decoded = decode(input.hash).split(':')
            const [id, email] = decoded

            const token = await ctx.prisma.loginToken.findFirst({
                where: {
                    id,
                    user: {
                        email,
                    },
                },
                include: {
                    user: true,
                },
            })

            if (!token) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Invalid token',
                })
            }

            const jwt = signJwt({
                email: token.user.email,
                id: token.user.id,
            })

            ctx.res.setHeader(
                'Set-Cookie',
                serialize('token', jwt, { path: '/' })
            )

            return {
                redirect: token.redirect,
            }
        },
    })
    .query('me', {
        resolve: ({ ctx }) => {
            return ctx.user
        },
    })
