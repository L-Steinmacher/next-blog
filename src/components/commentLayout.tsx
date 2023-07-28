import { signIn, useSession } from 'next-auth/react';
import { ReCaptcha } from 'next-recaptcha-v3';
import { type RefObject, useRef, useState } from 'react';
import { api } from '~/utils/api';

import { type Comment } from '~/interfaces/comments';
import { TRPCClientError } from '@trpc/client';
import { typedBoolean } from '~/utils/miscUtils';
import CommentCard from './commentCard';

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

type CustomErrorShape = {
  code: string;
  message: string;
};

export function CommentLayout({ slug }: { slug: string }) {
  const { data: commentsData } = api.comments.getCommentsForPost.useQuery({
    slug,
  });
  const [token, setToken] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');
  const [allComments, setAllComments] = useState<Comment[]>(commentsData || []);
  const [errors, setErrors] = useState<string[]>([]);
  const { data: sessionData } = useSession();
  const commentContainerRef: RefObject<HTMLDivElement> = useRef(null);
  const utils = api.useContext();
  if (!commentsData) {
    return null;
  }
  function onVerifyCaptcha(token: string) {
    setToken(token);
  }

  const userIsAdmin = sessionData?.user?.isAdmin;
  const userIsLoggedIn = !!sessionData;

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
    },
    onSuccess(data) {
      if (!slug) {
        console.error('No slug found for post and that aint right');
        return;
      }
      const newComment = data;
      console.log('New comment:', newComment);
      setAllComments(prevComments => [...prevComments, newComment]);

      utils.comments.getCommentsForPost.setData({ slug }, [
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

    const postSlug = slug;

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
      if (!slug) {
        console.error('No slug found for post and that aint right');
        return;
      }
      const commentId = variables.commentId;
      const newComments = allComments.filter(
        comment => comment.id !== commentId,
      );
      setAllComments(newComments);
      utils.comments.getCommentsForPost.setData({ slug }, newComments);
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
    if (!slug) {
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
    <div>
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
            {userIsLoggedIn ? (
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
  );
}
