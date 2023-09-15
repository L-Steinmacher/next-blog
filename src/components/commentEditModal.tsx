import { useEffect, useRef, useState } from 'react';
import { api } from '~/utils/api';
import CommentDeleteButton from './commentDeleteButton';
import { useSession } from 'next-auth/react';
import { type Comment } from '~/interfaces/comments';

const translateCases = [
    'none',
    'spanish',
    'german',
    'bruh',
    'intellegizer',
] as const;

export default function CommentEditModal({ comment }: { comment: Comment }) {
    const commentId = comment?.id;

    const { data: sessionData } = useSession();
    const user = sessionData?.user;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [commentContent, setCommentContent] = useState<string>(
        comment?.content,
    );
    const [caseType, setCaseType] = useState<string>('none');
    const [isTranslating, setIsTranslating] = useState(false);

    const modalRef = useRef<HTMLDialogElement>(null);
    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        if (!commentContent) {
            setCommentContent(comment?.content);
        }
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };

        // TODO this is not working yet
        const handleOutsideClick = (e: MouseEvent) => {
            if (
                isModalOpen &&
                modalRef.current &&
                !modalRef.current.contains(e.target as Node)
            ) {
                closeModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        if (isModalOpen) {
            document.addEventListener('click', handleOutsideClick);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    const utils = api.useContext();
    const translateMutation = api.translations.translateComment.useMutation({
        async onSuccess(res) {
            async function close() {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            await close();
            const { comment } = res;
            setCommentContent(comment.content);
            await utils.comments.invalidate();
            closeModal();
        },
        onError(error) {
            console.log('error translating comment', error);
        },
        onSettled() {
            console.log('settled');
            setIsTranslating(false);
        },
    });

    const updateMutation = api.comments.updateComment.useMutation({
        async onSuccess() {
            await utils.comments.invalidate();
            closeModal();
        },
        onError(error) {
            console.log('error updating comment', error);
        },
        onSettled() {
            console.log('settled');
            setIsTranslating(false);
        },
    });

    function handleUpdate() {
        setIsTranslating(true);
        if (caseType === 'none') {
            updateMutation.mutate({ commentId, content: commentContent });
        } else {
            translateMutation.mutate({
                commentId,
                caseType: caseType as (typeof translateCases)[number],
            });
        }
    }

    return (
        <>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex w-full items-center  justify-center bg-opacity-50 backdrop-blur-sm backdrop-brightness-75  ">
                    <dialog
                        id="comment-edit-modal"
                        open={isModalOpen}
                        className={`h-fit w-5/6 rounded-lg bg-[#f7f7f7] p-6 md:h-1/2 md:w-1/2  `}
                        ref={modalRef}
                    >
                        {isTranslating && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-lg font-bold animate-pulse text-white bg-gray-700 p-4 rounded-md">
                                    One moment while we translate...
                                </p>
                            </div>
                        )}
                        <div className="container flex h-full flex-col justify-between ">
                            <div>
                                <form className=" ">
                                    <label htmlFor="comment">Comment</label>
                                    <textarea
                                        name="comment"
                                        id="comment"
                                        cols={30}
                                        rows={10}
                                        value={commentContent}
                                        disabled={commentContent.length > 500 || isTranslating}
                                        onChange={e =>
                                            setCommentContent(e.target.value)
                                        }
                                        className="w-full rounded-sm border-2 border-gray-300 p-2 "
                                    ></textarea>
                                </form>
                            </div>
                            <div className="flex flex-grow flex-col items-end justify-between md:flex-row ">
                                <div className="relative flex h-fit flex-col ">
                                    <details className="absolute left-0 top-0 z-50 mt-[-1rem]">
                                        <summary className="text-xs">
                                            What is this?
                                        </summary>
                                        <p className="border-1 rounded-md bg-[#fefafa] p-3 text-xs shadow-md ">
                                            Each user gets 5 free translation
                                            tokens to transform your text using
                                            OpenAI ChatGPT. You have{' '}
                                            {user?.langToken} tokens left.
                                        </p>
                                    </details>
                                    <select
                                        value={caseType}
                                        disabled={
                                            user && user.isAdmin
                                                ? false
                                                : !(user && user.langToken > 0)
                                        }
                                        onChange={e =>
                                            setCaseType(e.target.value)
                                        }
                                    >
                                        <option key="none" value="none">
                                            none
                                        </option>
                                        {translateCases.map(c => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex ">
                                    <button
                                        className="rounded-md border border-transparent bg-none px-4  py-2 text-base font-medium shadow-sm shadow-slate-400 hover:bg-slate-100 focus:outline-none"
                                        type="submit"
                                        disabled={isTranslating}
                                        onClick={() => {
                                            handleUpdate();
                                        }}
                                    >
                                        update
                                    </button>
                                    <CommentDeleteButton
                                        commentId={commentId}
                                    />
                                    <button
                                        className="rounded-md border border-transparent bg-none px-4  py-2 text-base font-medium shadow-sm shadow-slate-400 hover:bg-yellow-100 focus:outline-none"
                                        type="submit"
                                        onClick={() => {
                                            closeModal();
                                        }}
                                    >
                                        cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </dialog>
                </div>
            )}
            <p>
                <button id="show-dialog" onClick={() => openModal()}>
                    Edit
                </button>
            </p>
        </>
    );
}
