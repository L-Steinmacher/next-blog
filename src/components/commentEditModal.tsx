import { useEffect, useRef, useState } from 'react';
import { api } from '~/utils/api';
import CommentDeleteButton from './commentDeleteButton';
import { useSession } from 'next-auth/react';
import { type Comment } from '~/interfaces/comments';

export default function CommentEditModal({ comment }: { comment: Comment }) {
    const commentId = comment?.id;

    const { data: sessionData } = useSession();
    const user = sessionData?.user;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [commentContent, setCommentContent] = useState<string>(comment?.content);

    const modalRef = useRef<HTMLDialogElement>(null);
    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        if (!commentContent) {
            setCommentContent(comment?.content );
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
        async onSuccess() {
            await utils.comments.invalidate();
            closeModal();
        },
    });

    function handleTranslate() {
        translateMutation.mutate({ commentId, caseType: 'spanish' });
    }

    const updateMutation = api.comments.updateComment.useMutation({
        async onSuccess() {
            await utils.comments.invalidate();
            closeModal();
        },
        onError(error) {
            console.log('error updating comment', error);
        },
    });
    function handleUpdate() {
        updateMutation.mutate({ commentId, content: commentContent });
    }

    return (
        <>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex w-full items-center  justify-center bg-opacity-50 backdrop-blur-sm backdrop-brightness-75 ">
                    <dialog
                        id="comment-edit-modal"
                        open
                        className="h-1/2 w-1/2 rounded-lg bg-white p-6"
                        ref={modalRef}
                    >
                        <div>
                            <form className=" ">
                                <label htmlFor="comment">Comment</label>
                                <textarea
                                    name="comment"
                                    id="comment"
                                    cols={30}
                                    rows={10}
                                    value={commentContent}
                                    onChange={e =>
                                        setCommentContent(e.target.value)
                                    }
                                    className="w-full rounded-sm border-2 border-gray-300 p-2 "
                                ></textarea>
                            </form>
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                className=""
                                type="submit"
                                onClick={() => {
                                    handleUpdate();
                                }}
                            >
                                update
                            </button>
                            <button
                                className="disabled:cursor-not-allowed disabled:line-through disabled:opacity-50"
                                type="submit"
                                onClick={() => {
                                    if (user && user.langToken > 0) {
                                        handleTranslate();
                                    } else {
                                        alert(
                                            'You need to buy tokens to translate',
                                        );
                                    }
                                }}
                                disabled={!(user && user.langToken > 0)}
                            >
                                translate
                            </button>
                            <CommentDeleteButton commentId={commentId} />
                            <button
                                className=""
                                type="submit"
                                onClick={() => {
                                    closeModal();
                                }}
                            >
                                cancel
                            </button>
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
