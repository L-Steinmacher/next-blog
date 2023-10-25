import { type Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import readingTime from 'reading-time';

import { type NonNullablePostOptions } from '~/interfaces/post';
import { getPostBySlug, getPostSlugs } from 'lib/blogApi';
import markdownToHtml from 'lib/markdownToHtml';
import PostBody from '~/components/postBody';
import { api } from '~/trpc/server';
import CommentForm from './commentForm';

type Params = {
    params: {
        slug: string;
    };
};

async function getPostData({ params }: Params) {
    const postData: NonNullablePostOptions = await getPostBySlug(params.slug, [
        'title',
        'date',
        'slug',
        'author',
        'content',
        'updatedAt',
    ]);

    const parsedContent = await markdownToHtml(postData.content || '');
    const stats = readingTime(postData.content || '');
    if (!postData.slug) throw new Error('No slug found for post');
    const comments = await api.comments.getCommentsForPost.query({
        slug: params.slug,
    });
    return {
        post: {
            title: postData.title,
            date: postData.date,
            slug: postData.slug,
            author: postData.author,
            content: parsedContent,
            updatedAt: postData.updatedAt,
        },
        stats,
        comments,
    };
}

export async function generateStaticParams() {
    const slugs = await getPostSlugs();
    return slugs.map(slug => {
        return {
            slug: slug.replace(/\.md$/, ''), // Remove file extension for each post slug
        };
    });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { title, excerpt } = await getPostBySlug(params.slug, [
        'title',
        'excerpt',
    ]);
    return {
        title,
        description: excerpt,
    };
}

export default async function Post({ params }: Params) {
    const { post, stats, comments } = await getPostData({ params });
    if (!post.slug) notFound();
    return (
        <>
            <div className="py-16">
                <details>
                    <summary>Post Data</summary>
                    <pre>
                        {JSON.stringify({ ...post, id: undefined }, null, 2)}
                    </pre>
                </details>
                {post.content ? (
                    <section aria-labelledby="post-heading">
                        <div className="container mx-auto min-h-full max-w-2xl px-5">
                            <h1
                                id="post-heading"
                                className="md:text-6 3xl mb-12 text-center text-3xl font-bold leading-tight tracking-tighter md:text-left md:leading-none lg:text-4xl"
                            >
                                {post.title}
                            </h1>
                            <p>{post.date?.split('T')[0]}</p>
                            <span>{stats.text}</span>
                            {typeof post.author === 'string' ? (
                                // When post.author is a string (name of the author)
                                <p>Written by: {post.author}</p>
                            ) : (
                                // When post.author is an Author object
                                <p>Written by: {post.author?.name}</p>
                            )}
                            {post.updatedAt ? (
                                <p className="text-body-md ">
                                    Updated on: {post.updatedAt.split('T')[0]} *
                                </p>
                            ) : null}
                            <PostBody content={post.content} />
                            <Link href="/blog">Back to blogs →</Link>
                        </div>
                    </section>
                ) : null}
                <hr className="mt-16 h-[3px] bg-gradient-to-r from-[#d68501] to-[#6b2b6f]" />
                <CommentForm slug={post.slug} allComments={comments} />
            </div>
        </>
    );
}
