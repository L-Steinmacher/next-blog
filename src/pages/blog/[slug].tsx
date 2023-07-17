import Link from "next/link"
import {  type Post, type PostOptions } from "../interfaces/post"
import { getAllPosts, getPostBySlug } from "lib/blogApi"
import markdownToHtml from "lib/markdownToHtml"
import PostBody from "~/componenets/postBody"
import CommentForm from "~/componenets/commentForm"
import readingTime, { type ReadTimeResults } from "reading-time"

type Props = {
    post: PostOptions
    stats: ReadTimeResults
}

export default function Post ({ post,stats } : Props) {
    return (
        <div>
            <details>
                <summary>Post</summary>
                <pre>{JSON.stringify(post, null, 2)}</pre>
            </details>
            {
                post.content ? (
                    <div className="container px-5 mx-auto max-w-2xl min-h-screen ">
                        <h1 className="text-3xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight md:leading-none mb-12 text-center md:text-left">{post.title}</h1>
                         <p>{post.date}</p> <span>{stats.text}</span>
                         <p>Written by: {post.author?.name}</p>
                        <PostBody content={post.content} />
                        <Link href="/blog">Back to blogs →</Link>
                    </div>
                ) : null
            }
            <CommentForm />
        </div>
    )
}

type Params = {
    params: {
        slug: string
    }
}

export const getStaticProps = async ({params}: Params) => {
    const postData: PostOptions | undefined = await getPostBySlug(params.slug, [
        'title',
        'date',
        'slug',
        'author',
        'content',
        'coverImage',
    ])

    if (!postData) {
        return {
            notFound: true,
        }
    }

    const content = await markdownToHtml(postData.content || '')
    const stats = readingTime(postData.content || '')

    return {
        props: {
            post: {
                title: postData.title,
                date: postData.date,
                slug: postData.slug,
                author: postData.author,
                content,
            },
            stats,
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