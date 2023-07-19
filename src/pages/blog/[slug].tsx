import Link from "next/link"
import {  type Post, type PostOptions } from "../interfaces/post"
import { getPostBySlug, getPostSlugs } from "lib/blogApi"
import markdownToHtml from "lib/markdownToHtml"
import PostBody from "~/components/postBody"
import readingTime, { type ReadTimeResults } from "reading-time"
import { type Comment } from "@prisma/client"
import {CommentLayout} from "~/components/commentLayout"
import { api } from "~/utils/api"

type Props = {
    post: PostOptions
    stats: ReadTimeResults
    comments: Comment[]
}

export default function Post ({ post, stats} : Props) {
    if (!post.slug) {
        return null
    }
    const comments = api.comments.getCommentsForPost.useQuery({ slug: post.slug }) || null
    console.log(comments)

    return (
        <div>
            <details>
                <summary>Post</summary>
                <pre>{JSON.stringify(post, null, 2)}</pre>
                <pre>{JSON.stringify(comments, null, 2)}</pre>
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
            {/* <CommentLayout slug={post.slug} /> */}

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
    ])

    if (!postData) {
        return {
            notFound: true,
        }
    }
    console.log(typeof params.slug)

    const parsedContent = await markdownToHtml(postData.content || '')
    const stats = readingTime(postData.content || '')

    return {
        props: {
            post: {
                title: postData.title,
                date: postData.date,
                slug: postData.slug,
                author: postData.author,
                content: parsedContent,
            },
            stats,
        },
    }
}



export async function getStaticPaths() {
    const slugs = await getPostSlugs();
    const paths = slugs.map((slug) => {
      return {
        params: {
          slug: slug.replace(/\.md$/, ''), // Remove file extension for each post slug
        },
      };
    });

    return {
      paths,
      fallback: false,
    };
  }