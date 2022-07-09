import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { RequestOtpInput } from '../schema/user.schema'
import { trpc } from '../utils/trpc'

const VerifyToken = ({ hash }: { hash: string }) => {
    const router = useRouter()
    const { data, isLoading } = trpc.useQuery([
        'users.verify-otp',
        {
            hash,
        },
    ])
    router.push(data?.redirect.includes('login') ? '/' : data?.redirect || '/')
    return isLoading ? <p>Verifying....</p> : <p>redirecting...</p>
}

const LoginForm = () => {
    const { handleSubmit, register } = useForm<RequestOtpInput>()
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const { mutate, error } = trpc.useMutation(['users.request-otp'], {
        onSuccess() {
            setSuccess(true)
        },
    })

    const onSubmit = (values: RequestOtpInput) => {
        mutate({ ...values, redirect: router.asPath })
    }

    const hash = router.asPath.split('#token=')[1]

    if (hash) {
        return <VerifyToken {...{ hash }} />
    }
    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                {error && error.message}

                {success && <p>Check your email</p>}

                <h1>Login</h1>
                <input
                    type="email"
                    placeholder="naqib@gmail.com"
                    {...register('email')}
                />
                <br />
                <button type="submit">Login</button>
            </form>
            <Link href="/register">Register</Link>
        </>
    )
}

export default LoginForm
