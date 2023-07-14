import { getAllPosts, getPostBySlug } from "lib/blogApi"
import {  type Post, type PostOptions } from "../interfaces/post"
import markdownToHtml from "lib/markdownToHtml"
import PostBody from "~/componenets/post-body"
import readingTime, { type ReadTimeResults } from "reading-time"
import Link from "next/link"

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
                    <div className="container px-5 mx-auto max-w-2xl ">
                        <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight md:leading-none mb-12 text-center md:text-left">{post.title}</h1>
                         <p>{post.date}</p> <span>{stats.text}</span>
                         <p>Written by: {post.author?.name}</p>
                        <PostBody content={post.content} />
                        <Link href="/blog">Back to blogs →</Link>
                    </div>
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