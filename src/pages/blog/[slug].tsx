import { getAllPosts, getPostBySlug } from "lib/api"
import {  type Post, type PostOptions } from "../interfaces/post"
import markdownToHtml from "lib/markdownToHtml"

type Props = {
    post: PostOptions
}

export default function Post ({ post } : Props) {
    return (
        <div>
            <details>
                <summary>Post</summary>
                <pre>{JSON.stringify(post, null, 2)}</pre>
            </details>
            <h1>{post.title}</h1>
            <p>{post.date}</p>
            {
                post.content ? (
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : null
            }
        </div>
    )
}

type Params = {
    params: {
        slug: string
    }
}



export const getStaticProps = async ({params}: Params) => {
    const postData: PostOptions = getPostBySlug(params.slug, [
        'title',
        'date',
        'slug',
        'author',
        'content',
        'coverImage',
    ])

    const content = await markdownToHtml(postData.content || '')

    return {
        props: {
            post: {
                title: postData.title,
                date: postData.date,
                slug: postData.slug,
                author: postData.author,
                coverImage: postData.coverImage,
                content,
            },
        },
    }
}

export const getStaticPaths = () => {
    const posts =  getAllPosts(['slug'])

    return {
        paths: posts.map((post) => {
            return {
                params: {
                    slug: post.slug,
                },
            }
        }),
        fallback: false,
    }
}