import { createReactQueryHooks } from '@trpc/react'
import { AppRouter } from '../server/router/app.router'

export const trpc = createReactQueryHooks<AppRouter>()
