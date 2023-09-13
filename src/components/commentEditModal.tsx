import { useEffect, useState } from 'react';
import { api } from '~/utils/api';

export default function CommentEditModal({ commentId }: { commentId: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const utils = api.useContext();
    const translateMutation = api.translations.translateComment.useMutation({
        async onSuccess() {
            await utils.comments.invalidate();
        },
    });

    function handleTranslate() {
        translateMutation.mutate({ commentId, caseType: 'spanish' });
    }

    return (
        <>
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center w-full  z-50 bg-opacity-50 backdrop-blur-sm backdrop-brightness-75 ">
                    <dialog id="comment-edit-modal" open className='bg-white p-6 rounded-lg h-40 w-1/2'>
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
