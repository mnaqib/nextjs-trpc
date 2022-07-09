import { NextApiRequest, NextApiResponse } from 'next'
import { verifyJwt } from '../utils/jwt'
import { prisma } from '../utils/prisma'

interface CtxUser {
    id: string
    email: string
    name: string
    iat: string
    ex: number
}

function getUserfromRequest(req: NextApiRequest) {
    const token = req.cookies.token

    if (token) {
        try {
            const verified = verifyJwt<CtxUser>(token)
            return verified
        } catch (e) {
            return null
        }
    }
}

export function createContext({
    req,
    res,
}: {
    req: NextApiRequest
    res: NextApiResponse
}) {
    const user = getUserfromRequest(req)
    return { req, res, prisma, user }
}

export type Context = ReturnType<typeof createContext>
