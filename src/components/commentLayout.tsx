import { signIn, useSession } from 'next-auth/react';
import BadWordsFilter from 'bad-words';
import {
    type RefObject,
    useRef,
    useState,
    useCallback,
    useEffect,
} from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import { api } from '~/utils/api';
import { type Comment } from '~/interfaces/comments';
import { typedBoolean } from '~/utils/miscUtils';
import CommentCard from './commentCard';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_KEY;

export function CommentLayout({ slug }: { slug: string }) {
    const { data: commentsData } = api.comments.getCommentsForPost.useQuery({
        slug,
    });

    const [submitting, setSubmitting] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>('');
    const [comment, setComment] = useState<string>('');
    const [allComments, setAllComments] = useState<Comment[]>(
        commentsData || [],
    );
    const [errors, setErrors] = useState<string[]>([]);
    const [gotime, setGotime] = useState<boolean>(false);

    const { data: sessionData } = useSession();

    const commentContainerRef: RefObject<HTMLDivElement> = useRef(null);

    const utils = api.useContext();

    const currentUser = sessionData?.user;
    const userIsAdmin = currentUser?.isAdmin;
    const userIsLoggedIn = !!sessionData;

    const createCommentMutation = api.comments.createComment.useMutation();

    useEffect(() => {
        if (!commentsData) {
            return;
        }
        setAllComments(commentsData);
    }, [commentsData]);

    const submitComment = useCallback(() => {
        const filter = new BadWordsFilter();
        let tempComment: Comment;

        const addComment = ({
            content,
            postSlug,
            token,
        }: {
            content: string;
            postSlug: string;
            token?: string;
        }) => {
            if (!sessionData) {
                console.error('No session data found');
                return;
            }
            if (!token) {
                console.error('No token found');
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
                const newComment = createCommentMutation.mutate(
                    {
                        content,
                        postSlug,
                        token,
                    },
                    {
                        onSuccess: data => {
                            if (!slug) {
                                console.error(
                                    'No slug found for post and that aint right',
                                );
                                return;
                            }
                            setAllComments(prevComments => [
                                ...prevComments,
                                data,
                            ]);

                            utils.comments.getCommentsForPost.setData(
                                { slug },
                                [...allComments, data],
                            );
                        },
                        onError: error => {
                            setErrors(prevErrors => [
                                ...prevErrors,
                                error.message,
                            ]);
                            setAllComments(prevComments =>
                                prevComments.filter(
                                    comment => comment.id !== tempComment.id,
                                ),
                            );
                        },
                    },
                );
                return newComment;
            } catch (error) {
                console.error('Error adding comment:', error);
            }
        };

        setErrors([]);

        if (comment.length < 2) {
            setErrors(['Comment must be at least 2 characters long']);
            return;
        }

        if (!sessionData) {
            console.error('User must be logged in to leave a comment.');
            return;
        }
        const filteredComment = filter.clean(comment);
        const postSlug = slug;

        if (!postSlug) {
            console.error('No slug found for post');
            return;
        }

        addComment({
            content: filteredComment,
            postSlug: postSlug,
            token: token || '',
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
    }, [
        allComments,
        comment,
        createCommentMutation,
        sessionData,
        slug,
        token,
        utils.comments.getCommentsForPost,
    ]);

    useEffect(() => {
        if (!gotime) {
            return;
        }
        submitComment();
        setGotime(false);
        setSubmitting(false);
        // linkter wants submitComment in dep array but that causes issues.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gotime]);

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

    if (!RECAPTCHA_SITE_KEY) {
        return <div>Error: reCAPTCHA site key not found!</div>;
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
                            setSubmitting(true);
                        }}
                    >
                        <h2 className="mb-4 text-center text-2xl font-bold">
                            Have an opinion of what I said? Find a typo? Just
                            want to be nice?
                            <br /> Feel free to leave a comment!
                        </h2>
                        <label htmlFor="comment" className="sr-only">
                            Comment
                        </label>
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
                        {submitting && (
                            <>
                                <ReCAPTCHA
                                    sitekey={RECAPTCHA_SITE_KEY}
                                    onChange={(tkn: string | null) => {
                                        setToken(tkn);
                                        setGotime(true);
                                    }}
                                />
                            </>
                        )}
                        <div className="block h-4 text-xl font-bold">
                            {errors.length
                                ? errors.map((error, i) => (
                                      <p key={i} className="text-red-500">
                                          {error}
                                      </p>
                                  ))
                                : null}
                        </div>
                        <div className='flex flex-col items-center'>
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
                                        You must be logged in to leave a
                                        comment.
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
                        </div>
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
                                <div
                                    className="flex flex-row items-center relative"
                                    key={comment.id}
                                >
                                    {(userIsAdmin ||
                                        comment.commenter.id ===
                                            currentUser?.id) && (
                                        <div className='absolute right-0 -mr-14 '>
                                            <button
                                                className="items-center rounded-md border border-transparent bg-none px-4 py-2 text-base font-medium text-white shadow-sm shadow-slate-400 hover:bg-red-200 focus:outline-none"
                                                onClick={e => {
                                                    e.preventDefault();
                                                    handleDeleteComment(
                                                        comment.id,
                                                    );
                                                }}
                                            >
                                                ❌
                                            </button>
                                        </div>
                                    )}
                                    <CommentCard
                                        key={comment.id}
                                        comment={comment}
                                    />
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
