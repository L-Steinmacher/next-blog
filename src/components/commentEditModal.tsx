import { useEffect, useRef, useState } from 'react';
import { api } from '~/utils/api';

export default function CommentEditModal({ commentId }: { commentId: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalRef = useRef<HTMLDialogElement>(null);
    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };

        const handleOutsideClick = (e: MouseEvent) => {
            // Check if the click is outside the modal
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
        },
    });

    function handleTranslate() {
        translateMutation.mutate({ commentId, caseType: 'spanish' });
        closeModal();
    }

    return (
        <>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex w-full items-center  justify-center bg-opacity-50 backdrop-blur-sm backdrop-brightness-75 ">
                    <dialog
                        id="comment-edit-modal"
                        open
                        className="h-40 w-1/2 rounded-lg bg-white p-6"
                        ref={modalRef}
                    >
                        <button
                            className=""
                            type="submit"
                            onClick={() => {
                                handleTranslate();
                            }}
                        >
                            translate
                        </button>
                        <button
                            className=""
                            type="submit"
                            onClick={() => {
                                closeModal();
                            }}
                        >
                            cancel
                        </button>
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
