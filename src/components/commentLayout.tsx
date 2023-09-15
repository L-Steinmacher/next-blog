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
const isDev = process.env.NODE_ENV === 'development';

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
    const userIsLoggedIn = !!sessionData;

    const utils = api.useContext();
    const createCommentMutation = api.comments.createComment.useMutation();

    useEffect(() => {
        if (commentsData) {
            setAllComments(commentsData);
        }
    }, [commentsData]);

    const addComment = useCallback(
        ({
            content,
            postSlug,
            token,
        }: {
            content: string;
            postSlug: string;
            token?: string;
        }) => {
            if (!token && !isDev) {
                console.error('No token found!');
                return;
            } else if (!token && isDev) {
                console.log('In Dev enviroment, using dev token!');
            }
            try {
                const newComment = createCommentMutation.mutate(
                    {
                        content,
                        postSlug,
                        token: token || 'devToken',
                    },
                    {
                        onSuccess: data => {
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
                            console.error('Error adding comment:', error);
                            setErrors(prevErrors => [
                                ...prevErrors,
                                error.message,
                            ]);
                        },
                    },
                );
                return newComment;
            } catch (error) {
                console.error('Error adding comment:', error);
            }
        },
        [
            createCommentMutation,
            slug,
            utils.comments.getCommentsForPost,
            allComments,
        ],
    );

    const submitComment = useCallback(() => {

        setErrors([]);
        const filter = new BadWordsFilter();


        const filteredComment = filter.clean(comment);
        console.log(gotime, submitting)
        addComment({
            content: filteredComment,
            postSlug: slug,
            token: token || '',
        });
        if (!errors) {
            const lastComment = commentContainerRef.current
            ?.lastElementChild as HTMLElement | null;
            if (lastComment) {
                lastComment.scrollIntoView({ behavior: 'smooth' });
                setComment('');
            }

        }
        setGotime(false);
        setSubmitting(false);
    }, [addComment, comment, errors, gotime, slug, submitting, token]);

    // First we wait for the recaptcha token to be set, only then will the boolean gotime to be true
    useEffect(() => {
        console.log("useEffect", comment);
        if (!gotime) {
            return;
        }
        submitComment();
        // linkter wants submitComment in dep array but that causes issues.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gotime]);

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
                        <div className="relative w-full ">
                            <textarea
                                id="comment"
                                name="comment"
                                rows={6}
                                className="mt-1 block w-full rounded-md border-gray-400 bg-[#fffefe] px-3 py-2 text-gray-700 placeholder-gray-400 shadow-lg shadow-slate-400 focus:border-[#6b2b6f] focus:ring-[#6b2b6f] sm:text-sm"
                                placeholder="Feel free to leave a comment."
                                aria-label="Comment on blog post"
                                tabIndex={1}
                                value={comment}
                                onChange={e => {
                                    const commentLength = e.target.value.length;
                                    if (commentLength <= 500) {
                                        setComment(e.target.value)
                                    }
                                }}
                            />
                            {comment.length ? (
                                <p className="absolute bottom-0 right-0 mb-2 mr-3 text-sm text-gray-500">
                                    {comment.length} / 500
                                </p>
                            ) : null}
                        </div>
                        {submitting && (
                            <>
                                {!RECAPTCHA_SITE_KEY ? (
                                    // render a fake recaptcha in dev mode
                                    <div className="relative  ">
                                        <button
                                            type="submit"
                                            className="absolute top-0 flex items-center space-x-2 rounded-md border border-gray-300 bg-white p-2 hover:bg-gray-100 focus:border-blue-300 focus:outline-none"
                                            tabIndex={2}
                                            aria-label="Submit comment button"
                                            onClick={e => {
                                                console.log('clicked', gotime);
                                                e.preventDefault();
                                                setGotime(true);
                                            }}
                                        >
                                            ✅
                                        </button>
                                    </div>
                                ) : (
                                    <ReCAPTCHA
                                        sitekey={RECAPTCHA_SITE_KEY}
                                        onChange={(tkn: string | null) => {
                                            setToken(tkn);
                                            setGotime(true);
                                        }}
                                    />
                                )}
                            </>
                        )}
                        <div className="block h-4 text-xl font-bold">
                            {errors.length
                                ? errors.map((error, i) => (
                                      <p key={i} className="text-red-500">
                                          {}
                                      </p>
                                  ))
                                : null}
                        </div>
                        <div className="flex flex-col items-center">
                            {userIsLoggedIn ? (
                                <>
                                    <button
                                        type="submit"
                                        className="mt-4 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-md shadow-slate-400 hover:bg-indigo-700 focus:outline-none"
                                        tabIndex={2}
                                        aria-label="Submit comment button"
                                        disabled={comment.length < 1}
                                    >
                                        Submit
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col ">
                                    <div className="block h-4">
                                        <p className="text-xl font-bold ">
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
                                    className="relative flex flex-row items-center"
                                    key={comment.id}
                                >
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
