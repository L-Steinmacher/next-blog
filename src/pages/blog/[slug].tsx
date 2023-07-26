import Link from 'next/link';
import { type NonNullablePostOptions } from '../../interfaces/post';
import { getPostBySlug, getPostSlugs } from 'lib/blogApi';
import markdownToHtml from 'lib/markdownToHtml';
import PostBody from '~/components/postBody';
import readingTime, { type ReadTimeResults } from 'reading-time';
import { api } from '~/utils/api';
import { signIn, useSession } from 'next-auth/react';
import { type RefObject, useRef, useState } from 'react';
import Head from 'next/head';
import { TRPCClientError } from '@trpc/client';
import { ReCaptcha } from 'next-recaptcha-v3';
import { typedBoolean } from '~/utils/miscUtils';
import CommentCard from '~/components/commentCard';
import { useRouter } from 'next/router';
import { type Comment } from '~/interfaces/comments';
import { createCaller } from '@trpc/client';

type Props = {
  post: NonNullablePostOptions;
  stats: ReadTimeResults;
  comments: Comment[];
};

type CustomErrorShape = {
  code: string;
  message: string;
};

type RecaptchaAPIResponse = {
  recaptchaJson: {
    success: boolean;
    challenge_ts?: string;
    hostname?: string;
    score?: number;
    action?: string;
    'error-codes'?: string[];
  };
};

export default function Post({ post, stats, comments }: Props) {
  const router = useRouter();
  if (!post.slug) throw router.push('/404');

  const [comment, setComment] = useState<string>('');
  const [allComments, setAllComments] = useState<Comment[]>(comments || []);
  const [errors, setErrors] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const commentContainerRef: RefObject<HTMLDivElement> = useRef(null);
  const { data: sessionData } = useSession();

  const userIsAdmin = sessionData?.user?.isAdmin;
  const userLoggedIn = !!sessionData;

  const utils = api.useContext();

  function onVerifyCaptcha(token: string) {
    setToken(token);
  }

  // We disable the next line vecause we may or may not be using the tempComment and I haven't
  // figured out how to make typescript happy with that yet.  ¯\_(ツ)_/¯
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  let tempComment: Comment;

  const addComment = api.comments.createComment.useMutation({
    onMutate({ content, postSlug }) {
      if (!sessionData) {
        console.error('No session data found');
        return;
      }
      tempComment = {
        id: `${Math.random()}`,
        commenter: {
          id: sessionData.user.id,
          name: sessionData.user.name || null,
          image: sessionData.user.image || null,
        },
        content,
        postSlug,
        createdAt: new Date(),
      };
      setAllComments(prevComments => [...prevComments, tempComment]);
    },
    onSuccess(data) {
      if (!post.slug) {
        console.error('No slug found for post and that aint right');
        return;
      }
      const newComment = data;
      console.log('New comment:', newComment);

      utils.comments.getCommentsForPost.setData({ slug: post.slug }, [
        ...allComments,
        newComment,
      ]);
    },
    onError(error) {
      setErrors(prevErrors => [...prevErrors, error.message]);
      setAllComments(prevComments =>
        prevComments.filter(comment => comment.id !== tempComment.id),
      );
    },
  });

  function submitComment(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    setErrors([]);
    if (!token) {
      // Here, handle the situation when there's no token.
      // This could be setting an error message or something similar.
      console.error('No recaptcha token');
      return;
    }

    setToken(null);

    if (comment.length < 2) {
      setErrors(['Comment must be at least 2 characters long']);
      return;
    }
    if (!sessionData) {
      console.error('No session data found');
      return;
    }

    const postSlug = post.slug;

    if (!postSlug) {
      console.error('No slug found for post');
      return;
    }

    fetch('/api/validateRecaptcha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to validate token');
        }

        return response.json();
      })
      .then(data => {
        const recaptchaData = data as RecaptchaAPIResponse;
        console.log('Recaptcha validation response:', recaptchaData);

        if (!recaptchaData.recaptchaJson.success) {
          console.error('Recaptcha validation failed:', recaptchaData);
          token && setToken(null);
          return;
        }

        return addComment.mutate(
          {
            content: comment,
            postSlug: postSlug,
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
            onError: error => {
              if (error instanceof TRPCClientError && error.shape) {
                const errorShape = error.shape as CustomErrorShape;
                if (errorShape && errorShape.code === 'TOO_MANY_REQUESTS') {
                  alert("you're doing that too much in five minutes");
                } else {
                  alert(errorShape.message);
                }
              }
            },
          },
        );
      })
      .catch(error => {
        console.error('Recaptcha validation error:', error);
      });
  }

  const deleteComment = api.comments.deleteComment.useMutation({
    onSuccess: (data, variables) => {
      if (!post.slug) {
        console.error('No slug found for post and that aint right');
        return;
      }
      const commentId = variables.commentId;
      const newComments = allComments.filter(
        comment => comment.id !== commentId,
      );
      setAllComments(newComments);
      utils.comments.getCommentsForPost.setData(
        { slug: post.slug },
        newComments,
      );
    },
    onError(error) {
      setErrors(prevErrors => [...prevErrors, error.message]);
    },
  });

  function handleDeleteComment(commentId: string) {
    if (!userIsAdmin) {
      console.error('User is not an admin');
      return;
    }
    if (!post.slug) {
      console.error('No slug found for post');
      return;
    }
    return deleteComment.mutate(
      { commentId },
      {
        onSettled: () => {
          console.log('Comment deleted');
        },
      },
    );
  }

  return (
    <>
      <Head>
        <title>{post.title} - Lucas Steinmacher </title>
        <meta
          name="description"
          content={post.excerpt || 'A Blog Post by Lucas Steinmacher'}
        />
        <link rel="icon" href="favicon.ico" />
        <meta name="robots" content="index,follow" />
      </Head>
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
                Have an opinion of what I said? Find a typo? Just want to be
                nice?
                <br /> Feel free to leave a comment!
              </h2>
              <label htmlFor="comment" className="sr-only">
                Comment
              </label>
              <ReCaptcha onValidate={onVerifyCaptcha} action="submit_comment" />
              <textarea
                id="comment"
                name="comment"
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-400 bg-[#fffefe] px-3 py-2 text-gray-700 placeholder-gray-400 shadow-lg shadow-slate-400 focus:border-[#6b2b6f] focus:ring-[#6b2b6f] sm:text-sm"
                placeholder="Leave a comment"
                aria-label="Comment on blog post"
                tabIndex={1}
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <div className="block h-4 text-xl font-bold">
                {errors.length
                  ? errors.map((error, i) => (
                      <p key={i} className="text-red-500">
                        {error}
                      </p>
                    ))
                  : null}
              </div>
              {userLoggedIn ? (
                <>
                  <button
                    type="submit"
                    className="mt-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-md shadow-slate-400 hover:bg-indigo-700 focus:outline-none"
                    tabIndex={2}
                    aria-label="Submit comment button"
                    onClick={submitComment}
                  >
                    Submit
                  </button>
                </>
              ) : (
                <div className="flex flex-col ">
                  <div className="block h-4">
                    <p className=" text-xl font-bold ">
                      You must be logged in to leave a comment.
                    </p>
                  </div>
                  <button
                    className="mx-auto mt-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm shadow-slate-400 hover:bg-indigo-700 focus:outline-none"
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
            {allComments?.length ? (
              allComments
                .filter(comment => typedBoolean(comment))
                .map(comment => (
                  <div className="flex flex-row items-center " key={comment.id}>
                    {userIsAdmin && (
                      <div>
                        <button
                          className="inline-flex items-center rounded-md border border-transparent bg-none px-4 py-2 text-base font-medium text-white shadow-sm shadow-slate-400 hover:bg-red-200 focus:outline-none"
                          onClick={e => {
                            e.preventDefault();
                            handleDeleteComment(comment.id);
                          }}
                        >
                          ❌
                        </button>
                      </div>
                    )}
                    <CommentCard key={comment.id} comment={comment} />
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
    </>
  );
}

type Params = {
  params: {
    slug: string;
  };
};

const caller = createCaller(appRouter);

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
  if (!postData.slug) throw new Error('No slug found for post');
  const comments = api.comments.getCommentsForPost.useQuery({
    slug: postData.slug,
  });

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
      comments
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
