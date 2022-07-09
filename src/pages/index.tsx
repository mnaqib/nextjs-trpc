import type { NextPage } from 'next'
import Link from 'next/link'
import LoginForm from '../components/Login'
import { useUserContext } from '../context/user.context'

const Home: NextPage = () => {
    const user = useUserContext()

    if (!user) {
        return <LoginForm />
    }
    return (
        <div className="text-xl font-bold">
            <Link href="/posts/new">Create Post</Link>
        </div>
    )
}

export default Home
