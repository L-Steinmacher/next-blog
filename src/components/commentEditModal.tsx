import { api } from "~/utils/api";

export default function CommentEditModal({ commentId }: { commentId: string}) {
    const utils = api.useContext();

    function handleTranslate() {
    const translateComment = api.translations.translateComment.useMutation({
            async onSuccess() {
                await utils.comments.invalidate();
            },
        });
    }

    return (
        <>

                <button
                    className=""
                    type="submit"
                    onClick={() => {
                        handleTranslate();
                    }}
                >
                        translate
                </button>
        </>
    );
}
