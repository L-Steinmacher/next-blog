import Link from "next/link"
import {  type Post, type PostOptions } from "../interfaces/post"
import { getPostBySlug, getPostSlugs } from "lib/blogApi"
import markdownToHtml from "lib/markdownToHtml"
import PostBody from "~/components/postBody"
import readingTime, { type ReadTimeResults } from "reading-time"
import { type Comment } from "@prisma/client"
import { api } from "~/utils/api"
import Image from "next/image"

type Props = {
    post: PostOptions
    stats: ReadTimeResults
    comments: Comment[]
}

export default function Post ({ post, stats} : Props) {
    if (!post.slug) {
        return null
    }
    const comments = api.comments.getCommentsForPost.useQuery({ slug: post.slug }).data || null

    return (
        <div>
            <details>
                <summary>Post Data</summary>
                <pre>{JSON.stringify({ ...post, id: undefined }, null, 2)}</pre>
            </details>
            {post.content ? (
                <section aria-labelledby="post-heading">
                    <div className="container px-5 mx-auto max-w-2xl min-h-screen">
                    <h1
                        id="post-heading"
                        className="text-3xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight md:leading-none mb-12 text-center md:text-left"
                    >
                        {post.title}
                    </h1>
                    <p>{post.date}</p>
                    <span>{stats.text}</span>
                    <p>Written by: {post.author?.name}</p>
                    <PostBody content={post.content} />
                    <Link href="/blog">Back to blogs →</Link>
                    </div>
                </section>
                ) : null
            }
            <hr className="mt-16 bg-gradient-to-r from-[#d68501] to-[#6b2b6f] h-[3px]" />
            <section aria-labelledby="comments-heading" className="pt-16">
                <div className="">
                    <form className="flex flex-col items-center" aria-label="Leave a comment">
                        <h2 className="text-2xl font-bold mb-4">
                            Have an opinion of what I said? Find a typo? Just want to be nice? Feel free to leave a comment!
                        </h2>
                        <label htmlFor="comment" className="sr-only">
                            Comment
                        </label>
                        <textarea
                            id="comment"
                            name="comment"
                            rows={4}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                            placeholder="Leave a comment"
                            aria-label="Comment"
                            tabIndex={1}
                        />
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none mt-4"
                            tabIndex={2}
                        >
                            Submit
                        </button>
                    </form>
                </div>
                <div className="mt-16">
                    <h2 id="comments-heading" className="sr-only">
                        Comments
                    </h2>
                    {comments?.map((comment) => (
                        <div
                        key={comment.id}
                        className="bg-white shadow-lg rounded-lg p-6 mb-4"
                        role="article"
                        >
                        <div className="flex items-center mb-4">
                        {comment.commenter.image ? (
                            <Image
                                className="w-8 h-8 rounded-full mr-3"
                                src={comment.commenter.image}
                                alt={comment.commenter.name || 'Commenter Image'}
                                width={32}
                                height={32}
                            />
                            ) : (<div className="w-8 h-8 rounded-full mr-3 bg-black" />)
                        }
                            <p className="font-bold">{comment.commenter.name}</p>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                        <p className="text-gray-500 text-sm mt-2">
                            {comment.createdAt.toISOString()}
                        </p>
                        </div>
                    ))}
                </div>
            </section>
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