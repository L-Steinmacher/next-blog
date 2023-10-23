'use client';
import { signIn } from 'next-auth/react';

import ReCAPTCHA from 'react-google-recaptcha';
import { type Comment } from '~/interfaces/comments';
import CommentCard from './commentCard';
import useController from '~/hooks/useController';

const RECAPTCHA_SITE_KEY = process.env.GOOGLE_PUBLIC_RECAPTCHA_KEY;

export default function CommentForm({
    slug,
    allComments,
}: {
    slug: string;
    allComments: Comment[];
}) {
    const {
        submitting,
        setSubmitting,
        setToken,
        comment,
        setComment,
        errors,
        setGotime,
        userIsLoggedIn,
    } = useController({
        slug,
    });

    return (
        <>
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
                                        setComment(e.target.value);
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
                                          {error}
                                      </p>
                                  ))
                                : null}
                        </div>
                        <div className="flex flex-col items-center">
                            {userIsLoggedIn ? (
                                <>
                                    <button
                                        type="submit"
                                        className="mt-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-md shadow-slate-400 hover:bg-indigo-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                <div className="mt-16">
                    <h2 id="comments-heading" className="sr-only">
                        Comments
                    </h2>
                    {allComments ? (
                        allComments.map(comment => (
                            <CommentCard key={comment?.id} comment={comment} />
                        ))
                    ) : (
                        <p className="text-center text-xl text-gray-500">
                            Be the first to leave your thoughts!
                        </p>
                    )}
                </div>
            </section>
        </>
    );
}
