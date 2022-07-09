import { useForm } from 'react-hook-form'
import { CreatePostInput } from '../../schema/post.schema'
import { trpc } from '../../utils/trpc'

function CreatePostPage() {
    const { handleSubmit, register } = useForm<CreatePostInput>()

    const { mutate, error } = trpc.useMutation(['posts.create-post'])

    function onSubmit(values: CreatePostInput) {
        mutate(values)
    }

    return <form onSubmit={handleSubmit(onSubmit)}>
        {error && error.message}
        <input />
    </form>
}

export default CreatePostPage
