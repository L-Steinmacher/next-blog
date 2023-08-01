import { signIn, useSession } from 'next-auth/react';
import { ReCaptcha } from 'next-recaptcha-v3';
import { type RefObject, useRef, useState } from 'react';
import { api } from '~/utils/api';
import BadWordsFilter from 'bad-words';

import { type Comment } from '~/interfaces/comments';
import { typedBoolean } from '~/utils/miscUtils';
import CommentCard from './commentCard';
import validateToken from '~/utils/validateToken';
import { TRPCClientError } from '@trpc/client';

type CustomErrorShape = {
  code: string;
  message: string;
};

const PUBLIC_RECAPTCHA_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_KEY;

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

  function onVerifyCaptcha(token: string) {
    setToken(token);
  }

  const currentUser = sessionData?.user;
  const userIsAdmin = currentUser?.isAdmin;
  const userIsLoggedIn = !!sessionData;

  const filter = new BadWordsFilter();

  // We disable the next line vecause we may or may not be using the tempComment and I haven't
  // figured out how to make typescript happy with that yet.  ¯\_(ツ)_/¯
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  let tempComment: Comment;

  const createCommentMutation = api.comments.createComment.useMutation();

  const addComment = ({
    content,
    postSlug,
  }: {
    content: string;
    postSlug: string;
  }) => {
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
    try {
      // Call the mutate method on the object returned by useMutation
      const newComment = createCommentMutation.mutate(
        {
          content,
          postSlug,
          token: token || '',
        },
        {
          // Define your callbacks here
          onSuccess: data => {
            if (!slug) {
              console.error('No slug found for post and that aint right');
              return;
            }
            console.log('New comment:', data);
            setAllComments(prevComments => [...prevComments, data]);

            utils.comments.getCommentsForPost.setData({ slug }, [
              ...allComments,
              data,
            ]);
          },
          onError: error => {
            setErrors(prevErrors => [...prevErrors, error.message]);
            setAllComments(prevComments =>
              prevComments.filter(comment => comment.id !== tempComment.id),
            );
          },
        },
      );
      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  function submitComment() {
    setErrors([]);
    if (!token) {
        setErrors(['Recaptcha validation failed, no token found']);
        return;
    }

    if (comment.length < 2) {
      setErrors(['Comment must be at least 2 characters long']);
      return;
    }

    if (!sessionData) {
      console.error('No session data found');
      return;
    }
    const filteredComment = filter.clean(comment);
    const postSlug = slug;

    if (!postSlug) {
      console.error('No slug found for post');
      return;
    }

    validateToken(token)
      .then(isValid => {
        if (isValid) {
          addComment({
            content: filteredComment,
            postSlug: postSlug,
          });

          // Get the last comment element
          const lastComment = commentContainerRef.current
            ?.lastElementChild as HTMLElement | null;
          if (lastComment) {
            // Scroll to the last comment
            lastComment.scrollIntoView({ behavior: 'smooth' });
            // Clear the textarea
            setComment('');
          }
        } else {
          console.error('Recaptcha validation failed');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        // On error
        if (error instanceof TRPCClientError && error.shape) {
          const errorShape = error.shape as CustomErrorShape;
          if (errorShape && errorShape.code === 'TOO_MANY_REQUESTS') {
            alert("you're doing that too much in five minutes");
          } else {
            alert(errorShape.message);
          }
        }
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
            onSubmit={e => {
              e.preventDefault();
              submitComment();
            }}
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
                  {(userIsAdmin ||
                    comment.commenter.id === currentUser?.id) && (
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
