import Link from 'next/link';
import { NonNullablePostOptions, type Post, type PostOptions } from '../interfaces/post';
import { getPostBySlug, getPostSlugs } from 'lib/blogApi';
import markdownToHtml from 'lib/markdownToHtml';
import PostBody from '~/components/postBody';
import readingTime, { type ReadTimeResults } from 'reading-time';
import { type Comment } from '@prisma/client';
import { api } from '~/utils/api';
import Image from 'next/image';
import { signIn, useSession } from 'next-auth/react';
import { type RefObject, useRef, useState } from 'react';

type Props = {
  post: PostOptions;
  stats: ReadTimeResults;
  comments: Comment[];
};

export default function Post({ post, stats }: Props) {
  const [comment, setComment] = useState<string>('');
  const commentContainerRef: RefObject<HTMLDivElement> = useRef(null);
  const { data: sessionData } = useSession();

  if (!post.slug) {
    return null;
  }
  const comments =
    api.comments.getCommentsForPost.useQuery({ slug: post.slug }).data || null;
  const userLoggedIn = !!sessionData;

  const utils = api.useContext();
  const allComments = comments || [];

  const addComment = api.comments.createComment.useMutation({
    onMutate({ content, postSlug }) {
      if (!postSlug) {
        console.error('No slug found for post');
        return;
      }
      if (!sessionData) {
        console.error('No session data found');
        return;
      }
      utils.comments.getCommentsForPost.setData({ slug: postSlug }, [
        ...allComments,
        {
          id: `${Math.random()}`,
          commenter: {
            ...sessionData.user,
            name: sessionData.user.name || null,
            image: sessionData.user.image || null,
          },
          content,
          postSlug,
          createdAt: new Date(),
        },
      ]);
    },
  });

  function submitComment(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    if (comment.length < 10) {
      alert('Your comment must be at least 10 characters long.');
      return;
    }
    if (!sessionData) {
      console.error('No session data found');
      return;
    }
    if (!post.slug) {
      console.error('No slug found for post');
      return;
    }

    addComment.mutate(
      {
        content: comment,
        commenterId: sessionData.user.id,
        postSlug: post.slug,
      },
      {
        onSettled: () => {
          // Get the last comment element
          const lastComment = commentContainerRef.current
            ?.lastElementChild as HTMLElement | null;
          if (lastComment) {
            // Scroll to the last comment
            lastComment.scrollIntoView({ behavior: 'smooth' });
            // Clear the textarea
            setComment('');
          }
        },
      },
    );
    setComment('');
  }

  return (
    <div className="py-16">
      <details>
        <summary>Post Data</summary>
        <pre>{JSON.stringify({ ...post, id: undefined }, null, 2)}</pre>
      </details>
      {post.content ? (
        <section aria-labelledby="post-heading">
          <div className="container mx-auto min-h-screen max-w-2xl px-5">
            <h1
              id="post-heading"
              className="mb-12 text-center text-3xl font-bold leading-tight tracking-tighter md:text-left md:text-6xl md:leading-none lg:text-8xl"
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
            <PostBody content={post.content} />
            <Link href="/blog">Back to blogs →</Link>
          </div>
        </section>
      ) : null}
      <hr className="mt-16 h-[3px] bg-gradient-to-r from-[#d68501] to-[#6b2b6f]" />
      <section aria-labelledby="comments-heading" className="pt-16">
        <div className="w-full">
          <form
            className="flex flex-col items-center"
            aria-label="Leave a comment"
          >
            <h2 className="mb-4 text-center text-2xl font-bold">
              Have an opinion of what I said? Find a typo? Just want to be nice?
              <br /> Feel free to leave a comment!
            </h2>
            <label htmlFor="comment" className="sr-only">
              Comment
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-400 px-3 py-2 shadow-slate-400 text-gray-700 placeholder-gray-400 shadow-lg focus:border-[#6b2b6f] focus:ring-[#6b2b6f] sm:text-sm"
              placeholder="Leave a comment"
              aria-label="Comment on blog post"
              tabIndex={1}
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            {userLoggedIn ? (
              <>
                <button
                  type="submit"
                  className="mt-4 inline-flex items-center rounded-md border border-transparent  bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-slate-400 shadow-md hover:bg-indigo-700 focus:outline-none"
                  tabIndex={2}
                  aria-label="Submit comment button"
                  onClick={submitComment}
                  disabled={comment.length < 10}
                >
                  Submit
                </button>
              </>
            ) : (
              <div>
                <p className="mb-4 text-xl font-bold">
                  You must be logged in to leave a comment.
                </p>
                <button
                  className="mt-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none"
                  tabIndex={2}
                  aria-label="Sign in"
                  onClick={() => void signIn()}
                >
                  Sign in
                </button>
              </div>
            )}
          </form>
        </div>
        <div className="mt-16 " ref={commentContainerRef}>
          <h2 id="comments-heading" className="sr-only">
            Comments
          </h2>
          {comments?.length ? (
            comments.map(comment => (
              <div
                key={comment.id}
                className="mb-4 rounded-lg bg-white p-6 shadow-lg max-w-2xl mx-auto"
                role="article"
              >
                <div className="mb-4 flex items-center">
                  {comment.commenter.image ? (
                    <Image
                      className="mr-3 h-8 w-8 rounded-full"
                      src={comment.commenter.image}
                      alt={comment.commenter.name || 'Commenter Image'}
                      width={32}
                      height={32}
                    />
                  ) : (
                    <div className="mr-3 h-8 w-8 rounded-full bg-black" />
                  )}
                  <p className="font-bold">{comment.commenter.name}</p>
                </div>
                <p className="text-gray-700">{comment.content}</p>
                <p className="mt-2 text-sm text-gray-500">
                  {comment.createdAt.toISOString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-xl text-gray-500">
              Be the first to leave your thoughts!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

type Params = {
  params: {
    slug: string;
  };
};

export const getStaticProps = async ({ params }: Params) => {
  const postData: NonNullablePostOptions = await getPostBySlug(params.slug, [
    'title',
    'date',
    'slug',
    'author',
    'content',
  ]);


  const parsedContent = await markdownToHtml(postData.content || '');
  const stats = readingTime(postData.content || '');

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
  };
};

export async function getStaticPaths() {
  const slugs = await getPostSlugs();
  const paths = slugs.map(slug => {
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
